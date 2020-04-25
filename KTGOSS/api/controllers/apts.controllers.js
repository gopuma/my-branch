var async = require('async');
var pg = require('pg');
var pgConfig = require('../../pgConfig');
var aptData = require('../data/apt-data.json');
var searchAPTSData = require('../data/popularAPTList.json');
var coinData = require('../data/coins.json')



module.exports.searchPopularAPTS = function(req, res) {
  console.log('GET popular APTS from JSON');
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

  // var dataWindow = aptData.slice(offset, count);
  
  res
    .status(200)
    .json(searchAPTSData);

}

module.exports.aptsGetAll = function(req, res) {
  //console.log('Requested by: ');
  console.log('GET the apts');
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

  var dataWindow = aptData.slice(offset, count);

  res
    .status(200)
    .json(aptData);
};
 
 module.exports.getLatLng = function(req,res,next){
  var db = {};
  var data = {};

  //var aptID = req.params.aptID;
  //var space = req.params.space;

  var aptID = req.params.aptID;

  console.log("aptID(getLatLng):============================================== ", aptID);

  // var validateOfViewContent = function(aptID, space) {
  //   // if('object' !== typeof req.params) return false;
  //   if('number' !== typeof params.aptID) return false;
  //   if('number' !== typeof params.space) return false;
  //   return true;
  // };
    
  res.type('application/json');

  // if(false == validateOfViewContent(req.params)) {
  //   return res.send({result:'fail'});
  // }
    
  async.waterfall([
    function(callback) {
      pg.connect(pgConfig.db.URL, callback);
      console.log("pg connection");
    },
    function(client, done, callback) {
      db.client = client;
      db.done = done;
      db.transactions = false;
      console.log("client connection");
      callback();
    },
     function(callback) {
      console.log("querying latitude longitude....");
      db.client.query(
          "SELECT APTID, LATITUDE, LONGITUDE, APT_NAME, BYEAR"
        + "  FROM APT_MASTER"
        + " WHERE APTID = $1"
        ,[aptID]
        , callback
      );
    }
    ,function(result, callback) {
      console.log(result);
      //data.list = result.rows;
      data = result.rows;
      callback();
    }
  ], 
  function(err) {
    if(('undefined' != typeof db.transactions) && (true == db.transactions)){
      db.client.query((err) ? 'ROLLBACK' : 'COMMIT', db.client.end.bind(db.client));
    }
    
    if('undefined' != typeof db.done) {
      db.done();
    }

    if(err) return res.send({result:err});
    res.send({result:'success', data:data});
  }); 
};




var aptRiskData = require('../data/apt-rdata.json');

module.exports.aptsRiskAssess = function(req, res) {
//console.log('Requested by: ');
    console.log('GET the apts risk assessment data');
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

    var dataWindow = aptRiskData.slice(offset, count);

    res
      .status(200)
      .json(aptRiskData);
};
 