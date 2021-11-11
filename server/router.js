const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const msal = require('./msal');
const path = require('path')
const transformation = require('../controllers/transformations');

const adtConfig = require('../adt.config');
const ADT_URL = 'https://' + adtConfig.hostname + '/';

router.use(express.json()); // for parsing application/json
router.use(express.urlencoded({ extended: true })); // for parsing routerlication/x-www-form-urlencoded

router.get('/', async function (req, res) {
  let resultData = await query_twins("SELECT * FROM digitaltwins T WHERE IS_DEFINED(T.SCSFile) AND IS_DEFINED(Transformation)");
  
  if (resultData.length <= 0) {
    // The twins have not been initialized yet.
    await transformation.initialise_twins();
  }

  res.sendFile(path.join(__dirname, "../src/index.html"));
});

router.post("/force_alert", (req, res, next) => {
  req.app.set("vibrationAlertTriggered", true);
});

router.post("/reset_alert", (req, res, next) => {
  req.app.set("vibrationAlertTriggered", false);
});

// Query twins with ADT query language
router.post("/query_twins", async (req, res, next) => {
  req.app.set("countdown", req.app.get("UPDATE_TIMEOUT"));

  let token = await msal.getToken();
  const url = ADT_URL + 'query?api-version=2020-10-31';

  let response = await fetch(url, {
    method: 'POST', headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },    
       body: JSON.stringify({query: req.body.query})
  })
  .catch((err) => {
    res.status(418).send(err);
  });

  var data = await response.json();
  res.send(data.value);
});

router.post("/reset_transformation", async (req, res) => {
  await transformation.reset_transformations();
  res.sendStatus(200);
});

// body: {dtid, matrix}
router.post("/update_transformation", async (req, res) => {
  transformation.update_transformation(req.body.dtid, req.body.matrix);
});

module.exports = router;
