const express = require('express');
const logger = require('./middleware/logger');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const roomRoutes = require('./routes/roomRoutes');
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();

app.disable('x-powered-by');

app.use(logger);
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/rooms', roomRoutes);
app.use('/auth', authRoutes);
app.use('/bookings', bookingRoutes);         
app.get('/block', (req, res) => {
  const end = Date.now() + 5000;
  while (Date.now() < end) {}
  res.json({ done: true });
});
app.use(notFound);
app.use(errorHandler);

module.exports = app;