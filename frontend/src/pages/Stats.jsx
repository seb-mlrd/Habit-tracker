import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import client from '../api/client';

async function downloadExport(format) {
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/export/${format}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `habits_export.${format}`;
  a.click();
  URL.revokeObjectURL(url);
}

const PERIODS = [
  { key: 'week', label: 'Week', days: 7 },
  { key: 'month', label: 'Month', days: 30 },
  { key: 'year', label: 'Year', days: 365 },
];

function getDays(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return d.toISOString().slice(0, 10);
  });
}

function aggregateByMonth(days, completions) {
  const byMonth = {};
  for (const date of days) {
    const month = date.slice(0, 7);
    byMonth[month] = (byMonth[month] || 0) + completions.filter((c) => c.completed_on === date).length;
  }
  return Object.entries(byMonth).map(([month, completed]) => ({ date: month, completed }));
}

export default function Stats() {
  const [completions, setCompletions] = useState([]);
  const [habits, setHabits] = useState([]);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    Promise.all([client.get('/completions'), client.get('/habits')]).then(
      ([cRes, hRes]) => { setCompletions(cRes.data); setHabits(hRes.data); }
    );
  }, []);

  const { days: periodDays } = PERIODS.find((p) => p.key === period);
  const days = getDays(periodDays);

  const dailyData = period === 'year'
    ? aggregateByMonth(days, completions)
    : days.map((date) => ({
        date: date.slice(5),
        completed: completions.filter((c) => c.completed_on === date).length,
      }));

  const habitStats = habits.map((h) => ({
    name: h.name.length > 16 ? h.name.slice(0, 14) + '…' : h.name,
    period: completions.filter((c) => c.habit_id === h.id && days.includes(c.completed_on)).length,
    total: completions.filter((c) => c.habit_id === h.id).length,
  }));

  const totalThisPeriod = completions.filter((c) => days.includes(c.completed_on)).length;
  const completionRate = habits.length && periodDays
    ? Math.round((totalThisPeriod / (habits.filter(h => h.frequency === 'daily').length * periodDays)) * 100)
    : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Statistics</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadExport('csv')}
            className="text-xs px-3 py-1.5 rounded-lg border dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            ↓ CSV
          </button>
          <button
            onClick={() => downloadExport('pdf')}
            className="text-xs px-3 py-1.5 rounded-lg border dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            ↓ PDF
          </button>
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  period === p.key ? 'bg-white dark:bg-gray-800 text-indigo-600 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-2xl font-bold text-indigo-600">{totalThisPeriod}</p>
          <p className="text-xs text-gray-500 mt-1">Completions</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-2xl font-bold text-indigo-600">{habits.length}</p>
          <p className="text-xs text-gray-500 mt-1">Active habits</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-2xl font-bold text-indigo-600">{completionRate}%</p>
          <p className="text-xs text-gray-500 mt-1">Rate (daily)</p>
        </div>
      </div>

      <section className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="font-semibold text-gray-700 mb-4">
          Completions per {period === 'year' ? 'month' : 'day'}
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={dailyData}>
            <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={period === 'week' ? 0 : period === 'month' ? 4 : 0} />
            <YAxis allowDecimals={false} width={28} />
            <Tooltip />
            <Bar dataKey="completed" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="bg-white rounded-xl shadow p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Per habit</h2>
        {habitStats.length === 0 ? (
          <p className="text-gray-400 text-sm">No data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(180, habitStats.length * 40)}>
            <BarChart data={habitStats} layout="vertical">
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="period" name={`This ${period}`} fill="#6366f1" radius={[0, 4, 4, 0]} />
              <Bar dataKey="total" name="All time" fill="#a5b4fc" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>
    </div>
  );
}
