const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const viewsHandler = require('./handle-views');
const cors = require('../../middleware/cors');
const helmet = require('helmet');

router.use(helmet());
router.use(cors);
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

viewsHandler(router);

module.exports = router;