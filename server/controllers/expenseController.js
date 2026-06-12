const Expense = require('../models/Expense');
const { uploadFile } = require('../services/s3Service');
const { createNotification } = require('../services/notificationService');
const User = require('../models/User');

exports.createExpense = async (req, res) => {
  try {
    const { title, amount, category, comment } = req.body;
    if (!title || !amount) {
      return res.status(400).json({ success: false, message: 'Please specify title and amount' });
    }

    if (!req.user.employeeProfile) {
      return res.status(400).json({ success: false, message: 'Only registered employees can submit expense claims' });
    }

    let receiptUrl = '';
    if (req.file) {
      receiptUrl = await uploadFile(req.file);
    }

    const expense = await Expense.create({
      employee: req.user.employeeProfile._id,
      title,
      amount,
      category,
      receiptUrl,
      comment,
      tenant: req.tenant
    });

    // Notify uploader and notify Admin/HR
    try {
      await createNotification({
        recipient: req.user._id,
        title: 'Expense Claim Submitted',
        message: `Your claim "${title}" for ${amount} has been successfully submitted.`,
        type: 'Info',
        tenant: req.tenant
      });

      const adminsAndHrs = await User.find({ role: { $in: ['Admin', 'HR'] }, tenant: req.tenant });
      for (const adminOrHr of adminsAndHrs) {
        await createNotification({
          recipient: adminOrHr._id,
          title: 'New Expense Claim',
          message: `${req.user.employeeProfile.firstName} submitted an expense claim of ${amount} for "${title}".`,
          type: 'Leave', // Maps to ClipboardCheck icon in client UI which looks fitting
          tenant: req.tenant
        });
      }
    } catch (notifErr) {
      console.error('Failed to send notification for expense claim:', notifErr.message);
    }

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyExpenses = async (req, res) => {
  try {
    if (!req.user.employeeProfile) {
      return res.status(400).json({ success: false, message: 'User does not have an employee profile' });
    }

    const expenses = await Expense.find({
      employee: req.user.employeeProfile._id,
      tenant: req.tenant
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAdminExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ tenant: req.tenant })
      .populate('employee', 'firstName lastName employeeId designation department')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateExpenseStatus = async (req, res) => {
  try {
    const { status, comment } = req.body;
    if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const expense = await Expense.findOne({ _id: req.params.id, tenant: req.tenant }).populate('employee');
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense claim not found' });
    }

    expense.status = status;
    if (comment) expense.comment = comment;
    await expense.save();

    // Notify employee of approval/rejection
    try {
      if (expense.employee && expense.employee.user) {
        await createNotification({
          recipient: expense.employee.user,
          title: `Expense Claim ${status}`,
          message: `Your expense claim "${expense.title}" was ${status.toLowerCase()}${comment ? `: "${comment}"` : ''}.`,
          type: status === 'Approved' ? 'Success' : 'Error',
          tenant: req.tenant
        });
      }
    } catch (notifErr) {
      console.error('Failed to notify expense decision:', notifErr.message);
    }

    res.status(200).json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
