const fetch = require('node-fetch')
const fs = require('fs')
const osmtogeojson = require('osmtogeojson')
const topojson = require('topojson')

/**
 * Returns true if 'array' contains 'element'
 * @param {*} element
 * @param {any[]} array
 */
const inArray = (element, array) => array.indexOf(element) > -1

/**
 *
 * @param {string} bounds geographical bounds in the form: 'long1,lat1,long2,lat2'
 * where long1 < long2 and lat1 < lat2
 */
const generateUrl = bounds => `http://overpass-api.de/api/interpreter?data=[out:json];(way[leisure=park](${bounds});relation[leisure=park](${bounds});way["landuse"="forest|allotments|meadow"](${bounds});relation["landuse"="forest|allotments"](${bounds});way["waterway"~"riverbank|dock"](${bounds});relation["waterway"~"riverbank|dock"](${bounds});way["highway"~"motorway|motorway_link|trunk|trunk_link|primary|primary_link|secondary|secondary_link|tertiary|tertiary_link|road|road|living_street|pedestrian|residential|unclassified"](${bounds}););out meta asc;>;out skel qt;`

/**
 * Fetches json data from given url
 * @param {string} url url to fetch data from
 */
const fetchData = async url => {
  let data = await fetch(url)
  let json = await data.json()
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
  generateUrl,
  fetchData,
  writeOutput,
  convert,
}
