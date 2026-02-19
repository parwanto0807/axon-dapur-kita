import express from 'express';
import passport from 'passport';

const router = express.Router();

const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';

// @desc    Auth with Google
// @route   GET /api/auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @desc    Google auth callback
// @route   GET /api/auth/google/callback
router.get(
    '/google/callback',
    passport.authenticate('google', { 
        failureRedirect: `${frontendUrl}/login?error=auth_failed` 
    }),
    (req, res) => {
        // Successful authentication, redirect to frontend dashboard.
        res.redirect(`${frontendUrl}/dashboard`);
    }
);

// @desc    Logout user
// @route   GET /api/auth/logout
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect(`${frontendUrl}/login?status=logged_out`);
    });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
router.get('/me', (req, res) => {
    if (req.isAuthenticated()) {
        res.json(req.user);
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
});

export default router;
