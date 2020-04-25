var async = require('async');
var pg = require('pg');
var pgConfig = require('../../pgConfig');
var redis = require('../data/redis-connection');
var redis_client = redis.get();

redis_client.on('error', function(err){
  redisConnected = false;
  console.error('ERR:REDIS:', err);
});

module.exports.cache = function(req,res,next){
  var aptID = req.params.aptID || null;
  var space = req.params.space || null;
  var lcode = req.params.lcode || null;
  var APIName = req.originalUrl.split("/")[3]

  if(!redis.isConnected()) { console.log("redis not connected"); next(); }
  

  if(APIName === 'getOnePrice'){
    redis_client.get(aptID+":"+space, function(err, data){
      if(err) throw err;

      if(data !== null){
        console.log(APIName + " cached in REDIS!");
        res.send({result:'success', data:JSON.parse(data)});
      }else{
        next();
      }
    })
  }
  else if(APIName === 'aptSupply'){
    redis_client.get("aptSupply", function(err, data){
      if(err) throw err;

      if(data !== null){
        console.log(APIName + " CACHED in REDIS!");
        res.send({result:'success', data:JSON.parse(data)});
      }else{
        next();
      }
    })
  }

}




module.exports.aptsPrediction = function(req, res) {
  var db = {};
  var data = {};
  var district = req.params.district || 'gu';
  var offset = req.query.offset || '0'
  var SQLQuery = null;

  console.log(district);
  var validateOfViewContent = function(params) {
    if('object' !== typeof params) return false;
    return true;
  };
    
  res.type('application/json');

  // if(false == validateOfViewContent(LCODE)) {
  //   return res.send({result:'fail'});
  // }

  if(district === 'city'){ 
    SQLQuery = "select * from (select distinct on (lcode) lcode, city, fifty, mean, tcount, rdate "
      + " from apt_stats where lcode < 100 and rtype = 'S' "
      + " order by lcode, rdate desc) t order by fifty desc"
  } else if(district === 'gu'){
    SQLQuery = "select * from (select distinct on (lcode) lcode, city, fifty, mean, tcount, rdate "
      + " from apt_stats where lcode >= 100 and lcode < 100000 and rtype = 'S' "
      + " order by lcode, rdate desc) t order by fifty desc;"
  }else{
    console.log("dong.....", offset)
    SQLQuery = "select * from (select distinct on (lcode) lcode, city, fifty, mean, tcount, rdate "
      + " from apt_stats where lcode > 100000 and rtype = 'S' "
      + " order by lcode, rdate desc) t order by fifty desc "
      + " offset " 
      + offset
      + " rows fetch next 50 rows only;"
  }

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
      console.log("querying stats temporarily....");
      db.client.query(
         SQLQuery
        ,[]
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
      console.log(data);
      res.send({result:'success', data:data});
    });
};



module.exports.predictionHistory = function(req, res) {
  var db = {};
  var data = {};
  var LCODE = req.params.lcode || '11';

  var validateOfViewContent = function(params) {
    if('object' !== typeof params) return false;
    return true;
  };
    
  res.type('application/json');

  // if(false == validateOfViewContent(LCODE)) {
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
      console.log("querying stats temporarily....");
      db.client.query(
         " select lcode, city, fifty, mean, tcount, rdate from apt_stats where lcode = $1 and rtype = 'S' order by rdate desc;"
        ,[LCODE]
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
      console.log(data);
      res.send({result:'success', data:data});
    }); 

}


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