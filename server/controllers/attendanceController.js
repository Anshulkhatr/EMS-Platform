const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const Shift = require('../models/Shift');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');

exports.punchIn = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const employee = req.user.employeeProfile;

    if (!employee) {
      return res.status(400).json({ success: false, message: 'Employee profile not associated with this user' });
    }

    let attendance = await Attendance.findOne({ employee: employee._id, date: today, tenant: req.tenant });
    if (attendance && attendance.punchIn) {
      return res.status(400).json({ success: false, message: 'Already punched in for today' });
    }

    const empObj = await Employee.findById(employee._id).populate('shift');
    let status = 'Present';

    if (empObj && empObj.shift) {
      const shiftStart = empObj.shift.startTime; // HH:MM
      const [shiftHour, shiftMin] = shiftStart.split(':').map(Number);
      const grace = empObj.shift.gracePeriod || 15;

      const now = new Date();
      const shiftTimeToday = new Date();
      shiftTimeToday.setHours(shiftHour, shiftMin, 0, 0);

      const lateBoundary = new Date(shiftTimeToday.getTime() + grace * 60 * 1000);
      if (now > lateBoundary) {
        status = 'Late';
      }
    }

    if (!attendance) {
      attendance = await Attendance.create({
        employee: employee._id,
        date: today,
        punchIn: new Date(),
        status,
        tenant: req.tenant
      });
    } else {
      attendance.punchIn = new Date();
      attendance.status = status;
      await attendance.save();
    }

    // Send Notification
    try {
      await createNotification({
        recipient: req.user._id,
        title: 'Punch In Recorded',
        message: `You successfully punched in at ${new Date().toLocaleTimeString()} (Status: ${status}).`,
        type: 'Attendance',
        tenant: req.tenant
      });
    } catch (notifErr) {
      console.error('Failed to notify punch-in:', notifErr.message);
    }

    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.punchOut = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const employee = req.user.employeeProfile;

    if (!employee) {
      return res.status(400).json({ success: false, message: 'Employee profile not associated' });
    }

    const attendance = await Attendance.findOne({ employee: employee._id, date: today, tenant: req.tenant });
    if (!attendance) {
      return res.status(400).json({ success: false, message: 'You must punch in first before punching out' });
    }
    if (attendance.punchOut) {
      return res.status(400).json({ success: false, message: 'Already punched out for today' });
    }

    attendance.punchOut = new Date();

    if (attendance.punchIn) {
      const diffMs = attendance.punchOut - attendance.punchIn;
      const hours = diffMs / (1000 * 60 * 60);
      attendance.workHours = parseFloat(hours.toFixed(2));
      if (hours < 4) {
        attendance.status = 'Half-Day';
      }
    }

    await attendance.save();

    // Send Notification
    try {
      await createNotification({
        recipient: req.user._id,
        title: 'Punch Out Recorded',
        message: `You successfully punched out at ${new Date().toLocaleTimeString()}. Hours worked: ${attendance.workHours || 0}.`,
        type: 'Attendance',
        tenant: req.tenant
      });
    } catch (notifErr) {
      console.error('Failed to notify punch-out:', notifErr.message);
    }

    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAttendanceStatus = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const employee = req.user.employeeProfile;

    if (!employee) {
      return res.status(200).json({ success: true, punchedIn: false, punchedOut: false });
    }

    const attendance = await Attendance.findOne({ employee: employee._id, date: today, tenant: req.tenant });

    res.status(200).json({
      success: true,
      punchedIn: attendance ? !!attendance.punchIn : false,
      punchedOut: attendance ? !!attendance.punchOut : false,
      attendance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAttendanceHistory = async (req, res) => {
  try {
    const employee = req.user.employeeProfile;
    if (!employee) {
      return res.status(200).json({ success: true, data: [] });
    }

    const history = await Attendance.find({ employee: employee._id, tenant: req.tenant })
      .sort({ date: -1 });

    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.requestRegularization = async (req, res) => {
  try {
    const { attendanceId, punchIn, punchOut, reason } = req.body;
    let attendance = await Attendance.findOne({ _id: attendanceId, tenant: req.tenant });

    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    attendance.regularization = {
      requested: true,
      reason,
      status: 'Pending',
      originalPunchIn: punchIn ? new Date(punchIn) : undefined,
      originalPunchOut: punchOut ? new Date(punchOut) : undefined
    };

    await attendance.save();

    // Send Notification to Admin/HR
    try {
      const adminsAndHrs = await User.find({ role: { $in: ['Admin', 'HR'] }, tenant: req.tenant });
      for (const adminOrHr of adminsAndHrs) {
        await createNotification({
          recipient: adminOrHr._id,
          title: 'Regularization Request',
          message: `${req.user.employeeProfile.firstName || 'An employee'} requested attendance regularization for ${attendance.date}.`,
          type: 'Attendance',
          tenant: req.tenant
        });
      }
    } catch (notifErr) {
      console.error('Failed to notify regularization request:', notifErr.message);
    }

    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRegularizationRequests = async (req, res) => {
  try {
    // If manager, load requests for their team
    const query = { tenant: req.tenant, 'regularization.requested': true, 'regularization.status': 'Pending' };

    const requests = await Attendance.find(query)
      .populate('employee', 'firstName lastName employeeId department designation')
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveRegularization = async (req, res) => {
  try {
    const attendance = await Attendance.findOne({ _id: req.params.id, tenant: req.tenant });
    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    attendance.punchIn = attendance.regularization.originalPunchIn || attendance.punchIn;
    attendance.punchOut = attendance.regularization.originalPunchOut || attendance.punchOut;
    attendance.regularization.status = 'Approved';
    attendance.regularization.approvedBy = req.user.employeeProfile ? req.user.employeeProfile._id : undefined;

    // Recalculate hours
    if (attendance.punchIn && attendance.punchOut) {
      const diffMs = attendance.punchOut - attendance.punchIn;
      const hours = diffMs / (1000 * 60 * 60);
      attendance.workHours = parseFloat(hours.toFixed(2));
      attendance.status = hours >= 8 ? 'Present' : (hours >= 4 ? 'Half-Day' : 'Present');
    }

    await attendance.save();

    // Send Notification to Employee
    try {
      const employeeUser = await User.findOne({ employeeProfile: attendance.employee, tenant: req.tenant });
      if (employeeUser) {
        await createNotification({
          recipient: employeeUser._id,
          title: 'Regularization Approved',
          message: `Your regularization request for ${attendance.date} has been approved.`,
          type: 'Attendance',
          tenant: req.tenant
        });
      }
    } catch (notifErr) {
      console.error('Failed to notify regularization approval:', notifErr.message);
    }

    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEmployeeAttendanceHistory = async (req, res) => {
  try {
    const history = await Attendance.find({ employee: req.params.employeeId, tenant: req.tenant })
      .sort({ date: -1 })
      .limit(30);
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
