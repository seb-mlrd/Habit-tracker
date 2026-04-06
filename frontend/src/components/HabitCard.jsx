import { useState } from 'react';
import client from '../api/client';
import HabitCalendar from './HabitCalendar';

const CATEGORY_ICONS = {
  health: '❤️', sport: '🏃', productivity: '🧠',
  learning: '📚', social: '🤝', other: '✨',
};

export default function HabitCard({ habit, completedToday, onToggle, onEdit, onDelete }) {
  const [showCalendar, setShowCalendar] = useState(false);

  async function handleToggle() {
    const today = new Date().toISOString().slice(0, 10);
    if (completedToday) {
      await client.delete(`/completions/${habit.id}/complete?date=${today}`);
    } else {
      await client.post(`/completions/${habit.id}/complete`, { date: today });
    }
    onToggle();
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggle}
            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
              completedToday
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
            }`}
          >
            {completedToday && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>

          <div>
            <p className={`font-medium leading-tight ${completedToday ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-100'}`}>
              {habit.name}
            </p>
            {habit.description && <p className="text-sm text-gray-500 dark:text-gray-400">{habit.description}</p>}
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 px-1.5 py-0.5 rounded capitalize">
                {CATEGORY_ICONS[habit.category] ?? '✨'} {habit.category}
              </span>
              <span className="text-xs text-indigo-400 capitalize">{habit.frequency}</span>
              {habit.streak > 0 && (
                <span className="text-xs font-medium text-orange-500">🔥 {habit.streak}d</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCalendar((v) => !v)}
            className={`text-sm px-2 py-0.5 rounded transition-colors ${
              showCalendar ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' : 'text-gray-400 hover:text-indigo-500'
            }`}
            title="Toggle calendar"
          >
            📅
          </button>
          <button onClick={() => onEdit(habit)} className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600">Edit</button>
          <button onClick={() => onDelete(habit.id)} className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-500">Delete</button>
        </div>
      </div>

      {showCalendar && <HabitCalendar habitId={habit.id} />}
    </div>
  );
}
