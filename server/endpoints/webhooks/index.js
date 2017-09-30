const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const connectionValidator = require('./middleware');
const guidesWebhook = require('./webhook-guides');
const challengesWebhook = require('./webhook-challenges');


router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use(connectionValidator);
guidesWebhook(router);
// TODO
// challengesWebhook(router);

module.exports = router;
