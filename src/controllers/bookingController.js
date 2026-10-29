const mongoose = require('mongoose');
const Booking = require('../models/booking');
const Room = require('../models/room');

const HOUR = 60 * 60 * 1000;

async function createBooking(req, res) {
    const {roomId, startAt} = req.body ?? {};
    const start = new Date(startAt);
    if (!mongoose.isValidObjectId(roomId) || start.getTime() % HOUR !== 0 || start <= Date.now()) {
        return res.status(400).json({error: 'Valid roomId and startAt (hourly, future) are required'});
    }
    if (!(await Room.exists({_id: roomId, isActive: true}))) {
        return res.status(404).json({error: 'Room not found or inactive'});
    }

    // Same key from the same user returns the first booking instead of a new one
    const key = req.get('Idempotency-Key');
    const prev = key && (await Booking.findOne({user: req.user.id, key}));
    if (prev) return res.json(prev);

    const booking = await Booking.create({room: roomId, user: req.user.id, startAt: start, key});
    res.status(201).json(booking);
}

async function listBookings(req, res) {
    res.json(await Booking.find({user: req.user.id}).sort({startAt: 1}).lean());
}

async function cancelBooking(req, res) {
    const booking = await Booking.findOneAndDelete({
        _id: req.params.id,
        user: req.user.id,
        startAt: {$gt: new Date(Date.now() + HOUR)},
    });
    if (!booking) return res.status(404).json({error: 'Booking not found'});
    res.status(204).send();
}

module.exports = {createBooking, listBookings, cancelBooking};