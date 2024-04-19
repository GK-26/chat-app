const express = require('express');
const {Server} = require("socket.io")
const http = require('http');
const path = require('path');
const { Socket } = require('dgram');


const app = express();
const server = http.createServer(app);
const io = new Server(server);


app.get('/', (req, res)=>{
    return res.sendFile(path.join(__dirname, 'index.html'))
})

io.on('connection', (socket) =>{
    console.log('a user connected');
    socket.on('disconnect', ()=>{
        console.log('user disconnected')    
    })
})

io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
      console.log('message: ' + msg);
      io.emit('chat message', msg)
    });
  });

server.listen(3000, ()=>{
    console.log('server started on port 3000')
})