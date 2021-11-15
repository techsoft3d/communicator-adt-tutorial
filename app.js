const express = require("express");
const apiRoutes = require('./routes/api');
const transformation = require('./controllers/transformations');
const production_step_data = require('./controllers/production_step_data');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('src'));
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use("/", apiRoutes);

app.listen(PORT, async () => {
  console.log("Checking and initializing data...");

  await transformation.initialise_twins();
  await production_step_data.initialize_all_steps();

  console.log("Data ready");
  console.log(`Server running on port ${PORT}`);
});
