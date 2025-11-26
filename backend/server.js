import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./src/db.js";   // Correct import
import businessRoutes from "./src/routes/businessRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/businesses", businessRoutes);

// Connect to MongoDB
connectDB();

app.listen(5000, () => console.log("Server running on port 5000"));
