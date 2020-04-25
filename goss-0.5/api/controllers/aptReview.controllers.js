var mongoose = require('mongoose');
var AptReview = mongoose.model('AptReview');


// GET all reviews for an APT
module.exports.reviewsGetAll = function(req, res) {
  var id = req.params.aptID;
  console.log('GET reviews for aptID', id);

  AptReview
    .findOne({aptID : id})
    // .findById('5aed8f3aee94d9041e99ae2a')
    .select('reviews')
    .exec(function(err, doc) {
      var response = {
        status : 200,
        message : []
      };
      if (err) {
        console.log("Error finding reviews");
        response.status = 500;
        response.message = err;
      } else if(!doc) {
        console.log("AptID not found in database", id);
        response.status = 404;
        response.message = {
          "message" : "AptID not found " + id
        };
      } else {
        response.message = doc.reviews ? doc.reviews : [];
        console.log(response.message);
      }
      res
        .status(response.status)
        .json(response.message);
    });
};

//Get reviews count for an apt.(used in Chat tab count badge)
module.exports.reviewsGetOne = function(req, res) {
  var aptID = req.params.aptID;
  var reviewID = req.params.reviewID;
  console.log('GET reviewID ' + reviewID + ' for aptID ' + aptID);

  AptReview
    .find({"aptID" : id})
    .select('reviews')
    .exec(function(err, apt) {
      var response = {
        status : 200,
        message : {}
      };
      if (err) {
        console.log("Error finding apt");
        response.status = 500;
        response.message = err;
      } else if(!review) {
        console.log("reviewID not found in database", id);
        response.status = 404;
        response.message = {
          "message" : "Apt ID not found " + id
        };
      } else {
        // Get the review
        response.message = apt.reviews.id(reviewID);
        // If the review doesn't exist Mongoose returns null
        if (!response.message) {
          response.status = 404;
          response.message = {
            "message" : "Review ID not found " + reviewID
          };
        }
      }
      res
        .status(response.status)
        .json(response.message);
    });

};



// GET single review for an APT
module.exports.reviewsGetCount = function(req, res) {
  var id = req.params.aptID;
  console.log('GET reviews COUNT =======================================', id);

  AptReview
    .findOne({aptID : id})
    // .findById('5aed8f3aee94d9041e99ae2a')
    .select('reviews')
    .exec(function(err, doc) {
      var response = {
        status : 200,
        message : []
      };
      if (err) {
        console.log("Error finding reviews COUNT============================");
        response.status = 500;
        response.message = err;
      } else if(!doc) {
        console.log("AptID not found in database", id);
        response.status = 404;
        response.message = {
          "message" : "AptID not found " + id
        };
      } else {
        response.message = doc.reviews ? doc.reviews : [];
        console.log(response.message.length,"==================================");
      }
      res
        .status(response.status)
        .json(response.message.length);
    });
};

var _addReview = function (req, res, apt) {
  console.log(req.body.username, req.body.review);
  console.log(typeof apt);
  apt.reviews.push({
    username : req.body.username,
    review : req.body.review
  });

  apt.save(function(err, aptUpdated) {
    if (err) {
      res
        .status(500)
        .json(err);
    } else {
      res
        .status(200)
        // .json(aptUpdated.reviews[aptUpdated.reviews.length - 1]);
        .json(aptUpdated);
    }
  });

};

module.exports.reviewsAddOne = function(req, res) {
  var aptID = req.params.aptID;
  console.log('POST review to aptID', req.params.aptID);
  console.log('POST review to aptID', req.body);
  AptReview
    .findOne({"aptID" : aptID})
    .exec(function(err, doc) {
      var response = {
        status : 200,
        message : doc
      };
      if (err) {
        console.log("Error finding apt");
        response.status = 500;
        response.message = err;
      } else if(!doc){
        console.log("Apt ID not found in database, Apt is being created!", aptID);
        console.log("Apt ", req.body.aptID, req.body.aptName, req.body.review);
        AptReview
          .create({
            aptID: req.body.aptID,
            // username: req.body.username,
            reviews : [{review: req.body.review, username: req.body.username}],
            aptName : req.body.aptName,
            stars : parseInt(req.body.rating,10)
          }, function(err, apt) {
            if (err) {
              console.log("Error creating APT");
              res
                .status(400)
                .json(err);
            } else {
              console.log("Apt record created!", apt);
              // res
              //   .status(201)
              //   .json(apt);
              response.status = 201;
              response.message = {
                "message" : "Apt record created " + aptID
              };
            }
          });
        }
      // } else if(!doc) {
      //   console.log("Apt ID not found in database", aptID);
      //   response.status = 404;
      //   response.message = {
      //     "message" : "Apt ID not found " + aptID
      //   };
      // }
      if (doc) {
        console.log(doc);
        _addReview(req, res, doc);
      } 
      // else{
      //   res
      //     .status(response.status)
      //     .json(response.message);
      // }
    });
};


var _addReply = function (req, res, apt, reviewID) {
  // console.log("apt in_addReply: ",apt.reviews[2].reply);
  // console.log(req.body.username, req.body.reply);
  // apt.reviews[2].reply.push({
  //   username : req.body.username,
  //   reply : req.body.reply
  // });
  var review = apt.reviews.id(reviewID);

  review.reply.push({
    username: req.body.username,
    reply: req.body.reply
  });


  apt.save(function(err, replyUpdated) {
    if (err) {
      res
        .status(500)
        .json(err);
    } else {
      res
        .status(200)
        .json(replyUpdated);
    }
  });
};


module.exports.replyAddOne = function(req, res) {
  var aptID = req.params.aptID;
  var reviewID = req.params.reviewID;
  console.log('POST reply to reviewID', aptID, reviewID);

  // AptReview.findOne({aptID: aptID}, function (err, doc) {
  //   var result = doc.reviews.id(reviewID);
  //   console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>");
  //   console.log(result);
  // });
  
  AptReview
    .findOne({aptID: aptID})
    // .find({ "aptID": aptID, "reviews.review._id": reviewID })
    .exec(function(err, doc) {
      var response = {
        status : 200,
        message : doc
      };
      if (err) {
        console.log("Error finding review");
        response.status = 500;
        response.message = err;
      } else if(!doc) {
        console.log("Review ID not found in database", reviewID);
        response.status = 404;
        response.message = {
          "message" : "Review ID not found " + reviewID
        };
      }
      if (doc) {
        _addReply(req, res, doc, reviewID);
      } else {
        res
          .status(response.status)
          .json(response.message);
      }
    });


};


module.exports.reviewsUpdateOne = function(req, res) {
  var aptID = req.params.aptID;
  var reviewID = req.params.reviewID;
  console.log('PUT reviewID ' + reviewID + ' for aptID ' + aptID);

  AptReview
    .find({"aptID" : id})
    .select('reviews')
    .exec(function(err, apt) {
      var thisReview;
      var response = {
        status : 200,
        message : {}
      };
      if (err) {
        console.log("Error finding apt");
        response.status = 500;
        response.message = err;
      } else if(!apt) {
        console.log("Apt id not found in database", id);
        response.status = 404;
        response.message = {
          "message" : "Apt ID not found " + id
        };
      } else {
        // Get the review
        thisReview = hotel.reviews.id(reviewID);
        // If the review doesn't exist Mongoose returns null
        if (!thisReview) {
          response.status = 404;
          response.message = {
            "message" : "Review ID not found " + reviewID
          };
        }
      }
      if (response.status !== 200) {
        res
          .status(response.status)
          .json(response.message);
      } else {
        thisReview.name = req.body.name;
        thisReview.rating = parseInt(req.body.rating, 10);
        thisReview.review = req.body.review;
        hotel.save(function(err, hotelUpdated) {
          if (err) {
            res
              .status(500)
              .json(err);
          } else {
            res
              .status(204)
              .json();
          }
        });
      }
    });

};
