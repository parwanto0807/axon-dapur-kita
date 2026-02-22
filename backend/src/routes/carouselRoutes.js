import express from 'express';
import { 
    getCarousels, 
    getAdminCarousels, 
    createCarousel, 
    updateCarousel, 
    deleteCarousel 
} from '../controllers/carouselController.js';
import multer from 'multer';

const router = express.Router();

// Configure Multer
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Hanya file gambar yang diperbolehkan'), false);
        }
    }
});

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'ADMIN') {
        return next();
    }
    res.status(403).json({ message: 'Akses ditolak. Hanya Admin yang diizinkan.' });
};

// Public route
router.get('/', getCarousels);

// Admin routes
router.get('/admin', isAdmin, getAdminCarousels);
router.post('/', isAdmin, upload.single('image'), createCarousel);
router.put('/:id', isAdmin, upload.single('image'), updateCarousel);
router.delete('/:id', isAdmin, deleteCarousel);

export default router;
