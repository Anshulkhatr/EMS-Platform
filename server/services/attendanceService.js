const Attendance = require('../models/Attendance');

const getTodayRecord = async (employeeId, tenantId) => {
  const today = new Date().toISOString().split('T')[0];
  return await Attendance.findOne({ employee: employeeId, date: today, tenant: tenantId });
};

const calculateWorkHours = (punchIn, punchOut) => {
  if (!punchIn || !punchOut) return 0;
  const ms = new Date(punchOut) - new Date(punchIn);
  return parseFloat((ms / (1000 * 60 * 60)).toFixed(2));
};

const getMonthlyStats = async (employeeId, tenantId, month, year) => {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
  const records = await Attendance.find({ employee: employeeId, tenant: tenantId, date: { $gte: startDate, $lte: endDate } });
  return {
    present: records.filter(r => r.status === 'Present').length,
    absent: records.filter(r => r.status === 'Absent').length,
    late: records.filter(r => r.status === 'Late').length,
    totalHours: records.reduce((sum, r) => sum + (r.workHours || 0), 0)
  };
};

module.exports = { getTodayRecord, calculateWorkHours, getMonthlyStats };
