import express from 'express';

import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import rateLimit from 'express-rate-limit';
import connectPgSimple from 'connect-pg-simple';
import configurePassport from './config/passport.js';
import register, { metricsMiddleware } from './utils/metrics.js';

import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import shopRoutes from './routes/shopRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import unitRoutes from './routes/unitRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import tagRoutes from './routes/tagRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import carouselRoutes from './routes/carouselRoutes.js';

dotenv.config();

// Passport Configuration
configurePassport();

const app = express();
app.set('trust proxy', 1);

// Middlewares
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000', 
    'http://localhost:3003',
    'http://127.0.0.1:3003',
    'https://axon-ecosystem.id',
    'https://www.axon-ecosystem.id',
    process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));
app.use(metricsMiddleware); // Track metrics for all requests


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');

// Ensure required directories exist
const paymentsDir = path.join(publicDir, 'payments');
const heroDir = path.join(publicDir, 'hero');
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(paymentsDir)) fs.mkdirSync(paymentsDir, { recursive: true });
if (!fs.existsSync(heroDir)) fs.mkdirSync(heroDir, { recursive: true });
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use(express.static(publicDir)); // Serve static files with absolute path
app.use('/uploads', express.static('uploads')); // Serve uploads

// Fix for production proxy: also serve static files under /api
app.use('/api/products', express.static(path.join(publicDir, 'products')));
app.use('/api/hero', express.static(path.join(publicDir, 'hero')));
app.use('/api/merchant', express.static(path.join(publicDir, 'merchant')));
app.use('/api/payments', express.static(path.join(publicDir, 'payments'))); // ADDED: Payment proofs
app.use('/api/uploads', express.static('uploads'));
app.use('/payments', express.static(path.join(publicDir, 'payments'))); // ADDED: Direct access to payments

const PgSession = connectPgSimple(session);

// ─── Rate Limiters ───────────────────────────────────────────────────────────
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300,                  // Max 300 requests per 15 min per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Terlalu banyak permintaan dari IP ini. Coba lagi dalam beberapa menit.' }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,                   // Max 20 login attempts per 15 min
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Terlalu banyak percobaan login. Coba lagi dalam beberapa menit.' }
});

// Session Configuration (Persistent via PostgreSQL)
export const sessionMiddleware = session({
    store: new PgSession({
        conString: process.env.DATABASE_URL,
        tableName: 'Session',
        createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    },
});

app.use(sessionMiddleware);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend is running' });
});

// Prometheus Metrics Endpoint
app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (err) {
        res.status(500).end(err);
    }
});



// Routes (with general rate limiter applied)
app.use('/api/users', generalLimiter, userRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', generalLimiter, productRoutes);
app.use('/api/shops', generalLimiter, shopRoutes);
app.use('/api/reviews', generalLimiter, reviewRoutes);
app.use('/api/categories', generalLimiter, categoryRoutes);
app.use('/api/units', generalLimiter, unitRoutes);
app.use('/api/orders', generalLimiter, orderRoutes);
app.use('/api/addresses', generalLimiter, addressRoutes);
app.use('/api/notifications', generalLimiter, notificationRoutes);
app.use('/api/tags', generalLimiter, tagRoutes);
app.use('/api/admin', generalLimiter, adminRoutes);
app.use('/api/carousel', generalLimiter, carouselRoutes);


// Basic Error Handler

app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err);
  res.status(500).json({ 
    error: 'Something went wrong!',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

export default app;
