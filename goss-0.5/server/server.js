require('../api/data/db.js');

// PostgreSQL DB connection
const async = require('async');
const pg = require('pg');
const pgConfig = require('../pgConfig');

const express = require('express');
const app = express();
var cors = require('cors')
const path = require('path');
const bodyParser = require('body-parser');

const routes = require('../api/routes');
//var zmq = require('zmq')
//var requester = zmq.socket('req');

const fs = require('fs');
const util = require('util');
const http = require('http');


// Enable parsing of posted forms
app.use(bodyParser.urlencoded({ extended: false   }));
app.use(bodyParser.json());

// Cross Origin Resource Sharing
app.use(cors())

// Define the port to run on
app.set('port', 8080);

// Add middleware to console log every request
app.use(function(req, res, next) {
  console.log(req.method, req.url, req.body);
  next();
});

// Set static directory before defining routes
app.use(express.static(path.join(__dirname, 'public')));
app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use('/fonts', express.static(__dirname + '/fonts'));


// Add some routing
app.use('/api',routes);

// Listen for requests
var server = app.listen(app.get('port'), function() {
  var port = server.address().port;
  console.log('Magic happens on port ' + port);
});
