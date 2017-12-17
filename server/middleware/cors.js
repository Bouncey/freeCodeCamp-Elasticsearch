const cors = require('cors');

const whitelist = [
  'https://freecodecamp.org',
  'https://guide.freecodecamp.org',
  'https://news.freecodecamp.org',
  'http://localhost:3000', // fcc dev
  'http://localhost:8000' // guides dev
];

const netlifyRE = /\.netlify\.com/;

function isTrustedOrigin(origin, callback) {
  if (whitelist.indexOf(origin) !== -1) {
    callback(null, true);
  } else if (netlifyRE.test(origin)) {
    callback(null, true);
  } else {
    callback(new Error('The request is not from an authorised origin'));
  }
}
const corsOptions = {
  origin: isTrustedOrigin,
  optionsSuccessStatus: 200
};

module.exports = cors(corsOptions);
