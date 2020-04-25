var mongoose = require('mongoose');

var messageSchema = new mongoose.Schema({
  firstname : {
    type : String,
    required : false
  },
  lastname : {
    type : String,
    required : false,
  },
  email : {
    type : String,
    required : true
  },
  phoneNumber : {
    type: String,
    required: false
  },
  message : {
    type : String,
    required : false
  },
  createdOn : {
    type : Date,
    "default" : Date.now
  }
});

mongoose.model('Message', messageSchema);