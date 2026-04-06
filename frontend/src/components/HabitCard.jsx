import client from '../api/client';

export default function HabitCard({ habit, completedToday, onToggle, onEdit, onDelete }) {
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
    <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
      <div className="flex items-center gap-3">
        <button
          onClick={handleToggle}
          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${
            completedToday
              ? 'bg-indigo-600 border-indigo-600 text-white'
              : 'border-gray-300 hover:border-indigo-400'
          }`}
        >
          {completedToday && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        <div>
          <p className={`font-medium ${completedToday ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            {habit.name}
          </p>
          {habit.description && <p className="text-sm text-gray-500">{habit.description}</p>}
          <span className="text-xs text-indigo-500 capitalize">{habit.frequency}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(habit)}
          className="text-sm text-gray-500 hover:text-indigo-600"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(habit.id)}
          className="text-sm text-gray-500 hover:text-red-500"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
