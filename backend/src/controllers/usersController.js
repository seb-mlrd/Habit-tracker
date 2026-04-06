const db = require('../db/schema');

exports.getSettings = (req, res) => {
  const user = db
    .prepare('SELECT id, email, notify_enabled, notify_time FROM users WHERE id = ?')
    .get(req.user.id);
  res.json(user);
};

exports.updateSettings = (req, res) => {
  const { notify_enabled, notify_time } = req.body;

  if (notify_time && !/^\d{2}:\d{2}$/.test(notify_time)) {
    return res.status(400).json({ error: 'notify_time must be HH:MM' });
  }

  db.prepare(
    'UPDATE users SET notify_enabled = ?, notify_time = ? WHERE id = ?'
  ).run(
    notify_enabled ? 1 : 0,
    notify_time || '08:00',
    req.user.id
  );

  res.json({ ok: true });
};
