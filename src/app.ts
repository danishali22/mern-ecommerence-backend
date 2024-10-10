import express from 'express';
import { connectDB } from './utils/features.js';
import { errorMiddleware } from './middlewares/error.js';
import NodeCache from 'node-cache';
import morgan from 'morgan';
import { config } from 'dotenv';

// Importing user routes
import userRoutes from './routes/user.js';
import productRoutes from './routes/product.js';
import orderRoutes from './routes/order.js';
import paymentRoutes from './routes/payment.js';
import dashboardRoutes from './routes/dashboard.js';

config({
  path: "./.env",
})
const port = process.env.PORT || 4000;
const mongoURI = process.env.MONGO_URI || "";

// Connect DB
connectDB(mongoURI);

export const myCache = new NodeCache();

const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.get('/', (req, res) => {
  console.log("Root route accessed");
  res.send("API working with /api/v1");
});

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/product', productRoutes);
app.use('/api/v1/order', orderRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// to access images via upload folder
app.use("/uploads", express.static("uploads"));

app.use(errorMiddleware);



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
