const fetch = require('node-fetch');
const msal = require('../server/msal');
const update_data = require("../server/update_data");

const adtConfig = require('../adt.config');
const ADT_URL = 'https://' + adtConfig.hostname + '/';

// Prevents updating when no one is accessing the server
const UPDATE_TIMEOUT = 15;
var countdown = UPDATE_TIMEOUT;

let vibrationAlertTriggered = false;

exports.forceAlert = async(req, res, next) => {
    vibrationAlertTriggered = true;
};

exports.resetAlert = async(req, res, next) => {
    vibrationAlertTriggered = false;
};

exports.queryTwins = async(req, res, next) => {
    countdown = UPDATE_TIMEOUT;
    let token = await msal.getToken();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    };
    const url = ADT_URL + 'query?api-version=2020-10-31';
  
    let response = await fetch(url, {
      method: 'POST', headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },    
         body: JSON.stringify({query: req.body.query})
    })
    .catch((err) => {
      res.status(418).send(err);
    });
  
    var data = await response.json();
  
    res.send(data.value);
};

// Start updating data every 5 seconds
setInterval(() => {
    if (countdown <= 5) {
      countdown = 0;
    } else {
      countdown -= 5;
      update_data(vibrationAlertTriggered);
    }
  }, 5000);
  