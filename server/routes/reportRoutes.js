const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const Employee = require('../models/Employee');

router.use(protect);
router.use(authorize('Admin', 'HR', 'Leadership', 'Manager'));

// Attendance summary report
router.get('/attendance', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { tenant: req.tenant };
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }
    const records = await Attendance.find(query)
      .populate('employee', 'firstName lastName employeeId department designation')
      .sort({ date: -1 });

    // Summary stats
    const totalPresent = records.filter(r => r.status === 'Present').length;
    const totalAbsent = records.filter(r => r.status === 'Absent').length;
    const totalLate = records.filter(r => r.status === 'Late').length;
    const totalHalfDay = records.filter(r => r.status === 'Half-Day').length;

    res.json({
      success: true,
      summary: { totalPresent, totalAbsent, totalLate, totalHalfDay, total: records.length },
      data: records
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Leave report
router.get('/leave', async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    const query = { tenant: req.tenant };
    if (status) query.status = status;
    if (startDate && endDate) {
      query.startDate = { $gte: new Date(startDate) };
      query.endDate = { $lte: new Date(endDate) };
    }

    const records = await LeaveRequest.find(query)
      .populate('employee', 'firstName lastName employeeId department')
      .sort({ createdAt: -1 });

    const totalApproved = records.filter(r => r.status === 'Approved').length;
    const totalPending = records.filter(r => r.status === 'Pending').length;
    const totalRejected = records.filter(r => r.status === 'Rejected').length;

    res.json({
      success: true,
      summary: { totalApproved, totalPending, totalRejected, total: records.length },
      data: records
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Headcount report
router.get('/headcount', async (req, res) => {
  try {
    const total = await Employee.countDocuments({ tenant: req.tenant });
    const active = await Employee.countDocuments({ tenant: req.tenant, status: 'Active' });
    const suspended = await Employee.countDocuments({ tenant: req.tenant, status: 'Suspended' });
    const terminated = await Employee.countDocuments({ tenant: req.tenant, status: 'Terminated' });

    // By department
    const byDept = await Employee.aggregate([
      { $match: { tenant: req.tenant } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
      { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
      { $project: { deptName: { $ifNull: ['$dept.name', 'Unassigned'] }, count: 1 } }
    ]);

    res.json({
      success: true,
      data: { total, active, suspended, terminated, byDepartment: byDept }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
