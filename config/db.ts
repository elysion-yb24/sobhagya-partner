import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("❌ MONGO_URI environment variable is missing");
}

// ✅ Fix caching of connection (prevents multiple connections)
let cached = (global as any).mongoose || { conn: null, promise: null };

const connectDB = async () => {
  if (cached.conn) return cached.conn; // ✅ Use cached connection if available

  try {
    if (!cached.promise) {
      cached.promise = mongoose.connect(MONGO_URI, {
        bufferCommands: false, // ✅ Recommended for performance
      }).then((mongoose) => mongoose);
    }
    
    cached.conn = await cached.promise;
    console.log("✅ Database connected successfully");
  } catch (error: any) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }

  return cached.conn;
};

export default connectDB;
