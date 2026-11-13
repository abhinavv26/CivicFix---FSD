const mongoose = require('mongoose');

let memoryServerInstance = null;

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/civicfix';
  
  // Try connecting to primary URI first with a 3-second timeout
  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[MongoDB] Connected to database: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`[MongoDB] Primary connection to ${primaryUri} failed (${err.message}).`);
    console.log('[MongoDB] Initializing embedded in-memory MongoDB fallback...');
    
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServerInstance = await MongoMemoryServer.create();
      const memoryUri = memoryServerInstance.getUri();
      
      const conn = await mongoose.connect(memoryUri);
      console.log(`[MongoDB] Connected to embedded MongoDB at: ${memoryUri}`);
      return conn;
    } catch (memErr) {
      console.error('[MongoDB] Fatal error initializing database:', memErr.message);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
  }
};

module.exports = { connectDB, disconnectDB };
