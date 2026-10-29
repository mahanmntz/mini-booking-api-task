const express = require('express');
const auth = require('../middleware/auth');
const { requestOtp, verifyOtp, me } = require('../controllers/authController');

const router = express.Router();

router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);
router.get('/me', auth, me);

module.exports = router;