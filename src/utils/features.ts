import mongoose from "mongoose";
import { InvalidateCacheProps, OrderItemsType } from "../types/types.js";
import { Product } from "../models/product.js";
import { myCache, redis } from "../app.js";
import { UploadApiResponse } from "cloudinary";
import {v2 as cloudinary} from "cloudinary";
import { Review } from "../models/review.js";
import { Redis } from "ioredis";

export const findAverageRatings = async (productId: mongoose.Types.ObjectId) => {
  let totalRating = 0;
  const reviews = await Review.find({ product: productId });
  reviews.forEach((review) => {
    totalRating += review.rating;
  });

  const averageRating = Math.floor(totalRating / reviews.length) || 0;

  return {
    numOfReviews: reviews.length,
    ratings: averageRating,
  };
}

const getBase64 = (file: Express.Multer.File) =>
  `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

export const uploadToCloudinary = async (files: Express.Multer.File[]) => {
  try {
    const promises = files.map(async (file) => {
      return new Promise<UploadApiResponse>((resolve, reject) => {
        cloudinary.uploader.upload(getBase64(file), (error, result) => {
          if (error) return reject(error);
          resolve(result!);
        });
      });
    });

    const result = await Promise.all(promises);

    return result.map((i) => ({
      public_id: i.public_id,
      url: i.secure_url,
    }));
  } catch (err) {
    console.error("Error during Cloudinary upload:", err); 
    throw new Error("Error uploading files to cloudinary");
  }
};

export const deleteFromCloudinary = async (publicIds: string[]) => {
  try {
    const promises = publicIds.map((id) => {
      return new Promise<void>((resolve, reject) => {
        cloudinary.uploader.destroy(id, (error, result) => {
          if (error) return reject(error);
          resolve();
        });
      });
    });

    await Promise.all(promises);
  } catch (err) {
    console.error("Error during Cloudinary delete:", err); 
    throw new Error("Error deleting files to cloudinary");
  }
};

export const connectDB = (mongoURI: string) => {
  mongoose
    .connect(mongoURI, {
      // Corrected connection string 127.0.0.1:27017
      dbName: "ecommerence",
    })
    .then(() => console.log("DB connected successfully")) // Log success
    .catch((error) => console.log(`DB connection error: ${error.message}`)); // Log error
};

type FetchFunction<T> = () => Promise<T>;
export const cacheData = async <T>(
  cacheKey: string,
  fetchFunction: FetchFunction<T>
): Promise<T> => {
  if (myCache.has(cacheKey)) {
    return JSON.parse(myCache.get(cacheKey)!);
  } else {
    const data = await fetchFunction();
    myCache.set(cacheKey, JSON.stringify(data));
    return data;
  }
};

export const connectRedis = (redisURI: string) => {
  const redis = new Redis(redisURI);
  // redis.set("foo", "bar")
  redis.on("connect", ()=>console.log("Redis Connected"));
  redis.on("error", (e)=> console.log(e));

  return redis
}

export const invalidateCache = async ({
  product,
  order,
  admin,
  userId,
  orderId,
  productId,
  review,
}: InvalidateCacheProps) => {
  if(review){
    await redis.del([`reviews-${productId}`]);
  }
  if (product) {
    const productKeys: string[] = [
      "latest-products",
      "admin-products",
      "categories",
    ];
    if (typeof productId === "string") productKeys.push(`product-${productId}`);

    if (typeof productId === "object")
      productId.forEach((i) => {
        productKeys.push(`product-${i}`);
      });

    await redis.del(productKeys);
  }
  if (order) {
    const orderKeys: string[] = [
      "all-orders",
      `my-orders-${userId}`,
      `order-${orderId}`,
    ];
    await redis.del(orderKeys);
  }
  if (admin) {
    const adminKeys: string[] = [
        "admin-stats",
        "admin-pie-chart",
        "admin-bar-chart",
        "admin-line-chart",
    ];
    await redis.del(adminKeys);
  }
};

export const reduceStock = async (orderItems: OrderItemsType[]) => {
  // console.log("Order Items:", JSON.stringify(orderItems, null, 2));
  for (let i = 0; i < orderItems.length; i++) {
    const order = orderItems[i];
    const product = await Product.findById(order.productId);
    if (!product) throw new Error("Product not found");
    product.stock -= order.quantity;
    await product.save();
  }
};

export const calculatePercentage = (thisMonth: number, lastMonth: number) => {
  if (lastMonth === 0) return thisMonth * 100;
  const percent = (thisMonth / lastMonth) * 100;
  return Number(percent.toFixed(0));
};

export const getInventories = async ({
  categories,
  productsCount,
}: {
  categories: string[];
  productsCount: number;
}) => {
  const categoriesCountPromise = categories.map((category) =>
    Product.countDocuments({ category })
  );

  const categoriesCount = await Promise.all(categoriesCountPromise);

  const categoryCount: Record<string, number>[] = [];

  categories.forEach((category, i) => {
    categoryCount.push({
      [category]: Math.round((categoriesCount[i] / productsCount) * 100),
    });
  });

  return categoryCount;
};

interface MyDocument {
  createdAt: Date;
  discount?: number;
  total?: number;
}

type ChartDataProps = {
  length: number;
  today: Date;
  docArr: MyDocument[];
  property?: "discount" | "total";
};

export const getChartData = ({
  length,
  today,
  docArr,
  property,
}: ChartDataProps) => {
  const data: number[] = new Array(length).fill(0);

  docArr.forEach((i) => {
    const orderCreation = i.createdAt;
    const monthDiff = (today.getMonth() - orderCreation.getMonth() + 12) % 12;

    if (monthDiff < length) {
      if (property) {
        data[length - monthDiff - 1] += i[property]!;
      } else {
        data[length - monthDiff - 1] += 1;
      }
    }
  });
  return data;
};

/*
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo chown mongodb:mongodb /tmp/mongodb-27017.sock    
sudo service mongod restart
*/
