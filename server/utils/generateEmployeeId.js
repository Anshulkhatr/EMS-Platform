const Employee = require('../models/Employee');

const generateEmployeeId = async (tenantId) => {
  try {
    const lastEmployee = await Employee.findOne({ tenant: tenantId })
      .sort({ createdAt: -1 })
      .select('employeeId');

    if (!lastEmployee || !lastEmployee.employeeId) {
      return 'EMP0001';
    }

    const currentNumber = parseInt(lastEmployee.employeeId.replace('EMP', ''), 10);
    const nextNumber = currentNumber + 1;
    const nextId = `EMP${String(nextNumber).padStart(4, '0')}`;
    return nextId;
  } catch (error) {
    console.error('Error generating employee ID:', error);
    return 'EMP' + Math.floor(1000 + Math.random() * 9000);
  }
};

module.exports = generateEmployeeId;
