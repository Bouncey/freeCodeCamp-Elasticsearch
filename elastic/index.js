const events = require('events');
const elasticsearch = require('elasticsearch');

const eventEmitter = new events.EventEmitter();
const promisify = require('promisify-event');
const { log } = require('../utils');
const { ELASTIC_AUTH, ELASTIC_HOST } = process.env;
const logger = log('elastic');
let connected = false;

const client = new elasticsearch.Client({
  host: [
    {
      host: ELASTIC_HOST,
      auth: ELASTIC_AUTH
    }
  ]
});

client.ping({
  requestTimeout: 5000
}, function (error) {
  if (error) {
    logger('Cluster is down!', 'red');
  } else {
    logger('All is well with the cluster');
    connected = true;
    eventEmitter.emit('connection');
  }
});

function singleInsert({ index, type, document, id }) {
  client.create({
    index,
    type,
    body: document,
    id
  },
  (err) => {
    if (err) { logger(err.message, 'red'); }
  });
}

function bulkInsert({ index, type, documents }) {
  const insert = { index:  { _index: index, _type: type } };
  const request = documents.reduce((acc, current) => {
    return [
      ...acc,
      {...insert, index: { ...insert.index, _id: current.id } },
      current
    ];
  }, []);
  client.bulk({
    body: request
  },
  (err) => {
    if (err) { logger(err.message, 'yellow'); }
  });
}

function bulkUpsert({ index, type, documents }) {
  const update = {
    update:
    {
      _index: index,
      _type: type,
      _retry_on_conflict: 3
    }
  };
  const request = documents
    .map(doc => {
      doc.doc_as_upsert = true;
      return doc;
    })
    .reduce((acc, current) => (
      [
        ...acc,
        Object.assign({}, update, { _id: current.id }),
        current
      ]
    ), []);
  client.bulk({
    body: request
  },
  (err) => {
    if (err) { logger(err.message, 'magenta'); }
  });
}

function deleteActual() {
  logger('DELETING all documents from the cluster', 'magenta');
  return new Promise((resolve, reject) => {
    client.indices.delete(
      { index: '_all' },
      (err, response) => {
        if (err) { logger(err.message, 'red'); reject(err.message); }
        logger(JSON.stringify(response, null, 2), 'blue');
        resolve();
      });
  });
}

function deleteAll() {
  return new Promise((resolve, reject) => {
    if (connected) {
      deleteActual().then(resolve).catch(reject);
    }
    return promisify(eventEmitter, 'connection')
      .then(deleteActual)
      .then(resolve)
      .catch(err => { logger(err.message, 'red'); reject(err.message); });
  });
}

function findTheThings(query) {
  log('query')(JSON.stringify(query), 'magenta');
  const searchQuery = {
    body: {
      query: {
        match: {
          _all: query
        }
      }
    }
  };

  return new Promise((resolve, reject) => {
    client.search(searchQuery, (err, response) => {
      if (err) {
        log('query')(err.message, 'yellow');
        reject(err);
        return;
      }
      resolve(response.hits.hits);
    });
  });
}

function incrementViewCount(id) {
  return new Promise((resolve, reject) => {
    client.update({
      index: 'news',
      type: 'story',
      id,
      body: {
        script: {
          lang: 'painless',
          inline: `ctx._source.views += 1; ctx._source.newsViews.add(${Date.now()}L);`
        }
      },
      retry_on_conflict: 3
    }, function (err) {
      if (err) {
        logger(JSON.stringify(err, null, 2), 'cyan');
        logger(err.message, 'red');
        reject(false);
        return;
      }
      resolve(true);
      return;
    });
  });
}

function getViewCount(id) {
  return new Promise((resolve, reject) => {
    client.get({
      index: 'news',
      type: 'story',
      id,
      _source: [ 'views' ]
    }, function (err, response) {
      if (err) {
        logger(err.message, 'red');
        reject(err.message);
      }
      resolve(response._source.views);
    });
  });
}

module.exports ={
  bulkInsert,
  bulkUpsert,
  deleteAll,
  findTheThings,
  getViewCount,
  incrementViewCount,
  singleInsert
};
