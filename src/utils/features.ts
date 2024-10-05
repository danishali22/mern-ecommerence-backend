import mongoose from "mongoose";

export const connectDB = () => {
    mongoose.connect("mongodb://localhost:27017", {  // Corrected connection string 127.0.0.1:27017
        dbName: "ecommerence",
    })
    .then(() => console.log("DB connected successfully"))  // Log success
    .catch((error) => console.log(`DB connection error: ${error.message}`));  // Log error
};


/*
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo chown mongodb:mongodb /tmp/mongodb-27017.sock    
sudo service mongod restart
*/
