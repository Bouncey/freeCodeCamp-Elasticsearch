const { Observable } = require('rx');
const { findTheThings } = require('../../../elastic');


module.exports = function searchHandler(app) {

  app.get('/', (req, res) => {
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
};
