// set up the server 
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

// create the express app
const app = express();
const httpServer = createServer(app);


// Define the TICK_RATE
const TICK_RATE = 30;
const SPEED = 5;
const SNOWBALL_SPEED = 10;
const inputsMap = {};
const PLAYER_WIDTH = 32;
const PLAYER_HEIGHT = 32;
const TILE_SIZE = 32;
let players = [];
let snowballs = [];
let ground2D, decals2D;

// Rectangle Collision Detection
function isCollidingRect(rect1,rect2)
{
    return  (rect1.x < rect2.x + rect2.w &&
            rect1.x + rect1.w > rect2.x &&
            rect1.y < rect2.y + rect2.h &&
            rect1.y + rect1.h > rect2.y);
}

// Coliision Detection 
function isCollidingWithMap(object)
{
    for(let row = 0; row < decals2D.length; row++)
    {
        for(let col = 0; col < decals2D[row].length; col++)
        {   
            if (decals2D[row][col])
            {
                const playerRect = {
                    x: object.x,
                    y: object.y,
                    w: object.w,
                    h: object.h
                };

                const tileRect = {
                    x: col * TILE_SIZE,
                    y: row * TILE_SIZE,
                    w: TILE_SIZE,
                    h: TILE_SIZE
                };

                if (isCollidingRect(playerRect,tileRect))
                {
                    return true;
                }
            }
        }
    }
    return false;
}


// Define the tick function
function tick(delta)
{
    //console.log("Delta: ",delta);
    for ( const player of players)
    {
        const prevX = player.x;
        const prevY = player.y;
        const inputs = inputsMap[player.id];
        if (inputs)
        {
            if (inputs.up)
            {
                player.y -= SPEED*delta/TICK_RATE;
            }
            if (inputs.down)    
            {
                player.y += SPEED*delta/TICK_RATE;
            }
            if (inputs.left)
            {
                player.x -= SPEED*delta/TICK_RATE;
            }
            if (inputs.right)
            {
                player.x += SPEED*delta/TICK_RATE;
            }
        }

        if (isCollidingWithMap({
            x: player.x,
            y: player.y,
            w: PLAYER_WIDTH,
            h: PLAYER_HEIGHT}))
        {
            player.x = prevX;
            player.y = prevY;
        }
    }



    for (const snowball of snowballs)
    {
        snowball.x += parseInt(Math.cos(snowball.angle) * SNOWBALL_SPEED*delta/TICK_RATE);
        snowball.y += parseInt(Math.sin(snowball.angle) * SNOWBALL_SPEED*delta/TICK_RATE);
        snowball.time_left -= delta;

        // check if snowball hits a wall
        if (isCollidingWithMap({
            x: snowball.x,
            y: snowball.y,
            w: 5,
            h: 5
        }))
        {
            snowball.time_left = 0;
        }

        // check if snowball hits a player
        for (const player of players)
        {
            if (((snowball.x - player.x)**2 + (snowball.y - player.y)**2 < (PLAYER_WIDTH/2)**2) && snowball.player_id !== player.id)
            {
                snowball.time_left = 0;
                player.x = 0;
                player.y = 0;
                break;
            }
        }
    }

    snowballs = snowballs.filter((snowball) => snowball.time_left > 0);

    io.emit("players",players);
    io.emit("snowballs",snowballs);
}


// create the socket server
const PORT = process.env.PORT || 5000;
const io = new Server(httpServer);
const loadMap = require('./mapLoader');

async function main()
{
    
    ({ground2D, decals2D} = await loadMap());

    io.on('connect',(socket) => {
        console.log("User Connected: ",socket.id);

        // when the user connects, send them the map
        socket.emit("map",
            {
                ground: ground2D,
                decals: decals2D,
            });
        console.log("Map Sent to: ",socket.id);

        // add the user to the players array
        players.push({
            id: socket.id,
            x: 0,
            y: 0
        });



        socket.on("getMap",() => {
            socket.emit("map",
            {
                ground: ground2D,
                decals: decals2D
            });
        });

        socket.on("inputs",(inputs) => {
            inputsMap[socket.id] = inputs;
        });


        socket.on("shoot",(angle) => {
            const player = players.find((player) => player.id === socket.id);
            snowballs.push({
                x: player.x,
                y: player.y,
                angle,
                time_left: 1000,
                player_id: socket.id
            });
        }
        );


        socket.on("disconnect",() => {
            console.log("User Disconnected: ",socket.id);
            players = players.filter((player) => player.id !== socket.id);
            delete inputsMap[socket.id];
        });
    })

    app.use(express.static("public"));

    httpServer.listen(PORT);

    let lastTime = Date.now();
    setInterval(() => {
        const currentTime = Date.now();
        const delta = currentTime - lastTime;
        lastTime = currentTime;
        tick(delta);
    },1000/TICK_RATE);
}

main();



