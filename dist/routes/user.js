import express from 'express';
import { newUser } from '../controllers/user.js';
const app = express.Router();
console.log("Setting up user routes");
app.post('/new', newUser);
export default app;
