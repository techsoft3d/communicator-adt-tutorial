// App ID
var CLIENT_ID = null;
// https://login.microsoftonline.com/<tenantID>
var AUTHORITY = null;
const REDIRECT_URL = "http://localhost:3000";

function setConfig(data) {
  CLIENT_ID = data.appId;
  AUTHORITY = "https://login.microsoftonline.com/" + data.tenant;
}

// Access token will be granted once you loged in.
accessToken = null;

const invokeWithLoading = async callback => {
  let response = null;
  try {
    response = await callback();
  } catch (e) {
    throw e;
  }

  return response;
};

async function azureIoTLogin() {

  // Config object to be passed to Msal on creation
  const msalConfig = {
    auth: {
      clientId: CLIENT_ID,
      authority: AUTHORITY,
      redirectUri: REDIRECT_URL,
    },
    cache: {
      cacheLocation: "localStorage",
      storeAuthStateInCookie: true,
    }
  };

  const myMSALObj = new Msal.UserAgentApplication(msalConfig);
  const loginRequest = { scopes: ["https://digitaltwins.azure.net/.default"] };

  if (!myMSALObj.getAccount()) {
    await invokeWithLoading(async () => await myMSALObj.loginPopup(loginRequest));
  }

  // If the user is already logged in you can acquire a token
  if (myMSALObj.getAccount()) {
    try {
      const response = await myMSALObj.acquireTokenSilent(loginRequest);
      accessToken = response.accessToken;
    } catch (err) {
      // Could also check if err instance of InteractionRequiredAuthError if you can import the class
      if (err.name === "InteractionRequiredAuthError") {
        const response = await invokeWithLoading(async () => await myMSALObj.acquireTokenPopup(loginRequest));
        accessToken = response.accessToken;
      } else {
        console.log(err);
      }
    }
  }
}

// param "object" is object.adtID
function get_data(object) {
  return new Promise((resolve, reject) => {
    if (!accessToken) {
      return;
    }

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
        resolve(this.responseText);
      }
    });

    xhr.addEventListener("error", function (e) {
      console.log(e);
    });

    xhr.open("GET", "http://localhost:3000/data/" + object);

    xhr.setRequestHeader('Authorization', accessToken);

    xhr.send();
  })
}

function force_alert() {
  return new Promise((resolve, reject) => {
    if (!accessToken) reject();

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
        console.log(this.responseText);
        resolve(this.responseText);
      }
    });

    xhr.open("POST", 'http://localhost:3000/force_alert');
    xhr.setRequestHeader('Authorization', accessToken);
    xhr.setRequestHeader("Content-Type", "application/json")
    xhr.send();
  });
}

function reset_alert() {
  return new Promise((resolve, reject) => {
    if (!accessToken) reject();

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
        console.log(this.responseText);
        resolve(this.responseText);
      }
    });

    xhr.open("POST", 'http://localhost:3000/reset_alert');
    xhr.setRequestHeader('Authorization', accessToken);
    xhr.setRequestHeader("Content-Type", "application/json")
    xhr.send();
  });
}

/// For updating ADT data

function update_data() {
  if (!accessToken) {
    console.log("update no access token");
    return;
  }

  update_step_data("fanning");
  update_step_data("grinding");
  update_step_data("molding");
  update_step_data("conching");
  update_step_data("winnowing");
}

// deviceType: "grinding", "fanning", or "molding"
function update_step_data(deviceType) {
  if (!accessToken) return;

  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener("error", function (e) {
    console.log(e);
  });

  xhr.open("POST", 'http://localhost:3000/update_data');
  xhr.setRequestHeader('Authorization', accessToken);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify({
    device: deviceType,
    content: generateMessage(deviceType)
  }));
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
        Vibration: vibration
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