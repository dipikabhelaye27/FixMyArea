const mongoose = require('mongoose');

const connectDB = async () => {
  // Reuse existing connection in serverless environments (Vercel)
  if (mongoose.connection && mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  const atlasUri = process.env.MONGO_URI;
  const localUri = 'mongodb://127.0.0.1:27017/fixmyarea';

  if (atlasUri) {
    try {
      console.log('Attempting MongoDB Atlas connection...');
      const conn = await mongoose.connect(atlasUri, {
        serverSelectionTimeoutMS: 4000,
      });
      console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
      return conn;
    } catch (atlasError) {
      console.warn(`⚠️ Atlas connection failed (${atlasError.message}).`);
      console.log('🔄 Failing over to local MongoDB (127.0.0.1:27017/fixmyarea)...');
    }
  }

  try {
    const conn = await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ Local MongoDB Connected: 127.0.0.1:27017/fixmyarea (Failover Active)`);
    return conn;
  } catch (localError) {
    console.error(`❌ Both Atlas and Local MongoDB connections failed: ${localError.message}`);
    // Don't crash process so APIs can return proper error messages rather than dead server
  }
};

module.exports = connectDB;
