# Map Tiles Crawler

Memory efficient and synchronous downloader of map tiles. Allows for a fast and easy approach to make map tiles (from a WMS) available offline.

## Install

```
npm i map-tiles-crawler (-g for global install)
```

## Usage from CLI

```
mtc --url http://maps.wien.gv.at/basemap/bmaporthofoto30cm/normal/google3857/{z}/{y}/{x}.jpeg \
    --target ./.tmp/ \
    --level 18 \
    --topLeft 47.46465597:11.91329956 \
    --bottomRight 47.46140645:11.9243288 \
    --wait 100
```

## Usage (programmatic)

```javascript
var crawler = require('map-tiles-crawler');
crawler.crawl({
    url: 'http://maps.wien.gv.at/basemap/bmaporthofoto30cm/normal/google3857/{z}/{y}/{x}.jpeg' ,
    targetFolder: './.tmp' ,
    level : 18 ,
    topLeft: [47.46575119, 11.92384601] ,
    bottomRight: [47.46068834, 11.91423297] ,
    wait: 100 ,
    progress : (tile) => { // callback after tile download } ,
    success : () => { // callback after all tiles are downloaded } ,
    error : (tile) => { // callback if a tile couldn't be downloaded }
});
```

## Params

| Param | Description |
| --- | --- |
| url | the url of the WMS endpoint with coordinates as placeholders in the url e.g.: http://maps.wien.gv.at/basemap/bmaporthofoto30cm/normal/google3857/{z}/{y}/{x}.jpeg |
| targetFolder | The filesystem folder, where all files will be downloaded to |
| level | The zoom level for the crawling |
| topLeft | the top-left geo-coordinate of the area to crawl as array |
| bottomRight | the bottom-right geo-coordinate of the area to crawl as array |
| wait | waiting time after each tile download, this allows for throttling the downloads |
| progress | callback after each tile download |
| success | callback after all tiles were downloaded successfully |
| error | callback after a error happened |

## Contact and support

Web: [www.beyondit.at](http://www.beyondit.at)
