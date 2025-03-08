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
let players = [];
let snowballs = [];


// Define the tick function
function tick(delta)
{
    //console.log("Delta: ",delta);
    for ( const player of players)
    {
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
    }



    for (const snowball of snowballs)
    {
        snowball.x += parseInt(Math.cos(snowball.angle) * SNOWBALL_SPEED*delta/TICK_RATE);
        snowball.y += parseInt(Math.sin(snowball.angle) * SNOWBALL_SPEED*delta/TICK_RATE);
        snowball.time_left -= delta;

        // check if snowball hits a player
        for (const player of players)
        {
            if (((snowball.x - player.x)**2 + (snowball.y - player.y)**2 < 200) && snowball.player_id !== player.id)
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
const io = new Server(httpServer);
const loadMap = require('./mapLoader');

async function main()
{
    
    const {ground2D, decals2D} = await loadMap();

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

    httpServer.listen(5000);

    let lastTime = Date.now();
    setInterval(() => {
        const currentTime = Date.now();
        const delta = currentTime - lastTime;
        lastTime = currentTime;
        tick(delta);
    },1000/TICK_RATE);
}

main();



