import mongoose from 'mongoose';

// Create a separate connection for Mureed database
let mureedConnection = null;

const connectMureedDB = async () => {
  try {
    // Create a new connection with proper options for stability
    mureedConnection = await mongoose.createConnection(process.env.MUREED_MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 60000,
      heartbeatFrequencyMS: 10000,
    });

    // Wait for connection to be ready
    await mureedConnection.asPromise();

    console.log(`✅ Mureed MongoDB Connected: ${mureedConnection.host}`);
    console.log(`📊 Mureed Database Name: ${mureedConnection.name}`);

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
    // Don't exit process, just log error - main app should still work
    return null;
  }
};

export const getMureedConnection = () => mureedConnection;

export default connectMureedDB;
