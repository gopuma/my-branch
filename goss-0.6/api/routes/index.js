var express = require('express');
var router = express.Router();


var ctrlUsers = require('../controllers/users.controllers.js');
var ctrlIngredients = require('../controllers/ingredients.controllers.js');
// var ctrlMessages = require('../controllers/messages.controllers.js');
// var ctrlApts = require('../controllers/apts.controllers.js');
// var ctrlVerify = require('../controllers/verify.controllers.js');
// var ctrlPrediction = require('../controllers/predictions.controllers.js');
// var ctrlSelectApt = require('../controllers/select.controllers.js');
// var ctrlAddress = require('../controllers/address.controllers.js');
// var ctrlMap = require('../controllers/map.controllers.js');
// var ctrlAptPrice = require('../controllers/aptPrice.controllers.js');
// var ctrlAptStats = require('../controllers/aptStats.controllers.js');



// Authentication
router
  .route('/users/register')
  .post(ctrlUsers.register);

router
  .route('/ingredients')
  .get(ctrlIngredients.getIngredients);

// router
//   .route('/users/verifyEmail')
//   .post(ctrlUsers.verifyEmail);

// router
//   .route('/verify/:verifyId')
//   .get(ctrlVerify.verifyAccount);

// router
//   .route('/verify-email/:verifyId')
//   .get(ctrlVerify.verifyEmail);


router
  .route('/users/login')
  .post(ctrlUsers.login);

// router
//   .route('/apts/:query')
//   .get(ctrlApts.aptsGetAll);

// router
//   .route('/apts/getLatLng/:aptID')  
//   .get(ctrlApts.getLatLng);

// router
//   .route('/searchAPTS')
//   .get(ctrlApts.searchPopularAPTS);

// // APT reviews and replies
// router
//   .route('/apt/:aptId/reviews/:reviewID')
//   .put(ctrlUsers.authenticate, ctrlAptReview.reviewsUpdateOne);

// router
//   .route('/apt/:aptID/reviews')
//   .get(ctrlAptReview.reviewsGetAll)
//   .post(ctrlAptReview.reviewsAddOne);

// router
//   .route('/apt/:aptID/reviewsCount')
//   .get(ctrlAptReview.reviewsGetCount)

//Authenticated version of review post
// router
//   .route('/apt/:aptID/reviews')
//   .get(ctrlUsers.authenticate, ctrlAptReview.reviewsGetAll)
//   .post(ctrlUsers.authenticate, ctrlAptReview.reviewsAddOne);

// s

module.exports = router;
