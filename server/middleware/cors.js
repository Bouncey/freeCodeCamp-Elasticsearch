const cors = require('cors');

const fccRE = /https:\/\/([\w]+\.)?freecodecamp\.org/;
const netlifyRE = /\.netlify\.com/;
const whitelist = [
  'http://localhost:3000', // fcc dev
  'http://localhost:8000' // guides dev
];

function isTrustedOrigin(origin, callback) {
  if (fccRE.test(origin)) {
    return callback(null, true);
  }
  if (whitelist.indexOf(origin) !== -1) {
    return callback(null, true);
  } else if (netlifyRE.test(origin)) {
    return callback(null, true);
  } else {
    return callback(new Error('The request is not from an authorised origin'));
  }
}
const corsOptions = {
  origin: isTrustedOrigin,
  optionsSuccessStatus: 200
};

module.exports = cors(corsOptions);
