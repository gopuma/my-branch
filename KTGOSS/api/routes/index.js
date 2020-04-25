var express = require('express');
var router = express.Router();

var ctrlUsers = require('../controllers/users.controllers.js');
var ctrlMessages = require('../controllers/messages.controllers.js');
var ctrlApts = require('../controllers/apts.controllers.js');
var ctrlVerify = require('../controllers/verify.controllers.js');
var ctrlPrediction = require('../controllers/predictions.controllers.js');
var ctrlSelectApt = require('../controllers/select.controllers.js');
var ctrlAddress = require('../controllers/address.controllers.js');
var ctrlMap = require('../controllers/map.controllers.js');
var ctrlAptPrice = require('../controllers/aptPrice.controllers.js');
var ctrlAptStats = require('../controllers/aptStats.controllers.js');

// // Hotel routes
// router
//   .route('/hotels')
//   .get(ctrlHotels.hotelsGetAll)
//   .post(ctrlHotels.hotelsAddOne);

// router
//   .route('/hotels/:hotelId')
//   .get(ctrlHotels.hotelsGetOne)
//   .put(ctrlHotels.hotelsUpdateOne);


// // Hotel Review routes
// router
//   .route('/hotels/:hotelId')
//   .get(ctrlReviews.reviewsGetAll)
//   .post(ctrlUsers.authenticate, ctrlReviews.reviewsAddOne);

// router
//   .route('/hotels/hotelId/reviews')
//   .get(ctrlReviews.reviewsGetOne)
//   .put(ctrlReviews.reviewsUpdateOne);


// Authentication
router
  .route('/users/register')
  .post(ctrlUsers.register);

router
  .route('/users/sendConfirmationEmail')
  .post(ctrlUsers.sendConfirmationEmail);

router
  .route('/users/verifyEmail')
  .post(ctrlUsers.verifyEmail);

router
  .route('/verify/:verifyId')
  .get(ctrlVerify.verifyAccount);

router
  .route('/verify-email/:verifyId')
  .get(ctrlVerify.verifyEmail);


router
  .route('/users/login')
  .post(ctrlUsers.login);

router
  .route('/apts')
  .get(ctrlApts.aptsGetAll);

router
  .route('/apts/getLatLng/:aptID')  
  .get(ctrlApts.getLatLng);

router
  .route('/searchAPTS')
  .get(ctrlApts.searchPopularAPTS);

// APT reviews and replies
router
  .route('/apt/:aptId/reviews/:reviewID')
  .put(ctrlUsers.authenticate, ctrlAptReview.reviewsUpdateOne);

router
  .route('/apt/:aptID/reviews')
  .get(ctrlAptReview.reviewsGetAll)
  .post(ctrlAptReview.reviewsAddOne);

router
  .route('/apt/:aptID/reviewsCount')
  .get(ctrlAptReview.reviewsGetCount)

//Authenticated version of review post
// router
//   .route('/apt/:aptID/reviews')
//   .get(ctrlUsers.authenticate, ctrlAptReview.reviewsGetAll)
//   .post(ctrlUsers.authenticate, ctrlAptReview.reviewsAddOne);

router
  .route('/apt/:aptID/reviews/:reviewID/reply')
  .post(ctrlAptReview.replyAddOne);
  // .post(ctrlUsers.authenticate, ctrlAptReview.replyAddOne);


router
  .route('/address/:cityName')
  .get(ctrlAddress.selectAddr1);

router
  .route('/address/:addr0/addr1/:addr1')
  .get(ctrlAddress.selectAddr2);

router
  .route('/address/:addr0/addr1/:addr1/addr2/:addr2')
  .get(ctrlAddress.aptSearch);

router
  .route('/address/:addr0/addr1/:addr1/addr2/:addr2/apt/:apt')
  .get(ctrlAddress.aptSpace);

router
  .route('/apts/riskAssess')
  .get(ctrlApts.aptsRiskAssess);

router
  .route('/predictions')
  .get(ctrlPrediction.aptsPrediction);

router
  .route('/predict')
  .post(ctrlPrediction.predict);

router
  .route('/select')
  .get(ctrlSelectApt.aptSelect);

router
  .route('/messages')
  .post(ctrlMessages.messagesAddOne);

router
  .route('/map/ready')
  .post(ctrlMap.ready);

router
  .route('/map/aptsInMap')
  .post(ctrlMap.aptsInMap);

router
  .route('/map/theAptInMap')
  .post(ctrlMap.theAptInMap);

router
  .route('/map/aptsPricesInMap')
  .post(ctrlMap.aptsPricesInMap);

router
  .route('/map/dongInMap')
  .post(ctrlMap.dongInMap);

router
  .route('/map/guInMap')
  .post(ctrlMap.guInMap);

router
  .route('/map/cityInMap')
  .post(ctrlMap.cityInMap);


router
  .route('/map/aptPriceDelta')
  .post(ctrlMap.aptPriceDelta);

router
  .route('/stats/aptPriceDelta/:lcode')
  .get(ctrlAptStats.aptPriceDelta);

router
  .route('/price/salePrice')
  .post(ctrlAptPrice.salePrice);

router
  .route('/price/collateralPrice')
  .post(ctrlAptPrice.collateralPrice);

router
  .route('/price/rentPrice')
  .post(ctrlAptPrice.rentPrice);

router
  .route('/stats/aptSupply')
  .get(ctrlAptStats.aptSupply);

router
  .route('/stats/aptSupplyByGu/:lcode')
  .get(ctrlAptStats.aptSupplyByGu);

router
  .route('/stats/aptProfitByDong/:lcode/aptID/:aptID')
  .get(ctrlAptStats.aptProfitByDong);

router
  .route('/stats/aptRiskByDong/:lcode/aptID/:aptID')
  .get(ctrlAptStats.aptRiskByDong);

router
  .route('/stats/mortgageLoan')
  .get(ctrlAptStats.mortgageLoan);


router
  .route('/stats/getOnePrice/:aptID/space/:space')
  .get(ctrlAptStats.getOnePrice);

router
  .route('/stats/getPrice')
  .post(ctrlAptStats.getPrice);

router
  .route('/stats/getSpace/:aptID')
  .get(ctrlAptStats.getSpace);

module.exports = router;
