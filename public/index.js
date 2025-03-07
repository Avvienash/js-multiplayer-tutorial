// GLOBAL VARIABLES
const tileSize = 32;
const scale = 0.5;
const PlayerScale = 1;
const inputs = {
    'up': false,
    'down': false,  
    'left': false,
    'right': false
};

// MANAGE THE SOCKET CONNECTION
const socket = io('ws://localhost:5000');

// Connection Event
socket.on('connect', ()=> {
    console.log("connected");
    console.log("Socket ID: ", socket.id);
});

// Get the map from the server
let map = [[]];
socket.on('map', (mapLoaded) => {
    console.log("Map Loaded");
    map = mapLoaded;
});

// Get the player positions from the server
let players = [];
socket.on('players', (playersData) => {
    players = playersData;
    //console.log(players);
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


// keyboard events
window.addEventListener('keydown', (e) => {
    
    if (e.key === 'w' || e.key === 'ArrowUp') {
        inputs.up = true;
    }
    else if (e.key === 's' || e.key === 'ArrowDown') {
        inputs.down = true;
    }

    if (e.key === 'a' || e.key === 'ArrowLeft') {
        inputs.left = true;
    }
    else if (e.key === 'd' || e.key === 'ArrowRight') {
        inputs.right = true;
    }

    // every time a key is pressed, send the inputs to the server
    socket.emit('inputs', inputs);
});

window.addEventListener('keyup', (e) => {
    
    if (e.key === 'w' || e.key === 'ArrowUp') {
        inputs.up = false;
    }
    else if (e.key === 's' || e.key === 'ArrowDown') {
        inputs.down = false;
    }
    
    if (e.key === 'a' || e.key === 'ArrowLeft') {
        inputs.left = false;
    }
    else if (e.key === 'd' || e.key === 'ArrowRight') {
        inputs.right = false;
    }

    socket.emit('inputs', inputs);
});



function drawMap()
{
    console.log("Drawing Map");
    if (map.length === 0)
    {
        socket.emit('getMap');
        return;
    }

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

function drawPlayers()
{
    for (const player of players)
    {
        drawPlayer(player.x,player.y);
    }
}


// main game loop
function mainloop()
{
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawMap();
    drawPlayers();
    window.requestAnimationFrame(mainloop);
}

window.requestAnimationFrame(mainloop);