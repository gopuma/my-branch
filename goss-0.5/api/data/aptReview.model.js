var mongoose = require('mongoose');


var replySchema = new mongoose.Schema({
  reply : {
    type : String,
    required : true
  },
  username : {
    type : String,
    required : true
  },
  createdOn : {
    type : Date,
    "default" : Date.now
  }
});



var reviewSchema = new mongoose.Schema({
  username : {
    type : String,
    required : true
  },
  review : {
    type : String,
    required : true
  },
  reply : [replySchema],
  createdOn : {
    type : Date,
    "default" : Date.now
  }
});


var aptReviewSchema = new mongoose.Schema({
  aptID : {
    type : Number,
    required : true
  },
  aptName : {
    type : String,
    required : true
  },
  stars : {
    type : Number,
    min : 0,
    max : 5,
    default : 0
  },
  reviews : [reviewSchema],
  createdOn : {
    type : Date,
    "default" : Date.now
  }
});

mongoose.model('AptReview', aptReviewSchema);