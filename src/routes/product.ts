import express from "express";
import {
  deleteProduct,
  getAdminProducts,
  getAllCategories,
  getProduct,
  latestProducts,
  newProduct,
  searchFilterProducts,
  updateProduct,
} from "../controllers/product.js";
import { singleUpload } from "../middlewares/multer.js";
import { adminOnly } from "../middlewares/auth.js";

const app = express.Router();
app.post("/new", adminOnly, singleUpload, newProduct);
app.get("/latest", singleUpload, latestProducts);
app.get("/categories", singleUpload, getAllCategories);
app.get("/admin-products", adminOnly, singleUpload, getAdminProducts);
app.get("/search", singleUpload, searchFilterProducts);

app.get("/:id", getProduct);
app.put("/:id", adminOnly, updateProduct);
app.delete("/:id", adminOnly, deleteProduct);

export default app;
