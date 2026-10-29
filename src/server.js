require('dotenv').config();
const app = require('./app');
const port = process.env.PORT || 3000;
const connectDB = require('./config/db');

for (const name of ['JWT_SECRET', 'OTP_SECRET']) {
  if (!process.env[name]) {
    throw new Error(`${name} is not set`);
  }
}

async function startServer() {
    await connectDB(process.env.MONGO_URI);
    app.listen(port,() => {
        console.log(`Server is running on port ${port}`);
    });
}

startServer().catch(err => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
});  