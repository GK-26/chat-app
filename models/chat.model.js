const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');
require('dotenv').config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY.padEnd(32, '0'); 

const IV_LENGTH = 16; 

const chatSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String },
  image: { type: String },
  timestamp: { type: Date, default: Date.now }
});


// Encryption function
function encrypt(text) {
  const iv = CryptoJS.lib.WordArray.random(IV_LENGTH);
  const key = CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY);
  const encrypted = CryptoJS.AES.encrypt(text, key, { iv: iv });
  const ivHex = CryptoJS.enc.Hex.stringify(iv);
  const encryptedText = encrypted.ciphertext.toString(CryptoJS.enc.Hex);
  return ivHex + ':' + encryptedText;
}

// Decryption function
function decrypt(text) {
  if(!text || text.length == 0) return "";
  const textParts = text.split(':');
  const iv = CryptoJS.enc.Hex.parse(textParts.shift());
  const encryptedText = CryptoJS.enc.Hex.parse(textParts.join(':'));
  const key = CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY);
  const decrypted = CryptoJS.AES.decrypt({ ciphertext: encryptedText }, key, { iv: iv });
  return decrypted.toString(CryptoJS.enc.Utf8);
}

// Add encryption to message and image fields
chatSchema.pre('save', function (next) {
  if (this.isModified('message')) {
    this.message = encrypt(this.message);
  }
  if (this.isModified('image')) {
    this.image = encrypt(this.image);
  }
  next();
});

chatSchema.methods.decryptMessage = function () {
  return decrypt(this.message);
};

chatSchema.methods.decryptImage = function (image) {
  return decrypt(image);
};

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
