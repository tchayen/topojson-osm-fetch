# topojson-osm-fetch

Node utilities for fetching data from Open Street Map and converting it to a TopoJSON file.

![](/screenshots/minneapolis.png)
_Check out the examples section below for source code of the above_

## Installation

```bash
npm install -g topojson-osm-fetch
```
**NOTE:** _Global install is not necessary if you want to use it only as a module_

## Usage as CLI

### Download data

```bash
topofetch download b50.0,19.85,50.105,20.13 output.topojson
```
(prepend coordinates with `b`)

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

## API

For API reference refer to `index.js` which contains JS Docs.

## Config

`convert()` takes configuration object as the third argument, which can look like this:

```js
const defaultConfig = {
  output: {
    layers: {
      parks:
        d => d.properties.leisure,
      rivers:
        d => d.properties.waterway,
      minorRoads:
        d => inArray(d.properties.highway, ['unclassified', 'residential', 'pedestrian', 'living_street', 'road']),
      majorRoads:
        d => inArray(d.properties.highway, ['motorway', 'motorway-link', 'trunk', 'trunk-link', 'primary', 'primary-link', 'secondary', 'secondary-link', 'tertiary', 'tertiary-link'])
    }
  }
}
```
The only thing needed for the layer is filter function used for separating it from others. `d` is data of a **Geo**JSON feature and comes from the OSM data that you provided.

The output TopoJSON file will have specified layers with their names.

**NOTE:** _TopoJSON layers are simply properties of the `features` in the TopoJSON object_

## Examples
In order to comply with browsers' security restrictions, you serve static content from local server.

This bash one-liner run from `/examples` directory comes to the rescue:
```bash
python -m SimpleHTTPServer 8000
```

### d3.js SVG

The simplest use case is rendering a map via `d3.js` library. Sometimes it might be useful to keep the whole map as one asset file and render it as a whole.

Check out [source code](/examples/d3.html).

![](/screenshots/minneapolis.png)

![](/screenshots/cracow.png)

## Insights

### Fetching data

Fetching data from Open Street Map is based on Overpass and its OverpassQL. It is really flexible and allows for querying quite complex relations between elements, but for now this lib uses only the following one:

```bash
[out:json];
(
  way[leisure=park]($BOUNDS);
  relation[leisure=park]($BOUNDS);
  way["landuse"="forest|allotments"]($BOUNDS);
  relation["landuse"="forest|allotments|meadow"]($BOUNDS);

  way["waterway"~"riverbank|dock"]($BOUNDS);
  relation["waterway"~"riverbank|dock"]($BOUNDS);

  way["highway"~"motorway|motorway-link|trunk|trunk-link|primary|primary-link|secondary|secondary-link|tertiary|tertiary-link|road|road|living_street|pedestrian|residential|unclassified"]($BOUNDS);
);
out meta asc;
>;
out skel qt;
```

where bounds is the provided `bounds` parameter.

As you can see there is whole lot of place for adding flexibility.

### Converting

The OSM data is converted to GeoJSON and only then the final TopoJSON conversion takes place. It is also phase in which layer separation happens if specified in the config.

## Future plans

- add `query` option for specifying own queries
- add ability to somehow specify config from CLI
- add usage examples
- maybe custom QL over the (IMO messy) OverpassQL 🤔