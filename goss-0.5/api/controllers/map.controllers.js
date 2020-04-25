var async = require('async');
var pg = require('pg');
var pgConfig = require('../../pgConfig');
var redis = require('../data/redis-connection');
var redis_client = redis.get();
// const redis = require('redis');
// const REDIS_PORT = 6379;
// const redis_client = redis.createClient(REDIS_PORT);
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
  var aptID = req.params.aptid || null;
  var space = req.params.space || null;
  var lcode = req.params.lcode || null;
  aptID = req.query.aptid;
  var APIName = req.originalUrl.split("/")[3]
  
  if(!redis.isConnected()) { console.log("redis not connected"); next(); }


  if(APIName === 'theAptInMap'){
    redis_client.get("theAptInMap:"+aptID, function(err, data){
      if(err) throw err;

      if(data !== null){
        console.log(APIName + " CACHED in REDIS!");
        res.send({result:'success', data:JSON.parse(data)});
      }else{
        next();
      }
    })
  }
  else{
  	next();
  }
  
}

module.exports.ready = function(req,res,next){
	var db = {};
	var data = {};
	var params = req.body;

	console.log(params.west);
	
	var validateOfViewContent = function(params) {
		if('object' !== typeof params) return false;
		if('string' !== typeof params.legalcode) return false;
		console.log("validateOfViewContent");
		return true;
	};
		
	res.type('application/json');

	if(false == validateOfViewContent(params)) {
		return res.send({result:'fail'});
	}
		
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
		function(callback) {
			db.client.query("BEGIN", callback);
		},
		function(result, callback) {
			db.transactions = true;
			callback();
		},
		function(callback) {
			db.client.query(
			    "SELECT (MIN(LONGITUDE) + MAX(LONGITUDE))/2 AS LONGITUDE"
			  + "       ,(MIN(LATITUDE) + MAX(LATITUDE))/2 AS LATITUDE"
			  + "  FROM APT_MASTER"
			  + " WHERE LCODE = $1 AND LATITUDE != 0 and LONGITUDE != 0"
			  ,[params.legalcode]
			  , callback
			);
		}, 
		function(result, callback) {
			if(result.rowCount != 1) return callback(new Error('No Apts'));
			data.legalcode = params.legalcode;
			data.mapPosition = result.rows[0];
			callback();
		}
		,function(callback) {
			db.client.query(
			    "SELECT APT_NAME"
			  + "       ,ST_ADDRESS"
			  + "       ,AREA1"
			  + "       ,LONGITUDE as LONGITUDE"
			  + "       ,LATITUDE  as LATITUDE"
			  + "  FROM APT_MASTER"
			  + " WHERE LCODE = $1"
			  ,[params.legalcode]
			  , callback
			);
		}
		,function(result, callback) {
			data.list = result.rows;
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

module.exports.aptsInMap = function(req,res,next){
	var db = {};
	var data = {};
	var params = req.body;

	var validateOfViewContent = function(params) {
		if('object' !== typeof params) return false;
		if('string' !== typeof params.east) return false;
		if('string' !== typeof params.west) return false;
		if('string' !== typeof params.north) return false;
		if('string' !== typeof params.south) return false;
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
		// function(callback) {
		// 	db.client.query("BEGIN", callback);
		// },
		// function(result, callback) {
		// 	db.transactions = true;
		// 	callback();
		// },
		function(callback) {
			console.log("querying... ");
			db.client.query(
			    "SELECT (MIN(LONGITUDE) + MAX(LONGITUDE))/2 AS LONGITUDE"
			  + "       ,(MIN(LATITUDE) + MAX(LATITUDE))/2 AS LATITUDE"
			  + "  FROM APT_MASTER"
			  + " WHERE LATITUDE != 0 and LONGITUDE != 0"
			  , []//params.legalcode
			  , callback
			);
		}, 
		function(result, callback) {
			console.log("result....");
			if(result.rowCount != 1) return callback(new Error('No Apts'));
			// data.legalcode = params.legalcode;
			data.mapPosition = result.rows[0];
			callback();
		}
		,function(callback) {
			console.log("querying apts....");
			// console.log(params.legalcode);
			console.log(params.east);
			console.log(params.west);
			console.log(params.south);
			console.log(params.north);
			db.client.query(
			    "SELECT APTID, APT_NAME, SSPACE, PRICE, SCOUNT, CRPRICE, CRSPACE, CRCOUNT,"
			  + "       RENT, RPRICE, RCOUNT, RSPACE, CITY, BYEAR"
			  + "       ,LONGITUDE as LONGITUDE"
			  + "       ,LATITUDE  as LATITUDE"
			  + "  FROM APT_MASTER"
			  + " WHERE LATITUDE >= $1 AND LATITUDE <= $2 AND LONGITUDE >= $3 AND LONGITUDE <= $4"
			  + " AND PRICE IS NOT NULL;"
			  ,[ params.south,  params.north, params.west , params.east ]
			  , callback
			);
		}
		,function(result, callback) {
			data.list = result.rows;
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


module.exports.theAptInMap = function(req,res,next){
	var db = {};
	var data = {};
	var params = req.body;
	var aptID = req.query.aptid;

	var validateOfViewContent = function(params) {
		if('object' !== typeof params) return false;
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
			console.log("querying... ");
			db.client.query(
			    "SELECT (MIN(LONGITUDE) + MAX(LONGITUDE))/2 AS LONGITUDE"
			  + "       ,(MIN(LATITUDE) + MAX(LATITUDE))/2 AS LATITUDE"
			  + "  FROM APT_MASTER"
			  + " WHERE LATITUDE != 0 and LONGITUDE != 0"
			  , []//params.legalcode
			  , callback
			);
		}, 
		function(result, callback) {
			console.log("result....");
			if(result.rowCount != 1) return callback(new Error('No Apts'));
			// data.legalcode = params.legalcode;
			data.mapPosition = result.rows[0];
			callback();
		},
		function(callback) {
			console.log("querying the apt searched....", params.aptid);
			db.client.query(
			    "SELECT APTID, APT_NAME, SSPACE, PRICE, SCOUNT, CRPRICE, CRSPACE, CRCOUNT,"
			  + "       RENT, RPRICE, RCOUNT, RSPACE, CITY, BYEAR"
			  + "       ,LONGITUDE as LONGITUDE"
			  + "       ,LATITUDE  as LATITUDE"
			  + "  FROM APT_MASTER"
			  + " WHERE APTID = $1"
			  + " AND PRICE IS NOT NULL;"
			  ,[ params.aptid]
			  , callback
			);
		}
		,function(result, callback) {
			data.list = result.rows;
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
		if(redis_client.get("theAptInMap:"+aptID === null)){
			console.log("SET in REDIS: ", "theAptInMap")
      		redis_client.set("theAptInMap:"+aptID, JSON.stringify(data));
    	}
		res.send({result:'success', data:data});
	});	
};


module.exports.dongInMap = function(req,res,next){
	var db = {};
	var data = {};
	var params = req.body;
	var rtype = (params.rtype ==='Sale') ? 'S' : (params.rtype ==='CR') ? 'C' : 'R';

	console.log("RTYPE!!!!!!!!!!", rtype);
	console.log(params.west);

	var validateOfViewContent = function(params) {
		if('object' !== typeof params) return false;
		if('string' !== typeof params.east) return false;
		if('string' !== typeof params.rtype) return false;
		if('string' !== typeof params.west) return false;
		if('string' !== typeof params.north) return false;
		if('string' !== typeof params.south) return false;
		return true;
	};
		
	res.type('application/json');

	if(false == validateOfViewContent(params)) {
		return res.send({result:'fail'});
	}
		
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
		// 	db.client.query("BEGIN", callback);
		// },
		// function(result, callback) {
		// 	db.transactions = true;
		// 	callback();
		// },
		function(callback) {
			db.client.query(
			    "SELECT (MIN(LONGITUDE) + MAX(LONGITUDE))/2 AS LONGITUDE"
			  + "       ,(MIN(LATITUDE) + MAX(LATITUDE))/2 AS LATITUDE"
			  + "  FROM APT_MASTER"
			  + " WHERE LCODE = $1 AND LATITUDE != 0 and LONGITUDE != 0"
			  , [params.legalcode]
			  , callback
			);
		}, 
		function(result, callback) {
			if(result.rowCount != 1) return callback(new Error('No Apts'));
			data.legalcode = params.legalcode;
			data.mapPosition = result.rows[0];
			callback();
		}
		,function(callback) {
			console.log(params.east);
			console.log(params.west);
			console.log(params.south);
			console.log(params.north);
			db.client.query(
				  "SELECT DISTINCT ON(APT_STATS.LCODE) APT_STATS.LCODE, APT_STATS.MEAN, APT_STATS.TCOUNT, APT_STATS.CITY AS DONG, "
				+ " APT_STATS.LAT, APT_STATS.LNG, APT_STATS.RDATE "  
				+ " FROM (SELECT DISTINCT ON(LCODE)  LCODE, MAX(RDATE) AS RDATE FROM APT_STATS WHERE geolevel = 'D' "
				+ " AND RTYPE = $1 AND LAT > $2 AND LAT < $3 AND LNG > $4 AND LNG < $5 GROUP BY LCODE) AS LATEST_STATS "
				+ " INNER JOIN APT_STATS ON APT_STATS.LCODE = LATEST_STATS.LCODE AND"
				+ " APT_STATS.RDATE = LATEST_STATS.RDATE WHERE RTYPE = $1 "
			  , [ rtype, params.south,  params.north, params.west, params.east]
			  , callback
			);
		}
		,function(result, callback) {
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
		res.send({result:'success', data:data});
	});	
};

module.exports.guInMap = function(req,res,next){
	var db = {};
	var data = {};
	var params = req.body;
	var rtype = (params.rtype ==='Sale') ? 'S' : (params.rtype ==='CR') ? 'C' : 'R';

	console.log("RTYPE: ", rtype);
	console.log("gu data aggregated");
	var validateOfViewContent = function(params) {
		if('object' !== typeof params) return false;
		if('string' !== typeof params.rtype) return false;
		// if('string' !== typeof params.east) return false;
		// if('string' !== typeof params.west) return false;
		// if('string' !== typeof params.north) return false;
		// if('string' !== typeof params.south) return false;
		return true;
	};
		
	res.type('application/json');
	
	if(false == validateOfViewContent(params)) {
		return res.send({result:'fail'});
	}
		
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
		// 	db.client.query("BEGIN", callback);
		// },
		// function(result, callback) {
		// 	db.transactions = true;
		// 	callback();
		// },
		function(callback) {
			db.client.query(
			    "SELECT (MIN(LONGITUDE) + MAX(LONGITUDE))/2 AS LONGITUDE"
			  + "       ,(MIN(LATITUDE) + MAX(LATITUDE))/2 AS LATITUDE"
			  + "  FROM APT_MASTER"
			  + " WHERE LATITUDE != 0 and LONGITUDE != 0"
			  ,[]// [params.legalcode]
			  , callback
			);
		}, 
		function(result, callback) {
			if(result.rowCount != 1) return callback(new Error('No Apts'));
			data.legalcode = params.legalcode;
			data.mapPosition = result.rows[0];
			callback();
		}
		,function(callback) {
			console.log(params.east);
			console.log(params.west);
			console.log(params.south);
			console.log(params.north);
			db.client.query(
				  "SELECT DISTINCT ON(APT_STATS.LCODE) APT_STATS.LCODE, APT_STATS.MEAN, APT_STATS.TCOUNT, APT_STATS.CITY AS GU, "
				+ " APT_STATS.LAT, APT_STATS.LNG, APT_STATS.RDATE "  
				+ " FROM (SELECT DISTINCT ON(LCODE)  LCODE, MAX(RDATE) AS RDATE FROM APT_STATS WHERE geolevel = 'G' "
				+ " AND RTYPE = $1 AND LAT > $2 AND LAT < $3 AND LNG > $4 AND LNG < $5 GROUP BY LCODE) AS LATEST_STATS"
				+ " INNER JOIN APT_STATS ON APT_STATS.LCODE = LATEST_STATS.LCODE AND"
				+ " APT_STATS.RDATE = LATEST_STATS.RDATE WHERE RTYPE = $1"				
			  , [rtype, params.south,  params.north, params.west, params.east]
			  , callback
			);
		}
		,function(result, callback) {
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
		res.send({result:'success', data:data});
	});	
};


module.exports.cityInMap = function(req,res,next){
	var db = {};
	var data = {};
	var params = req.body;
	var rtype = (params.rtype ==='Sale') ? 'S' : (params.rtype ==='CR') ? 'C' : 'R';
	var rdate = params.rdate;
	console.log("RTYPE: ", rtype, rdate);
	console.log("CITY data aggregated");
	var validateOfViewContent = function(params) {
		if('object' !== typeof params) return false;
		if('string' !== typeof params.rtype) return false;
		// if('string' !== typeof params.rdate) return false;
		if('string' !== typeof params.east) return false;
		if('string' !== typeof params.west) return false;
		if('string' !== typeof params.north) return false;
		if('string' !== typeof params.south) return false;
		return true;
	};
		
	res.type('application/json');

	if(false == validateOfViewContent(params)) {
		return res.send({result:'fail'});
	}
		
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
		// 	db.client.query("BEGIN", callback);
		// },
		// function(result, callback) {
		// 	db.transactions = true;
		// 	callback();
		// },
		function(callback) {
			db.client.query(
			    "SELECT (MIN(LONGITUDE) + MAX(LONGITUDE))/2 AS LONGITUDE"
			  + "       ,(MIN(LATITUDE) + MAX(LATITUDE))/2 AS LATITUDE"
			  + "  FROM APT_MASTER"
			  + " WHERE LATITUDE != 0 and LONGITUDE != 0"
			  ,[]// [params.legalcode]
			  , callback
			);
		}, 
		function(result, callback) {
			if(result.rowCount != 1) return callback(new Error('No Apts'));
			data.legalcode = params.legalcode;
			data.mapPosition = result.rows[0];
			callback();
		}
		,function(callback) {
			console.log(params.east);
			console.log(params.west);
			console.log(params.south);
			console.log(params.north);
			if (rdate == undefined){
				db.client.query(
					 "SELECT DISTINCT ON(APT_STATS.LCODE) APT_STATS.LCODE, APT_STATS.MEAN, APT_STATS.TCOUNT, APT_STATS.CITY AS CITY, "
				+ " APT_STATS.LAT, APT_STATS.LNG, APT_STATS.RDATE "  
				+ " FROM (SELECT DISTINCT ON(LCODE)  LCODE, MAX(RDATE) AS RDATE FROM APT_STATS WHERE geolevel = 'C' "
				+ " AND RTYPE = $1 AND LAT > $2 AND LAT < $3 AND LNG > $4 AND LNG < $5 GROUP BY LCODE) AS LATEST_STATS"
				+ " INNER JOIN APT_STATS ON APT_STATS.LCODE = LATEST_STATS.LCODE AND"
				+ " APT_STATS.RDATE = LATEST_STATS.RDATE WHERE RTYPE = $1;"
				  , [rtype, params.south,  params.north, params.west, params.east ]
				  , callback
				);
			}
			else{
				db.client.query(
					 "SELECT LCODE, MEAN, TCOUNT, CITY AS CITY,  LAT, LNG"
				   + " FROM APT_STATS"
				   + " WHERE AND GEOLEVEL = 'C' AND RDATE > now() - interval '3 months' AND RTYPE = $1 AND RDATE = $2 "
				   + " LAT > $3 AND LAT < $4 AND LNG > $5 AND LNG < $6  ORDER BY LCODE;"
				  , [rtype, rdate, params.south, params.north, params.west , params.east ]
				  , callback
				);	
			}
		}
		,function(result, callback) {
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
		res.send({result:'success', data:data});
	});	
};


module.exports.aptPriceDelta = function(req,res,next){
	var db = {};
	var data = {};
	var params = req.body;

	var validateOfViewContent = function(params) {
		if('object' !== typeof params) return false;
		if('string' !== typeof params.legalcode) return false;
		// if('string' !== typeof params.east) return false;
		// if('string' !== typeof params.west) return false;
		// if('string' !== typeof params.north) return false;
		// if('string' !== typeof params.south) return false;
		return true;
	};
		
	res.type('application/json');

	if(false == validateOfViewContent(params)) {
		return res.send({result:'fail'});
	}
		
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
		// 	db.client.query("BEGIN", callback);
		// },
		// function(result, callback) {
		// 	db.transactions = true;
		// 	callback();
		// },
		function(callback) {
			console.log("pdelta query: ", params.legalcode);
			db.client.query(
			  "SELECT APTID, LEGALCODE, APTNAME, ZIP, SPACE, RTYPE, RDATE, PRICE, DELTA FROM" 
			 +" ("
			 +" SELECT APTID, LEGALCODE, APTNAME, ZIP, SPACE, RTYPE, RDATE, PRICE"
			 +" ,PRICE - LAG(PRICE) OVER (PARTITION BY APTNAME, ZIP, SPACE ORDER BY RDATE ASC) AS DELTA"
			 +" FROM RE2"
			 +" WHERE LEGALCODE = $1 AND RDATE >= '2017-10-01' AND RTYPE = 'S') as A"
			 +" WHERE LEGALCODE = $1 AND RDATE >= '2017-10-01' AND RTYPE = 'S' AND (DELTA IS NOT NULL)  ORDER BY DELTA  DESC LIMIT 5;"
			  , [params.legalcode]
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
		res.send({result:'success', data:data});
	});
};


module.exports.aptsPricesInMap = function(req,res,next){
	var db = {};
	var data = {};
	var params = req.body;
	var aptids = [];

	aptids = req.body;
	console.log("aptids passed!!!!!!: ",aptids.join(','));
	var validateOfViewContent = function(params) {
		if('object' !== typeof params) return false;
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
			console.log("querying apts prices in the map....");
			db.client.query(
			    "WITH summary AS ( SELECT p.id aptid,p.aptname,p.space,p.price,count(*),"
			  + "  ROW_NUMBER() OVER(PARTITION BY p.id"
			  + " ORDER BY p.rdate DESC, count(*) DESC) AS rk"
			  + " FROM re2 p where p.id IN ( "
			  + aptids.join(',') 
			  + " )"
			  + " and p.rtype = 'S' group by p.id, p.aptname, p.space, p.price, p.rdate)"
			  + " SELECT s.* FROM summary s WHERE s.rk = 1;"
			  ,[]
			  , callback
			);
		}
		,function(result, callback) {
			console.log(result);
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




