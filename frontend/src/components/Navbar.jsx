import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useTheme from '../hooks/useTheme';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="bg-indigo-600 dark:bg-gray-900 text-white px-4 py-3 flex items-center justify-between">
      <div className="flex gap-6 font-medium">
        <Link to="/" className="hover:text-indigo-200">Dashboard</Link>
        <Link to="/stats" className="hover:text-indigo-200">Stats</Link>
        <Link to="/settings" className="hover:text-indigo-200">Settings</Link>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <button
          onClick={toggle}
          className="bg-indigo-700 dark:bg-gray-700 hover:bg-indigo-800 dark:hover:bg-gray-600 px-2 py-1 rounded text-base"
          title="Toggle dark mode"
        >
          {dark ? '☀️' : '🌙'}
        </button>
        <span className="opacity-75 hidden sm:inline">{user?.email}</span>
        <button
          onClick={handleLogout}
          className="bg-indigo-800 dark:bg-gray-700 hover:bg-indigo-900 dark:hover:bg-gray-600 px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
