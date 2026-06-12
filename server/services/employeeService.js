const Employee = require('../models/Employee');
const User = require('../models/User');
const generateEmployeeId = require('../utils/generateEmployeeId');

const createEmployee = async ({ tenantId, firstName, lastName, email, role, designation, department, shift, phone, address }) => {
  const employeeId = await generateEmployeeId(tenantId);
  const user = await User.create({ email, password: 'Welcome@123', role: role || 'Employee', tenant: tenantId });
  const employee = await Employee.create({ employeeId, firstName, lastName, user: user._id, tenant: tenantId, designation, department, shift, phone, address });
  user.employeeProfile = employee._id;
  await user.save();
  return { employee, user };
};

const getEmployeeByUserId = async (userId) => {
  return await Employee.findOne({ user: userId }).populate('department shift');
};

module.exports = { createEmployee, getEmployeeByUserId };
