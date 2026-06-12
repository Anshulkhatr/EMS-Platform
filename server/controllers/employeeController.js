const Employee = require('../models/Employee');
const User = require('../models/User');
const LeaveBalance = require('../models/LeaveBalance');
const generateEmployeeId = require('../utils/generateEmployeeId');
const sendEmail = require('../utils/sendEmail');

exports.getEmployees = async (req, res) => {
  try {
    const query = { tenant: req.tenant };
    if (req.query.department) {
      query.department = req.query.department;
    }
    const employees = await Employee.find(query)
      .populate('department')
      .populate('reportingManager', 'firstName lastName employeeId')
      .populate('shift')
      .populate('user', 'email role');

    const data = employees.map(emp => {
      const obj = emp.toObject();
      obj.email = emp.user?.email;
      obj.role = emp.user?.role;
      return obj;
    });

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findOne({ _id: req.params.id, tenant: req.tenant })
      .populate('department')
      .populate('reportingManager', 'firstName lastName employeeId')
      .populate('shift')
      .populate('user', 'email role isActive');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const obj = employee.toObject();
    obj.email = employee.user?.email;
    obj.role = employee.user?.role;

    res.status(200).json({ success: true, data: obj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const { firstName, lastName, email, role, password, designation, department, reportingManager, shift, phone, salary, currency, address } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const employeeId = await generateEmployeeId(req.tenant);
    const finalPassword = password || 'Welcome@123';

    const user = await User.create({
      email,
      password: finalPassword,
      role: role || 'Employee',
      tenant: req.tenant
    });

    const employee = await Employee.create({
      employeeId,
      firstName,
      lastName,
      user: user._id,
      tenant: req.tenant,
      designation,
      department: department || undefined,
      reportingManager: reportingManager || undefined,
      shift: shift || undefined,
      phone,
      salary,
      currency: currency || 'USD',
      address
    });

    user.employeeProfile = employee._id;
    await user.save();

    await LeaveBalance.create({
      employee: employee._id,
      tenant: req.tenant
    });

    // Send Welcome Email
    try {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      const loginLink = `${clientUrl}/login`;
      
      const emailHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #f8fafc; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3); border: 1px solid #1e293b;">
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); padding: 32px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Welcome to EMS Platform</h1>
            <p style="color: #c7d2fe; margin: 8px 0 0 0; font-size: 16px;">Your employee portal account has been created</p>
          </div>
          <div style="padding: 32px; background-color: #0f172a;">
            <p style="font-size: 16px; line-height: 1.6; color: #94a3b8; margin-top: 0;">Hello ${firstName || 'Team Member'},</p>
            <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">An HR administrator has added you to the EMS Platform. Below are your login credentials to access your portal:</p>
            
            <div style="background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 20px; margin: 24px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8; font-size: 14px; width: 80px;"><strong>Email:</strong></td>
                  <td style="padding: 6px 0; color: #f8fafc; font-size: 15px; font-family: monospace;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8; font-size: 14px; width: 80px;"><strong>Password:</strong></td>
                  <td style="padding: 6px 0; color: #f8fafc; font-size: 15px; font-family: monospace;">${finalPassword}</td>
                </tr>
              </table>
            </div>

            <div style="text-align: center; margin: 32px 0 24px 0;">
              <a href="${loginLink}" target="_blank" style="background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); transition: all 0.2s ease;">
                Login to Your Account
              </a>
            </div>

            <p style="font-size: 13px; line-height: 1.6; color: #64748b; text-align: center; margin: 24px 0 0 0;">
              If the button above does not work, copy and paste this URL into your browser:<br/>
              <a href="${loginLink}" style="color: #6366f1; text-decoration: none; word-break: break-all;">${loginLink}</a>
            </p>
          </div>
          <div style="background-color: #020617; padding: 20px; text-align: center; border-top: 1px solid #1e293b;">
            <p style="margin: 0; color: #475569; font-size: 12px;">&copy; ${new Date().getFullYear()} EMS Platform. All rights reserved.</p>
          </div>
        </div>
      `;

      await sendEmail({
        email,
        subject: 'Welcome to EMS Platform - Your Account Details',
        message: `Welcome to EMS Platform. Your email: ${email}, Password: ${finalPassword}. Login here: ${loginLink}`,
        html: emailHtml
      });
    } catch (emailErr) {
      console.error('[employeeController] Failed to send onboarding welcome email:', emailErr.message);
    }

    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    let employee = await Employee.findOne({ _id: req.params.id, tenant: req.tenant });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('department shift');

    // Update user credentials if changed
    if (employee.user) {
      const user = await User.findById(employee.user);
      if (user) {
        if (req.body.email) user.email = req.body.email;
        if (req.body.role) user.role = req.body.role;
        if (req.body.password) user.password = req.body.password;
        await user.save();
      }
    }

    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrgChart = async (req, res) => {
  try {
    const employees = await Employee.find({ tenant: req.tenant })
      .select('firstName lastName designation reportingManager employeeId')
      .populate('reportingManager', 'firstName lastName');

    // Map to parent-child structure
    const orgData = employees.map(emp => ({
      id: emp._id.toString(),
      name: `${emp.firstName} ${emp.lastName}`,
      title: emp.designation,
      parentId: emp.reportingManager ? emp.reportingManager._id.toString() : null
    }));

    res.status(200).json({ success: true, data: orgData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDirectory = async (req, res) => {
  try {
    const { search } = req.query;
    let query = { tenant: req.tenant, status: 'Active' };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    const directory = await Employee.find(query)
      .populate('department', 'name')
      .populate('user', 'email role');

    const data = directory.map(emp => {
      const obj = emp.toObject();
      obj.email = emp.user?.email;
      obj.role = emp.user?.role;
      return obj;
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
