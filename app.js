const msal = require('./server/msal');
const express = require("express");
const axios = require("axios").default;
const app = express();
const server = require('http').createServer(app);
const update_data = require("./server/update_data");
const PORT = process.env.PORT || 3000;

const adtConfig = require('./adt.config');
const ADT_URL = 'https://' + adtConfig.hostname + '/';

var vibrationAlertTriggered = false;

// Prevents updating when no one is accessing the server
const UPDATE_TIMEOUT = 15;
var countdown = UPDATE_TIMEOUT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use(express.static('src'));
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/src/index.html');
});

app.post("/force_alert", (req, res, next) => {
  vibrationAlertTriggered = true;
});

app.post("/reset_alert", (req, res, next) => {
  vibrationAlertTriggered = false;
});

// Query twins which has scs model
app.post("/query_twins", (req, res, next) => {
  countdown = UPDATE_TIMEOUT;
  msal.getToken().then(token => {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    };
    const url = ADT_URL + 'query?api-version=2020-10-31';

    axios.post(url, {
      "query": req.body["query"]
    }, {
      headers: headers,
    }).then(axiosres => {
      res.send(axiosres.data["value"]);
    }).catch(err => {
      res.status(418).send(err);
    });
  });
});

// Start updating data every 5 seconds
setInterval(() => {
  if (countdown <= 5) {
    countdown = 0;
  } else {
    countdown -= 5;
    update_data(vibrationAlertTriggered);
  }
}, 5000);
