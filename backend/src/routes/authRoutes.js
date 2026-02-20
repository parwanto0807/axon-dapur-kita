import express from 'express';
import passport from 'passport';

const router = express.Router();

const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';

// @desc    Auth with Google
// @route   GET /api/auth/google
router.get('/google', (req, res, next) => {
    // Use 'state' to pass the returnTo URL securely and statelessly
    const state = req.query.redirect ? Buffer.from(req.query.redirect).toString('base64') : undefined;
    passport.authenticate('google', { scope: ['profile', 'email'], state })(req, res, next);
});

// @desc    Google auth callback
// @route   GET /api/auth/google/callback
router.get(
    '/google/callback',
    passport.authenticate('google', {
        failureRedirect: `${frontendUrl}/login?error=auth_failed`
    }),
    (req, res) => {
        // Successful authentication
        // Retrieve redirect URL from state if available
        let returnTo = `${frontendUrl}/dashboard`;
        if (req.query.state) {
            try {
                const decodedState = Buffer.from(req.query.state, 'base64').toString('utf-8');
                if (decodedState.startsWith('/') || decodedState.startsWith('http')) {
                    returnTo = decodedState;
                }
            } catch (e) {
                console.error('Failed to decode state:', e);
            }
        }
        
        // Ensure returning to frontend URL if it's a relative path
        const redirectUrl = returnTo.startsWith('http') ? returnTo : `${frontendUrl}${returnTo.startsWith('/') ? '' : '/'}${returnTo}`;
        
        res.redirect(redirectUrl);
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
