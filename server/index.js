require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const Rx = require('rx');
const app = express();

const { findTheThings, getAllTitleFields } = require('../elastic');
const cors = require('./middleware/cors');
const { error, info, log } = require('../utils');

const PORT = process.env.PORT || 7000;

const { Observable } = Rx;

let typeAheadTitles = [];

app.use(helmet());
app.use(cors);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('views', './views');
app.set('view engine', 'pug');

app.get('/search', (req, res) => {
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
});

app.get('/type-ahead', (req, res) => {
  if (typeAheadTitles.length) {
    res.status(200).end(JSON.stringify(typeAheadTitles));
  } else {
    getAllTitleFields()
      .then(titles => {
        typeAheadTitles = [ ...titles ];
        info('typeAheadTitles seeded');
      })
      .catch(err => {
        error(err.message);
      });
    res.status(503).end('Please try again later');
  }
});

app.get('*', (req, res) => {
  res.render('noRoute', { route: req.originalUrl }).end();
});

app.post('*', (req, res) => {
  res.json({ error: 'No mail thank you' }).end();
});

app.listen(PORT, () => {
  log(`API server listening on port ${PORT}!`);
  getAllTitleFields()
  .then(titles => {
    typeAheadTitles = [ ...titles ];
    info('typeAheadTitles seeded');
  })
  .catch(err => {
    error(err.message);
  });
});
