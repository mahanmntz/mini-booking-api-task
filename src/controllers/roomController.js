const Room = require('../models/room');

// Create a new room

async function createRoom(req, res, next) {
  try {
    const { name, capacity, amenities } = req.body;
    const room = await Room.create({ name, capacity, amenities });
    res.status(201).json(room);
  } catch (err) {
    next(err);
  }
}

async function listRooms(req, res, next) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const filter = { isActive: true };

    const [rooms, total] = await Promise.all([
      Room.find(filter)
        .select('-internalNotes -__v')
        .sort({ name: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Room.countDocuments(filter),
    ]);
    res.set('Cache-Control', 'public, max-age=60');
    res.json({
      data: rooms,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
}

async function getRoom(req, res, next) {
  try {
    const room = await Room.findById(req.params.id)
      .select('-internalNotes -__v')
      .lean();

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json(room);
  } catch (err) {
    next(err);
  }
}
async function updateRoom(req, res, next) {
  try {
    const allowed = ['name', 'capacity', 'amenities', 'isActive'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const room = await Room.findByIdAndUpdate(req.params.id, updates, {
      returnDocument: 'after',
      runValidators: true,
    })
      .select('-internalNotes -__v')
      .lean();

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json(room);
  } catch (err) {
    next(err);
  }
}

async function deleteRoom(req, res, next) {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { createRoom, listRooms, getRoom, updateRoom, deleteRoom };