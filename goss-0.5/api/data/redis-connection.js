const redis = require('redis');
const REDIS_PORT = 6379;
const redis_client = redis.createClient(REDIS_PORT)
var connected = null;
var _connection = null;

var open = function(){
	_connection = redis.createClient(REDIS_PORT);
}

var get = function(){
	return _connection;
}

var isConnected = function(){
	return connected
}

redis_client.on('connect', function() {
    connected = true;
    console.log('Redis client connected');
});

redis_client.on('error', function(err){
  connected = false;
  console.error('ERR:REDIS:', err);
});


module.exports = {
  open : open,
  get : get,
  isConnected: isConnected
};