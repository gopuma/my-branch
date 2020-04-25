var mongoose = require('mongoose');
var Message = mongoose.model('Message');


module.exports.messagesGetAll = function(req, res) {
  console.log('Requested by: ' + req.user);
  console.log('GET the hotels');
  console.log(req.query);

  var offset = 0;
  var count = 10;
  var maxCount = 50;

  if (req.query && req.query.lat && req.query.lng) {
    runGeoQuery(req, res);
    return;
  }

  if (req.query && req.query.offset) {
    offset = parseInt(req.query.offset, 10);
  }

  if (req.query && req.query.count) {
    count = parseInt(req.query.count, 10);
  }

  if (isNaN(offset) || isNaN(count)) {
    res
      .status(400)
      .json({
        "message" : "If supplied in querystring, count and offset must both be numbers"
      });
    return;
  }

  if (count > maxCount) {
    res
      .status(400)
      .json({
        "message" : "Count limit of " + maxCount + " exceeded"
      });
    return;
  }

  Message
    .find()
    .skip(offset)
    .limit(count)
    .exec(function(err, messages) {
      console.log(err);
      console.log(messages);
      if (err) {
        console.log("Error finding hotels");
        res
          .status(500)
          .json(err);
      } else {
        console.log("Found hotels", messages.length);
        res
          .json(messages);
      }
    });

};

module.exports.messagesGetOne = function(req, res) {
  var id = req.params.hotelId;

  console.log('GET hotelId', id);

  Message
    .findById(id)
    .exec(function(err, doc) {
      var response = {
        status : 200,
        message : doc
      };
      if (err) {
        console.log("Error finding hotel");
        response.status = 500;
        response.message = err;
      } else if(!doc) {
        console.log("HotelId not found in database", id);
        response.status = 404;
        response.message = {
          "message" : "Hotel ID not found " + id
        };
      }
      res
        .status(response.status)
        .json(response.message);
    });

};

var _splitArray = function(input) {
  var output;
  if (input && input.length > 0) {
    output = input.split(";");
  } else {
    output = [];
  }
  return output;
};

var _addReview = function (req, res, message) {
  message.push({
    firstname : req.body.firstname,
    lastname : req.body.lastname,
    email : req.body.email,
    phoneNumber: req.body.phoneNumber,
    message : req.body.message
  });

  message.save(function(err, messageInserted) {
    if (err) {
      res
        .status(500)
        .json(err);
    } else {
      res
        .status(200)
        .json(messageInserted[messageInserted.length - 1]);
    }
  });

};

module.exports.messagesAddOne = function(req, res) {
  console.log("POST new message");

  Message
    .create({
      firstname : req.body.firstname,
      lastname : req.body.lastname,
      email : req.body.email,
      phoneNumber : req.body.phoneNumber,
      message : req.body.formMessage
    }, function(err, message) {
      if (err) {
        console.log("Error creating message");
        res
          .status(400)
          .json(err);
      } else {
        console.log("Message posted!", message);
        res
          .status(201)
          .json(message);
      }
    });

};


module.exports.hotelsUpdateOne = function(req, res) {
  var hotelId = req.params.hotelId;

  console.log('GET hotelId', hotelId);

  Hotel
    .findById(hotelId)
    .select('-reviews -rooms')
    .exec(function(err, hotel) {
      if (err) {
        console.log("Error finding hotel");
        res
          .status(500)
          .json(err);
          return;
      } else if(!hotel) {
        console.log("HotelId not found in database", hotelId);
        res
          .status(404)
          .lson({
            "message" : "Hotel ID not found " + hotelId
          });
          return;
      }

      hotel.name = req.body.name;
      hotel.description = req.body.description;
      hotel.stars = parseInt(req.body.stars,10);
      hotel.services = _splitArray(req.body.services);
      hotel.photos = _splitArray(req.body.photos);
      hotel.currency = req.body.currency;
      hotel.location = {
        address : req.body.address,
        coordinates : [parseFloat(req.body.lng), parseFloat(req.body.lat)]
      };

      hotel
        .save(function(err, hotelUpdated) {
          if(err) {
            res
              .status(500)
              .json(err);
          } else {
            res
              .status(204)
              .json();
          }
        });


    });

};
