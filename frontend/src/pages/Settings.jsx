import { useState, useEffect } from 'react';
import client from '../api/client';

export default function Settings() {
  const [form, setForm] = useState({ notify_enabled: false, notify_time: '08:00' });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    client.get('/users/me').then(({ data }) => {
      setForm({ notify_enabled: Boolean(data.notify_enabled), notify_time: data.notify_time });
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaved(false);
    try {
      await client.put('/users/me', form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save');
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Settings</h1>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Email reminders</h2>
        <p className="text-sm text-gray-500 mb-5">
          Receive a daily email listing your incomplete habits. Requires SMTP to be configured on the server.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={form.notify_enabled}
                onChange={(e) => setForm((f) => ({ ...f, notify_enabled: e.target.checked }))}
              />
              <div className={`w-10 h-6 rounded-full transition-colors ${form.notify_enabled ? 'bg-indigo-600' : 'bg-gray-200'}`} />
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.notify_enabled ? 'left-5' : 'left-1'}`} />
            </div>
            <span className="text-sm font-medium text-gray-700">Enable daily reminder</span>
          </label>

          {form.notify_enabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reminder time</label>
              <input
                type="time"
                value={form.notify_time}
                onChange={(e) => setForm((f) => ({ ...f, notify_time: e.target.value }))}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {saved && <p className="text-green-600 text-sm">Saved!</p>}

          <button
            type="submit"
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-indigo-700"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
}
