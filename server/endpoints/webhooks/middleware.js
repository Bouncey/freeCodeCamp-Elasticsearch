const crypto = require('crypto');
const compare = require('secure-compare');

// thanks mrugesh (@raisedadead)

function connectionValidator(req, res, next) {
  if (req.method === 'POST') {
    const signature = req.headers['x-hub-signature'];
    const computedSignature = 'sha1=' + crypto.
        createHmac('sha1', process.env.GITHUB_WEBHOOK_TOKEN).
        update(new Buffer(JSON.stringify(req.body), 'utf8')).digest('hex');
    if (!(
      res.req.headers['x-hub-signature'] === signature &&
      res.req.headers['x-hub-signature'] === computedSignature &&
      computedSignature === signature &&
      compare(computedSignature, signature) &&
      compare(computedSignature, res.req.headers['x-hub-signature']) &&
      compare(signature, res.req.headers['x-hub-signature'])
    )) {
      res.sendStatus(403);
      console.error('This request is not secured! Aborting.');
      return;
    }
  }
  next();
}

module.exports = connectionValidator;
