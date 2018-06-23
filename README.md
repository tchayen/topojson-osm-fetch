# topojson-osm-fetch

Node utilities for fetching data from Open Street Map and converting it to a TopoJSON file.

## Installation
```bash
npm install -g topojson-osm-fetch
```

## Usage

### Download data

```bash
topofetch download 50.0,19.85,50.105,20.13
```

### Convert OSM to TopoJSON

If you have already downloaded OSM data as a JSON file

**NOTE:** _it's not the same as GeoJSON, OSM also has JSON format for its XML-like data_

```bash
topofetch convert map.json
```

### NPM package
```js
import { generateUrl, fetchData, convert } from 'topojson-osm-fetch'

const bounds = [50.0, 19.85, 50.105, 20.13].join()

convert(fetchData(generateUrl(bounds)), console.log)
```
