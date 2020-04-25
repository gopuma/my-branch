//require('./api/data/db.js');

// PostgreSQL DB connection
var async = require('async');
var pg = require('pg');
var pgConfig = require('./config/pgConfig');

var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');

//var routes = require('./api/routes');

var fs = require('fs');
var util = require('util');
var log_stdout = process.stdout;
var http = require('http');

// Enable parsing of posted forms
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Define the port to run on
app.set('port', 8080);

// Add middleware to console log every request
app.use(function(req, res, next) {
  console.log(req.method, req.url);
  next();
});

// Set static directory before defining routes
app.use(express.static(path.join(__dirname, 'client')));
app.use('/node_modules', express.static(__dirname + '/node_modules'));
//app.use('/fonts', express.static(__dirname + '/fonts'));

// Add some routing
//app.use('/api', routes);

// Listen for requests
var server = app.listen(app.get('port'), function() {
  var port = server.address().port;
  console.log('Magic happens on port ' + port);
});
