// GLOBAL VARIABLES
const tileSize = 32;
const scale = 0.5;
const PlayerScale = 1;

// MANAGE THE SOCKET CONNECTION
const socket = io('ws://localhost:5000');

// Connection Event
socket.on('connect', ()=> {
    console.log("connected");
});

// Get the map from the server
let map = [[]];
socket.on('map', (mapLoaded) => {
    //console.log("Map Received: ",mapLoaded);
    map = mapLoaded;
});


// LOAD IMAGES

// Load the map image
const mapImage = new Image();
mapImage.src = './snowy-sheet.png';
const tilesPerRow = mapImage.width / tileSize;
const tilesPerCol = mapImage.height / tileSize;

// Load the player image
const playerImage = new Image();
playerImage.src = './santa.png';



// SETUP THE CANVAS
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// update the canvas size when the window is resized
window.addEventListener('resize', ()=> {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});








function drawMap()
{
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

function drawPlayer(x,y)
{
    ctx.drawImage(playerImage,x,y, playerImage.width * PlayerScale, playerImage.height * PlayerScale);
}

// get mouse position
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

canvas.addEventListener('mousedown', (event) => {
    mousePos = getMousePos(canvas, event);
    console.log(mousePos);
});

let mousePos = {x:0,y:0};
// main game loop
function mainloop()
{
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawMap();
    drawPlayer(mousePos.x,mousePos.y);
    window.requestAnimationFrame(mainloop);
}

window.requestAnimationFrame(mainloop);