import { TryCatch } from "../middlewares/error.js";
import { Coupon } from "../models/coupon.js";
import ErrorHandler from "../utils/utitlity-class.js";
export const newCoupon = TryCatch(async (req, res, next) => {
    const { code, amount } = req.query;
    if (!code || !amount)
        return next(new ErrorHandler("Please enter both coupon code and amount", 400));
    await Coupon.create({ code, amount });
    return res.status(201).json({
        success: true,
        message: `Coupon ${code} created successfully!`,
    });
});
export const applyDiscount = TryCatch(async (req, res, next) => {
    const { code } = req.query;
    const discount = await Coupon.findOne({ code: code });
    if (!discount)
        return next(new ErrorHandler("Invalid Coupon Code", 400));
    return res.status(200).json({
        success: true,
        discount: discount.amount,
    });
});
