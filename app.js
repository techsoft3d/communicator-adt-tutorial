const express = require("express");
const apiRoutes = require('./routes/api');
const transformation = require('./controllers/transformations');
const query_twins = require('./controllers/api').queryTwins;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('src'));
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use("/", apiRoutes);

app.get('/', async function (req, res) {
  let resultData = await query_twins("SELECT * FROM digitaltwins T WHERE IS_DEFINED(T.SCSFile) AND IS_DEFINED(Transformation)");
  
  if (resultData.length <= 0) {
    // The twins have not been initialized yet.
    await transformation.initialise_twins();
  }

  res.sendFile(__dirname + '/src/index.html');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
