import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import businessRoutes from "./routes/businessRoutes.js";

dotenv.config();

const app = express();

// MIDDLEWARE FIRST
app.use(cors());
app.use(express.json());

// ROUTES AFTER
app.use("/businesses", businessRoutes);

// MongoDB
mongoose.connect(process.env.MONGO_URI, { dbName: "oja247" })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("Backend is running and connected to MongoDB!");
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
