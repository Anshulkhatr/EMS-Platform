const express = require('express');
const router = express.Router();
const { 
  generatePayroll, 
  getPayrollHistory, 
  getAdminPayroll, 
  updatePayrollStatus 
} = require('../controllers/payrollController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/my-history', getPayrollHistory);
router.get('/admin-list', authorize('Admin', 'HR', 'Leadership'), getAdminPayroll);
router.post('/generate', authorize('Admin', 'HR'), generatePayroll);
router.put('/:id/status', authorize('Admin', 'HR'), updatePayrollStatus);

module.exports = router;
