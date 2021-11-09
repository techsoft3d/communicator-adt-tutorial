const express = require("express");
const random_update_data = require("./server/random_update_data");
const router = require("./server/router");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('src'));
app.set("vibrationAlertTriggered", false);

// Prevents updating when no one is accessing the server
app.set("UPDATE_TIMEOUT", 15);
app.set("countdown", app.get("UPDATE_TIMEOUT"));

app.use("/", router);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Start updating data every 5 seconds
setInterval(() => {
  if (app.get("countdown") <= 5) {
    app.set("countdown", 0);
  } else {
    app.set("countdown", app.get("countdown")-5);
    random_update_data(app.get("vibrationAlertTriggered"));
  }
}, 5000);
