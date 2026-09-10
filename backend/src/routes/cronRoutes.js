import express from "express";
import { runWeeklyPayoutBatch } from "../controllers/payoutBatchController.js";

const router = express.Router();

// Vercel Cron sends GET requests with an Authorization header set from
// CRON_SECRET automatically — see the "crons" entry in vercel.json.
router.get("/payout-batch", runWeeklyPayoutBatch);

export default router;
