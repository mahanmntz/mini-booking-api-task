function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue);
    return res.status(409).json({ error: 'Duplicate value', fields });
  }

  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: 'Validation failed', details });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ error: `Invalid ${err.path}` });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  return res.status(500).json({ error: 'Internal server error' });
}

module.exports = errorHandler;