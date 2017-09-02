const fse = require('fs-extra');

module.exports = function guidesWebhook(req, res) {
  fse.writeFile('webhookRes.txt', JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
};
