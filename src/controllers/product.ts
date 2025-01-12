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
import { redis, redisTTL } from "../app.js";
import { deleteFromCloudinary, findAverageRatings, invalidateCache, uploadToCloudinary } from "../utils/features.js";
import { User } from "../models/user.js";
import { Review } from "../models/review.js";

export const latestProducts = TryCatch(async (req, res, next) => {
  let products;
  const key = "latest-products";
  products = await redis.get(key);

  if (products) {
    products = JSON.parse(products);
  } else {
    products = await Product.find({}).sort({ created_at: -1 }).limit(5);
    await redis.setex(key, redisTTL, JSON.stringify(products));
  }

  return res.status(200).json({
    success: true,
    data: products,
  });
});

export const getAllCategories = TryCatch(async (req, res, next) => {
  let categories; 
  const key = "categories";
  categories = await redis.get(key);
  if(categories){
    categories = JSON.parse(categories);
  }
  else {
    categories = await Product.distinct("category");
    redis.setex(key, redisTTL, JSON.stringify(categories));
  }

  return res.status(200).json({
    success: true,
    data: categories,
  });
});

export const getAdminProducts = TryCatch(async (req, res, next) => {
  let admin_products;
  const key = "all-products";
  admin_products = await redis.get(key);
  if (admin_products){
    admin_products = JSON.parse(admin_products);
  }
  else {
    admin_products = await Product.find({});
    await redis.setex(key, redisTTL, JSON.stringify(admin_products));
  }

  return res.status(200).json({
    success: true,
    data: admin_products,
  });
});

export const getProduct = TryCatch(async (req, res, next) => {
  let product;
  const id = req.params.id;
  const key = `product-${id}`;
  product = await redis.get(key);
  if(product){
    product = JSON.parse(product);
  }
  else{
    product = await Product.findById(id);
    if (!product) return next(new ErrorHandler("Product Not Found", 400));
    await redis.setex(key, redisTTL, JSON.stringify(product));
  }

  res.status(200).json({
    success: true,
    product,
    message: "Product found successfully",
  });
});

export const newProduct = TryCatch(
  async (
    req: Request<{}, {}, NewProductRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { name, description, category, price, stock } = req.body;
    const photos = req.files as Express.Multer.File[] | undefined;

    if (!photos) return next(new ErrorHandler("Please add Product photo", 400));

    if (photos.length < 1) return next(new ErrorHandler("Please add atleast one photo", 400));

    if (photos.length > 5) return next(new ErrorHandler("You can only upload 5 photos", 400));

    if (!name || !description || !category || !price || !stock) {
      return next(new ErrorHandler("Please enter all fields", 400));
    }

    const photosUrl = await uploadToCloudinary(photos);

    await Product.create({
      name,
      description,
      price,
      stock,
      category: category.toLowerCase(),
      photos: photosUrl,
    });

    invalidateCache({ product: true, admin: true });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
    });
  }
);

export const updateProduct = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const { name, description, category, price, stock } = req.body;

  const photos = req.files as Express.Multer.File[] | undefined;
  const product = await Product.findById(id);
  if (!product) return next(new ErrorHandler("Product Not Found", 400));

  if (photos && photos.length > 0) {
    const photosUrl = await uploadToCloudinary(photos);
    const ids = product.photos.map((photo) => photo.public_id);
    await deleteFromCloudinary(ids);
    product.photos = photosUrl as any;
  }

  if (name) product.name = name;
  if (description) product.description = description;
  if (category) product.category = category;
  if (price) product.price = price;
  if (stock) product.stock = stock;

  const updatedProduct = await product.save();

  await invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });

  return res.status(200).json({
    success: true,
    data: updatedProduct,
    message: "Product updated successfully",
  });
});

export const deleteProduct = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  const product = await Product.findById(id);
  if (!product) return next(new ErrorHandler("Product Not Found", 400));

  const ids = product.photos.map((photo) => photo.public_id);

  await deleteFromCloudinary(ids);

  await product.deleteOne();
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

    const key = `products-${search}-${category}-${price}-${sort}-${page}`;

    let products;
    let totalPages;

    const cachedData = await redis.get(key);
    if(cachedData){
      const data = JSON.parse(cachedData);
      products = data.products;
      totalPages = data.totalPages;
    }
    else {
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

    const [productsFetched, filterProducts] = await Promise.all([
      productsPromise,
      Product.find(baseQuery),
    ]);

    products = productsFetched;
    totalPages = Math.ceil(filterProducts.length / limit);

    await redis.setex(key, redisTTL, JSON.stringify({products, totalPages}));
  }

    res.status(200).json({
      success: true,
      data: products,
      total_pages: totalPages,
      message: "Product found successfully!",
    });
  }
);

export const allRevewsOfProduct = TryCatch(async (req, res, next) => {
  let reviews;
  const key = `reviews-${req.params.id}`;

  reviews = await redis.get(key);
  if(reviews) reviews = JSON.parse(reviews);
  else{
    reviews = await Review.find({
      product: req.params.id
    })
    .populate("user", "name photo")
    .sort({ updatedAt: -1 });

    await redis.setex(key, redisTTL, JSON.stringify(reviews));
  }

  return res.status(200).json({
    success: true,
    reviews,
  });
});

export const newReview = TryCatch(async (req, res, next) => {
  const user = await User.findById(req.query.id);
  if (!user) return next(new ErrorHandler("User Not Found", 400));

  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler("Product Not Found", 400));

  const { rating, comment } = req.body;

  const alreadyReviewed = await Review.findOne({
    user: user._id,
    product: product._id,
  });

  if (alreadyReviewed) {
    alreadyReviewed.rating = rating;
    alreadyReviewed.comment = comment;
    await alreadyReviewed.save();
  }
  else {
    await Review.create({
      rating,
      comment,
      user: user._id,
      product: product._id
    });
  }

  const { ratings, numOfReviews } = await findAverageRatings(product._id);

  product.ratings = ratings;
  product.numOfReviews = numOfReviews;
  await product.save();

  await invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
    review: true,
  });

  return res.status(alreadyReviewed ? 200 : 201).json({
    success: true,
    message: alreadyReviewed ? "Review updated successfully" : "Review added successfully",
  });
});

export const deleteReview = TryCatch(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new ErrorHandler("Review Not Found", 400));

  const user = await User.findById(req.query.id);
  if (!user) return next(new ErrorHandler("User Not Found", 400));

  const isAuthenticated = review.user.toString() === user._id.toString();
  if (!isAuthenticated) return next(new ErrorHandler("Not Authorized", 401));

  await review.deleteOne();

  const product = await Product.findById(review.product);
  if (!product) return next(new ErrorHandler("Product Not Found", 400));

  const { ratings, numOfReviews } = await findAverageRatings(review.product);
  product.ratings = ratings;
  product.numOfReviews = numOfReviews;
  await product.save();

  await invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });

  return res.status(200).json({
    success: true,
    message: "Review deleted successfully",
  });
});

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
