const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io'); 
const mongoose = require('mongoose');
require('dotenv').config();
const Chat = require('./models/chat.model');
const app = express();
const server = http.createServer(app);
let io = socketIO(server);

// mongoose.connect(process.env.MONGOURI).then(()=>{
//   console.log(`#### DB CONNECTED`)
// })


app.get('/', (req, res)=>{
  
io.on('connection', socket =>{
  console.log('a user connected', socket.id)
  socket.on('disconnect', ()=>{
    console.log('user disconnected')
  })
  socket.on('chat message', (msg, room) =>{
    if (room === ""){
      socket.broadcast.emit('chat message', msg);
    } else {
      socket.to(room).emit('chat message', msg)
    }
  })
})
    return res.sendFile(path.join(__dirname, 'index.html'))
})


server.listen(3000, ()=>{
    console.log('server started on port 3000')
})