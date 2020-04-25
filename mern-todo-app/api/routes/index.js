var express = require('express');
var router = express.Router();

var ctrlHotels = require('../controllers/hotels.controllers.js');
var ctrlReviews = require('../controllers/reviews.controllers.js');
var ctrlAptReview = require('../controllers/aptReview.controllers.js');
var ctrlUsers = require('../controllers/users.controllers.js');


// Authentication
router
  .route('/users/register')
  .post(ctrlUsers.register);


router
  .route('/users/login')
  .post(ctrlUsers.login);


module.exports = router;
