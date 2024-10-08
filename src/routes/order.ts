import express from "express";
import { newOrder } from "../controllers/order.js";

const app = express.Router();

app.get("/newOrder", newOrder);

export default app;