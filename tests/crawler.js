const crawler = require('./../src/crawler');
const fs = require('fs');
const rimraf = require('rimraf');

describe('Crawler', function() {

    it('Calculate tile coordinates', function() {
        var coords = crawler.calculateTileCoordinates(47.57977173,12.16776609,18);
        expect(coords.x).toEqual(139932);
        expect(coords.y).toEqual(91580);
        expect(coords.z).toEqual(18);
    });

    it('Download random file to folder', function(done) {
        var source = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/FullMoon2010.jpg/800px-FullMoon2010.jpg";
        var target = './.tmp/example/moon.jpg';

        crawler.downloadFile(source, target)
            .then(() => {
                expect(fs.existsSync(target)).toBeTruthy();
                rimraf('./.tmp', done);
            });
    });

    it('Replace paths with tile variables', function() {
        var paths = crawler.getPaths('http://maps.wien.gv.at/basemap/bmaporthofoto30cm/normal/google3857/{z}/{y}/{x}.jpeg', {
            x : "x-val" ,
            y : "y-val" ,
            z : "z-val"
        }, './.tmp/');

        expect(paths.source).toEqual('http://maps.wien.gv.at/basemap/bmaporthofoto30cm/normal/google3857/z-val/y-val/x-val.jpeg');
        expect(paths.target).toEqual('./.tmp/z-val/y-val/x-val.jpeg');
    });

    it('Download some tiles', function (done) {

        var i = 0;

        crawler.crawl({
            url : 'http://maps.wien.gv.at/basemap/bmaporthofoto30cm/normal/google3857/{z}/{y}/{x}.jpeg' ,
            targetFolder : './.tmp/' ,
            level : 18 ,
            topLeft: [47.58237709, 12.16813087] ,
            bottomRight: [47.58079218, 12.170223] ,
            progress: (tile) => { i++; } ,
            success : () => {
                expect(i).toEqual(9);
                rimraf('./.tmp', done);
            }
        });

    });

});