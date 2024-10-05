import express from 'express';
import { connectDB } from './utils/features.js';
import { errorMiddleware } from './middlewares/error.js';
// Importing user routes
import userRoutes from './routes/user.js';
const port = 4000;
// Connect DB
connectDB();
const app = express();
app.use(express.json());
app.get('/', (req, res) => {
    console.log("Root route accessed");
    res.send("API working with /api/v1");
});
app.use('/api/v1/user', userRoutes);
app.use(errorMiddleware);
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
