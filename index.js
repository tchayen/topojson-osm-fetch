const fs = require('fs')
const http = require('http')
const readline = require('readline')
const osmtogeojson = require('osmtogeojson')
const topojson = require('topojson')

/**
 * Returns true if 'array' contains 'element'
 * @param {*} element
 * @param {any[]} array
 */
const inArray = (element, array) => array.indexOf(element) > -1

const hostName = 'overpass-api.de'
const path = bounds => `api/interpreter?data=[out:json];(way[leisure=park](${bounds});relation[leisure=park](${bounds});way["landuse"="forest|allotments|meadow"](${bounds});relation["landuse"="forest|allotments"](${bounds});way["waterway"~"riverbank|dock"](${bounds});relation["waterway"~"riverbank|dock"](${bounds});way["highway"~"motorway|motorway_link|trunk|trunk_link|primary|primary_link|secondary|secondary_link|tertiary|tertiary_link|road|road|living_street|pedestrian|residential|unclassified"](${bounds}););out meta asc;>;out skel qt;`

/**
 * Convert number of bytes to a human readable format
 * @param {Number} bytes
 */
const humanFileSize = bytes => {
  const thresh = 1000
  if(Math.abs(bytes) < thresh) return bytes + ' B'
  const units = ['kB','MB','GB','TB','PB','EB','ZB','YB']
  let u = -1
  do {
      bytes /= thresh
      ++u
  } while(Math.abs(bytes) >= thresh && u < units.length - 1)
  return `${bytes.toFixed(1)} ${units[u]}`
}

/**
 * Returns promise resolving to data downloaded by the given bounds
 * @param {string} bounds geographical bounds in the form: 'long1,lat1,long2,lat2'
 * where long1 < long2 and lat1 < lat2
 */
const fetch = bounds => new Promise((resolve, reject) => {
  let data = ''
  const encodedPath = encodeURI(path(bounds))

  const options = {
    hostname: hostName,
    port: 80,
    path: `/${encodedPath}`,
    method: 'GET',
  }

  const request = http.request(options)

  request.on('response', response => {
    let total = 0

    process.stdout.write('\x1B[?25l')
    readline.cursorTo(process.stdout, 0)

    response.on('data', chunk => {
      data += chunk
      const current = chunk.length
      total += current

      // TODO: add throttle
      readline.cursorTo(process.stdout, 0)
      readline.clearLine(process.stdout)
      process.stdout.write(`Downloaded ${humanFileSize(total)}`)
    })

    response.on('end', () => {
      process.stdout.write('\x1B[?25h\n')
      resolve(data)
    })

    response.on('error', error => { reject(error) })
  })
  request.end()
})

/**
 * Fetches json data by given bounds
 * @param {string} bounds geographical bounds in the form: 'long1,lat1,long2,lat2'
 * where long1 < long2 and lat1 < lat2
 */
const fetchData = async bounds => {
  let data = await fetch(bounds)
  let json = await JSON.parse(data)
  return json
}

/**
 * Writes data to given writeable object. Handles adding trailing newline in STDOUT.
 * @param {object} output writeable output, for example process.stdout
 * @param {object} data data to write
 */
const writeOutput = (output, data) => {
  output.write(JSON.stringify(data))
  output[output === process.stdout ? 'write' : 'end']('\n')
}

/**
 *
 * @param {object[]} data array of GeoJSON features
 */
const createLayer = data => ({
  type: 'FeatureCollection',
  features: data,
})

/**
 *
 * @param {Promise} input promise returning JSON output
 * @param {function} output function taking TopoJSON object
 * @param {object} [config] config object in the form: { output: { layers: ... } }
 */
const convert = async (input, output, config) => {
  try {
    let data
    data = await input()
    data = osmtogeojson(data)

    const layers = {}
    if (!config || !config.output || !config.output.layers) {
      layers['map'] = createLayer(data.features)
    } else {
      const configLayers = config.output.layers
      for (const layer in configLayers) {
        if (!configLayers.hasOwnProperty(layer)) continue
        layers[layer] = createLayer(data.features.filter(configLayers[layer]))
      }
    }

    data = topojson.topology(layers)
    output(data)
  } catch(e) {
    console.error(e.stack)
  }
}

module.exports = {
  fetchData,
  writeOutput,
  convert,
}
