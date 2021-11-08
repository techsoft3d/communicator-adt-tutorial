const path = require('path');
const express = require('express');
const apiController = require('../controllers/api');
const router = express.Router();

router.post('/force_alert', apiController.forceAlert);
router.post('/reset_alert', apiController.resetAlert);
router.post('/query_twins', apiController.queryTwins);

module.exports = router;