const express = require('express');
const auth = require('../middleware/auth');
const { admin } = auth;

const {
  createRoom,
  listRooms,
  getRoom,
  updateRoom,
  deleteRoom,
} = require('../controllers/roomController');

const router = express.Router();

router.get('/', listRooms);
router.post('/', admin, createRoom);
router.get('/:id', getRoom);
router.patch('/:id', admin, updateRoom);
router.delete('/:id', admin, deleteRoom);

module.exports = router;