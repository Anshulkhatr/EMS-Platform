const express = require('express');
const router = express.Router();
const {
  sendEmail,
  getEmailHistory,
  getRecipients,
  getSmtpStatus,
} = require('../controllers/emailController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('Admin', 'HR'));

router.get('/status', getSmtpStatus);
router.get('/recipients', getRecipients);
router.get('/history', getEmailHistory);
router.post('/send', sendEmail);

module.exports = router;
