const User = require('../models/User');
const Tenant = require('../models/Tenant');
const Employee = require('../models/Employee');
const LeaveBalance = require('../models/LeaveBalance');
const Shift = require('../models/Shift');
const Department = require('../models/Department');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const generateEmployeeId = require('../utils/generateEmployeeId');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkey123!@#', {
    expiresIn: process.env.JWT_EXPIRE || '24h'
  });
};

exports.registerTenantAndAdmin = async (req, res) => {
  try {
    const { tenantName, firstName, lastName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    // 1. Create Tenant
    const tenant = await Tenant.create({ name: tenantName });

    // 2. Seed Default Departments
    await Department.create([
      { name: 'Finance Dept', code: 'FIN', tenant: tenant._id },
      { name: 'Technical Dept', code: 'TECH', tenant: tenant._id },
      { name: 'HR Dept', code: 'HR', tenant: tenant._id }
    ]);

    // 3. Create Default Shift
    const shift = await Shift.create({
      name: 'General Shift',
      startTime: '09:00',
      endTime: '18:00',
      gracePeriod: 15,
      tenant: tenant._id
    });

    // 3. Create User Account
    const user = await User.create({
      email,
      password,
      role: 'Admin',
      tenant: tenant._id
    });

    // 4. Create Employee Profile
    const empId = await generateEmployeeId(tenant._id);
    const employee = await Employee.create({
      employeeId: empId,
      firstName,
      lastName,
      user: user._id,
      tenant: tenant._id,
      designation: 'Administrator',
      shift: shift._id
    });

    user.employeeProfile = employee._id;
    await user.save();

    // 5. Create Default Leave Balance
    await LeaveBalance.create({
      employee: employee._id,
      tenant: tenant._id
    });

    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        tenant: user.tenant,
        employeeProfile: employee
      }
    });
  } catch (error) {
    console.error('Registration Error Details:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, tenantId } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const query = { email };
    if (tenantId) {
      query.tenant = tenantId;
    }

    const user = await User.findOne(query).populate('employeeProfile');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or tenant mismatch' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated' });
    }

    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        tenant: user.tenant,
        employeeProfile: user.employeeProfile
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    res.status(200).json({ success: true, user: req.user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found with that email' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins

    await user.save();

    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
    const message = `You requested a password reset. Please click this link: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'EMS Password Reset Token',
        message
      });
      res.status(200).json({ success: true, message: 'Reset token sent to email' });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.setupMFA = async (req, res) => {
  try {
    const secret = crypto.randomBytes(10).toString('hex').toUpperCase();
    req.user.mfaSecret = secret;
    req.user.mfaEnabled = true;
    await req.user.save();

    res.status(200).json({
      success: true,
      message: 'MFA Enabled successfully',
      mfaSecret: secret
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
