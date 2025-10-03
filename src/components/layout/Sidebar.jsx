import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { 
  LayoutDashboard, 
  FileText, 
  BarChart3, 
  User, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button.jsx';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Issues', href: '/issues', icon: FileText },
  { name: 'Review & Approve', href: '/issues', icon: CheckCircle, special: true },
  { name: 'Reports & Analytics', href: '/reports', icon: BarChart3 },
  { name: 'Create Worker', href: '/create-profile', icon: User },
  { name: 'Worker List', href: '/assign-worker', icon: User }, // <-- Added Worker List
  { name: 'Profile', href: '/profile', icon: User },
];

export function Sidebar({ className, collapsed, setCollapsed }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div
      className={`fixed left-0 z-40 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} ${className || ''}`}
      style={{
        top: '5rem', // Match the navbar height
        height: 'calc(100vh - 5rem)', // Fill below the navbar
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.10)",
        borderRadius: "1rem",
        background: "hsl(var(--sidebar))",
        backdropFilter: "blur(8px)",
        border: "1px solid hsl(var(--border))",
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Collapse Button Section */}
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-end'} p-2`}>
        <button
          onClick={() => setCollapsed && setCollapsed(!collapsed)}
          className="p-1 rounded-md bg-muted shadow hover:bg-accent transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          type="button"
        >
          {collapsed ? <Menu className="w-5 h-5 text-muted-foreground" /> : <X className="w-5 h-5 text-muted-foreground" />}
        </button>
      </div>
      {/* Navigation */}
      <nav className="flex-1 p-2 flex flex-col h-full">
        <ul className="space-y-1 flex-1">
          {navigation.map((item) => (
            <li key={item.name}>
              {item.special ? (
                <button
                  onClick={() => navigate('/issues', { state: { filterStatus: 'manual' } })}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 w-full",
                    "text-gray-700 hover:bg-gray-200 hover:shadow-lg",
                    collapsed ? "justify-center" : "justify-start"
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  <item.icon className={cn("h-5 w-5", !collapsed && "mr-3")} />
                  {!collapsed && <span>{item.name}</span>}
                </button>
              ) : (
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                      isActive
                        ? "bg-gray-300 text-gray-900 shadow-lg"
                        : "text-gray-700 hover:bg-gray-200 hover:shadow-lg",
                      collapsed ? "justify-center" : "justify-start"
                    )
                  }
                  title={collapsed ? item.name : undefined}
                >
                  <item.icon className={cn("h-5 w-5", !collapsed && "mr-3")} />
                  {!collapsed && <span>{item.name}</span>}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
        {/* Logout at the bottom */}
        <div className={`mt-auto p-2 border-t border-border flex ${collapsed ? 'justify-center' : 'justify-start'}`}>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              "w-full justify-start text-red-600 hover:text-white hover:bg-red-600",
              collapsed ? "px-3 justify-center" : ""
            )}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut className={cn("h-5 w-5", !collapsed && "mr-3")} />
            {!collapsed && <span>Logout</span>}
          </Button>
        </div>
      </nav>
    </div>
  );
}