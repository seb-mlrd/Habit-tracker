import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="bg-indigo-600 text-white px-4 py-3 flex items-center justify-between">
      <div className="flex gap-6 font-medium">
        <Link to="/" className="hover:text-indigo-200">Dashboard</Link>
        <Link to="/stats" className="hover:text-indigo-200">Stats</Link>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span className="opacity-75">{user?.email}</span>
        <button
          onClick={handleLogout}
          className="bg-indigo-800 hover:bg-indigo-900 px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
