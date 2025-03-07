// set up the server 
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { Z_BEST_SPEED } = require("zlib");

// create the express app
const app = express();
const httpServer = createServer(app);


// Define the TICK_RATE
const TICK_RATE = 30;
const SPEED = 5;
const inputsMap = {};
let players = [];


// Define the tick function
function tick()
{
    for ( const player of players)
    {
        const inputs = inputsMap[player.id];
        if (inputs)
        {
            if (inputs.up)
            {
                player.y -= SPEED;
            }
            if (inputs.down)
            {
                player.y += SPEED;
            }
            if (inputs.left)
            {
                player.x -= SPEED;
            }
            if (inputs.right)
            {
                player.x += SPEED;
            }
        }
    }

    io.emit("players",players);
}


// create the socket server
const io = new Server(httpServer);
const loadMap = require('./mapLoader');

async function main()
{
    
    const map2D = await loadMap();

    io.on('connect',(socket) => {
        console.log("User Connected: ",socket.id);

        // when the user connects, send them the map
        socket.emit("map",map2D);
        console.log("Map Sent to: ",socket.id);

        // add the user to the players array
        players.push({
            id: socket.id,
            x: 0,
            y: 0
        });


        socket.on("getMap",() => {
            socket.emit("map",map2D);
        });

        socket.on("inputs",(inputs) => {
            inputsMap[socket.id] = inputs;
        });

        socket.on("disconnect",() => {
            console.log("User Disconnected: ",socket.id);
            players = players.filter((player) => player.id !== socket.id);
            delete inputsMap[socket.id];
        });
    })

    app.use(express.static("public"));

    httpServer.listen(5000);

    setInterval(tick,1000/TICK_RATE);
}

main();



