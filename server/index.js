const path = require('path');
const envPath = path.resolve(__dirname, '../.env');

require('dotenv').config({ path: envPath });

const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const Rx = require('rx');
const pmx = require('pmx');

const webhookRouter = require('./endpoints/webhooks');
const newsRouter = require('./endpoints/news');

const app = express();
const probe = pmx.probe();

const reqPerHour = probe.meter({
  name: 'Requests per hour',
  samples: 60 * 60
});
const reqPerMin = probe.meter({
  name: 'Requests per minute',
  samples: 60
});
const reqPerSec = probe.meter({
  name: 'Requests per second',
  samples: 1
});

const probes = [ reqPerHour, reqPerMin, reqPerSec ];

const { findTheThings } = require('../elastic');
const cors = require('./middleware/cors');
const { log } = require('../utils');

const logger = log('server');

const PORT = process.env.PORT || 7000;

const { Observable } = Rx;

// webhooks
app.use('/webhook', webhookRouter);
// diasble this until the rollout of news
app.use('/news/v1', newsRouter);

app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('views', __dirname +'/views');
app.set('view engine', 'pug');

app.all('*', (req, res, next) => {
	logger(req.originalUrl)
next();
})

app.get('/search', cors, (req, res) => {
  const { q: query } = req.query;
  Observable.fromPromise(findTheThings(query))
  .subscribe(
    hits => {
      res.json(hits).end();
    },
    err => {
      console.error(err);
      res.json(err).end();
    }
  );
  probes.map(probe => probe.mark());
});

app.get('*', (req, res) => {
  res.render('noRoute', { route: req.originalUrl });
});

app.post('*', (req, res) => {
  res.json({ error: 'No mail thank you' }).end();
});

app.listen(PORT, () => {
  logger(`API server listening on port ${PORT}!`);
});
