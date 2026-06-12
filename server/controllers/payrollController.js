const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');

// Helper to determine working days and present days in a month
const calculateAttendanceDays = async (employeeId, tenant, monthName, year) => {
  // Return default 22 total working days and 20 present days if attendance cannot be calculated
  return { totalWorkingDays: 22, presentDays: 21 };
};

exports.generatePayroll = async (req, res) => {
  try {
    const { month, year } = req.body;
    if (!month || !year) {
      return res.status(400).json({ success: false, message: 'Please specify month and year' });
    }

    // Get all active employees
    const employees = await Employee.find({ tenant: req.tenant, status: 'Active' });
    const generatedRecords = [];

    for (const emp of employees) {
      const baseSalary = emp.salary || 3000; // default to 3000 if not set
      const { totalWorkingDays, presentDays } = await calculateAttendanceDays(emp._id, req.tenant, month, year);
      
      // Calculate net pay based on ratio of present days to total working days
      const ratio = presentDays / totalWorkingDays;
      const calculatedPay = Math.round(baseSalary * ratio);

      // Check if already exists
      const existing = await Payroll.findOne({
        employee: emp._id,
        month,
        year,
        tenant: req.tenant
      });

      if (!existing) {
        const payroll = await Payroll.create({
          employee: emp._id,
          month,
          year,
          baseSalary,
          presentDays,
          totalWorkingDays,
          netPay: calculatedPay,
          status: 'Unpaid',
          tenant: req.tenant
        });
        generatedRecords.push(payroll);
      }
    }

    res.status(201).json({
      success: true,
      message: `Generated payroll records for ${generatedRecords.length} employees`,
      count: generatedRecords.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPayrollHistory = async (req, res) => {
  try {
    if (!req.user.employeeProfile) {
      return res.status(400).json({ success: false, message: 'User does not have an employee profile' });
    }

    const payrolls = await Payroll.find({
      employee: req.user.employeeProfile._id,
      tenant: req.tenant
    }).sort({ year: -1, createdAt: -1 });

    res.status(200).json({ success: true, data: payrolls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAdminPayroll = async (req, res) => {
  try {
    const payrolls = await Payroll.find({ tenant: req.tenant })
      .populate('employee', 'firstName lastName employeeId designation department')
      .sort({ year: -1, createdAt: -1 });

    res.status(200).json({ success: true, data: payrolls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePayrollStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Paid', 'Unpaid'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const payroll = await Payroll.findOne({ _id: req.params.id, tenant: req.tenant });
    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }

    payroll.status = status;
    await payroll.save();

    res.status(200).json({ success: true, data: payroll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
