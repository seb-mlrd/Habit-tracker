const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendReminderEmail(to, habits) {
  const list = habits.map((h) => `  • ${h.name} (${h.category})`).join('\n');
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: '🔔 Habit reminder — don\'t break your streak!',
    text: `Hi!\n\nYou still have ${habits.length} habit${habits.length > 1 ? 's' : ''} to complete today:\n\n${list}\n\nKeep it up!\n— Habit Tracker`,
    html: `
      <p>Hi!</p>
      <p>You still have <strong>${habits.length} habit${habits.length > 1 ? 's' : ''}</strong> to complete today:</p>
      <ul>${habits.map((h) => `<li><strong>${h.name}</strong> <em>(${h.category})</em></li>`).join('')}</ul>
      <p>Keep it up! 💪</p>
    `,
  });
}

module.exports = { sendReminderEmail };
