const LeaveRequest = require('../models/LeaveRequest');
const LeaveBalance = require('../models/LeaveBalance');

const deductBalance = async (employeeId, tenantId, leaveType, days) => {
  const field = leaveType.toLowerCase();
  if (field === 'unpaid') return;
  const balance = await LeaveBalance.findOne({ employee: employeeId, tenant: tenantId });
  if (balance && balance[field] !== undefined) {
    balance[field] = Math.max(0, balance[field] - days);
    await balance.save();
  }
};

const getPendingRequests = async (tenantId) => {
  return await LeaveRequest.find({ tenant: tenantId, status: 'Pending' })
    .populate('employee', 'firstName lastName employeeId')
    .sort({ createdAt: -1 });
};

module.exports = { deductBalance, getPendingRequests };
