import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';
import HabitCard from '../components/HabitCard';
import HabitForm from '../components/HabitForm';
import Skeleton from '../components/Skeleton';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';

const CATEGORIES = ['all', 'health', 'sport', 'productivity', 'learning', 'social', 'other'];
const CATEGORY_ICONS = {
  all: '🗂️', health: '❤️', sport: '🏃', productivity: '🧠',
  learning: '📚', social: '🤝', other: '✨',
};

function ProgressBar({ done, total }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const allDone = total > 0 && done === total;
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {allDone ? '🎉 All done for today!' : `${done} / ${total} completed`}
        </span>
        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{pct}%</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${allDone ? 'bg-emerald-500' : 'bg-indigo-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [habits, setHabits] = useState([]);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const toast = useToast();

  const today = new Date().toISOString().slice(0, 10);

  const load = useCallback(async () => {
    const [habitsRes, completionsRes] = await Promise.all([
      client.get('/habits'),
      client.get('/completions'),
    ]);
    setHabits(habitsRes.data);
    setCompletedIds(new Set(
      completionsRes.data.filter((c) => c.completed_on === today).map((c) => c.habit_id)
    ));
    setLoading(false);
  }, [today]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(form) {
    await client.post('/habits', form);
    setShowForm(false);
    toast('Habit created!');
    load();
  }

  async function handleUpdate(form) {
    await client.put(`/habits/${editing.id}`, form);
    setEditing(null);
    toast('Habit updated!');
    load();
  }

  async function handleDelete(id) {
    setConfirmDelete(id);
  }

  async function confirmDeleteHabit() {
    await client.delete(`/habits/${confirmDelete}`);
    setConfirmDelete(null);
    toast('Habit deleted', 'info');
    load();
  }

  const filtered = categoryFilter === 'all' ? habits : habits.filter((h) => h.category === categoryFilter);

  return (
    <div>
      {confirmDelete && (
        <ConfirmModal
          message="Delete this habit? All its history will be lost."
          onConfirm={confirmDeleteHabit}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Today</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditing(null); }}
          className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"
        >
          + New habit
        </button>
      </div>

      {!loading && habits.length > 0 && (
        <ProgressBar done={completedIds.size} total={habits.length} />
      )}

      <div className="flex gap-2 flex-wrap mb-5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`text-xs px-3 py-1 rounded-full border capitalize transition-all ${
              categoryFilter === cat
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500'
            }`}
          >
            {CATEGORY_ICONS[cat]} {cat}
          </button>
        ))}
      </div>

      {(showForm || editing) && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 mb-5 border border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">
            {editing ? 'Edit habit' : 'New habit'}
          </h2>
          <HabitForm
            initial={editing}
            onSubmit={editing ? handleUpdate : handleCreate}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        </div>
      )}

      {loading ? (
        <Skeleton count={3} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">{habits.length === 0 ? '🌱' : '🔍'}</p>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            {habits.length === 0 ? 'No habits yet' : 'No habits in this category'}
          </p>
          {habits.length === 0 && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Create your first habit →
            </button>
          )}
        </div>
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
    </div>
  );
}
