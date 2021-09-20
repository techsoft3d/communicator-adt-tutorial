const msal = require('./server/msal');
const express = require("express");
const axios = require("axios").default;
const app = express();
const server = require('http').createServer(app);
const update_data = require("./server/update_data");

const adtConfig = require('./adt.config');
const ADT_URL = 'https://' + adtConfig.hostname + '/';

var vibrationAlertTriggered = false;

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

app.use(express.static('src'));

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
  console.log("fa")
  vibrationAlertTriggered = true;
});

app.post("/reset_alert", (req, res, next) => {
  console.log("ra")
  vibrationAlertTriggered = false;
});

// Start updating data every 5 seconds
setInterval(() => {
  update_data(vibrationAlertTriggered);
}, 5000);