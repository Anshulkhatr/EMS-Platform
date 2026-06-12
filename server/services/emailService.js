const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { createNotification } = require('./notificationService');

const getActiveUsers = async (tenant, roleFilter) => {
  const query = { tenant, isActive: true };
  if (roleFilter) query.role = roleFilter;
  return User.find(query).select('email role').lean();
};

const sendToUsers = async (users, { subject, message, html }) => {
  const results = await Promise.allSettled(
    users.map((user) =>
      sendEmail({
        email: user.email,
        subject,
        message,
        html,
      })
    )
  );

  const sent = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;

  results
    .filter((r) => r.status === 'rejected')
    .forEach((r) => console.error('[emailService] Send failed:', r.reason?.message));

  return { sent, failed, total: users.length };
};

const notifyAllUsers = async ({
  tenant,
  title,
  message,
  type = 'Info',
  emailSubject,
  emailMessage,
  emailHtml,
}) => {
  const users = await getActiveUsers(tenant);

  await Promise.allSettled(
    users.map((user) =>
      createNotification({
        recipient: user._id,
        title,
        message,
        type,
        tenant,
      })
    )
  );

  if (emailSubject) {
    return sendToUsers(users, {
      subject: emailSubject,
      message: emailMessage || message,
      html: emailHtml,
    });
  }

  return { sent: 0, failed: 0, total: users.length };
};

const sendDirectEmail = async ({
  tenant,
  senderId,
  subject,
  body,
  recipientType,
  role,
  emails,
}) => {
  let users = [];

  if (recipientType === 'all') {
    users = await getActiveUsers(tenant);
  } else if (recipientType === 'role' && role) {
    users = await getActiveUsers(tenant, role);
  } else if (recipientType === 'individual' && emails?.length) {
    const normalized = emails.map((e) => e.toLowerCase().trim());
    users = await User.find({
      tenant,
      isActive: true,
      email: { $in: normalized },
    })
      .select('email role')
      .lean();
  }

  if (!users.length) {
    return { sent: 0, failed: 0, total: 0, recipients: [] };
  }

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
      <h2 style="color:#4f46e5;margin-bottom:16px;">${subject}</h2>
      <div style="color:#334155;line-height:1.6;white-space:pre-wrap;">${body}</div>
      <hr style="margin:24px 0;border:none;border-top:1px solid #e2e8f0;" />
      <p style="color:#94a3b8;font-size:12px;">Sent via EMS Platform</p>
    </div>
  `;

  const result = await sendToUsers(users, { subject, message: body, html });

  try {
    await Promise.allSettled(
      users.map((user) =>
        createNotification({
          recipient: user._id,
          title: `New Internal Mail: ${subject}`,
          message: body.length > 80 ? `${body.substring(0, 80)}...` : body,
          type: 'Email',
          tenant,
        })
      )
    );
  } catch (notifErr) {
    console.error('[emailService] Failed to create email notifications:', notifErr.message);
  }

  return {
    ...result,
    recipients: users.map((u) => u.email),
  };
};

module.exports = {
  getActiveUsers,
  notifyAllUsers,
  sendDirectEmail,
};
