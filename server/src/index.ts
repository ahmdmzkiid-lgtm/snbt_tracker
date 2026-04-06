import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import "dotenv/config";

import userPageRouter from './routes/user.route.js';
import syllabusRouter from './routes/syllabus.route.js';
import tryoutRouter from './routes/tryout.route.js';
import sessionRouter from './routes/session.route.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: true,
}));

// Better Auth handler - IMPORTANT: Better Auth handles its own body parsing.
// It should come BEFORE express.json() to avoid stream consumption issues.
app.use("/api/auth", toNodeHandler(auth));

app.use(express.json());

// Logging middleware - Now after express.json() so req.body is available.
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.url.startsWith('/api/auth') && req.method === 'POST') {
    console.log('Auth request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});



// App routes
app.use('/api/user', userPageRouter);
app.use('/api/syllabus', syllabusRouter);
app.use('/api/tryout', tryoutRouter);
app.use('/api/session', sessionRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('SNBT Tracker API is running!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
