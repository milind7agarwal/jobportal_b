import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './utils/db.js';
import userRoutes from './routes/user.route.js';
import companyRoutes from './routes/company.route.js';
import jobRoutes from './routes/job.route.js';
import applicationRoutes from './routes/application.route.js';
import aiRoutes from './routes/ai.route.js'

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

app.use('/api/users', userRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/job', jobRoutes);
app.use('/api/application', applicationRoutes);
app.use('/api/ai', aiRoutes)

const PORT =  3000;   //process.env.PORT ||

app.listen(PORT, () => {
    connectDB();
  console.log(`Server is running on port ${PORT}`);
});