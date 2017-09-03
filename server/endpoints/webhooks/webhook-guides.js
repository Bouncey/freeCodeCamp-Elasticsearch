const getGuideArticleData = require('../../init/guides');

module.exports = function guidesWebhook(req, res) {
  const { action, pull_request: { base, merged } } = req.body;
  if (
      action === 'closed' &&
      base.ref === 'master' &&
      merged
    ) {
    // update the guides
    getGuideArticleData('update');
  }
  res.sendStatus(200).end();
};
