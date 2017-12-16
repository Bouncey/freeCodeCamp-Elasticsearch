const cors = require('cors');

const whitelist = [
  /(\.|https:\/\/)freecodecamp\.org/, // freecodecamp.org and any subdomain of
  /\.netlify\.com/, // deploy previews
  'http://localhost:3000', // fcc dev
  'http://localhost:8000' // guides dev
];
const corsOptions = {
  origin: whitelist,
  optionsSuccessStatus: 200
};
exports.cors = cors;
exports.options = corsOptions;
