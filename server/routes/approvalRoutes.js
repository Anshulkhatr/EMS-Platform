const express = require('express');
const router = express.Router();
const Approval = require('../models/Approval');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

// Get all pending approvals (managers/HR/Admin)
router.get('/', authorize('Admin', 'HR', 'Manager'), async (req, res) => {
  try {
    const approvals = await Approval.find({ tenant: req.tenant, status: 'Pending' })
      .populate('requestedBy', 'firstName lastName employeeId')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: approvals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Approve
router.put('/:id/approve', authorize('Admin', 'HR', 'Manager'), async (req, res) => {
  try {
    const approval = await Approval.findOneAndUpdate(
      { _id: req.params.id, tenant: req.tenant },
      { status: 'Approved', approvedBy: req.user.employeeProfile?._id, remarks: req.body.remarks },
      { new: true }
    );
    res.json({ success: true, data: approval });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Reject
router.put('/:id/reject', authorize('Admin', 'HR', 'Manager'), async (req, res) => {
  try {
    const approval = await Approval.findOneAndUpdate(
      { _id: req.params.id, tenant: req.tenant },
      { status: 'Rejected', approvedBy: req.user.employeeProfile?._id, remarks: req.body.remarks },
      { new: true }
    );
    res.json({ success: true, data: approval });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get approval history
router.get('/history', async (req, res) => {
  try {
    const history = await Approval.find({ tenant: req.tenant, status: { $ne: 'Pending' } })
      .populate('requestedBy', 'firstName lastName employeeId')
      .populate('approvedBy', 'firstName lastName')
      .sort({ updatedAt: -1 });
    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
