var async = require('async');
var pg = require('pg');
var pgConfig = require('../../pgConfig');



module.exports.salePrice = function(req,res,next){
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
			    "SELECT RDATE, PRICE"
			  + "  FROM RE2"
			  + " WHERE APTID = $1 AND SPACE = $2 AND RTYPE = 'S' ORDER BY RDATE"
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



module.exports.collateralPrice = function(req,res,next){
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
			    "SELECT RDATE, PRICE"
			  + "  FROM RE2"
			  + " WHERE APTID = $1 AND SPACE = $2 AND RTYPE = 'C' ORDER BY RDATE"
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


module.exports.rentPrice = function(req,res,next){
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
			    "SELECT RDATE, PRICE"
			  + "  FROM RE2"
			  + " WHERE APTID = $1 AND SPACE = $2 AND RTYPE = 'R' ORDER BY RDATE"
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