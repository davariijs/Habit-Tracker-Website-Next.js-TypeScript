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
      };


      if(cached){
          cached.promise = mongoose.connect(MONGO_URI, opts)
          .then((mongoose) => {
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
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectMongo;
