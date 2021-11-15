const express = require("express");
const apiRoutes = require('./routes/api');
const transformation = require('./controllers/transformations');
const query_twins = require('./controllers/query').query_twins;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('src'));
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use("/", apiRoutes);

app.listen(PORT, async () => {
  console.log("Checking data");
  let resultData = await query_twins("SELECT * FROM digitaltwins T WHERE IS_DEFINED(SCSFile) AND IS_DEFINED(Transformation)");

  if (resultData.length <= 0) {
    // The twins have not been initialized yet.
    console.log("Data not initialized yet");
    await transformation.initialise_twins();
    console.log("Data initialized");
  }
  console.log("Data ready");
  console.log(`Server running on port ${PORT}`);
});
