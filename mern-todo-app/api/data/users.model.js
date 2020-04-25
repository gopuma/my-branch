var mongoose = require('mongoose');


var temporarySchema = new mongoose.Schema({
  temp: {
    type: Boolean,
    required: true,
    "default": true
  },
  tempKey: {
    type: String,
    required: true,
    "default": 'please-create-tempKey'
  }
});

var userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String
  },
  password: {
    type: String,
    required: true
  },
  tempKey: {
    type: String,
    required: true
  },
  tempKeyCreatedAt:{
    type: Date,
    required: true,
    "default": Date.now
  },
  createdAt: {
    type: Date,
    required: true,
    "default": Date.now
  }
});

mongoose.model('User', userSchema);
