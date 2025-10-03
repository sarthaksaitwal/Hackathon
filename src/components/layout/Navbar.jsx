import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const pageTitles = {
  '/': 'Home',
  '/dashboard': 'Dashboard',
  '/issues': 'Issues',
  '/profile': 'Profile',
  '/reports': 'Reports',
  '/assign-worker': 'Assign Worker',
  '/create-profile': 'Create Worker',
  // Add more as needed
};

export default function Navbar() {
  const location = useLocation();
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Get page title based on current path
  const getPageTitle = () => {
    const path = location.pathname;
    if (pageTitles[path]) return pageTitles[path];
    // Dynamic routes (e.g., /issues/:id, /workers/:id)
    if (/^\/issues\//.test(path)) return 'Issue Details';
    if (/^\/workers\//.test(path)) return 'Worker Details';
    return 'CivicTracker';
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-sidebar backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-gray-200 shadow-md"
      style={{ height: '5.5rem' }}
    >
      {/* Left: App Name */}
      <span className="text-xl font-extrabold text-gray-900 tracking-wide">CivicTracker</span>
      {/* Center: Page Title */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <span className="text-4xl font-extrabold text-gray-900">{getPageTitle()}</span>
      </div>
      {/* Right: Date/Time */}
      <span className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-full shadow-md text-lg font-semibold text-gray-700 border border-gray-300 select-none">
        {dateTime.toLocaleString(undefined, {
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })}
      </span>
    </nav>
  );
}
