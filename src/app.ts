import express from 'express';
import { connectDB, connectRedis } from './utils/features.js';
import { errorMiddleware } from './middlewares/error.js';
import NodeCache from 'node-cache';
import morgan from 'morgan';
import { config } from 'dotenv';
import {v2 as cloudinary} from 'cloudinary';

// Importing user routes
import userRoutes from './routes/user.js';
import productRoutes from './routes/product.js';
import orderRoutes from './routes/order.js';
import couponRoutes from './routes/coupon.js';
import paymentRoutes from './routes/payment.js';
import dashboardRoutes from './routes/dashboard.js';
import Stripe from 'stripe';
import cors from 'cors';

config({
  path: "./.env",
})
const port = process.env.PORT || 4000;
const mongoURI = process.env.MONGO_URI || "";
const redisURI = process.env.REDIS_URI || "";
const stripeKey = process.env.STRIPE_KEY || "";
const clientURL = process.env.CLIENT_URL || "";
export const redisTTL = Number(process.env.REDIS_TTL) || 60 * 60 * 4;

// Connect DB
connectDB(mongoURI);
export const redis = connectRedis(redisURI);


cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

export const stripe = new Stripe(stripeKey);

export const myCache = new NodeCache();

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(
  cors({
    origin: [clientURL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.get('/', (req, res) => {
  console.log("Root route accessed");
  res.send("API working with /api/v1");
});

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/product', productRoutes);
app.use('/api/v1/order', orderRoutes);
app.use('/api/v1/coupon', couponRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// to access images via upload folder
app.use("/uploads", express.static("uploads"));

app.use(errorMiddleware);



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
