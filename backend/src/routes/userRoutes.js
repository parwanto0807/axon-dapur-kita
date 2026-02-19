import express from 'express';
import multer from 'multer';
import path from 'path';
import { getUsers, getProfile, updateProfile } from '../controllers/userController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

// Multer config for avatar upload
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/avatars/');
  },
  filename(req, file, cb) {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

const router = express.Router();

// Profile routes
router.get('/me', protect, getProfile);
router.put('/me', protect, upload.single('image'), updateProfile);

// Example: Only ADMIN can get all users
router.get('/', protect, authorize('ADMIN'), getUsers);

export default router;
