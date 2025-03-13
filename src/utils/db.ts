import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI as string;

if (!MONGO_URI) {
  throw new Error("Please define the MONGO_URI environment variable inside .env.local");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}
let cached = (global as any).mongoose as MongooseCache | undefined;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectMongo() {
  if (cached && cached.conn) {
      return cached.conn;
  }

  if (cached && !cached.promise) {
      const opts = {
          bufferCommands: false,
          serverSelectionTimeoutMS: 5000,    // Added timeout
          connectTimeoutMS: 5000,            // Added timeout
          socketTimeoutMS: 10000,            // Added timeout
          family: 4                          // Force IPv4
      };

      if(cached){
          cached.promise = mongoose.connect(MONGO_URI, opts)
          .then((mongoose) => {
              console.log("MongoDB connected successfully");
              return mongoose;
          })
          .catch((error) => {
              console.error("MongoDB connection error:", error);
              throw error;
          });
      }
  }

  if(!cached){
      throw new Error("Cached connection is undefined unexpectedly.");
  }
  
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error("Failed to resolve MongoDB connection:", error);
    throw error;
  }
}

export default connectMongo;