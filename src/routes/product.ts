import express from "express";
import {
  deleteProduct,
  deleteReview,
  getAdminProducts,
  getAllCategories,
  getProduct,
  latestProducts,
  newProduct,
  newReview,
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

// review
app.post("/:id/review/new", newReview);
app.delete("/review/:id", deleteReview);


app.get("/:id", getProduct);
app.put("/:id", adminOnly, multiUpload, updateProduct);
app.delete("/:id", adminOnly, deleteProduct);

export default app;
