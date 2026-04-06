const db = require('../db/schema');

exports.list = (req, res) => {
  const habits = db
    .prepare('SELECT * FROM habits WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.user.id);
  res.json(habits);
};

exports.create = (req, res) => {
  const { name, description, frequency = 'daily' } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const result = db
    .prepare('INSERT INTO habits (user_id, name, description, frequency) VALUES (?, ?, ?, ?)')
    .run(req.user.id, name, description || null, frequency);

  const habit = db.prepare('SELECT * FROM habits WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(habit);
};

exports.update = (req, res) => {
  const habit = db
    .prepare('SELECT * FROM habits WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);
  if (!habit) return res.status(404).json({ error: 'Habit not found' });

  const { name, description, frequency } = req.body;
  db.prepare(
    'UPDATE habits SET name = ?, description = ?, frequency = ? WHERE id = ?'
  ).run(
    name ?? habit.name,
    description ?? habit.description,
    frequency ?? habit.frequency,
    habit.id
  );

  res.json(db.prepare('SELECT * FROM habits WHERE id = ?').get(habit.id));
};

exports.remove = (req, res) => {
  const result = db
    .prepare('DELETE FROM habits WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.user.id);

  if (result.changes === 0) return res.status(404).json({ error: 'Habit not found' });
  res.status(204).end();
};
