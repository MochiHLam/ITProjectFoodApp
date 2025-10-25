const { Router } = require('express');
const { body } = require('express-validator');
const passport = require('passport');
const { authenticateJWT } = require('../middlewares/auth');
const Auth = require('../controllers/authController');

const router = Router();

router.post(
  '/register',
  [body('email').isEmail(), body('password').isLength({ min: 6 }), body('name').optional().isString()],
  Auth.register
);

router.post('/login', [body('email').isEmail(), body('password').isString()], Auth.login);

router.get('/me', authenticateJWT, Auth.me);

// Providers discovery endpoint for frontend
router.get('/providers', (req, res) => {
  const providers = {
    google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    github: Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
    facebook: Boolean(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET),
  };
  res.json(providers);
});

// Conditionally register OAuth routes
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get('/google', passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
  }));
  router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), Auth.oauthSuccess);
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
  router.get('/github/callback', passport.authenticate('github', { session: false, failureRedirect: '/login' }), Auth.oauthSuccess);
}

if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
  router.get('/facebook/callback', passport.authenticate('facebook', { session: false, failureRedirect: '/login' }), Auth.oauthSuccess);
}

module.exports = router;



