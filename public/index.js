// GLOBAL VARIABLES
const tileSize = 32;
const scale = 1;
const PlayerScale = 1;
const inputs = {
    'up': false,
    'down': false,  
    'left': false,
    'right': false
};
let cameraX = 0;
let cameraY = 0;
const snowballRadius = 5;

// MANAGE THE SOCKET CONNECTION
const socket = io('ws://localhost:5000'); 

// Connection Event
socket.on('connect', ()=> {
    console.log("connected");
    console.log("Socket ID: ", socket.id);
});

// Get the map from the server
let ground = [[]];
let decals = [[]];
socket.on('map', (mapLoaded) => {
    console.log("Map Loaded");
    ground = mapLoaded.ground;
    decals = mapLoaded.decals;
    console.log("ground: ", ground);
    console.log("decals: ", decals);
});

// Get the player positions from the server
let players = [];
socket.on('players', (playersData) => {
    players = playersData;
    //console.log(players);
});

// Get the snowballs from the server
let snowballs = [];
socket.on('snowballs', (snowballsData) => {
    snowballs = snowballsData;
    //console.log(snowballs);
});



// LOAD IMAGES

// Load the ground image
const groundImage = new Image();
groundImage.src = './snowy-sheet.png';
const tilesPerRow = groundImage.width / tileSize;
const tilesPerCol = groundImage.height / tileSize;




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

// Click event
window.addEventListener('click', (e) => {
    const angle = Math.atan2(e.clientY - canvas.height / 2, e.clientX - canvas.width / 2);
    console.log("Angle: ", angle*180/Math.PI);
    socket.emit('shoot', angle);
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
    if (ground.length === 0)
    {
        socket.emit('getMap');
        return;
    }


    // Draw the ground
    for(let row = 0; row < ground.length; row++)
    {
        for(let col = 0; col < ground[row].length; col++)
        {
            const { id } = ground[row][col];
            const imageRow = Math.floor(id / tilesPerRow);
            const imageCol = id % tilesPerRow;

            ctx.drawImage(groundImage,
                imageCol * tileSize,
                imageRow * tileSize,
                tileSize,
                tileSize,
                Math.floor(col * tileSize * scale) - cameraX,
                Math.floor(row * tileSize * scale) - cameraY,
                Math.ceil(tileSize * scale),
                Math.ceil(tileSize * scale)
            );


        }
    }

    // Draw the decals
    for(let row = 0; row < decals.length; row++)
    {
        for(let col = 0; col < decals[row].length; col++)
        {   
            if (decals[row][col])
            {
                const { id } = decals[row][col];
                const imageRow = Math.floor(id / tilesPerRow);
                const imageCol = id % tilesPerRow;

                ctx.drawImage(groundImage,
                    imageCol * tileSize,
                    imageRow * tileSize,
                    tileSize,
                    tileSize,
                    Math.floor(col * tileSize * scale) - cameraX,
                    Math.floor(row * tileSize * scale) - cameraY,
                    Math.ceil(tileSize * scale),
                    Math.ceil(tileSize * scale)
                );
            }
        }
    }
}

function drawPlayer(x,y)
{
    ctx.drawImage(playerImage,
        x, 
        y,
        Math.floor(playerImage.width * PlayerScale),
        Math.floor(playerImage.height * PlayerScale));
}

function drawPlayers()
{
    const myPlayer = players.find(player => player.id === socket.id);
    
    if (myPlayer)
    {
        cameraX = Math.floor(myPlayer.x - canvas.width / 2);
        cameraY = Math.floor(myPlayer.y - canvas.height / 2);
    }

    for (const player of players)
    {
        drawPlayer(player.x - cameraX, player.y - cameraY);
    }
}

function drawSnowball(x,y)
{
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(x - cameraX + playerImage.width / 2,
            y - cameraY + playerImage.height / 2,
            snowballRadius,
            0, 2 * Math.PI);
    ctx.fill();
}

function drawSnowballs()
{
    for (const snowball of snowballs)
    {
        drawSnowball(snowball.x, snowball.y);
    }
}


// main game loop
function mainloop()
{
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawMap();
    drawSnowballs();
    drawPlayers();
}

// Run the game loop at 30 FPS
setInterval(() => {
    mainloop();
}, 1000 / 30);