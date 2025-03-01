// set up the server 
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

// create the express app
const app = express();
const httpServer = createServer(app);

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

    })

    app.use(express.static("public"));

    httpServer.listen(5000);

}

main();



