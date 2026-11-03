const Notification = require('../models/Notification');

const createNotification = async ({
  title,
  message,
  type = 'system',
  link = '',
  metadata = {},
}) => {
  try {
    const notification = await Notification.create({
      title,
      message,
      type,
      link,
      metadata,
    });
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error.message);
    return null;
  }
};

module.exports = { createNotification };

