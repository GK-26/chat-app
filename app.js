const express = require('express');
const bodyParser = require('body-parser')
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
require('dotenv').config();
const Chat = require('./models/chat.model');
const app = express();
const server = http.createServer(app);
let io = socketIO(server);
const User = require('./models/user.model')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));
  
const customIdToSocketId = {};  // Mapping custom IDs (emails) to socket IDs

mongoose.connect(process.env.MONGOURI).then(()=>{
  console.log(`#### DB CONNECTED`)
})





function getKeyByValue(object, value) {
  // Iterate over each key-value pair in the object
  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      // If the value matches, return the key
      if (object[key] === value) {
        return key;
      }
    }
  }
  // If no key matches the value, return undefined
  return undefined;
}


io.on('connection', async socket => {
  console.log('a user connected', socket.id);

  // Listen for custom ID assignment
  socket.on('setCustomId', customId => {
    customIdToSocketId[customId] = socket.id;
    console.log(`User connected with customId: ${customId}`);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected', socket.customId);

     // Remove the custom ID mapping when a user disconnects
     for (const [customId, socketId] of Object.entries(customIdToSocketId)) {
      if (socketId === socket.id) {
        delete customIdToSocketId[customId];
        break;
      }
    if (socket.customId) {
      delete userSockets[socket.customId];
    }
  }})


  socket.on('chat message', async (msg, room) => {
    let sender = getKeyByValue(customIdToSocketId, socket.id)
    console.log(`sender : ${sender}`)
    if (room.length === 0) {
      socket.broadcast.emit('chat message', msg);
    } else {
      const targetSocketId = customIdToSocketId[room];
      if (targetSocketId) {
        socket.to(targetSocketId).emit('chat message', msg);
      } else {
        console.log(`User with customId ${room} not found`);
      }
    
      
let userId = await User.findOne({username: room})

let senderId = await User.findOne({username: sender})
      const newChat = new Chat({ sender: senderId._id, user: userId._id, message: msg });
    await newChat.save();
    }
  });

  socket.on('image message', async (imageData, room) => {
    let sender = customIdToSocketId[socket.id]
    if (customId.length === 0) {
      socket.broadcast.emit('image message', imageData);
    } else {
      {
        const targetSocketId = customIdToSocketId[room];
        if (targetSocketId) {
          socket.to(targetSocketId).emit('chat message', imageData);
        } else {
          console.log(`User with customId ${room} not found`);
        }
      }
    }
    let userId = await User.findOne({username: room})
    let senderId = await User.findOne({username: sender})
    const newChat = new Chat({ sender: senderId._id, user: userId._id, image: imageData });
    newChat.save();
  });


})

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/register', (req, res) => {
try
 { const { username, email, password } = req.body;

  const newUser = new User({ username, email, password });

  newUser.save();
  return res.send(newUser)
}catch(err){
  return res.send(err)
}
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  User.findOne({ username }, (err, user) => {
    if (err) return res.status(500).send('Error on the server.');
    if (!user) return res.status(404).send('No user found.');

    user.comparePassword(password, (err, isMatch) => {
      if (err) return res.status(500).send('Error on the server.');
      if (!isMatch) return res.status(401).send('Password is incorrect.');

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: 86400 // expires in 24 hours
      });

      res.status(200).send({ auth: true, token });
    });
  });
});

app.get('/getChatsByUser/:username', async(req, res)=>{
  try {
    
    const username = req.params.username;
    const user = await User.findOne({ username: username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const chats = await Chat.find({ user: user._id });

    const decryptedChats = chats.map(chat => ({
      sender: chat.sender,
      user: chat.user,
      message: chat.decryptMessage(),
      timestamp: chat.timestamp
    }));

    res.json(decryptedChats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
})

server.listen(3000, () => {
  console.log('server started on port 3000');
});
