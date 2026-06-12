const express = require('express');
const router = express.Router();
const { 
  getLeaveBalance, 
  getLeaveHistory, 
  createLeaveRequest, 
  getLeaveApprovals, 
  approveLeave, 
  rejectLeave,
  getEmployeeLeaveHistory,
  getEmployeeLeaveBalance
} = require('../controllers/leaveController');
const { protect } = require('../middleware/authMiddleware');
const { authorize, authorizeSelfOrRoles } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/balance', getLeaveBalance);
router.get('/history', getLeaveHistory);
router.post('/request', createLeaveRequest);
router.get('/approvals', authorize('Admin', 'HR', 'Manager'), getLeaveApprovals);
router.post('/request/:id/approve', authorize('Admin', 'HR', 'Manager'), approveLeave);
router.post('/request/:id/reject', authorize('Admin', 'HR', 'Manager'), rejectLeave);
router.get('/employee/:employeeId/history', authorizeSelfOrRoles('employeeId', 'Admin', 'HR', 'Manager', 'Leadership'), getEmployeeLeaveHistory);
router.get('/employee/:employeeId/balance', authorizeSelfOrRoles('employeeId', 'Admin', 'HR', 'Manager', 'Leadership'), getEmployeeLeaveBalance);

module.exports = router;

