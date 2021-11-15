const fetch = require('node-fetch');
const msal = require('../server/msal');
const adtConfig = require('../adt.config');

const ADT_URL = 'https://' + adtConfig.hostname + '/';

/// For randomly updating data on a schedule
/// Updading Fanning, Grinding, and Molding
function random_update_data(vibrationAlertTriggered) {
  return Promise.all([
    update_step_data("fanning", vibrationAlertTriggered),
    update_step_data("grinding", vibrationAlertTriggered),
    update_step_data("molding", vibrationAlertTriggered),
    update_step_data("conching", vibrationAlertTriggered),
    update_step_data("winnowing", vibrationAlertTriggered),
  ]);
}

/// Randomly assign initial value to each step
function initialize_all_steps() {
  return Promise.all([
    initialize_step_data("fanning"),
    initialize_step_data("grinding"),
    initialize_step_data("molding"),
    initialize_step_data("conching"),
    initialize_step_data("winnowing"),
  ]);
}

// deviceType: "grinding", "fanning", "conching", "winnowing", or "molding"
async function update_step_data(deviceType, vibrationAlertTriggered) {
  let token = await msal.getToken();

  const url = ADT_URL + 'digitaltwins/' + capitalizeFirstLetter(deviceType) + '?api-version=2020-10-31';
  const data = generate_data(deviceType, vibrationAlertTriggered);
  var mapped_data = [];
  for (const [key, value] of Object.entries(data)) {
    mapped_data.push({
      op: "replace",
      path: "/" + key,
      value: value
    });
  }

  return await fetch(url, {
    method: 'PATCH', headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(mapped_data)
  });

}

// deviceType: "grinding", "fanning", "conching", "winnowing", or "molding"
async function initialize_step_data(deviceType) {
  let token = await msal.getToken();

  const url = ADT_URL + 'digitaltwins/' + capitalizeFirstLetter(deviceType) + '?api-version=2020-10-31';
  const data = generate_data(deviceType, false);
  var mapped_data = [];
  for (const [key, value] of Object.entries(data)) {
    mapped_data.push({
      op: "add",
      path: "/" + key,
      value: value
    });
  }

  return await fetch(url, {
    method: 'PATCH', headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(mapped_data)
  });

}

// Generating message for "grinding", "fanning", or "molding"
// Return a string
function generate_data(deviceType, vibrationAlertTriggered) {
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
        VibrationAlert: vibrationAlertTriggered,
        Vibration: vibrationAlertTriggered ? 300 : vibration
      };
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

  return data;
}

// Utility Function
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = {
  random_update_data,
  initialize_all_steps
};