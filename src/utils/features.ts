import mongoose from "mongoose";
import { InvalidateCacheProps } from "../types/types.js";
import { Product } from "../models/product.js";
import { myCache } from "../app.js";

export const connectDB = () => {
    mongoose.connect("mongodb://localhost:27017", {  // Corrected connection string 127.0.0.1:27017
        dbName: "ecommerence",
    })
    .then(() => console.log("DB connected successfully"))  // Log success
    .catch((error) => console.log(`DB connection error: ${error.message}`));  // Log error
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


/*
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo chown mongodb:mongodb /tmp/mongodb-27017.sock    
sudo service mongod restart
*/
