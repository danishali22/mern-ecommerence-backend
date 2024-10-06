import express from "express";
import { getAllUsers, newUser } from "../controllers/user.js";
const app = express.Router();
app.post("/new", newUser);
app.get("/all", getAllUsers);
export default app;
