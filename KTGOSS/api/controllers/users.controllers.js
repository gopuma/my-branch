var mongoose = require('mongoose');
var User     = mongoose.model('User');
var bcrypt   = require('bcrypt-nodejs');
var jwt      = require('jsonwebtoken');
var nodemailer = require("nodemailer");
var config = require('../data/config.js');
var uuid = require('node-uuid');
var uuid4 = uuid.v4();

module.exports.register = function(req, res) {
  console.log('registering user');

  var username = req.body.username;
  var name = req.body.name || null;
  var password = req.body.password;

  User.create({
    username: username,
    name: name,
    tempKey: uuid4,
    password: bcrypt.hashSync(password, bcrypt.genSaltSync(10))
  }, function(err, user) {
    if (err) {
      console.log(err);
      res.status(400).json(err);
    } else {
      console.log('user created', user);
      res.status(201).json(user);
    }
  });
};

module.exports.login = function(req, res) {
  console.log('logging in user');
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({
    username: username
  }).exec(function(err, user) {
    if (err) {
      console.log(err);
      res.status(400).json(err);
    } else {
      if (bcrypt.compareSync(password, user.password)) {
        console.log('User found', user);
        var token = jwt.sign({ username: user.username }, 's3cr3t', { expiresIn: 3600 });
        res.status(200).json({success: true, token: token});
      } else {
        res.status(401).json('Unauthorized');
      }
    }
  });
};

module.exports.authenticate = function(req, res, next) {
  var headerExists = req.headers.authorization;
  if (headerExists) {
    var token = req.headers.authorization.split(' ')[1]; //--> Authorization Bearer xxx
    jwt.verify(token, 's3cr3t', function(error, decoded) {
      if (error) {
        console.log(error);
        res.status(401).json('Unauthorized');
      } else {
        req.user = decoded.username;
        next();
      }
    });
  } else {
    res.status(403).json('No token provided');
  }
};


module.exports.sendConfirmationEmail = function(req, res) {
  var transport = nodemailer.createTransport({
    service: "SendinBlue",
    auth: {
        user: config.mailUser,
        pass: config.mailPass
      }
  });
  var username = req.body.username;

  console.log(username);
  
  console.log(uuid4);
  //rand=Math.floor((Math.random() * 100) + 54);
    host=req.get('host');
    link="http://"+req.get('host')+"#!/verify?verifyId="+uuid4;
    imgLink = "http://localhost:3000/images/verify_email.png";
    imgSize = "width:104px;height:28px;";
    mailOptions={
        from: "john@beantowndataworks.com",
        to : username,//"buterrier@gmail.com",
        subject : "Please confirm your Email account",
        html : "<img src="+imgLink+" style="+imgSize+"><br>Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>" 
    }
    console.log(mailOptions);
    transport.sendMail(mailOptions, function(error, response){
     if(error){
        console.log(error);
        res.end("error");
     }else{
        console.log("Message sent: " + mailOptions.to);
        res.end("sent");
     }
  });
};


module.exports.verifyEmail = function(req, res) {
  var transport = nodemailer.createTransport({
    service: "SendinBlue",
    auth: {
        user: config.mailUser,
        pass: config.mailPass
      }
  });

  var mailOptions, host, link;
  var userEmail = req.body.clientEmail;

  console.log(userEmail);
  console.log(uuid4);
  //rand=Math.floor((Math.random() * 100) + 54);
    host=req.get('host');
    link="http://"+req.get('host')+"#!/verify-email?verifyId="+uuid4;
    imgLink = "http://localhost:3000/images/verify_email.png";
    imgSize = "width:104px;height:28px;";
    mailOptions={
        from: "john@beantowndataworks.com",
        to : userEmail,//"buterrier@gmail.com",
        subject : "Please confirm your Email account",
        html : "<img src="+imgLink+" style="+imgSize+"><br>Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>" 
    }
    console.log(mailOptions);
    transport.sendMail(mailOptions, function(error, response){
     if(error){
        console.log(error);
        res.end("error");
     }else{
        console.log("Message sent: " + mailOptions.to);
        res.end("sent");
     }
  });
};


module.exports.verifyAccount = function(req, res) {
  
  var id = req.params.verifyId;

  console.log('GET verifyId', verifyId);
  console.log('GET verifyId', id);
  console.log(req.protocol+":/"+req.get('host'));

  User
    .find({tempKey: id})
    .exec(function(err, doc) {
      var response = {
        status : 200,
        message : doc
      };
      if (err) {
        console.log("Error finding tempKey");
        response.status = 500;
        response.message = err;
      } else if(!doc) {
        console.log("verifyId not found in database", id);
        response.status = 404;
        response.message = {
          "message" : "verify ID not found " + id
        };
      }
      res
        .status(response.status)
        .json(response.message);
    });

};