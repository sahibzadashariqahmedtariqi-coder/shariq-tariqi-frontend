import mongoose from 'mongoose';

// Create a separate connection for Mureed database
let mureedConnection = null;
let connectionAttempts = 0;
const MAX_RETRIES = 3;

const connectMureedDB = async () => {
  if (!process.env.MUREED_MONGODB_URI) {
    console.warn('⚠️ MUREED_MONGODB_URI not set - Mureed features will be unavailable');
    return null;
  }

  try {
    connectionAttempts++;
    console.log(`🔄 Attempting Mureed MongoDB connection (attempt ${connectionAttempts}/${MAX_RETRIES})...`);
    
    // Create a new connection with proper options for stability
    mureedConnection = await mongoose.createConnection(process.env.MUREED_MONGODB_URI, {
      serverSelectionTimeoutMS: 60000, // Increased timeout
      socketTimeoutMS: 60000,
      connectTimeoutMS: 60000,
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 5,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      heartbeatFrequencyMS: 30000,
      retryReads: true,
    });

    // Wait for connection to be ready
    await mureedConnection.asPromise();

    console.log(`✅ Mureed MongoDB Connected: ${mureedConnection.host}`);
    console.log(`📊 Mureed Database Name: ${mureedConnection.name}`);
    connectionAttempts = 0; // Reset on success

    // Handle connection events
    mureedConnection.on('connected', () => {
      console.log('🔗 Mureed Mongoose connected to separate DB');
    });

    mureedConnection.on('error', (err) => {
      console.error(`❌ Mureed Mongoose connection error: ${err.message}`);
    });

    mureedConnection.on('disconnected', () => {
      console.log('📴 Mureed Mongoose disconnected - will auto-reconnect');
    });

    mureedConnection.on('reconnected', () => {
      console.log('🔄 Mureed Mongoose reconnected successfully');
    });

    return mureedConnection;
  } catch (error) {
    console.error(`❌ Mureed MongoDB Connection Error: ${error.message}`);
    
    // Retry connection if under max retries
    if (connectionAttempts < MAX_RETRIES) {
      console.log(`⏳ Retrying in 5 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      return connectMureedDB();
    }
    
    console.error('❌ Max retries reached for Mureed MongoDB. Continuing without Mureed database.');
    return null;
  }
};

export const getMureedConnection = () => mureedConnection;

export default connectMureedDB;
