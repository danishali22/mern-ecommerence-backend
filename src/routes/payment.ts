import express from 'express';
import { applyDiscount, createPaymentIntent } from '../controllers/payment.js';

const app = express.Router();

app.post("/create", createPaymentIntent);
app.get("/discount", applyDiscount);

export default app;