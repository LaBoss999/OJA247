import mongoose from "mongoose";

// Cached across warm serverless invocations so we don't reconnect (or race
// ahead of a still-pending connection) on every request — this is the
// classic cause of a "slow to load" backend on Vercel.
let connectionPromise = null;

export const connectDB = () => {
  if (mongoose.connection.readyState === 1) return Promise.resolve();
  if (connectionPromise) return connectionPromise;

  connectionPromise = mongoose
    .connect(process.env.MONGO_URI, {
      dbName: "oja247",
      // Small per-instance pool — each serverless invocation gets its own
      // pool, they don't share one, so this doesn't need to be large.
      maxPoolSize: 5,
      minPoolSize: 0, // don't hold idle connections open between invocations
      maxIdleTimeMS: 30000, // release unused connections quickly
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 10000,
    })
    .then(() => {
      console.log("MongoDB connected successfully");
    })
    .catch((error) => {
      connectionPromise = null; // let the next request retry instead of staying stuck
      console.error("MongoDB connection failed:", error);
      throw error;
    });

  return connectionPromise;
};
