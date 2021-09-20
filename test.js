const msal = require('./msal');
const express = require("express");
const axios = require("axios").default;
const app = express();
const server = require('http').createServer(app);
const update_data = require("./update_data");

const adtConfig = require('./adt.config');
const ADT_URL = 'https://' + adtConfig.hostname + '/';

var vibrationAlertTriggered = false;

app.listen(3300, () => {
  console.log("Server running on port 3300");
});

app.use(express.static('src'));
// app.use(express.json());

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/src/index.html');
});

// req.params[0] is the adtId in objects.json
app.get("/data/*", (req, res, next) => {
  msal.getToken().then(token => {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    };
    const url = ADT_URL + 'digitaltwins/' + req.params[0] + '?api-version=2020-10-31';

    axios.get(url, {
      headers: headers
    }).then(axiosres => {
      res.send(axiosres.data);
    }).catch(err => {
      res.status(418).send(err);
    });
  });
});


app.post("/force_alert", (req, res, next) => {
  vibrationAlertTriggered = true;
  update_data(vibrationAlertTriggered);
});

app.post("/reset_alert", (req, res, next) => {
  vibrationAlertTriggered = false;
  update_data(vibrationAlertTriggered);
});

// Start updating data every 5 seconds
setInterval(() => {
  update_data(vibrationAlertTriggered);
}, 5000);