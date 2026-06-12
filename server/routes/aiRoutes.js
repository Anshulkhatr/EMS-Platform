const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  searchEmployees,
  generateEmployeeSummary,
  getWorkforcePlanning,
  getBurnoutAttrition,
  getAttendanceAnomalies,
  screenResume
} = require('../controllers/aiController');

// All AI routes are protected
router.use(protect);

// Smart search (available to all roles)
router.post('/search', searchEmployees);

// Restricted to Admins, HR, Managers, and Leadership for sensitive HR advisories
router.use(authorize('Admin', 'HR', 'Manager', 'Leadership'));

router.get('/summary/:id', generateEmployeeSummary);
router.get('/workforce-planning', getWorkforcePlanning);
router.get('/burnout-attrition', getBurnoutAttrition);
router.get('/attendance-anomalies', getAttendanceAnomalies);
router.post('/resume-screening', screenResume);

module.exports = router;
