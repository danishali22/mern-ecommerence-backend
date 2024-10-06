import { TryCatch } from "../middlewares/error.js";
import { Product } from "../models/product.js";
import ErrorHandler from "../utils/utitlity-class.js";
import { rm } from "fs";
export const newProduct = TryCatch(async (req, res, next) => {
    const { name, category, price, stock } = req.body;
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
export const getAdminProducts = TryCatch(async (req, res, next) => {
    const products = await Product.find({});
    return res.status(200).json({
        success: true,
        data: products,
    });
});
export const getProduct = TryCatch(async (req, res, next) => {
    const id = req.params.id;
    const product = await Product.findById(id);
    if (!product)
        return next(new ErrorHandler("Product Not Found", 400));
    res.status(200).json({
        success: true,
        data: product,
        message: "Product found successfully",
    });
});
export const updateProduct = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const { name, category, price, stock } = req.body;
    const photo = req.file;
    const product = await Product.findById(id);
    if (!product)
        return next(new ErrorHandler("Product Not Found", 400));
    if (photo) {
        rm(product?.photo, () => {
            console.log("Old photo deleted");
        });
        product.photo = photo.path;
    }
    if (name)
        product.name = name;
    if (category)
        product.category = category;
    if (price)
        product.price = price;
    if (stock)
        product.stock = stock;
    const updatedProduct = await product.save();
    return res.status(201).json({
        success: true,
        data: updatedProduct,
        message: "Product updated successfully",
    });
});
export const deleteProduct = TryCatch(async (req, res, next) => {
    const id = req.params.id;
    const product = await Product.findById(id);
    if (!product)
        return next(new ErrorHandler("Product Not Found", 400));
    rm(product.photo, () => {
        console.log("Product photo deleted");
    });
    await Product.deleteOne();
    return res.status(200).json({
        success: true,
        message: "Product deleted successfully",
    });
});
