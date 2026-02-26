import express from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.API_PUBLIC_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean) as string[];

app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(null, false);
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    })
);

app.use(express.json());
app.use('/api/v1', routes);
export default app;