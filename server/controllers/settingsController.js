const Department = require('../models/Department');
const Shift = require('../models/Shift');

exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ tenant: req.tenant }).populate('manager', 'firstName lastName');
    res.status(200).json({ success: true, data: departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const { name, code, manager } = req.body;
    const dept = await Department.create({
      name,
      code,
      manager: manager || undefined,
      tenant: req.tenant
    });
    res.status(201).json({ success: true, data: dept });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getShifts = async (req, res) => {
  try {
    const shifts = await Shift.find({ tenant: req.tenant });
    res.status(200).json({ success: true, data: shifts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createShift = async (req, res) => {
  try {
    const { name, startTime, endTime, gracePeriod } = req.body;
    const shift = await Shift.create({
      name,
      startTime,
      endTime,
      gracePeriod,
      tenant: req.tenant
    });
    res.status(201).json({ success: true, data: shift });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
