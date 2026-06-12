const Approval = require('../models/Approval');

const createApproval = async ({ type, refId, requestedBy, tenant }) => {
  return await Approval.create({ type, refId, requestedBy, tenant });
};

const getPendingApprovals = async (tenantId) => {
  return await Approval.find({ tenant: tenantId, status: 'Pending' })
    .populate('requestedBy', 'firstName lastName employeeId')
    .sort({ createdAt: -1 });
};

module.exports = { createApproval, getPendingApprovals };
