import express from 'express';
import { newUser } from '../controllers/user.js';

const app = express.Router();

app.get('/new', newUser);

export default app;