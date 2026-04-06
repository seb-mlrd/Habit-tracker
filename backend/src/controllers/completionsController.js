const db = require('../db/schema');

function habitBelongsToUser(habitId, userId) {
  return db
    .prepare('SELECT id FROM habits WHERE id = ? AND user_id = ?')
    .get(habitId, userId);
}

exports.complete = (req, res) => {
  const { id: habitId } = req.params;
  if (!habitBelongsToUser(habitId, req.user.id)) {
    return res.status(404).json({ error: 'Habit not found' });
  }

  const date = req.body.date || new Date().toISOString().slice(0, 10);

  try {
    db.prepare('INSERT INTO completions (habit_id, completed_on) VALUES (?, ?)').run(habitId, date);
    res.status(201).json({ habit_id: Number(habitId), completed_on: date });
  } catch (e) {
    if (e.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Already completed for this date' });
    }
    throw e;
  }
};

exports.uncomplete = (req, res) => {
  const { id: habitId } = req.params;
  if (!habitBelongsToUser(habitId, req.user.id)) {
    return res.status(404).json({ error: 'Habit not found' });
  }

  const date = req.query.date || new Date().toISOString().slice(0, 10);
  db.prepare('DELETE FROM completions WHERE habit_id = ? AND completed_on = ?').run(habitId, date);
  res.status(204).end();
};

exports.history = (req, res) => {
  const { id: habitId } = req.params;
  if (!habitBelongsToUser(habitId, req.user.id)) {
    return res.status(404).json({ error: 'Habit not found' });
  }

  const completions = db
    .prepare('SELECT * FROM completions WHERE habit_id = ? ORDER BY completed_on DESC')
    .all(habitId);
  res.json(completions);
};

exports.allCompletions = (req, res) => {
  const completions = db
    .prepare(`
      SELECT c.*, h.name as habit_name
      FROM completions c
      JOIN habits h ON h.id = c.habit_id
      WHERE h.user_id = ?
      ORDER BY c.completed_on DESC
    `)
    .all(req.user.id);
  res.json(completions);
};
