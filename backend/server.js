import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
// import dotenv from "dotenv";
import { connectDB } from "./src/db.js";   // Correct import
import businessRoutes from "./src/routes/businessRoutes.js";
import productRoutes from './src/routes/productRoutes.js';
import uploadRoutes from './src/routes/uploadRoutes.js';
import authRoutes from './src/routes/authRoutes.js';


// ADD DEBUG HERE:
console.log('=== Environment Variables Check ===');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY);
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'EXISTS' : 'MISSING');
console.log('===================================');

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/businesses", businessRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/auth", authRoutes);

// Connect to MongoDB
connectDB();

app.listen(5000, () => console.log("Server running on port 5000"));
