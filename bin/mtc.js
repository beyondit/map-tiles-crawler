#!/usr/bin/env node

var program = require('commander');
var package = require('./../package.json');
var crawler = require('./../src/crawler');

program
  .version(package.version)
  .option('-u, --url [url]', 'The url of the WMS endpoint')
  .option('-t, --target [targetFolder]', 'The target folder to download the tiles to')
  .option('-l, --level [level]', 'Zoom level')
  .option('-w, --wait [wait]', 'Wait for milliseconds after download')
  .option('-o, --topLeft [topLeft]', 'Top-left geo-coordinate divided by ":" e.g. 49.12325:10.2325')
  .option('-b, --bottomRight [bottomRight]', 'Bottom-right geo-coordinate divided by ":"')
  .parse(process.argv);

try {
  crawler.crawl({
    url : program.url ,
    targetFolder : program.target ,
    level : program.level ,
    wait : program.wait ,
    topLeft : program.topLeft.split(":") ,
    bottomRight : program.bottomRight.split(":") ,
    success : () => { console.info("Successfully crawled tiles!"); } ,
    error : () => { console.error("Tile crawling stopped, due to an error."); } ,
    progress : (tile) => { console.info("Tile crawled (x/y/z): (" + tile.x + "/" + tile.y + "/" + tile.z + ")"); }
  });
} catch (e) {
  console.error("There was an error: " + e.message);
}
