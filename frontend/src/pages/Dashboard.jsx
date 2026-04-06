import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';
import HabitCard from '../components/HabitCard';
import HabitForm from '../components/HabitForm';

const CATEGORIES = ['all', 'health', 'sport', 'productivity', 'learning', 'social', 'other'];
const CATEGORY_ICONS = {
  all: '🗂️', health: '❤️', sport: '🏃', productivity: '🧠',
  learning: '📚', social: '🤝', other: '✨',
};

export default function Dashboard() {
  const [habits, setHabits] = useState([]);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const today = new Date().toISOString().slice(0, 10);

  const load = useCallback(async () => {
    const [habitsRes, completionsRes] = await Promise.all([
      client.get('/habits'),
      client.get('/completions'),
    ]);
    setHabits(habitsRes.data);
    const todayIds = new Set(
      completionsRes.data
        .filter((c) => c.completed_on === today)
        .map((c) => c.habit_id)
    );
    setCompletedIds(todayIds);
  }, [today]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(form) {
    await client.post('/habits', form);
    setShowForm(false);
    load();
  }

  async function handleUpdate(form) {
    await client.put(`/habits/${editing.id}`, form);
    setEditing(null);
    load();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this habit?')) return;
    await client.delete(`/habits/${id}`);
    load();
  }

  const filtered = categoryFilter === 'all'
    ? habits
    : habits.filter((h) => h.category === categoryFilter);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Today</h1>
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditing(null); }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
        >
          + New habit
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`text-xs px-3 py-1 rounded-full border capitalize transition-colors ${
              categoryFilter === cat
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300'
            }`}
          >
            {CATEGORY_ICONS[cat]} {cat}
          </button>
        ))}
      </div>

      {(showForm || editing) && (
        <div className="bg-white rounded-xl shadow p-5 mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">{editing ? 'Edit habit' : 'New habit'}</h2>
          <HabitForm
            initial={editing}
            onSubmit={editing ? handleUpdate : handleCreate}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-gray-400 text-center py-16">
          {habits.length === 0 ? 'No habits yet. Create your first one!' : 'No habits in this category.'}
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              completedToday={completedIds.has(habit.id)}
              onToggle={load}
              onEdit={(h) => { setEditing(h); setShowForm(false); }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {habits.length > 0 && (
        <p className="text-sm text-gray-400 text-center mt-6">
          {completedIds.size} / {habits.length} completed today
        </p>
      )}
    </div>
  );
}
