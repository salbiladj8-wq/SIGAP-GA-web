const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server,{ cors:{origin:"*"} });

io.on("connection",(socket)=>{
    console.log("client connect");

    setInterval(()=>{
        let eruption = Math.floor(Math.random()*20);
        let rockfall = Math.floor(Math.random()*30);

        let level = eruption < 5 ? 1 : eruption < 15 ? 2 : 3;
        let rsam = level==1 ? "low" : "high";

        socket.emit("sigap-data",{
            eruption,
            rockfall,
            level,
            rsam
        });

    },1000);
});

server.listen(3000,()=>{
    console.log("server jalan");
});