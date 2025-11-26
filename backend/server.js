import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/db.js";
import businessRoutes from "./src/routes/businessRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// ⭐ IMPORTANT
app.use("/api/businesses", businessRoutes);

connectDB();

app.listen(5000, () => console.log("Server running on port 5000"));
