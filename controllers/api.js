const fetch = require('node-fetch');
const msal = require('../server/msal');
const random_update_data = require("./random_update_data");
const transformation = require('./transformations');

const adtConfig = require('../adt.config');
const ADT_URL = 'https://' + adtConfig.hostname + '/';

// Prevents updating when no one is accessing the server
const UPDATE_TIMEOUT = 15;
var countdown = UPDATE_TIMEOUT;

let vibrationAlertTriggered = false;

exports.forceAlert = async (req, res, next) => {
  vibrationAlertTriggered = true;
};

exports.resetAlert = async (req, res, next) => {
  vibrationAlertTriggered = false;
};

exports.queryTwins = async (req, res, next) => {
  countdown = UPDATE_TIMEOUT;
  let token = await msal.getToken();

  const url = ADT_URL + 'query?api-version=2020-10-31';

  let response = await fetch(url, {
    method: 'POST', headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ query: req.body.query })
  })
    .catch((err) => {
      res.status(418).send(err);
    });

  var data = await response.json();

  res.send(data.value);
};


//retrieve all ADT models
exports.getModels = async (req, res, next) => {
  countdown = UPDATE_TIMEOUT;
  let token = await msal.getToken();

  const url = ADT_URL + 'models?includeModelDefinition=true&api-version=2020-10-31';

  let response = await fetch(url, {
    method: 'GET', headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  })
    .catch((err) => {
      res.status(418).send(err);
    });

  var data = await response.json();

  res.send(data);
};

//retrieve all ADT digitaltwins with relationships
exports.getAllTwins = async (req, res, next) => {
  countdown = UPDATE_TIMEOUT;
  let token = await msal.getToken();
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  };
  const url = ADT_URL + 'query?api-version=2020-10-31';

  let response = await fetch(url, {
    method: 'POST', headers: headers,
    body: JSON.stringify({ query: "SELECT * FROM digitaltwins" })
  })
    .catch((err) => {
      res.status(418).send(err);
    });

  var alltwins = await response.json();

  for (let i = 0; i < alltwins.value.length; i++) {
    let twin = alltwins.value[i];
    const url = ADT_URL + 'digitaltwins/' + twin.$dtId + '/relationships?api-version=2020-10-31';
    let response = await fetch(url, { method: 'GET', headers: headers })
      .catch((err) => {
        res.status(418).send(err);
      });

    alltwins.value[i].relationships = await response.json();
  }
  res.send(alltwins);
};

exports.reset_transformations = async (req, res, next) => {
  res.send(await transformation.reset_transformations());
};

exports.update_transformation = async (req, res, next) => {
  res.send(await transformation.update_transformation(req.body.dtid, req.body.matrix));
};

// Start updating data every 5 seconds
setInterval(() => {
  if (countdown <= 5) {
    countdown = 0;
  } else {
    countdown -= 5;
    random_update_data(vibrationAlertTriggered);
  }
}, 5000);
