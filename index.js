const fetch = require('node-fetch')
const fs = require('fs')
const osmtogeojson = require('osmtogeojson')
const topojson = require('topojson')

const generateUrl = bounds => `http://overpass-api.de/api/interpreter?data=[out:json];(way[leisure=park](${bounds});relation[leisure=park](${bounds});way["landuse"="forest|allotments|meadow"](${bounds});relation["landuse"="forest|allotments"](${bounds});way["waterway"~"riverbank|dock"](${bounds});relation["waterway"~"riverbank|dock"](${bounds});way["highway"~"motorway|motorway-link|trunk|trunk-link|primary|primary-link|secondary|secondary-link|tertiary|tertiary-link|road|road|living_street|pedestrian|residential|unclassified"](${bounds});way[railway=tram](${bounds}););out meta asc;>;out skel qt;`

const fetchData = async url => {
  let data = await fetch(url)
  let json = await data.json()
  return json
}

const writeOutput = (output, data) => {
  output.write(JSON.stringify(data))
  output[output === process.stdout ? 'write' : 'end']('\n')
}

const convert = async (input, output) => {
  try {
    let data
    data = await input()
    data = osmtogeojson(data)
    data = topojson.topology({ data })
    output(data)
  } catch(e) {
    console.error(e.stack)
  }
}

module.exports = { generateUrl, fetchData, writeOutput, convert }
