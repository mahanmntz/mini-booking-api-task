const Otp = require('../models/otp');
const { generateCode, hashCode } = require('../utils/otp');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const OTP_TTL_SECONDS = 120;
const RESEND_COOLDOWN_SECONDS = 60;
const PHONE_RE = /^09\d{9}$/;
const MAX_ATTEMPTS = 5;

async function requestOtp(req, res, next) {
  try {
    const phone = String(req.body?.phone ?? '').trim();
    if (!PHONE_RE.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }

    const last = await Otp.findOne({ phone }).sort({ createdAt: -1 });
    if (last) {
      const waitMs = last.createdAt.getTime() + RESEND_COOLDOWN_SECONDS * 1000 - Date.now();
      if (waitMs > 0) {
        const retryAfter = Math.ceil(waitMs / 1000);
        res.set('Retry-After', String(retryAfter));
        return res.status(429).json({ error: 'Too many requests', retryAfter });
      }
    }

    const code = generateCode();
    await Otp.deleteMany({ phone });
    await Otp.create({
      phone,
      codeHash: hashCode(phone, code),
      expiresAt: new Date(Date.now() + OTP_TTL_SECONDS * 1000),
    });

    // DEV ONLY: stands in for the SMS provider. Never log or return codes in production.
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] OTP for ${phone}: ${code}`);
    }

    res.json({ message: 'OTP sent', expiresInSeconds: OTP_TTL_SECONDS });
  } catch (err) {
    next(err);
  }
}

async function verifyOtp(req, res, next) {
  try {
    const phone = String(req.body?.phone ?? '').trim();
    const code = String(req.body?.code ?? '').trim();

    if (!PHONE_RE.test(phone) || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: 'Invalid phone or code format' });
    }

    // Spend one attempt atomically; only an active code with tries left matches.
    const otp = await Otp.findOneAndUpdate(
      {
        phone,
        usedAt: null,
        expiresAt: { $gt: new Date() },
        attempts: { $lt: MAX_ATTEMPTS },
      },
      { $inc: { attempts: 1 } },
      { returnDocument: 'after' }
    );

    if (!otp) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    const expected = Buffer.from(otp.codeHash, 'hex');
    const actual = Buffer.from(hashCode(phone, code), 'hex');
    const ok = expected.length === actual.length && crypto.timingSafeEqual(expected, actual);

    if (!ok) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    // One-time use: only one request can flip usedAt from null.
    const claimed = await Otp.findOneAndUpdate(
      { _id: otp._id, usedAt: null },
      { usedAt: new Date() }
    );

    if (!claimed) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    const user = await User.findOneAndUpdate(
      { phone },
      { $setOnInsert: { phone } },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    const token = jwt.sign(
      { sub: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    res.json({ token, user: { id: user._id, phone: user.phone, role: user.role } });
  } catch (err) {
    next(err);
  }
}
async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select('phone role').lean();
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { requestOtp, verifyOtp, me };

