const Notification = require('../models/Notification');

const createNotification = async ({ recipient, title, message, type = 'Info', tenant }) => {
  try {
    return await Notification.create({ recipient, title, message, type, tenant });
  } catch (err) {
    console.error('Failed to create notification:', err.message);
  }
};

const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({ recipient: userId, read: false });
};

module.exports = { createNotification, getUnreadCount };
