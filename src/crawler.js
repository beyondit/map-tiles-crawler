const https = require('https');
const http = require('http');
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');

function Crawler () {
    this.tileSize = 256;
    this.urlTemplate = /\{ *([xyz]) *\}/g;   
    this.pathTemplate = /\{ *([xyz]) *\}\/\{ *([xyz]) *\}\/\{ *([xyz]) *\}(\.[a-zA-Z]{3,4})/;
}

Crawler.prototype.selectProtocol = function(url) {
    if (url.search(/^http:\/\//) === 0) {
        return http;
    } else if (url.search(/^https:\/\//) === 0) {
        return https;
    } else {
        return null;
    }
}

Crawler.prototype.downloadFile = function(source, target) {
    return new Promise((resolve, reject) => {
        try {
            var dirname = path.dirname(target);
            mkdirp(dirname, (err) => {
                var file = fs.createWriteStream(target);
                this.selectProtocol(source).get(source, function(resp) {                    
                    file.once('finish', () => {
                        file.close();
                        resolve();
                    });
                    resp.pipe(file);                    
                });
            });
        } catch(e) {
            reject();
        }
    }); 
};

Crawler.prototype.calculateRect = function(topLeft, bottomRight, level) {
    var topLeftTile = this.calculateTileCoordinates(topLeft.latitude, topLeft.longitude, level);
    var bottomRightTile = this.calculateTileCoordinates(bottomRight.latitude, bottomRight.longitude, level);

    return {
        startX : topLeftTile.x ,
        startY : topLeftTile.y ,
        endX : bottomRightTile.x ,
        endY : bottomRightTile.y ,
        level : level
    };
};

Crawler.prototype.getPaths = function (url, tile, targetPrefix = '') {
    var path = url.match(this.pathTemplate);
    return {
        source : this.replacePath(url, tile) ,
        target : targetPrefix + this.replacePath(path[0], tile)
    };
};

Crawler.prototype.replacePath = function(url, data) {
    return url.replace(this.urlTemplate, (str, key) => {
        return data[key];
    });
};

Crawler.prototype.calculateTileCoordinates = function(latitude, longitude, level) {
    var sinLatitude = Math.sin(latitude * Math.PI / 180);
    var pixelX = ((longitude + 180) / 360) * this.tileSize * Math.pow(2, level);
    var pixelY = (0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (4*Math.PI)) * this.tileSize * Math.pow(2,level);

    return {
        x : Math.floor(pixelX / this.tileSize) ,
        y : Math.floor(pixelY / this.tileSize) ,
        z : level
    };
};

Crawler.prototype.crawlRect = function(rect, url, folder, current) {
    if (!current) {
        current = {
            x : rect.startX ,
            y : rect.startY ,
            z : rect.level
        };
    }

    var paths = this.getPaths(url, current, folder);
    this.downloadFile(paths.source, paths.target)
        .then(() => {
            if (this.progress) {
                this.progress(current);
            }

            // next y
            if (current.x >= rect.endX && current.y >= rect.endY) {
                if (this.success) {
                    this.success();
                    return;
                }
            } else if (current.x >= rect.endX && current.y < rect.endY) {
                current.y += 1;
            }

            // next x
            if (current.x >= rect.endX) {
                current.x = rect.startX;
            } else {
                current.x += 1;
            }

            setTimeout(() => {
                this.crawlRect(rect, url, folder, current);
            }, this.wait);                     
        })
        .catch(() => {
            if (this.error) {
                this.error(current);
            }
        });
};

Crawler.prototype.crawl = function(options) {
    var options = options || {};

    var topLeft = {
        latitude : parseFloat(options.topLeft[0]) ,
        longitude : parseFloat(options.topLeft[1])
    };

    var bottomRight = {
        latitude : parseFloat(options.bottomRight[0]) ,
        longitude : parseFloat(options.bottomRight[1])
    };

    this.wait = options.wait || 0;
    this.success = options.success;
    this.error = options.error;
    this.progress = options.progress;

    this.crawlRect(this.calculateRect(topLeft, bottomRight, options.level), options.url, options.targetFolder);
};

module.exports = new Crawler();
