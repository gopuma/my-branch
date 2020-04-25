var async = require('async');
var pg = require('pg');
var pgConfig = require('../../pgConfig');
var redis = require('../data/redis-connection');
var redis_client = redis.get();
// const redis = require('redis');
// const REDIS_PORT = 6379;
// const redis_client = redis.createClient(REDIS_PORT)
// var redisConnected

// redis_client.on('connect', function() {
//     redisConnected = true
//     console.log('Redis client connected');
// });

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
  else if(APIName === 'aptSupplyByGu'){
    redis_client.get("aptSupplyByGu:"+lcode, function(err, data){
      if(err) throw err;

      if(data !== null){
        console.log(APIName + " CACHED in REDIS!");
        res.send({result:'success', data:JSON.parse(data)});
      }else{
        next();
      }
    })
  }
  else if(APIName === 'aptPriceDelta'){
    redis_client.get(lcode, function(err, data){
      if(err) throw err;

      if(data !== null){
        console.log(APIName + " CACHED in REDIS!");
        res.send({result:'success', data:JSON.parse(data)});
      }else{
        next();
      }
    })
  }
  else if(APIName === 'aptProfitByDong'){
    redis_client.get(aptID+":"+lcode, function(err, data){
      if(err) throw err;

      if(data !== null){
        console.log(APIName + " CACHED in REDIS!");
        res.send({result:'success', data:JSON.parse(data)});
      }else{
        next();
      }
    })
  }
  else if(APIName === 'aptRiskByDong'){
    redis_client.get(aptID+":"+lcode+":risk", function(err, data){
      if(err) throw err;

      if(data !== null){
        console.log(APIName + " CACHED in REDIS!");
        res.send({result:'success', data:JSON.parse(data)});
      }else{
        next();
      }
    })
  }
  else if(APIName === 'mortgageLoan'){
    redis_client.get("mortgageLoan", function(err, data){
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




module.exports.aptSupply = function(req,res,next){
  var db = {};
  var data = {};
  var params = req.body;

  var d = new Date();
  var year = d.getFullYear();
  var month = d.getMonth();
  var day = d.getDate();
  var twoYearsAhead = new Date(year + 2, month, day);
  var fourYearsAgo = new Date(year - 4, month, day);
  var twoYearsAhead = twoYearsAhead.toISOString().slice(0,10);
  var fourYearsAgo = fourYearsAgo.toISOString().slice(0,10);

  console.log("TWO YEARS------------------", twoYearsAhead)

  // var validateOfViewContent = function(params) {
  //   if('object' !== typeof params) return false;
  //   if('string' !== typeof params.period) return false;
  //   return true;
  // };
    
  res.type('application/json');

  // if(false == validateOfViewContent(params)) {
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
      console.log("querying apts supply....");
      db.client.query(
          "SELECT SUM(gsupply)+SUM(psupply) as total, move_in "
        + "  FROM APT_DETAIL"
        + " WHERE MOVE_IN >= $1 and MOVE_IN <= $2 group by move_in order by move_in"
        // "SELECT move_in, supply, aptname, area "
        // + "  FROM APT_SUMMARY"
        // + " WHERE MOVE_IN >= $1 and MOVE_IN <= $2 group by move_in, aptname, area, supply order by move_in"
        ,[fourYearsAgo, twoYearsAhead]
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
    if(redis_client.get("aptSupply" === null)){
      console.log("SET in REDIS: ", "aptSupply")
      redis_client.set("aptSupply", JSON.stringify(data));
    }
    res.send({result:'success', data:data});
  }); 
};


module.exports.aptSupplyByGu = function(req,res,next){
  var db = {};
  var data = {};
  // var params = req.body;
  var LCODE = req.params.lcode;
  var LCODE_START = (req.params.lcode/100000).toFixed(0) * 100000;
  var LCODE_END = LCODE_START + 1000000;

  console.log("**^&&&^&%^&#%^$%@$%#^%^&$%&", LCODE_START, LCODE_END);

  var d = new Date();
  var year = d.getFullYear();
  var month = d.getMonth();
  var day = d.getDate();
  var NOW = new Date(year, month, day)
  var twoYearsAhead = new Date(year + 2, month, day);
  var fourYearsAgo = new Date(year - 4, month, day);
  var fourYearsAhead = new Date(year + 4, month, day);
  var NOW = NOW.toISOString().slice(0,10);
  var twoYearsAhead = twoYearsAhead.toISOString().slice(0,10);
  var fourYearsAgo = fourYearsAgo.toISOString().slice(0,10);
  var fourYearsAhead = fourYearsAhead.toISOString().slice(0,10);

  console.log("TWO YEARS------------------", twoYearsAhead)

  // var validateOfViewContent = function(params) {
  //   if('object' !== typeof params) return false;
  //   if('string' !== typeof params.period) return false;
  //   return true;
  // };
    
  res.type('application/json');

  // if(false == validateOfViewContent(params)) {
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
      console.log("querying apts supply by gu");
      db.client.query(
        "SELECT move_in, supply, aptname, area "
        + "  FROM APT_SUMMARY"
        + " WHERE MOVE_IN >= $1 and MOVE_IN <= $2 and lcode > $3 and lcode < $4 order by move_in"
        ,[NOW, fourYearsAhead, LCODE_START, LCODE_END]
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
    if(redis_client.get("aptSupplyByGu" === null)){
      console.log("SET in REDIS: ", "aptSupplyByGu:", LCODE)
      redis_client.set("aptSupplyByGu:"+LCODE, JSON.stringify(data));
    }
    res.send({result:'success', data:data});
  }); 
};



module.exports.aptProfitByDong = function(req,res,next){
  var db = {};
  var data = {};

  var LCODE = req.params.lcode;//;1111017400;//req.params.lcode;
  var aptID = req.params.aptID;
  // var space = req.params.space;

  var d = new Date();
  var year = d.getFullYear();
  var month = d.getMonth();
  var day = d.getDate();
  var twoYearsAgo = new Date(year - 2, month, day);
  // var fourYearsAgo = new Date(year - 4, month, day);
  var twoYearsAgo = twoYearsAgo.toISOString().slice(0,10);
  // var fourYearsAgo = fourYearsAgo.toISOString().slice(0,10);

  // console.log("TWO YEARS------------------", twoYearsAgo);

  // var validateOfViewContent = function(params) {
  //   if('object' !== typeof params) return false;
  //   if('string' !== typeof params.period) return false;
  //   return true;
  // };
  
  console.log("aptProfitByDong LCODE>>>>>>>>>>>>>>>>>>>>", LCODE, aptID);

  res.type('application/json');

  // if(false == validateOfViewContent(params)) {
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
      console.log("querying Sharpe ratio, prediction....");
      db.client.query(
          "SELECT APTID, APTNAME, LCODE, APT_SPACE, ALL_TIME_SR, TWO_YR_SR, MAPE, VAR "
        + "  FROM APT_PREDICTION"
        + " WHERE LCODE = $1 and RDATE >= $2 order by (APTID=$3) DESC, TWO_YR_SR DESC LIMIT 5;"
        ,[LCODE, twoYearsAgo, aptID]
        , callback
      );
    }
    ,function(result, callback) {
      console.log(result);
      //data.list = result.rows;
      data = result.rows;
      console.log(data);
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
    if(redis_client.get(aptID+":"+LCODE === null)){
      console.log("SET in REDIS: ", aptID+":"+LCODE)
      redis_client.set(aptID+":"+LCODE, JSON.stringify(data));
    }
    res.send({result:'success', data:data});
  }); 
}; 


module.exports.aptRiskByDong = function(req,res,next){
  var db = {};
  var data = {};

  var LCODE = req.params.lcode;//;1111017400;//req.params.lcode;
  var aptID = req.params.aptID;
  // var space = req.params.space;

  var d = new Date();
  var year = d.getFullYear();
  var month = d.getMonth();
  var day = d.getDate();
  var twoYearsAgo = new Date(year - 2, month, day);
  
  var twoYearsAgo = twoYearsAgo.toISOString().slice(0,10);
  
  
  console.log("aptRiskByDong LCODE>>>>>>>>>>>>>>>>>>>>", LCODE, req.params.lcode);

  res.type('application/json');

  // if(false == validateOfViewContent(params)) {
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
      console.log("querying VaR ....");
      db.client.query(
          "SELECT APTID, APTNAME, LCODE, APT_SPACE, VAR "
        + "  FROM APT_PREDICTION"
        + " WHERE LCODE = $1 and RDATE >= $2 order by (APTID=$3) DESC, VAR DESC LIMIT 5;"
        ,[LCODE, twoYearsAgo, aptID]
        , callback
      );
    }
    ,function(result, callback) {
      console.log(result);
      //data.list = result.rows;
      data = result.rows;
      console.log(data);
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
    if(redis_client.get(aptID+":"+LCODE+":risk" === null)){
      console.log("SET in REDIS: ", aptID+":"+LCODE+":risk")
      redis_client.set(aptID+":"+LCODE+":risk", JSON.stringify(data));
    }
    res.send({result:'success', data:data});
  }); 
}; 




module.exports.mortgageLoan = function(req,res,next){
  var db = {};
  var data = {};
  var params = req.body;

  var d = new Date();
  var year = d.getFullYear();
  var month = d.getMonth();
  var day = d.getDate();
  var tenYearsAgo = new Date(year - 10, month, day);
  var tenYearsAgo = tenYearsAgo.toISOString().slice(0,10);

  // var validateOfViewContent = function(params) {
  //   if('object' !== typeof params) return false;
  //   if('string' !== typeof params.period) return false;
  //   return true;
  // };

  console.log("Inside mortgage loan");  
  res.type('application/json');

  // if(false == validateOfViewContent(params)) {
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
      console.log("querying mortgage loan amounts....");
      console.log(params.period);
      db.client.query(
          "SELECT rdate, value "
        + "  FROM rates"
        + " WHERE name = 'mortgageLoan' and rdate >= $1 ORDER BY RDATE"
        ,[tenYearsAgo]
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
    if(redis_client.get("mortgageLoan" === null)){
      console.log("SET in REDIS: ", "mortgageLoan")
      redis_client.set("mortgageLoan", JSON.stringify(data));
    }
    res.send({result:'success', data:data});
  }); 
};



module.exports.getPrice = function(req,res,next){
  var db = {};
  var data = {};
  var params = req.body;

  var validateOfViewContent = function(params) {
    if('object' !== typeof params) return false;
    if('string' !== typeof params.id) return false;
    if('string' !== typeof params.space) return false;
    return true;
  };
    
  res.type('application/json');

  if(false == validateOfViewContent(params)) {
    return res.send({result:'fail'});
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
      console.log("querying apts....");
      console.log(params.id);
      console.log(params.space);
      db.client.query(
          "SELECT RDATE, PRICE, RTYPE"
        + "  FROM RE2"
        + " WHERE APTID = $1 AND SPACE = $2 and rtype in ('S','C') ORDER BY RDATE"
        ,[ params.id,  params.space]
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



module.exports.getSpace = function(req,res,next){
  var db = {};
  var data = {};

  //var aptID = req.params.aptID;
  //var space = req.params.space;

  var aptID = req.params.aptID;

  console.log("aptID(getSpace):============================================== ", aptID);

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
      console.log("querying apts....");
      db.client.query(
          "SELECT DISTINCT SPACE, CITY"
        + "  FROM RE2"
        + " WHERE APTID = $1 ORDER BY SPACE"
        ,[ aptID]
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



module.exports.getOnePrice = function(req,res,next){
  var db = {};
  var data = {};

  var aptID = req.params.aptID;
  var space = req.params.space;

  console.log("space(getOnePrice):============================================= ", space);
  console.log("aptID(getOnePrice):============================================= ", aptID);


  // var validateOfViewContent = function(aptID, space) {
  //   // if('object' !== typeof req.params) return false;
  //   if('number' !== typeof params.aptID) return false;
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
      console.log("querying apts....");
      db.client.query(
          "SELECT RDATE, PRICE, RTYPE, FLOOR, APTNAME, SPACE, BYEAR"
        + "  FROM RE2"
        + " WHERE APTID = $1 AND SPACE = $2 and rtype in ('S','C') ORDER BY RDATE"
        ,[ aptID,  space]
        , callback
      );
    }
    ,function(result, callback) {
      data = result.rows
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
    if(redis_client.get(aptID+":"+space === null)){
      console.log("SET in REDIS: ", aptID+":"+space)
      redis_client.set(aptID+":"+space, JSON.stringify(data));
    }
    res.send({result:'success', data:data});
  }); 
};



module.exports.aptPriceDelta = function(req,res,next){
  var db = {};
  var data = {};
  // var params = req.body;

  var LCODE = req.params.lcode;
  // console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^", LCODE);

  // var validateOfViewContent = function(params) {
  //   if('object' !== typeof params) return false;
  //   if('string' !== typeof params.legalcode) return false;
  //   return true;
  // };
    
  res.type('application/json');

  // if(false == validateOfViewContent(params)) {
  //   return res.send({result:'fail'});
  // }
    
  async.waterfall([
    function(callback) {
      pg.connect(pgConfig.db.URL, callback);
    },
    function(client, done, callback) {
      db.client = client;
      db.done = done;
      db.transactions = false;
      callback();
    },
    // function(callback) {
    //  db.client.query("BEGIN", callback);
    // },
    // function(result, callback) {
    //  db.transactions = true;
    //  callback();
    // },
    function(callback) {
      console.log("pdelta query: ", LCODE);
      db.client.query(
        "SELECT APTID, LEGALCODE, APTNAME, ZIP, SPACE, RTYPE, RDATE, PRICE, DELTA FROM" 
       +" ("
       +" SELECT APTID, LEGALCODE, APTNAME, ZIP, SPACE, RTYPE, RDATE, PRICE"
       +" ,PRICE - LAG(PRICE) OVER (PARTITION BY APTNAME, ZIP, SPACE ORDER BY RDATE ASC) AS DELTA"
       +" FROM RE2"
       +" WHERE LEGALCODE = $1 AND RDATE >= '2017-10-01' AND RTYPE = 'S') as A"
       +" WHERE LEGALCODE = $1 AND RDATE >= '2017-10-01' AND RTYPE = 'S' AND (DELTA IS NOT NULL)  ORDER BY DELTA  DESC LIMIT 5;"
        , [LCODE]
        , callback
      );
    },
    function(result, callback) {
      console.log(result);
      data.list = result.rows;
      console.log(data.list);
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
    if(redis_client.get(LCODE === null)){
      console.log("SET in REDIS: ", LCODE)
      redis_client.set(LCODE, JSON.stringify(data));
    }
    res.send({result:'success', data:data});
  });
};


module.exports.dongStat = function(req,res,next){
  console.log("!!!!!!!DONGSTAT Called!!!!!!!!!");
  var db = {};
  var data = {};
  var params = req.body;
  var rtype = (params.rtype ==='Sale') ? 'S' : (params.rtype ==='CR') ? 'C' : 'R';

  var d = new Date();
  var year = d.getFullYear();
  var month = d.getMonth();
  var day = d.getDate();
  var recentTwoMonths = new Date(year, month - 3, day);
  var recentTwoMonths = recentTwoMonths.toISOString().slice(0,10);


  var validateOfViewContent = function(params) {
    if('object' !== typeof params) return false;
    if('number' !== typeof params.east) return false;
    if('string' !== typeof params.rtype) return false;
    if('string' !== typeof params.level) return false;
    if('number' !== typeof params.west) return false;
    if('number' !== typeof params.north) return false;
    if('number' !== typeof params.south) return false;
    return true;
  };
    

  res.type('application/json');

  if(false == validateOfViewContent(params)) {
    return res.send({result:'fail'});
  }
    
  // console.log("BEFORE db call", params);

  async.waterfall([
    function(callback) {
      pg.connect(pgConfig.db.URL, callback);
    },
    function(client, done, callback) {
      db.client = client;
      db.done = done;
      db.transactions = false;
      callback();
    }//,
    // function(callback) {
    //  db.client.query("BEGIN", callback);
    // },
    // function(result, callback) {
    //  db.transactions = true;
    //  callback();
    // }//,
    // function(callback) {
    //   db.client.query(
    //       "SELECT (MIN(LONGITUDE) + MAX(LONGITUDE))/2 AS LONGITUDE"
    //     + "       ,(MIN(LATITUDE) + MAX(LATITUDE))/2 AS LATITUDE"
    //     + "  FROM APT_MASTER"
    //     + " WHERE LCODE = $1 AND LATITUDE != 0 and LONGITUDE != 0"
    //     , [params.legalcode]
    //     , callback
    //   );
    // }, 
    // function(result, callback) {
    //   if(result.rowCount != 1) return callback(new Error('No Apts'));
    //   data.legalcode = params.legalcode;
    //   data.mapPosition = result.rows[0];
    //   callback();
    // }
    ,function(callback) {
      console.log( rtype, params.level, params.south,  params.north, params.west, params.east);
      db.client.query(
          " select distinct on(rdate,lcode) lcode, city, mean, tcount, rdate "
        + " from apt_stats "  
        + " where rtype = $1 and geolevel = $2 and lat > $3 and lat < $4 and lng > $5 and lng < $6 "
        + " and rdate >= $7 order by rdate, lcode"
        , [ rtype, params.level, params.south,  params.north, params.west, params.east, recentTwoMonths]
        , callback
      );
    }
    ,function(result, callback) {
      // console.log(result);
      data.list = result.rows;
      console.log(data.list);
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




