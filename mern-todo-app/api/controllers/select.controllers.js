var selectAptData = require('../data/apt-search.json');

module.exports.aptSelect = function(req, res) {
//console.log('Requested by: ');
    console.log('Select apartment');
    console.log(req.query);


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

    var dataWindow = aptRiskData.slice(offset, count);

    res
      .status(200)
      .json(selectAptData);
};