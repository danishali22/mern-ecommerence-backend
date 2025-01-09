import express from 'express';
import { allCoupons, deleteCoupon, newCoupon, updateCoupon } from '../controllers/coupon.js';
import { adminOnly } from '../middlewares/auth.js';

const app = express.Router();

app.post("/new", adminOnly, newCoupon);
app.get("/all", adminOnly, allCoupons);
app.put("/:id", adminOnly, updateCoupon);
app.delete("/:id", adminOnly, deleteCoupon);

export default app;