const serverUrl = "http://localhost:3000/";

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
  console.log("fa")
  var xhr = new XMLHttpRequest();

  xhr.open("POST", serverUrl + 'force_alert');
  xhr.setRequestHeader("Content-Type", "application/json")
  xhr.send();
}

function reset_alert() {
  console.log("ra");
  var xhr = new XMLHttpRequest();

  xhr.open("POST", serverUrl + 'reset_alert');
  xhr.setRequestHeader("Content-Type", "application/json")
  xhr.send();
}
