import { useState, useEffect } from 'react';
import client from '../api/client';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function isoDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function HabitCalendar({ habitId }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [completedDates, setCompletedDates] = useState(new Set());

  useEffect(() => {
    client.get(`/completions/${habitId}/history`).then(({ data }) => {
      setCompletedDates(new Set(data.map((c) => c.completed_on)));
    });
  }, [habitId]);

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  const today = now.toISOString().slice(0, 10);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells = Array(firstDow).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  const monthLabel = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="pt-3 border-t dark:border-gray-700 mt-3">
      <div className="flex items-center justify-between mb-2">
        <button onClick={prevMonth} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 px-1">‹</button>
        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{monthLabel}</span>
        <button onClick={nextMonth} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 px-1">›</button>
      </div>
      <div className="grid grid-cols-7 gap-px text-center">
        {DAYS.map((d) => (
          <div key={d} className="text-xs text-gray-400 dark:text-gray-500 pb-1">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const date = isoDate(year, month, day);
          const done = completedDates.has(date);
          const isToday = date === today;
          const future = date > today;
          return (
            <div
              key={date}
              className={`aspect-square flex items-center justify-center rounded-full text-xs mx-auto w-6 h-6
                ${done ? 'bg-indigo-600 text-white font-semibold' : ''}
                ${isToday && !done ? 'ring-1 ring-indigo-400 text-indigo-600 dark:text-indigo-400 font-semibold' : ''}
                ${!done && !isToday && !future ? 'text-gray-300 dark:text-gray-600' : ''}
                ${future ? 'text-gray-400 dark:text-gray-500' : ''}
              `}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
