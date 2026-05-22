// src/app.ts
import express from 'express';
import rootRouter from './routes/index.js';
import { applyMiddleware } from './middleware/index.js';
const app = express();
applyMiddleware(app);
app.use('/', rootRouter);
export default app;
