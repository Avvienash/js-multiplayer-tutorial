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

    
    const ground_tiles = map.layers[0].tiles;
    const decals_tiles = map.layers[1].tiles;

    const ground2D = new Array(map.height).fill('').map(() => new Array(map.width));
    const decals2D = new Array(map.height).fill('').map(() => new Array(map.width));
    for (let row = 0; row < map.height; row++) 
    {
        for (let col = 0; col < map.width; col++)
        {
            const ground_tile = ground_tiles[row * map.height + col];
            const decals_tile = decals_tiles[row * map.height + col];

            if (ground_tile)
            {
                ground2D[row][col] = { id: ground_tile.id, gid: ground_tile.gid };
            }
        
            if (decals_tile)
            {
                decals2D[row][col] = { id: decals_tile.id, gid: decals_tile.gid };
            }
        }
    }

    return {ground2D, decals2D};
}

module.exports = loadMap;
