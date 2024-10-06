import { TryCatch } from "../middlewares/error.js";
import { Product } from "../models/product.js";
import ErrorHandler from "../utils/utitlity-class.js";
import { rm } from "fs";
export const newProduct = TryCatch(async (req, res, next) => {
    const { name, category, price, stock } = req.body;
    console.log("File: ", req.file);
    const photo = req.file;
    if (!photo)
        return next(new ErrorHandler("Please add Product photo", 400));
    if (!name || !category || !price || !stock) {
        rm(photo.path, () => {
            console.log("Photo Deleted");
        });
        return next(new ErrorHandler("Please enter all fields", 400));
    }
    await Product.create({
        name,
        price,
        stock,
        category: category.toLowerCase(),
        photo: photo?.path,
    });
    res.status(201).json({
        success: true,
        message: "Product created successfully",
    });
});
export const latestProducts = TryCatch(async (req, res, next) => {
    const products = await Product.find({}).sort({ created_at: -1 }).limit(5);
    return res.status(200).json({
        success: true,
        data: products,
    });
});
export const getAllCategories = TryCatch(async (req, res, next) => {
    const products = await Product.distinct("category");
    return res.status(200).json({
        success: true,
        data: products,
    });
});
