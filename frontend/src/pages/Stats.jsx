import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import client from '../api/client';
import { useToast } from '../context/ToastContext';

async function downloadExport(format, toast) {
  try {
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
    toast(`Export ${format.toUpperCase()} downloaded!`);
  } catch {
    toast('Export failed', 'error');
  }
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

function StatCard({ value, label, icon }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 text-center border border-gray-100 dark:border-gray-700">
      <div className="text-2xl mb-1">{icon}</div>
      <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

export default function Stats() {
  const [completions, setCompletions] = useState([]);
  const [habits, setHabits] = useState([]);
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    Promise.all([client.get('/completions'), client.get('/habits')]).then(
      ([cRes, hRes]) => {
        setCompletions(cRes.data);
        setHabits(hRes.data);
        setLoading(false);
      }
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
  const dailyHabits = habits.filter((h) => h.frequency === 'daily').length;
  const completionRate = dailyHabits && periodDays
    ? Math.min(100, Math.round((totalThisPeriod / (dailyHabits * periodDays)) * 100))
    : 0;
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.streak ?? 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Statistics</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadExport('csv', toast)}
            className="text-xs px-3 py-1.5 rounded-lg border dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            ↓ CSV
          </button>
          <button
            onClick={() => downloadExport('pdf', toast)}
            className="text-xs px-3 py-1.5 rounded-lg border dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            ↓ PDF
          </button>
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  period === p.key
                    ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard value={totalThisPeriod} label="Completions" icon="✅" />
        <StatCard value={habits.length} label="Active habits" icon="📋" />
        <StatCard value={`${completionRate}%`} label="Completion rate" icon="📈" />
        <StatCard value={`${bestStreak}d`} label="Best streak" icon="🔥" />
      </div>

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-5">
        <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">
          Completions per {period === 'year' ? 'month' : 'day'}
        </h2>
        {loading ? (
          <div className="h-[220px] bg-gray-50 dark:bg-gray-700/30 rounded-xl animate-skeleton" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyData}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} interval={period === 'week' ? 0 : period === 'month' ? 4 : 0} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} width={28} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="completed" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">Per habit</h2>
        {loading ? (
          <div className="h-[180px] bg-gray-50 dark:bg-gray-700/30 rounded-xl animate-skeleton" />
        ) : habitStats.length === 0 ? (
          <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-8">No data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(180, habitStats.length * 44)}>
            <BarChart data={habitStats} layout="vertical">
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="period" name={`This ${period}`} fill="#6366f1" radius={[0, 6, 6, 0]} maxBarSize={20} />
              <Bar dataKey="total" name="All time" fill="#a5b4fc" radius={[0, 6, 6, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>
    </div>
  );
}
