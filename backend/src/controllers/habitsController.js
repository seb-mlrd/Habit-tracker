const db = require('../db/schema');

function calculateStreak(habitId) {
  const dates = db
    .prepare('SELECT completed_on FROM completions WHERE habit_id = ? ORDER BY completed_on DESC')
    .all(habitId)
    .map((c) => c.completed_on);

  if (dates.length === 0) return 0;

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

  // Streak is broken if neither today nor yesterday is completed
  if (!dates.includes(today) && !dates.includes(yesterday)) return 0;

  let streak = 0;
  const cursor = new Date(dates.includes(today) ? today : yesterday);

  while (true) {
    const dateStr = cursor.toISOString().slice(0, 10);
    if (!dates.includes(dateStr)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

exports.list = (req, res) => {
  const habits = db
    .prepare('SELECT * FROM habits WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.user.id);

  const withStreaks = habits.map((h) => ({ ...h, streak: calculateStreak(h.id) }));
  res.json(withStreaks);
};

exports.create = (req, res) => {
  const { name, description, frequency = 'daily', category = 'other' } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const result = db
    .prepare('INSERT INTO habits (user_id, name, description, frequency, category) VALUES (?, ?, ?, ?, ?)')
    .run(req.user.id, name, description || null, frequency, category);

  const habit = db.prepare('SELECT * FROM habits WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ ...habit, streak: 0 });
};

exports.update = (req, res) => {
  const habit = db
    .prepare('SELECT * FROM habits WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);
  if (!habit) return res.status(404).json({ error: 'Habit not found' });

  const { name, description, frequency, category } = req.body;
  db.prepare(
    'UPDATE habits SET name = ?, description = ?, frequency = ?, category = ? WHERE id = ?'
  ).run(
    name ?? habit.name,
    description ?? habit.description,
    frequency ?? habit.frequency,
    category ?? habit.category,
    habit.id
  );

  const updated = db.prepare('SELECT * FROM habits WHERE id = ?').get(habit.id);
  res.json({ ...updated, streak: calculateStreak(habit.id) });
};

exports.remove = (req, res) => {
  const result = db
    .prepare('DELETE FROM habits WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.user.id);

  if (result.changes === 0) return res.status(404).json({ error: 'Habit not found' });
  res.status(204).end();
};
