const axios = require("axios").default;
const msal = require('./msal');
const adtConfig = require('./adt.config');
const ADT_URL = 'https://' + adtConfig.hostname + '/';

/// For updating data
/// Updading Fanning, Grinding, and Molding

function update_data() {
  update_step_data("fanning");
  update_step_data("grinding");
  update_step_data("molding");
  update_step_data("conching");
  update_step_data("winnowing");
}

// deviceType: "grinding", "fanning", or "molding"
function update_step_data(deviceType) {
  msal.getToken().then(token => {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    };

    const url = ADT_URL + 'digitaltwins/' + capitalizeFirstLetter(deviceType) + '.pu01.l01' + '?api-version=2020-10-31';
    axios.patch(url, generateMessage(deviceType), {
      headers: headers
    }).then(patchResponse => {
      // console.log(patchResponse);
    }).catch(err => {
      console.log("err")
    });
  });
}

// Generating message for "grinding", "fanning", or "molding"
// Return a string
function generateMessage(deviceType) {
  const fanSpeed = 10 + (Math.random() * 4); // range: [10, 14]
  const temperature = 200 + (Math.random() * 10); // range: [200, 300]
  const powerUsage = 60 + (Math.random() * 20); // range: [60, 80]
  const force = 300 + (Math.random() * 10); // range: [300, 400]
  const vibration = 80 + Math.floor(Math.random() * Math.floor(80)); // range: [99, 199]
  const roastingTime = 30 + (Math.floor(Math.random() * 100)); //range [30, 50]

  var data = {};
  switch (deviceType) {
    case "grinding":
      data = {
        ChasisTemperature: temperature,
        PowerUsage: powerUsage,
        GrindingTime: roastingTime,
        Force: force,
      };
      // if (vibrationAlertTriggered == false) {
      //   data["Vibration"] = vibration;
      // }
      break;
    case "fanning":
      data = {
        ChasisTemperature: temperature,
        PowerUsage: powerUsage,
        FanSpeed: fanSpeed,
        RoastingTime: roastingTime
      };
      break;
    case "molding":
    case "conching":
    case "winnowing":
      data = {
        ChasisTemperature: temperature,
        PowerUsage: powerUsage
      };
  }

  var mapped_data = [];
  for (const [key, value] of Object.entries(data)) {
    mapped_data.push({
      op: "replace",
      path: "/" + key,
      value: value
    });
  }

  return JSON.stringify(mapped_data);
}

// Utility Function
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = update_data;