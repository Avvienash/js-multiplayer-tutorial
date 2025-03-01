const tmx = require('tmx-parser');

async function loadMap()
{
    const map = await new Promise((resolve, reject) => {
        // load the map
        tmx.parseFile("./src/map.tmx", function(err, loadedMap) {
            if (err) return reject(err);
            console.log("Map Loaded: ",loadedMap);
            resolve(loadedMap);
        });
    });

    const layers = map.layers[0];
    const tiles = layers.tiles;

    const map2D = new Array(map.height).fill('').map(() => new Array(map.width));
    for (let row = 0; row < map.height; row++) {
        for (let col = 0; col < map.width; col++) {
            const tile = tiles[row * map.height + col];
            map2D[row][col] = { id: tile.id, gid: tile.gid };
        }
    }

    return map2D;
}

module.exports = loadMap;
