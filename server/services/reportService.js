const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const Employee = require('../models/Employee');

const generateAttendanceReport = async (tenantId, { startDate, endDate }) => {
  const query = { tenant: tenantId };
  if (startDate && endDate) query.date = { $gte: startDate, $lte: endDate };

  const records = await Attendance.find(query).populate('employee', 'firstName lastName employeeId department');
  return records;
};

const generateLeaveReport = async (tenantId, { startDate, endDate, status }) => {
  const query = { tenant: tenantId };
  if (status) query.status = status;
  if (startDate && endDate) {
    query.startDate = { $gte: new Date(startDate) };
    query.endDate = { $lte: new Date(endDate) };
  }
  return await LeaveRequest.find(query).populate('employee', 'firstName lastName employeeId department');
};

const generateHeadcountReport = async (tenantId) => {
  const total = await Employee.countDocuments({ tenant: tenantId });
  const active = await Employee.countDocuments({ tenant: tenantId, status: 'Active' });
  const terminated = await Employee.countDocuments({ tenant: tenantId, status: 'Terminated' });
  return { total, active, terminated };
};

module.exports = { generateAttendanceReport, generateLeaveReport, generateHeadcountReport };
