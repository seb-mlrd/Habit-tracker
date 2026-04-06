const cron = require('node-cron');
const db = require('../db/schema');
const { sendReminderEmail } = require('./mailer');

function getIncompleteHabitsForUser(userId) {
  const today = new Date().toISOString().slice(0, 10);
  return db
    .prepare(`
      SELECT h.name, h.category
      FROM habits h
      WHERE h.user_id = ?
        AND h.frequency = 'daily'
        AND h.id NOT IN (
          SELECT habit_id FROM completions WHERE completed_on = ?
        )
    `)
    .all(userId, today);
}

function startReminderJob() {
  // Run every minute, check each user's configured notify_time
  cron.schedule('* * * * *', async () => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const users = db
      .prepare("SELECT id, email, notify_time FROM users WHERE notify_enabled = 1 AND notify_time = ?")
      .all(currentTime);

    for (const user of users) {
      const incomplete = getIncompleteHabitsForUser(user.id);
      if (incomplete.length === 0) continue;

      try {
        await sendReminderEmail(user.email, incomplete);
        console.log(`Reminder sent to ${user.email} (${incomplete.length} habits)`);
      } catch (err) {
        console.error(`Failed to send reminder to ${user.email}:`, err.message);
      }
    }
  });

  console.log('Reminder job started');
}

module.exports = { startReminderJob };
