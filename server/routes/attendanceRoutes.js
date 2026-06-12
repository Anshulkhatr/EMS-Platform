const express = require('express');
const router = express.Router();
const { 
  punchIn, 
  punchOut, 
  getAttendanceStatus, 
  getAttendanceHistory, 
  requestRegularization, 
  getRegularizationRequests, 
  approveRegularization,
  getEmployeeAttendanceHistory
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize, authorizeSelfOrRoles } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/punch-in', punchIn);
router.post('/punch-out', punchOut);
router.get('/status', getAttendanceStatus);
router.get('/history', getAttendanceHistory);
router.post('/regularization', requestRegularization);
router.get('/regularization-requests', authorize('Admin', 'HR', 'Manager'), getRegularizationRequests);
router.post('/regularization/:id/approve', authorize('Admin', 'HR', 'Manager'), approveRegularization);
router.get('/employee/:employeeId', authorizeSelfOrRoles('employeeId', 'Admin', 'HR', 'Manager', 'Leadership'), getEmployeeAttendanceHistory);

module.exports = router;

