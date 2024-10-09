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
import { faker } from "@faker-js/faker";
import { myCache } from "../app.js";
import { cacheData, invalidateCache } from "../utils/features.js";

export const latestProducts = TryCatch(async (req, res, next) => {
  let products;

  if (myCache.has("latest-products")) {
    products = JSON.parse(myCache.get("latest-products")!);
  } else {
    products = await Product.find({}).sort({ created_at: -1 }).limit(5);
    myCache.set("latest-products", JSON.stringify(products));
  }

  return res.status(200).json({
    success: true,
    data: products,
  });
});

// export const getAllCategories = TryCatch(async (req, res, next) => {
//   let products;
//   if (myCache.has("categories")) {
//     products = JSON.parse(myCache.get("categories")!);
//   } else {
//     products = await Product.distinct("category");
//     myCache.set("categories", JSON.stringify(products));
//   }

//   return res.status(200).json({
//     success: true,
//     data: products,
//   });
// });

export const getAllCategories = TryCatch(async (req, res, next) => {
  const key = "categories";
  const categories = await cacheData(key, async () => {
    return await Product.distinct("category");
  });

  return res.status(200).json({
    success: true,
    data: categories,
  });
});

export const getAdminProducts = TryCatch(async (req, res, next) => {
  const key = "admin-products";
  const products = await cacheData(key, async () => {
    return await Product.find({});
  });

  return res.status(200).json({
    success: true,
    data: products,
  });
});

export const getProduct = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  const key = `product-${id}`;

  const product = await cacheData(key, async () => {
    const foundProduct = await Product.findById(id);
    if (!foundProduct) {
      return next(new ErrorHandler("Product Not Found", 400));
    }
    return foundProduct;
  });

  res.status(200).json({
    success: true,
    data: product,
    message: "Product found successfully",
  });
});

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

    await invalidateCache({ product: true, admin: true });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
    });
  }
);

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

  await invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });

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
  await invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });
  return res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});

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

// const generateRandomProducts = async (count: number = 10) => {
//   const products = [];

//   for (let i = 0; i < count; i++) {
//     const product = {
//       name: faker.commerce.productName(),
//       photo: "uploads\\5ba9bd91-b89c-40c2-bb8a-66703408f986.png",
//       price: faker.commerce.price({ min: 1500, max: 80000, dec: 0 }),
//       stock: faker.commerce.price({ min: 0, max: 100, dec: 0 }),
//       category: faker.commerce.department(),
//       createdAt: new Date(faker.date.past()),
//       updatedAt: new Date(faker.date.recent()),
//       __v: 0,
//     };

//     products.push(product);
//   }

//   await Product.create(products);

//   console.log({ succecss: true });
// };

// const deleteRandomsProducts = async (count: number = 10) => {
//   const products = await Product.find({}).skip(2);

//   for (let i = 0; i < products.length; i++) {
//     const product = products[i];
//     await product.deleteOne();
//   }

//   console.log({ succecss: true });
// };
