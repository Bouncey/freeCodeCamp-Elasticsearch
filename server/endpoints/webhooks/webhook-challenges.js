const getChallengeData = require('../../../init/challenges');

module.exports = function challengesWebhook(req, res) {
  const { action, pull_request: { base, merged } } = req.body;
  if (
      action === 'closed' &&
      base.ref === 'master' &&
      merged
    ) {
    // update challenges
    getChallengeData('update');
  }
  res.sendStatus(200).end();
};
