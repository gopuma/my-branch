var nodemailer = require("nodemailer");
var uuid = require('node-uuid');
var config = require('../data/config.js');
var mongoose = require('mongoose');
var User = mongoose.model('User');


module.exports.verifyEmail = function(req,res){
	console.log(req.protocol+":/"+req.get('host'));
	if((req.protocol+"://"+req.get('host'))==("http://"+host))
	{
	    console.log("Domain is matched. Information is from Authentic email");
	    if(req.query.id==rand)
	    {
	        console.log("email is verified");
	        res.end("<h1>Email "+mailOptions.to+" is been Successfully verified");
	    }
	    else
	    {
	        console.log("email is not verified");
	        res.end("<h1>Bad Request</h1>");
	    }
	}
	else
	{
	    res.end("<h1>Request is from unknown source");
	}
};



module.exports.verifyAccount = function(req, res) {
  
  var id = req.params.verifyId;
  var date = new Date();
  date.setHours(date.getHours() + 1);

// now you can get the string
  var validHours = date.toISOString();

  //console.log('GET verifyId', verifyId);
  console.log('GET verifyId', id);
  console.log(req.protocol+":/"+req.get('host'));

  //user email verification should be made within 6 hours(21600000 millisecons)
  User
    .find({ $and: [ {tempKey: id}, {tempKeyCreatedAt: { $gte: validHours } } ] })
    .exec(function(err, user) {
      var response = {
        status : 200,
        message : user
      };
      if (err) {
        console.log("Error finding tempKey");
        response.status = 500;
        response.message = err;
      } else if(user.length === 0){
        User
          .find({ $and: [ {tempKey: id}, {tempKeyCreatedAt: { $lt: validHours } } ] })
          .exec(function(err, user) {
            var response = {
              status : 200,
              message : user
            };
            if(err){
              console.log("Error finding tempKey");
              response.status = 500;
              response.message = err;
            } else if (user.length === 0){
              console.log("verifyId not found in database", id);
              response.status = 404;
              response.message = {
                "message" : "verify ID not found " + id      
              };
              res
                .status(response.status)
                .json(response.message);
            } else{
                console.log('Email Verification Period Expired');
                console.log(response.status);
                console.log(response.message);
                res
                  .status(response.status)
                  .json(response.message);        
            }
        });

      } else {
        console.log('Successfully verified user email');
        console.log(response.status);
        console.log(response.message);
        res
          .status(response.status)
          .json(response.message); 
      }
      //console.log('Email Verification Period Expired');
      // console.log(response.status);
      // console.log(response.message);
      // res
      //   .status(response.status)
      //   .json(response.message);
    });

};

// module.exports.verifyAccount = function(req, res) {
  
//   var id = req.params.verifyId;

//   console.log('GET verifyId', id);

//   console.log(req.protocol+":/"+req.get('host'));
// 	if((req.protocol+"://"+req.get('host'))==("http://"+host))
// 	{
// 	    console.log("Domain is matched. Information is from Authentic email");
// 	    if(req.query.id==rand)
// 	    {
// 	        console.log("email is verified");
// 	        res.end("<h1>Email "+mailOptions.to+" is been Successfully verified");
// 	    }
// 	    else
// 	    {
// 	        console.log("email is not verified");
// 	        res.end("<h1>Bad Request</h1>");
// 	    }
// 	}
// 	else
// 	{
// 	    res.end("<h1>Request is from unknown source");
// 	}



//   User
//     .find({tempKey: id})
//     .exec(function(err, doc) {
//       var response = {
//         status : 200,
//         message : doc
//       };
//       if (err) {
//         console.log("Error finding tempKey");
//         response.status = 500;
//         response.message = err;
//       } else if(!doc) {
//         console.log("verifyId not found in database", id);
//         response.status = 404;
//         response.message = {
//           "message" : "verify ID not found " + id
//         };
//       }
//       res
//         .status(response.status)
//         .json(response.message);
//     });

// };