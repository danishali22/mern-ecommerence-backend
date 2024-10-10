import express from 'express';
import { allCoupons, applyDiscount, deleteCoupon, newCoupon } from '../controllers/payment.js';

const app = express.Router();

app.post("/coupon/new", newCoupon);
app.get("/discount", applyDiscount);
app.get("/all", allCoupons);
app.delete("/:id", deleteCoupon);

export default app;