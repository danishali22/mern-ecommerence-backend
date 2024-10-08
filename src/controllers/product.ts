import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middlewares/error.js";
import {
  BaseQuery,
  NewProductRequestBody,
  SearchRequestQuery,
} from "../types/types.js";
import { Product } from "../models/product.js";
import ErrorHandler from "../utils/utitlity-class.js";
import { rm } from "fs";

export const newProduct = TryCatch(
  async (
    req: Request<{}, {}, NewProductRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { name, category, price, stock } = req.body;
    const photo = req.file;

    if (!photo) return next(new ErrorHandler("Please add Product photo", 400));

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
  }
);

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
  if (!product) return next(new ErrorHandler("Product Not Found", 400));
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
  if (!product) return next(new ErrorHandler("Product Not Found", 400));

  if (photo) {
    rm(product?.photo!, () => {
      console.log("Old photo deleted");
    });
    product.photo = photo.path;
  }

  if (name) product.name = name;
  if (category) product.category = category;
  if (price) product.price = price;
  if (stock) product.stock = stock;

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
  if (!product) return next(new ErrorHandler("Product Not Found", 400));
  rm(product.photo, () => {
    console.log("Product photo deleted");
  });
  await Product.deleteOne();
  return res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});

export const searchFilterProducts = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { search, category, price, sort } = req.query as {
      search?: string;
      category?: string;
      price?: string;
      sort?: string;
    };

    const page = Number(req.query.page) || 1;
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = (page - 1) * limit;

    // Define the base query object
    const baseQuery: BaseQuery = {};

    // Check if search is being passed correctly
    console.log("Search Term:", search);
    console.log("Category:", category);
    console.log("Price:", price);

    // Build the query based on typecasted string values
    if (search) {
      baseQuery.name = {
        $regex: search,
        $options: "i", // Case insensitive matching
      };
    }

    if (price) {
      baseQuery.price = {
        $lte: Number(price),
      };
    }

    if (category) {
      baseQuery.category = category;
    }

    // Print the base query to see the conditions
    console.log("Base Query:", baseQuery);

    // Fetch products based on the query
    const productsPromise = Product.find(baseQuery)
      .sort(sort ? { price: sort === "asc" ? 1 : -1 } : {})
      .limit(limit)
      .skip(skip);

    const [products, filterProducts] = await Promise.all([
      productsPromise,
      Product.find(baseQuery),
    ]);

    const totalPages = Math.ceil(filterProducts.length / limit);

    res.status(200).json({
      success: true,
      data: products,
      total_pages: totalPages,
      message: "Products found successfully!",
    });
  }
);
export const searchFilterProducts = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { search, category, price, sort } = req.query as {
      search?: string;
      category?: string;
      price?: string;
      sort?: string;
    };

    const page = Number(req.query.page) || 1;
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = (page - 1) * limit;

    // Define the base query object
    const baseQuery: BaseQuery = {};

    // Check if search is being passed correctly
    console.log("Search Term:", search);
    console.log("Category:", category);
    console.log("Price:", price);

    // Build the query based on typecasted string values
    if (search) {
      baseQuery.name = {
        $regex: search,
        $options: "i", // Case insensitive matching
      };
    }

    if (price) {
      baseQuery.price = {
        $lte: Number(price),
      };
    }

    if (category) {
      baseQuery.category = category;
    }

    // Print the base query to see the conditions
    console.log("Base Query:", baseQuery);

    // Fetch products based on the query
    const productsPromise = Product.find(baseQuery)
      .sort(sort ? { price: sort === "asc" ? 1 : -1 } : {})
      .limit(limit)
      .skip(skip);

    const [products, filterProducts] = await Promise.all([
      productsPromise,
      Product.find(baseQuery),
    ]);

    const totalPages = Math.ceil(filterProducts.length / limit);

    res.status(200).json({
      success: true,
      data: products,
      total_pages: totalPages,
      message: "Products found successfully!",
    });
  }
);


export const searchFilterProducts = TryCatch(
  async (
    req: Request<{}, {}, SearchRequestQuery>,
    res: Response,
    next: NextFunction
  ) => {
    const { search, category, price, sort } = req.query as SearchRequestQuery;
    
    const page = Number(req.query.page) || 1;
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = (page - 1) * limit;

    const baseQuery: BaseQuery = {};

    if (search)
      baseQuery.name = {
        $regex: search,
        $options: "i",
      };

    if (price)
      baseQuery.price = {
        $lte: Number(price),
      };

    if (category) baseQuery.category = category;

    const productsPromise = Product.find(baseQuery)
      .sort(sort && { price: sort === "asc" ? 1 : -1 })
      .limit(limit)
      .skip(skip);

    const [products, filterProducts] = await Promise.all([
      productsPromise,
      Product.find(baseQuery),
    ]);

    const totalPages = Math.ceil(filterProducts.length / limit);

    res.status(200).json({
      success: true,
      data: products,
      total_pages: totalPages,
      message: "Product found successfully!",
    });
  }
);
