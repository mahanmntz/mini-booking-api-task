const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    room: {type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    startAt: {type: Date, required: true},
    key: String,
},
    {timestamps: true}
);

bookingSchema.index({room: 1, startAt: 1}, {unique: true});
bookingSchema.index(
  { user: 1, key: 1 },
  { unique: true, partialFilterExpression: { key: { $type: 'string' } } }
);

module.exports = mongoose.model('Booking', bookingSchema);
