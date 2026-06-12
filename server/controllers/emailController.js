const EmailLog = require('../models/EmailLog');
const User = require('../models/User');
const { sendDirectEmail } = require('../services/emailService');
const { isSmtpConfigured } = require('../utils/sendEmail');

exports.getRecipients = async (req, res) => {
  try {
    const users = await User.find({ tenant: req.tenant, isActive: true })
      .select('email role')
      .sort({ email: 1 });

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEmailHistory = async (req, res) => {
  try {
    const logs = await EmailLog.find({ tenant: req.tenant })
      .populate('sender', 'email role')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.sendEmail = async (req, res) => {
  try {
    const { subject, body, recipientType, role, emails } = req.body;

    if (!subject?.trim() || !body?.trim()) {
      return res.status(400).json({ success: false, message: 'Subject and body are required' });
    }

    if (!['all', 'role', 'individual'].includes(recipientType)) {
      return res.status(400).json({ success: false, message: 'Invalid recipient type' });
    }

    if (recipientType === 'role' && !role) {
      return res.status(400).json({ success: false, message: 'Role is required for role-based emails' });
    }

    if (recipientType === 'individual' && (!emails || !emails.length)) {
      return res.status(400).json({ success: false, message: 'At least one email is required' });
    }

    if (!isSmtpConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'SMTP is not configured. Add Brevo credentials on Render (SMTP_HOST, SMTP_USER, SMTP_PASS).',
      });
    }

    const result = await sendDirectEmail({
      tenant: req.tenant,
      senderId: req.user._id,
      subject: subject.trim(),
      body: body.trim(),
      recipientType,
      role,
      emails,
    });

    if (result.total === 0) {
      return res.status(400).json({ success: false, message: 'No matching recipients found' });
    }

    const status =
      result.failed === 0 ? 'sent' : result.sent === 0 ? 'failed' : 'partial';

    const log = await EmailLog.create({
      sender: req.user._id,
      subject: subject.trim(),
      body: body.trim(),
      recipientType,
      role: recipientType === 'role' ? role : undefined,
      recipients: result.recipients,
      sentCount: result.sent,
      failedCount: result.failed,
      status,
      tenant: req.tenant,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${result.sent} of ${result.total} recipients`,
      data: log,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSmtpStatus = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      configured: isSmtpConfigured(),
      host: process.env.SMTP_HOST || null,
      from: process.env.SMTP_FROM || process.env.SMTP_USER || null,
    },
  });
};
