import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import configurePassport from './config/passport.js';
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

// Session Configuration
export const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: process.env.NODE_ENV === 'production',
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

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/carousel', carouselRoutes);

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
