const mongoose = require("mongoose");

/**
 * Establish connection to MongoDB using Mongoose
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // You can add these if needed:
      // useCreateIndex: true,
      // useFindAndModify: false,
    });

    console.log(`✅ MongoDB Connected — Host: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:");
    console.error(`   ${err.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

// Export for use in server.js
module.exports = connectDB;
