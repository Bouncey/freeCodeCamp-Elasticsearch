const cors = require('cors');

const whitelist = [
  'http://guide.freecodecamp.org',
  'https://guide.freecodecamp.org',
  'http://localhost:8000'
];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

module.exports = cors(corsOptions);
