# topojson-osm-fetch

Node utilities for fetching data from Open Street Map and converting it to a TopoJSON file.

## Installation
```bash
npm install -g topojson-osm-fetch
```

## Usage as CLI

### Download data

```bash
topofetch download 50.0,19.85,50.105,20.13 output.topojson
```

Output file is optional. Defaults to `STDOUT`.

### Convert OSM to TopoJSON

If you have already downloaded OSM data as a JSON file

**NOTE:** _it's not the same as GeoJSON, OSM also has JSON format for its XML-like data_

```bash
topofetch convert -i map.json -o output.topojson
```

Both input and output files are optional. Input defaults to `STDIN`. Output defaults to `STDOUT`.

## Usage as module
```js
import { generateUrl, fetchData, convert } from 'topojson-osm-fetch'

const bounds = [50.0, 19.85, 50.105, 20.13].join()

convert(fetchData(generateUrl(bounds)), console.log)
```

## Config
`convert()` takes configuration object as the third argument, which can look like this:

```js
const defaultConfig = {
  output: {
    layers: {
      green:
        d => d.properties.leisure,
      water:
        d => d.properties.waterway,
      minorRoads:
        d => inArray(d.properties.highway, ['unclassified', 'residential', 'pedestrian', 'living_street', 'road']),
      majorRoads:
        d => inArray(d.properties.highway, ['motorway', 'motorway-link', 'trunk', 'trunk-link', 'primary', 'primary-link', 'secondary', 'secondary-link', 'tertiary', 'tertiary-link'])
    }
  }
}
```

The output TopoJSON file will have specified layers with their names.

**NOTE:** _TopoJSON layers are simply properties of the `features` in the TopoJSON object_

## TODO
- add `query` option for specifying own queries
- add ability to specify config from CLI