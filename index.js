import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';    
import dotenv from 'dotenv';
import connectDB from './utils/db.js';
import userRoutes from './routes/user.route.js';
import companyRoutes from './routes/company.route.js';

dotenv.config();

const app = express();

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};  

app.use(cors(corsOptions));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/users', userRoutes);
app.use('/api/company', companyRoutes);

const PORT =  3000;   //process.env.PORT ||

app.listen(PORT, () => {
    connectDB();
  console.log(`Server is running on port ${PORT}`);
});