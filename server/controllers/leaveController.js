const LeaveRequest = require('../models/LeaveRequest');
const LeaveBalance = require('../models/LeaveBalance');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');

exports.getLeaveBalance = async (req, res) => {
  try {
    const employee = req.user.employeeProfile;
    if (!employee) {
      return res.status(400).json({ success: false, message: 'Employee profile not associated' });
    }

    let balance = await LeaveBalance.findOne({ employee: employee._id, tenant: req.tenant });
    if (!balance) {
      balance = await LeaveBalance.create({ employee: employee._id, tenant: req.tenant });
    }

    res.status(200).json({ success: true, data: balance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLeaveHistory = async (req, res) => {
  try {
    const employee = req.user.employeeProfile;
    if (!employee) {
      return res.status(200).json({ success: true, data: [] });
    }

    const history = await LeaveRequest.find({ employee: employee._id, tenant: req.tenant })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createLeaveRequest = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    const employee = req.user.employeeProfile;

    if (!employee) {
      return res.status(400).json({ success: false, message: 'Employee profile not associated' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    if (timeDiff < 0) {
      return res.status(400).json({ success: false, message: 'End date cannot be before start date' });
    }

    const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    // Check Balance
    const balanceField = leaveType.toLowerCase();
    const balance = await LeaveBalance.findOne({ employee: employee._id, tenant: req.tenant });

    if (!balance) {
      return res.status(400).json({ success: false, message: 'Leave balances not initialized' });
    }

    if (balanceField !== 'unpaid' && balance[balanceField] < totalDays) {
      return res.status(400).json({
        success: false,
        message: `Insufficient leave balance. Requested: ${totalDays}, Available: ${balance[balanceField]}`
      });
    }

    const request = await LeaveRequest.create({
      employee: employee._id,
      leaveType,
      startDate: start,
      endDate: end,
      totalDays,
      reason,
      tenant: req.tenant
    });

    // Notify Admin and HR users
    try {
      const adminsAndHrs = await User.find({ role: { $in: ['Admin', 'HR'] }, tenant: req.tenant });
      for (const adminOrHr of adminsAndHrs) {
        await createNotification({
          recipient: adminOrHr._id,
          title: 'New Leave Request',
          message: `${req.user.employeeProfile.firstName || 'An employee'} has requested a ${leaveType} leave for ${totalDays} days.`,
          type: 'Leave',
          tenant: req.tenant
        });
      }
    } catch (notifErr) {
      console.error('Failed to notify leave request:', notifErr.message);
    }

    res.status(201).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLeaveApprovals = async (req, res) => {
  try {
    const approvals = await LeaveRequest.find({ tenant: req.tenant, status: 'Pending' })
      .populate('employee', 'firstName lastName employeeId department designation')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: approvals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveLeave = async (req, res) => {
  try {
    const request = await LeaveRequest.findOne({ _id: req.params.id, tenant: req.tenant });
    if (!request) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Request is already processed' });
    }

    // Deduct leave balance
    const balanceField = request.leaveType.toLowerCase();
    if (balanceField !== 'unpaid') {
      const balance = await LeaveBalance.findOne({ employee: request.employee, tenant: req.tenant });
      if (balance) {
        balance[balanceField] = Math.max(0, balance[balanceField] - request.totalDays);
        await balance.save();
      }
    }

    request.status = 'Approved';
    request.approvedBy = req.user.employeeProfile ? req.user.employeeProfile._id : undefined;
    await request.save();

    // Notify the employee
    try {
      const employeeUser = await User.findOne({ employeeProfile: request.employee, tenant: req.tenant });
      if (employeeUser) {
        await createNotification({
          recipient: employeeUser._id,
          title: 'Leave Request Approved',
          message: `Your leave request for ${request.leaveType} (${request.totalDays} days) has been approved.`,
          type: 'Leave',
          tenant: req.tenant
        });
      }
    } catch (notifErr) {
      console.error('Failed to notify leave approval:', notifErr.message);
    }

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.rejectLeave = async (req, res) => {
  try {
    const request = await LeaveRequest.findOne({ _id: req.params.id, tenant: req.tenant });
    if (!request) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Request is already processed' });
    }

    request.status = 'Rejected';
    request.approvedBy = req.user.employeeProfile ? req.user.employeeProfile._id : undefined;
    await request.save();

    // Notify the employee
    try {
      const employeeUser = await User.findOne({ employeeProfile: request.employee, tenant: req.tenant });
      if (employeeUser) {
        await createNotification({
          recipient: employeeUser._id,
          title: 'Leave Request Rejected',
          message: `Your leave request for ${request.leaveType} (${request.totalDays} days) has been rejected.`,
          type: 'Leave',
          tenant: req.tenant
        });
      }
    } catch (notifErr) {
      console.error('Failed to notify leave rejection:', notifErr.message);
    }

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEmployeeLeaveHistory = async (req, res) => {
  try {
    const history = await LeaveRequest.find({ employee: req.params.employeeId, tenant: req.tenant })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEmployeeLeaveBalance = async (req, res) => {
  try {
    let balance = await LeaveBalance.findOne({ employee: req.params.employeeId, tenant: req.tenant });
    if (!balance) {
      balance = await LeaveBalance.create({ employee: req.params.employeeId, tenant: req.tenant });
    }
    res.status(200).json({ success: true, data: balance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
