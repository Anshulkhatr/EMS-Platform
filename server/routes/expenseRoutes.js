const express = require('express');
const router = express.Router();
const { 
  createExpense, 
  getMyExpenses, 
  getAdminExpenses, 
  updateExpenseStatus 
} = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.post('/claim', upload.single('receipt'), createExpense);
router.get('/my-history', getMyExpenses);
router.get('/admin-list', authorize('Admin', 'HR', 'Manager', 'Leadership'), getAdminExpenses);
router.put('/:id/status', authorize('Admin', 'HR', 'Manager'), updateExpenseStatus);

module.exports = router;
