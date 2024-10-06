import express from "express";
import { getAllCategories, latestProducts, newProduct } from "../controllers/product.js";
import { singleUpload } from "../middlewares/multer.js";
import { adminOnly } from "../middlewares/auth.js";
const app = express.Router();
app.post("/new", adminOnly, singleUpload, newProduct);
app.get("/latest", adminOnly, singleUpload, latestProducts);
app.get("/categories", singleUpload, getAllCategories);
export default app;
