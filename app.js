const fs = require("fs");
const adtConfig = JSON.parse(fs.readFileSync('adt.config.json'));
const ADT_URL = 'https://' + adtConfig.hostname + '/';

var express = require("express");
const request = require('request');

var app = express();
const server = require('http').createServer(app);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

app.use(express.static('src'));
app.use(express.json());

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/src/index.html');
});

app.get('/adtConfig', function(req, res) {
  res.send(adtConfig);
});

// req.params[0] is the adtId in onkects.json
app.get("/data/*", (req, res, next) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + req.headers.authorization
  }

  const url = ADT_URL + 'digitaltwins/' + req.params[0] + '?api-version=2020-10-31';

  new Promise((resolve, reject) => {
    request.get({
      url: url,
      headers: headers
    }, function (error, response, body) {
      if (error) throw new Error(error);
      if (response != undefined && response.statusCode != undefined && response.statusCode !== 201) {
        resolve(body);
      }
    });
  }).then((result) => {
    res.send(result);
  });
});

app.get("/relationships/*", (req, res, next) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + req.headers.authorization
  }
  new Promise((resolve, reject) => {
    request.get({
      url: ADT_URL + req.params[0] + '/relationships' + '?api-version=2020-10-31',
      headers: headers
    }, function (error, response, body) {
      if (response != undefined && response.statusCode != undefined && response.statusCode !== 201) {
        resolve(body);
      }
    });
  }).then((result) => {
    res.send(result);
  });
});

app.post("/force_alert", (req, res, next) => {
  var options = {
    'method': 'PATCH',
    'url': ADT_URL + 'Grinding.pu01.l01' + '?api-version=2020-10-31',
    'headers': {
      'Content-Type': 'application/json-patch+json',
      'Authorization': 'Bearer ' + req.headers.authorization,
    },
    body: "[{\n\"op\": \"replace\",\n\"path\": \"/vibrationAlert\",\n\"value\": true\n},\n{\n\"op\": \"replace\",\n\"path\": \"/Vibration\",\n\"value\": 300\n}\n]"
  };
  new Promise((resolve, reject) => {
    request(options, (error, response) => {
      if (error) throw new Error(error);
    });
  }).then((result) => {
    res.send(result);
  });
});

app.post("/reset_alert", (req, res, next) => {
  var options = {
    'method': 'PATCH',
    'url': ADT_URL + 'Grinding.pu01.l01' + '?api-version=2020-10-31',
    'headers': {
      'Content-Type': 'application/json-patch+json',
      'Authorization': 'Bearer ' + req.headers.authorization,
    },
    body: "[{\n\"op\": \"replace\",\n\"path\": \"/vibrationAlert\",\n\"value\": false\n},\n{\n\"op\": \"replace\",\n\"path\": \"/Vibration\",\n\"value\": 260\n}\n]"
  };
  new Promise((resolve, reject) => {
    request(options, (error, response) => {
      if (error) throw new Error(error);
    });
  }).then((result) => {
    res.send(result);
  });
});

/// For updating data
/// Updading Fanning, Grinding, and Molding
app.post("/update_data", (req, res, next) => {
  var options = {
    'method': 'PATCH',
    'url': ADT_URL + 'digitaltwins/' + capitalizeFirstLetter(req.body["device"]) + '.pu01.l01' + '?api-version=2020-10-31',
    'headers': {
      'Content-Type': 'application/json-patch+json',
      'Authorization': 'Bearer ' + req.headers.authorization,
    },
    body: req.body["content"]
  };

  request(options, (error, response) => {
    if (error) console.log(err);
    res.send(response);

  });
  // new Promise((resolve, reject) => {
  //   request(options, (error, response) => {
  //     if (error) throw new Error(error);
  //     if (response.statusCode == 202) resolve(response);
  //   });
  // }).then((result) => {
  //   res.send(result);
  // });
});

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}