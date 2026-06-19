import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './utils/db.js';
import userRoutes from './routes/user.route.js';
import companyRoutes from './routes/company.route.js';
import jobRoutes from './routes/job.route.js';
import applicationRoutes from './routes/application.route.js';
import aiRoutes from './routes/ai.route.js';
import { apiLimiter, authLimiter } from './middleware/rateLimit.js';
import path from "path"

const app = express();

//middleware
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// basic abuse protection
app.use(apiLimiter);

// apply auth rate limiting to cookie protected routes
app.use('/api/users', authLimiter);
app.use('/api/company', authLimiter);
app.use('/api/job', authLimiter);
app.use('/api/application', authLimiter);


const corsOptions = {
  // allow your deployed frontend + local dev.
  // set FRONTEND_ORIGINS as a comma-separated list, e.g.
  // FRONTEND_ORIGINS=https://yourdomain.com,http://localhost:5173
  origin: (origin, callback) => {
    const allowed = (process.env.FRONTEND_ORIGINS)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // allow non-browser requests (no origin)
    if (!origin) return callback(null, true);
    if (allowed.includes(origin)) return callback(null, true);

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use('/api/users', userRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/job', jobRoutes);
app.use('/api/application', applicationRoutes);
app.use('/api/ai', aiRoutes);

const PORT = process.env.PORT;   

app.listen(PORT, () => {
    connectDB();
  console.log(`Server is running on port ${PORT}`);
});