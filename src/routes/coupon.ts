import express from 'express';
import { allCoupons, deleteCoupon, getCoupon, newCoupon, updateCoupon } from '../controllers/coupon.js';
import { adminOnly } from '../middlewares/auth.js';

const app = express.Router();

app.post("/new", adminOnly, newCoupon);
app.get("/all", adminOnly, allCoupons);
app.get("/:id", adminOnly, getCoupon);
app.put("/:id", adminOnly, updateCoupon);
app.delete("/:id", adminOnly, deleteCoupon);

export default app;