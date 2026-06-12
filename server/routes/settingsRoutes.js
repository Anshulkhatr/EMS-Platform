const express = require('express');
const router = express.Router();
const { getDepartments, createDepartment, getShifts, createShift } = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/departments', getDepartments);
router.post('/departments', authorize('Admin', 'HR'), createDepartment);
router.get('/shifts', getShifts);
router.post('/shifts', authorize('Admin', 'HR'), createShift);

module.exports = router;
