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
    if (whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('The request is not from an authorised origin'));
    }
  },
  optionsSuccessStatus: 200
};
exports.cors = cors;
exports.options = corsOptions;
