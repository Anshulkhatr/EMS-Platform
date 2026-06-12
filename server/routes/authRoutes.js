const express = require('express');
const router = express.Router();
const { registerTenantAndAdmin, login, getMe, forgotPassword, resetPassword, setupMFA } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register-tenant', registerTenantAndAdmin);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);
router.post('/mfa-setup', protect, setupMFA);

module.exports = router;
