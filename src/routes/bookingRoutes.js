const router = require('express').Router();
const auth = require('../middleware/auth');
const { createBooking, listBookings, cancelBooking } = require('../controllers/bookingController');

router.use(auth);
router.post('/', createBooking);
router.get('/', listBookings);
router.delete('/:id', cancelBooking);

module.exports = router;