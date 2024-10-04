import mongoose from "mongoose";

export const connectDB = () => {
    mongoose.connect("mongodb://localhost:27017", {  // Corrected connection string
        dbName: "ecommerence",
    })
    .then(() => console.log("DB connected successfully"))  // Log success
    .catch((error) => console.log(`DB connection error: ${error.message}`));  // Log error
};
