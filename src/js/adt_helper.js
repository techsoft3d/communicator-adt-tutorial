const serverUrl = "http://localhost:3300/";

// Access token will be granted once you loged in.
var vibrationAlertTriggered = false;

// param "object" is object.adtID
function get_data(object) {
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();

    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
        resolve(this.responseText);
      }
    });

    xhr.addEventListener("error", function (e) {
      console.log(e);
    });

    const url = serverUrl + "data/" + object;
    xhr.open("GET", url);
    xhr.setRequestHeader("Content-Type", "application/json")
    xhr.send();
  })
}

function force_alert() {
  vibrationAlertTriggered = true;
  return new Promise((resolve, reject) => {

    var xhr = new XMLHttpRequest();

    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
        console.log(this.responseText);
        resolve(this.responseText);
      }
    });

    xhr.open("POST", 'http://localhost:3000/force_alert');
    xhr.setRequestHeader("Content-Type", "application/json")
    xhr.send();
  });
}

function reset_alert() {
  vibrationAlertTriggered = false;
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
