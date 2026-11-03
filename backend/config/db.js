const mongoose = require('mongoose');
const dns = require('dns');
const dotenv = require('dotenv');

dotenv.config();

let mongod = null;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (uri && uri.trim() !== '') {
    // Windows Node.js bug workaround: c-ares fails SRV lookup when system DNS is set to 127.0.0.1 or local router
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch (e) {
      // Ignore if setServers fails
    }

    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log(`\x1b[32m✔ MongoDB Atlas Connected: ${conn.connection.host} (DB: ${conn.connection.name})\x1b[0m`);
      return;
    } catch (err) {
      console.warn(`\x1b[33m⚠ Failed to connect to MongoDB Atlas (${err.message}). Falling back to MongoMemoryServer...\x1b[0m`);
    }
  }

  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongod = await MongoMemoryServer.create();
    const memoryUri = mongod.getUri();
    await mongoose.connect(memoryUri);
    console.log(`\x1b[32m✔ Connected to In-Memory MongoDB Server: ${memoryUri}\x1b[0m`);
    console.log(`\x1b[36mℹ Ready for instant testing. (To persist data, specify MONGO_URI in .env)\x1b[0m`);
  } catch (error) {
    console.error(`\x1b[31m✖ Error starting MongoDB: ${error.message}\x1b[0m`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
};

module.exports = { connectDB, disconnectDB };
