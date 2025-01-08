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
import { multiUpload } from "../middlewares/multer.js";
import { adminOnly } from "../middlewares/auth.js";

const app = express.Router();
app.post("/new", adminOnly, multiUpload, newProduct);
app.get("/latest", latestProducts);
app.get("/categories", getAllCategories);
app.get("/admin-products", adminOnly, getAdminProducts);
app.get("/search", searchFilterProducts);

app.get("/:id", getProduct);
app.put("/:id", adminOnly, multiUpload, updateProduct);
app.delete("/:id", adminOnly, deleteProduct);

export default app;
