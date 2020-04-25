var aptPredictionData = require('../data/apt-pdata.json');

module.exports.aptsPrediction = function(req, res) {
//console.log('Requested by: ');
console.log('GET the apts prediction');
console.log(req.query);

var offset = 0;
var count = 5;
var maxCount = 200;

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

var dataWindow = aptPredictionData.slice(offset, count);

res
  .status(200)
  .json(aptPredictionData);
};


module.exports.predict = function(req, res) {

console.log('parameters to pass');
//var email = req.body.email;
//var city = req.body.city || null;
//var space = req.body.space;

console.log(req.body.email);
console.log(req.body.lcode);

res
  .status(200)
  .json('Hello');
};