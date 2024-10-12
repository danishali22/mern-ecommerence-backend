import { stripe } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Coupon } from "../models/coupon.js";
import ErrorHandler from "../utils/utitlity-class.js";


export const createPaymentIntent = TryCatch (
    async(req, res, next) => {
        const {amount} = req.query;

        if(!amount) return next(new ErrorHandler("Please enter amount", 400));

        const paymentIntent = await stripe.paymentIntents.create({
            "amount": Number(amount) * 100,
            "currency": "pkr",
        });

        return res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
        });
    }
)
// sk_test_51PGbVmFJHdjwKuJhElYCRjNzLCeltmRMgoYjhk7oYtAUUNu4xV5hdDBrOyfP2eDxI7vCBiGc4SQdR2gI616r5neG001bkOXJ0m

export const newCoupon = TryCatch (
    async(req, res, next) => {
        const {code, amount} = req.query;

        if(!code || !amount) return next(new ErrorHandler("Please enter both coupon code and amount", 400));

        await Coupon.create({code, amount});
        return res.status(201).json({
            success: true,
            message: `Coupon ${code} created successfully!`,
        });
    }
)

export const applyDiscount = TryCatch (
    async(req, res, next) => {
        const {code} = req.query;

        const discount = await Coupon.findOne({code: code});

        if(!discount) return next(new ErrorHandler("Invalid Coupon Code", 400));

        return res.status(200).json({
            success: true,
            discount: discount.amount,
        });
    }
)

export const allCoupons = TryCatch (
    async(req,res,next) => {
        const coupons = await Coupon.find();

        return res.status(200).json({
            success: true,
            data: coupons,
            message: "All coupons found successfully",
        });
    }
)

export const deleteCoupon = TryCatch (
    async(req,res,next) => {
        const { id } = req.params;
        const coupon = await Coupon.findByIdAndDelete(id);
        if(!coupon) return next(new ErrorHandler("Invalid Coupon Id", 400));

        return res.status(200).json({
            success: true,
            message: `Coupon ${coupon.code} deleted successfully!`,
        });
    }
)