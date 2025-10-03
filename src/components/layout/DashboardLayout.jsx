import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { Sidebar } from './Sidebar';
import Navbar from './Navbar';
import { Loader2 } from 'lucide-react';

export function DashboardLayout({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }
  return (
    <>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <Navbar />
      <div
        className={`transition-all duration-300 pt-20 px-4 bg-sidebar min-h-screen ${collapsed ? 'ml-16' : 'ml-64'}`}
      >
        <main>{children}</main>
      </div>
    </>
  );
}
