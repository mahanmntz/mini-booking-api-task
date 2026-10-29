const crypto = require('crypto');

function generateCode() {
  return String(crypto.randomInt(0, 1000000)).padStart(6, '0');
}

function hashCode(phone, code) {
  return crypto
    .createHmac('sha256', process.env.OTP_SECRET)
    .update(`${phone}:${code}`)
    .digest('hex');
}

module.exports = { generateCode, hashCode };