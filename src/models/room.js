const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    capacity: { type: Number, required: true, min: 1 },
    amenities: {type: [String], default: [] },
    isActive: { type: Boolean, default: true},
    internalNotes:{
      type: String, default: '' 
    },
},
  {  timestamps: true},

);
module.exports = mongoose.model('Room', roomSchema);