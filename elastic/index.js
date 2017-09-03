const events = require('events');
const elasticsearch = require('elasticsearch');
const uuidv4 = require('uuid/v4');

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

function singleInsert({ index, type, document }) {
  client.create({
    index,
    type,
    id: uuidv4(),
    body: document
  },
  (err) => {
    if (err) { error(JSON.stringify(err, null, 2)); }
    log(`insterted ${document.title}`);
  });
}

function bulkInsert({ index, type, documents }) {
  const insert = { index:  { _index: index, _type: type } };
  const request = documents.reduce((acc, current) => {
    return [
      ...acc,
      Object.assign({}, insert, { _id: current.id }),
      current
    ];
  }, []);
  client.bulk({
    body: request
  }, 
  (err) => {
    if (err) { error(JSON.stringify(err, null, 2)); }
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

function getAllTitleFields() {
  const searchQuery = {
    index: 'challenge,guides,youtube',
    size: 10000,
    body: {
      _source: [ 'title', 'url' ]
    }
  };

  return new Promise((resolve, reject) => {
    client.search(searchQuery, (err, response) => {
      if (err) {
        reject(err);
        return;
      }
      const titles = response.hits.hits
        .reduce((accu, current) => (
          [
            ...accu,
            {
              index: current._index,
              title: current._source.title,
              type: current._type,
              url: current._source.url
            }
          ]), []);
      resolve(titles);
    });
  });
}

module.exports ={
  bulkInsert,
  bulkUpsert,
  deleteAll,
  findTheThings,
  getAllTitleFields,
  singleInsert
};
