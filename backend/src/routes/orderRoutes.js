import express from 'express';
import { createOrder, getOrder } from '../controllers/orderController.js';


const router = express.Router();


router.post('/', createOrder);
router.get('/:id', getOrder);


export default router;