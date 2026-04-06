import { useState, useEffect } from 'react';

const CATEGORIES = [
  { value: 'health', label: '❤️ Health' },
  { value: 'sport', label: '🏃 Sport' },
  { value: 'productivity', label: '🧠 Productivity' },
  { value: 'learning', label: '📚 Learning' },
  { value: 'social', label: '🤝 Social' },
  { value: 'other', label: '✨ Other' },
];

const inputCls = 'w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400';

export default function HabitForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState({ name: '', description: '', frequency: 'daily', category: 'other' });

  useEffect(() => {
    if (initial) setForm({
      name: initial.name,
      description: initial.description || '',
      frequency: initial.frequency,
      category: initial.category || 'other',
    });
  }, [initial]);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" for="name">Name</label>
        <input id="name" name="name" value={form.name} onChange={handleChange} required className={inputCls} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" for="description">Description</label>
        <input id="description" name="description" value={form.description} onChange={handleChange} className={inputCls} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" for="category">Category</label>
          <select id="category" name="category" value={form.category} onChange={handleChange} className={inputCls}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" for="frequency">Frequency</label>
          <select id="frequency" name="frequency" value={form.frequency} onChange={handleChange} className={inputCls}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm hover:bg-indigo-700">
          {initial ? 'Update' : 'Create'}
        </button>
        <button type="button" onClick={onCancel} className="flex-1 border dark:border-gray-600 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
          Cancel
        </button>
      </div>
    </form>
  );
}
