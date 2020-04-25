var addressData = require('../data/apt-search.json');


module.exports.selectCity = function(req, res) {
  //console.log('Requested by: ');
  console.log('GET the city');
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

  var dataWindow = addressData.slice(offset, count);
  //console.log(dataWindow);

  res
    .status(200)
    .json(addressData);
};
 

module.exports.selectAddr1 = function(req, res) {

    var selectedCity = req.params.cityName;
    var gu = [];
    console.log('GET city', selectedCity);
    console.log('GET the addr1(Gu)');

    // vm Gu = addressData[city];
    var dataLength = addressData.length;
    for(i = 0; i < dataLength; i++){
        if (addressData[i].city === selectedCity){
          if(i === 0 || addressData[i].addr1 !== addressData[i-1].addr1){
            gu.push(addressData[i].addr1)
          }
        }
    }

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

    // var dataWindow = addressData.slice(offset, count);
    console.log(gu);
    res
      .status(200)
      .json(gu);
};
 


module.exports.selectAddr2 = function(req, res) {

    var selectedCity = req.params.addr0;
    var selectedAddr1 = req.params.addr1;

    var addr2 = [];
    var addr2Array = [];
    console.log('GET city', selectedCity);
    console.log('GET the addr1(Gu)', selectedAddr1);


    // city data does not come from JSON file. It is hard-coded in the my-apt-controller for better performance
    var dataLength = addressData.length;
    for(i = 0; i < dataLength; i++){
        if ( addressData[i].city === selectedCity && addressData[i].addr1 === selectedAddr1){
          if(i === 0 || addressData[i].addr2 !== addressData[i-1].addr2) {
            addr2.push(addressData[i].addr2)
            addr2Array.push(addressData[i]);
          }
        }
    }

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

    // var dataWindow = addressData.slice(offset, count);
    console.log(addr2);
    res
      .status(200)
      .json(addr2);
};



module.exports.aptSearch = function(req, res) {

    var selectedCity = req.params.addr0;
    var selectedAddr1 = req.params.addr1;
    var selectedAddr2 = req.params.addr2;
    var apts = [];
    console.log('GET city', selectedCity);
    console.log('GET the addr1(Gu)', selectedAddr1);
    console.log('GET the addr2(Dong)', selectedAddr2)

    // vm Gu = addressData[city];
    var dataLength = addressData.length;
    for(i = 0; i < dataLength; i++){
        if (addressData[i].addr1 === selectedAddr1 && addressData[i].addr2 === selectedAddr2){
          console.log(addressData[i])
          if(i === 0 || addressData[i].space !== addressData[i-1].space){
            apts.push(addressData[i])
            //apts.push(addressData[i].aptname)
          }
        }
    }

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

    // var dataWindow = addressData.slice(offset, count);
    console.log(apts);
    res
      .status(200)
      .json(apts);
};
 

 module.exports.aptSpace = function(req, res) {

    var selectedCity = req.params.addr0;
    var selectedAddr1 = req.params.addr1;
    var selectedAddr2 = req.params.addr2;
    var selectedApt = req.params.apt;
    var spaces = [];
    console.log('GET city', selectedCity);
    console.log('GET the addr1(Gu)', selectedAddr1);
    console.log('GET the addr2(Dong)', selectedAddr2);
    console.log('GET the apt', selectedApt);
    // vm Gu = addressData[city];
    var dataLength = addressData.length;
    for(i = 0; i < dataLength; i++){
        if (addressData[i].city === selectedCity &&
           addressData[i].addr1 === selectedAddr1 && 
           addressData[i].addr2 === selectedAddr2 && 
           addressData[i].aptname === selectedApt){
          if(i === 0 || addressData[i].space !== addressData[i-1].space){
            spaces.push(addressData[i])
            //apts.push(addressData[i].aptname)
          }
        }
    }

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

    // var dataWindow = addressData.slice(offset, count);
    console.log(spaces);
    res
      .status(200)
      .json(spaces);
};