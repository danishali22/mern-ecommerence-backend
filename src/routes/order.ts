import express from "express";
import { allOrders, getOrder, myOrders, newOrder } from "../controllers/order.js";
import { adminOnly } from "../middlewares/auth.js";

const app = express.Router();

app.post("/new", newOrder);
app.get("/my", myOrders);
app.get("/all", adminOnly, allOrders);
app.get("/:id", getOrder);

export default app;