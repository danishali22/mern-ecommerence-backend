import express from "express";
import { allOrders, deleteOrder, getOrder, myOrders, newOrder, processOrder } from "../controllers/order.js";
import { adminOnly } from "../middlewares/auth.js";

const app = express.Router();

app.post("/new", newOrder);
app.get("/my", myOrders);
app.get("/all", adminOnly, allOrders);
app.get("/:id", getOrder);
app.put("/:id", processOrder);
app.delete("/:id", deleteOrder);

export default app;