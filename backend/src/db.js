import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://owolabilanre2006_db_user:<db_password>@cluster0.chiovt4.mongodb.net/?appName=Cluster0", 
      { dbName: "small_business_platform" }
    );
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
};
