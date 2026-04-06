import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend,
} from 'recharts';
import client from '../api/client';

function getLast30Days() {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export default function Stats() {
  const [completions, setCompletions] = useState([]);
  const [habits, setHabits] = useState([]);

  useEffect(() => {
    Promise.all([client.get('/completions'), client.get('/habits')]).then(
      ([cRes, hRes]) => {
        setCompletions(cRes.data);
        setHabits(hRes.data);
      }
    );
  }, []);

  const days = getLast30Days();

  const dailyData = days.map((date) => ({
    date: date.slice(5),
    completed: completions.filter((c) => c.completed_on === date).length,
  }));

  const habitStats = habits.map((h) => {
    const total = completions.filter((c) => c.habit_id === h.id).length;
    const last30 = completions.filter(
      (c) => c.habit_id === h.id && days.includes(c.completed_on)
    ).length;
    return { name: h.name, total, last30 };
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Statistics</h1>

      <section className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="font-semibold text-gray-700 mb-4">Completions — last 30 days</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={dailyData}>
            <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={4} />
            <YAxis allowDecimals={false} width={28} />
            <Tooltip />
            <Bar dataKey="completed" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="bg-white rounded-xl shadow p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Per habit (last 30 days vs all time)</h2>
        {habitStats.length === 0 ? (
          <p className="text-gray-400 text-sm">No data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={habitStats} layout="vertical">
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="last30" name="Last 30 days" fill="#6366f1" radius={[0, 4, 4, 0]} />
              <Bar dataKey="total" name="All time" fill="#a5b4fc" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>
    </div>
  );
}
