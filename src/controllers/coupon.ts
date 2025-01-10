import { TryCatch } from "../middlewares/error.js";
import { Coupon } from "../models/coupon.js";
import ErrorHandler from "../utils/utitlity-class.js";

export const allCoupons = TryCatch(async (req, res, next) => {
  const coupons = await Coupon.find();

  return res.status(200).json({
    success: true,
    message: "All coupons found successfully",
    data: coupons,
  });
});

export const getCoupon = TryCatch(async (req, res, next) => {
  const { id } = req.params;

  const coupon = await Coupon.findById(id);

  if (!coupon) return next(new ErrorHandler("Invalid Coupon ID", 400));

  return res.status(200).json({
    success: true,
    data: coupon,
  });
});

export const newCoupon = TryCatch(async (req, res, next) => {
  const { code, amount } = req.body;

  if (!code || !amount)
    return next(
      new ErrorHandler("Please enter both coupon code and amount", 400)
    );

  await Coupon.create({ code, amount });
  return res.status(201).json({
    success: true,
    message: `Coupon ${code} created successfully!`,
  });
});

export const updateCoupon = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const { code, amount } = req.body;

  const coupon = await Coupon.findById(id);
  if (!coupon) return next(new ErrorHandler("Invalid Coupon Id", 400));
  if (code) coupon.code = code;
  if (amount) coupon.amount = amount;

  const updatedCoupon = await coupon.save();

  return res.status(201).json({
    success: true,
    data: updatedCoupon,
    message: `Coupon ${coupon.code} Updated Successfully`,
  });
});

export const deleteCoupon = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const coupon = await Coupon.findByIdAndDelete(id);
  if (!coupon) return next(new ErrorHandler("Invalid Coupon Id", 400));

  return res.status(200).json({
    success: true,
    message: `Coupon ${coupon.code} deleted successfully!`,
  });
});
