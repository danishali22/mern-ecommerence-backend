import mongoose from "mongoose";
import { InvalidateCacheProps, OrderItemsType } from "../types/types.js";
import { Product } from "../models/product.js";
import { myCache } from "../app.js";

export const connectDB = (mongoURI: string) => {
    mongoose.connect(mongoURI, {  // Corrected connection string 127.0.0.1:27017
        dbName: "ecommerence",
    })
    .then(() => console.log("DB connected successfully"))  // Log success
    .catch((error) => console.log(`DB connection error: ${error.message}`));  // Log error
};

type FetchFunction<T> = () => Promise<T>;
export const cacheData = async <T>(cacheKey: string, fetchFunction: FetchFunction<T>): Promise<T> => {
    if (myCache.has(cacheKey)) {
        return JSON.parse(myCache.get(cacheKey)!);
    } else {
        const data = await fetchFunction();
        myCache.set(cacheKey, JSON.stringify(data));
        return data;
    }
};


export const invalidateCache = async ({product, order, admin}: InvalidateCacheProps) => {
    if(product){
        const productKeys: string[] = [
            "latest-products",
            "admin-products",
            "categories",
        ]

        let products = await Product.find({}).select("_id");
        products.forEach((i) => {
            productKeys.push(`product-${i._id}`);
        });

        myCache.del(productKeys);
    }
    if(order){

    }
    if(admin){

    }
}

export const reduceStock = async(orderItems: OrderItemsType[]) => {
    // console.log("Order Items:", JSON.stringify(orderItems, null, 2)); 
    for (let i = 0; i < orderItems.length; i++) {
        const order = orderItems[i];
        const product = await Product.findById(order.productId);
        if(!product) throw new Error("Product not found");
        product.stock -=order.quantity;
        await product.save();
    }
}


/*
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo chown mongodb:mongodb /tmp/mongodb-27017.sock    
sudo service mongod restart
*/
