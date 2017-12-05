const cors = require('cors');

const whitelist = [

  'http://guide.freecodecamp.org',
  'https://guide.freecodecamp.org',
  'http://news.freecodecamp.org',
  'https://news.freecodecamp.org',
  'http://localhost:8000'
];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('The request is not from an authorised origin'));
    }
  }
};

module.exports = cors(corsOptions);
