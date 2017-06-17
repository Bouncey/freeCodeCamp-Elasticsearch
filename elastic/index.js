const events = require('events');
const elasticsearch = require('elasticsearch');

const eventEmitter = new events.EventEmitter();
const {
  error,
  log,
  info
} = require('../utils');
const { ELASTIC_AUTH, ELASTIC_HOST } = process.env;

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
  requestTimeout: 1000
}, function (error) {
  if (error) {
    console.trace('elasticsearch cluster is down!');
  } else {
    log('All is well with the cluster');
    connected = true;
    eventEmitter.emit('connection');
  }
});

function bulkInsert({ index, type, documents }) {
  const insert = { index:  { _index: index, _type: type } };
  const request = documents.reduce((acc, current) => {
    return [ ...acc, insert, current ];
  }, []);
  client.bulk({
    body: request
  }, 
  (err) => {
    if (err) { error(JSON.stringify(err, null, 2)); }
  });
}

function deleteActual() {
  error('DELETING all documents from the cluster');
  client.indices.delete(
    { index: '_all' },
    (err, response) => {
      if (err) {
        log(JSON.stringify(err, null, 2));
        return;
      }
      info(JSON.stringify(response, null, 2));
      return Promise.resolve();
    });
}

function deleteAll() {
  if (connected) {
    return deleteActual();
  }
  return eventEmitter.on('connection', deleteActual);
}

function findTheThings(query) {
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
        reject(err);
        return;
      }
      resolve(response.hits.hits);
    });

  });
}

module.exports ={
  bulkInsert,
  deleteAll,
  findTheThings
};
