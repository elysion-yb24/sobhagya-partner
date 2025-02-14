import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("MONGO_URI environment variable is missing");
}

let cached = (global ).mongoose || { conn: null, promise: null };

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  try {
    if (!cached.promise) {
      cached.promise = mongoose.connect(MONGO_URI, {
        bufferCommands: false, // ✅ Improves performance
      }).then((mongoose) => mongoose);
    }
    cached.conn = await cached.promise;
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }

  return cached.conn;
};

export default connectDB;
