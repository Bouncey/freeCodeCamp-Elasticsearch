const express = require('express');
const router = express.Router();
const searchHandler = require('./handle-search');
const cors = require('../../middleware/cors');
const helmet = require('helmet');

router.use(helmet());
router.use(cors);

searchHandler(router);

module.exports = router;