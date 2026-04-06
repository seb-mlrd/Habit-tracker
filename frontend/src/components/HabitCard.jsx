import { useState } from 'react';
import client from '../api/client';
import HabitCalendar from './HabitCalendar';
import { useToast } from '../context/ToastContext';

const CATEGORY_ICONS = {
  health: '❤️', sport: '🏃', productivity: '🧠',
  learning: '📚', social: '🤝', other: '✨',
};

const CATEGORY_COLORS = {
  health: 'border-l-red-400',
  sport: 'border-l-green-400',
  productivity: 'border-l-blue-400',
  learning: 'border-l-yellow-400',
  social: 'border-l-purple-400',
  other: 'border-l-gray-300',
};

export default function HabitCard({ habit, completedToday, onToggle, onEdit, onDelete }) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function handleToggle() {
    if (loading) return;
    setLoading(true);
    const today = new Date().toISOString().slice(0, 10);
    try {
      if (completedToday) {
        await client.delete(`/completions/${habit.id}/complete?date=${today}`);
        toast('Unmarked', 'info');
      } else {
        await client.post(`/completions/${habit.id}/complete`, { date: today });
        toast(`${habit.name} done! 🎯`);
      }
      onToggle();
    } finally {
      setLoading(false);
    }
  }

  const borderColor = CATEGORY_COLORS[habit.category] ?? 'border-l-gray-300';

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md border-l-4 ${borderColor} p-4 transition-all duration-200`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={handleToggle}
            disabled={loading}
            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
              loading ? 'opacity-50 cursor-wait' :
              completedToday
                ? 'bg-indigo-600 border-indigo-600 text-white scale-105'
                : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 hover:scale-105'
            }`}
          >
            {completedToday && (
              <svg className="w-4 h-4 animate-check-pop" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>

          <div className="min-w-0">
            <p className={`font-semibold leading-tight truncate ${
              completedToday ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-100'
            }`}>
              {habit.name}
            </p>
            {habit.description && (
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">{habit.description}</p>
            )}
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 px-1.5 py-0.5 rounded-md capitalize">
                {CATEGORY_ICONS[habit.category] ?? '✨'} {habit.category}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">{habit.frequency}</span>
              {habit.streak > 0 && (
                <span className="text-xs font-semibold text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded-md">
                  🔥 {habit.streak}d
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
          <button
            onClick={() => setShowCalendar((v) => !v)}
            className={`p-1.5 rounded-lg text-sm transition-colors ${
              showCalendar
                ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30'
                : 'text-gray-400 hover:text-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            title="Toggle calendar"
          >
            📅
          </button>
          <button
            onClick={() => onEdit(habit)}
            className="p-1.5 rounded-lg text-xs text-gray-400 hover:text-indigo-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(habit.id)}
            className="p-1.5 rounded-lg text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            🗑️
          </button>
        </div>
      </div>

      {showCalendar && <HabitCalendar habitId={habit.id} />}
    </div>
  );
}
