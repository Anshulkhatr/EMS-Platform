const User = require('../models/User');
const jwt = require('jsonwebtoken');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkey123!@#', {
    expiresIn: process.env.JWT_EXPIRE || '24h'
  });

const findUserByEmail = async (email) => {
  return await User.findOne({ email }).populate('employeeProfile');
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey123!@#');
};

module.exports = { signToken, findUserByEmail, verifyToken };
