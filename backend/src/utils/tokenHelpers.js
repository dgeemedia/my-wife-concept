// backend/src/utils/tokenHelpers.js
const crypto = require('crypto');

function genRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}

function parseExpiryToMs(value) {
  const num = parseInt(value);
  if (value.endsWith('d')) return num * 24 * 60 * 60 * 1000;
  if (value.endsWith('h')) return num * 60 * 60 * 1000;
  if (value.endsWith('m')) return num * 60 * 1000;
  return num * 1000;
}

module.exports = {
  genRefreshToken,
  parseExpiryToMs,
};
