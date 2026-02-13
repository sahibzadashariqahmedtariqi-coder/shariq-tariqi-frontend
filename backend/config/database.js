import mongoose from 'mongoose';

let connectionAttempts = 0;
const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in environment variables!');
    console.error('Please set MONGODB_URI in your environment or .env file');
    return;
  }

  // Mask the URI for logging (hide password)
  const maskedUri = process.env.MONGODB_URI.replace(
    /\/\/([^:]+):([^@]+)@/,
    '//$1:****@'
  );
  console.log(`🔄 Connecting to MongoDB: ${maskedUri}`);

  try {
    connectionAttempts++;
    console.log(`🔄 MongoDB connection attempt ${connectionAttempts}/${MAX_RETRIES}...`);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 10,
      minPoolSize: 2,
      retryReads: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);
    connectionAttempts = 0; // Reset on success
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error(`   Full error: ${error}`);
    
    // Retry connection if under max retries
    if (connectionAttempts < MAX_RETRIES) {
      console.log(`⏳ Retrying in ${RETRY_DELAY / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return connectDB();
    }
    
    console.error('❌ Max retries reached for MongoDB. Server will run but database operations will fail.');
    console.error('   Please check:');
    console.error('   1. MONGODB_URI environment variable is correct');
    console.error('   2. MongoDB Atlas IP whitelist includes 0.0.0.0/0 (allow all)');
    console.error('   3. MongoDB Atlas cluster is active (not paused)');
    console.error('   4. Database user credentials are correct');
  }
};

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ Mongoose connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('📴 Mongoose disconnected');
  // Auto-reconnect after disconnect
  if (process.env.MONGODB_URI) {
    console.log('🔄 Attempting to reconnect...');
    setTimeout(() => {
      connectionAttempts = 0;
      connectDB();
    }, RETRY_DELAY);
  }
});

export default connectDB;
