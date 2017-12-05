const { getViewCount, getAllViewCounts, incrementViewCount } = require('../../../elastic/index.js');
const { log } = require('../../../utils');
const logger = log('handle-views');

module.exports = function (app) {

  app.get('/get-views', (req, res) => {
    res.sendStatus(400).end({'error': 'An id must be provided'});
  });

  app.get('/get-views/all-mapped', async (req, res) => {
    const map = await getAllViewCounts();
    res.json(map).end('OK');
  });

  app.get('/get-views/:storyId', async (req, res) => {
    const { storyId } = req.params;
    logger(storyId);
    if (!storyId) {
      res.sendStatus(400).end({'error': 'An id must be provided'});
      return;
    }
    let views = await getViewCount(storyId);
    logger(views);
    if (views) {
      res.json(JSON.stringify({views}));
    } else {
      res.sendStatus(400).end('KO');
    }
  });

  app.get('/increment-views', (req, res) => {
    res.sendStatus(400).end({'error': 'An id must be provided'});
  });

  app.get('/increment-views/:storyId', async (req, res) => {
    const { storyId } = req.params;
    if (!storyId) {
      res.sendStatus(400).end({'error': 'An id must be provided'});
    }
    let result;
    try {
      result = await incrementViewCount(storyId);
    }
    catch (err) {
      logger(`
      (incrementViewCount): ${storyId}
      ${err.message}
      `, 'red');
      result = false;
    }
    if (result) {
      res.json({ status: 'success', id: storyId });
    } else {
      res.json({ status: 'failed', id: storyId });
    }
  });
};
