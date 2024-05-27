const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
  userID: {
    type: String
  },
  messageGroups: [
    {
      senderID : {
        type: String
      },
      messages: [{
        text: {
          type: String,
          required: true
        },
        file: {
          type: Buffer
        },
        timeStamp: {
          type: Date,
          default: Date.now
        }
      }]
    }
  ]
});
  
  const Chat = mongoose.model('Chat', ChatSchema);
  
  module.exports = Chat;
  