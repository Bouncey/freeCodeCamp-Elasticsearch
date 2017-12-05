const express = require('express');
const router = express.Router();
const searchHandler = require('./handle-search');
const helmet = require('helmet');

router.use(helmet());

searchHandler(router);

module.exports = router;