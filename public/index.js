// load in map data
const mapImage = new Image();
mapImage.src = './snowy-sheet.png';

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const tileSize = 32;
const tilesPerRow = mapImage.width / tileSize;
console.log("Tiles Per Row: ",tilesPerRow);
const tilesPerCol = mapImage.height / tileSize;
console.log("Tiles Per Col: ",tilesPerCol);
const scale = 0.5;
// update the canvas size when the window is resized
window.addEventListener('resize', ()=> {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});




let map = [[]];

const socket = io('ws://localhost:5000');

socket.on('connect', ()=> {
    console.log("connected");
});

socket.on('map', (mapLoaded) => {
    //console.log("Map Received: ",mapLoaded);
    map = mapLoaded;
});

function drawMap()
{
    ctx.clearRect(0,0,canvas.width,canvas.height);




    for(let row = 0; row < map.length; row++)
    {
        for(let col = 0; col < map[row].length; col++)
        {
            const { id } = map[row][col];
            const imageRow = Math.floor(id / tilesPerRow);
            const imageCol = id % tilesPerRow;

            ctx.drawImage(mapImage,
                imageCol * tileSize,
                imageRow * tileSize,
                tileSize,
                tileSize,
                Math.floor(col * tileSize * scale),
                Math.floor(row * tileSize * scale),
                Math.ceil(tileSize * scale),
                Math.ceil(tileSize * scale)
            );
        }
    }
}

function mainloop()
{
    
    drawMap();
    window.requestAnimationFrame(mainloop);
}

window.requestAnimationFrame(mainloop);