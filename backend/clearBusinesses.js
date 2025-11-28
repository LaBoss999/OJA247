clearBusinesses.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Business from "./src/models/Business.js"; // make sure this is ES Module (export default)

dotenv.config();

const clearBusinesses = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const result = await Business.deleteMany({});
    console.log(`Deleted ${result.deletedCount} businesses`);

    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  } catch (err) {
    console.error("Error clearing businesses:", err);
  }
};

clearBusinesses();
