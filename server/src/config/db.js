const mongoose = require('mongoose');

const DEFAULT_ATLAS_URI = 'mongodb+srv://bhelayedipika_db_user:98KzIyUNFmHsbpgj@fixmyareacluster.dkb6rf2.mongodb.net/fixmyarea?retryWrites=true&w=majority';

// Global connection cache across serverless function invocations
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // If already connected, return connection immediately
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const uri = process.env.MONGO_URI || DEFAULT_ATLAS_URI;
    const opts = {
      bufferCommands: false, // Prevent buffering timeout; ensure explicit await
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
      family: 4 // Prefer IPv4 to avoid serverless DNS latency
    };

    cached.promise = mongoose.connect(uri, opts).then((m) => {
      console.log(`✅ MongoDB Atlas Connected: ${m.connection.host}`);
      return m;
    }).catch((err) => {
      cached.promise = null;
      console.error('❌ MongoDB connection error:', err.message);
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectDB;
