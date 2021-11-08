const express = require("express");

const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('src'));
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use("/", apiRoutes);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/src/index.html');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
