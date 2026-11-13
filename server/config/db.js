const mongoose = require('mongoose');

let memoryServerInstance = null;

const sanitizeUri = (uri) => {
  if (!uri) return uri;
  // If the user has an unencoded '@' in the password part, e.g. mongodb://user:pass@word@host...
  // mongodb://<user>:<password>@<host>...
  const match = uri.match(/^(mongodb(?:\+srv)?:\/\/)([^:]+):(.+)@([^@]+)$/);
  if (match) {
    const [, proto, user, pass, rest] = match;
    // Check if pass contains an unencoded '@'
    if (pass.includes('@') && !pass.includes('%40')) {
      const encodedPass = encodeURIComponent(pass);
      return `${proto}${user}:${encodedPass}@${rest}`;
    }
  }
  return uri;
};

const connectDB = async () => {
  let primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/civicfix';
  primaryUri = sanitizeUri(primaryUri);
  
  // Try connecting to primary URI first with a 15-second timeout
  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`[MongoDB] ✅ Connected to database: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    const isRemote = primaryUri.includes('mongodb.net') || primaryUri.includes('mongodb+srv');
    console.error(`[MongoDB] ❌ Primary connection to ${isRemote ? 'MongoDB Atlas' : primaryUri} failed: ${err.message}`);
    
    // When connecting to Atlas or in production, NEVER attempt in-memory fallback
    if (isRemote || process.env.NODE_ENV === 'production') {
      console.error('\n================================================================');
      console.error(' [MongoDB Atlas Connection Issue Detected]');
      console.error(' Error: Could not connect to MongoDB Atlas from this server.');
      console.error(' ');
      console.error(' 👉 HOW TO FIX:');
      console.error(' 1. Go to https://cloud.mongodb.com');
      console.error(' 2. In the left menu under Security, click "Network Access"');
      console.error(' 3. Click "+ Add IP Address"');
      console.error(' 4. Click "Allow Access from Anywhere" (adds 0.0.0.0/0)');
      console.error(' 5. Click "Confirm" and wait 1 minute for it to apply');
      console.error(' 6. In Render Environment variables, verify MONGO_URI has %40 for @ in password');
      console.error('================================================================\n');
      process.exit(1);
    }

    console.log('[MongoDB] ℹ️ Initializing embedded in-memory MongoDB fallback...');
    
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
