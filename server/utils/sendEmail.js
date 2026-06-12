const nodemailer = require('nodemailer');

const isSmtpConfigured = () =>
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

const createTransporter = () => {
  const port = parseInt(process.env.SMTP_PORT, 10) || 587;
  const secure = port === 465;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    ...(port === 587 && { requireTLS: true }),
  });
};

const sendEmail = async (options) => {
  if (!isSmtpConfigured()) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SMTP is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS.');
    }
    console.warn('[sendEmail] SMTP not configured — skipping send to', options.email);
    return { messageId: 'dev-skipped', accepted: [options.email] };
  }

  const transporter = createTransporter();

  const message = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || `<p>${options.message}</p>`,
  };

  const info = await transporter.sendMail(message);
  console.log(`Email sent to ${options.email}: ${info.messageId}`);
  return info;
};

module.exports = sendEmail;
module.exports.isSmtpConfigured = isSmtpConfigured;
