import express from 'express'

// importing user routes 
import userRoutes from './routes/user.js';

const app  = express();

const port = 4000;

app.get('/api/v1/user', userRoutes);

app.listen(port, ()=>{
    console.log(`Server is running on http://localhost:${port}`);
    
});