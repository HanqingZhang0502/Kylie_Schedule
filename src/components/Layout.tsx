import React from 'react';
import { Users, Calendar, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'students' | 'history';
  onTabChange: (tab: 'dashboard' | 'students' | 'history') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const { logout, currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      {/* Header */}
      <header className="bg-rose-600 text-white p-4 shadow-md sticky top-0 z-10">
        <div className="flex items-center justify-between">
          {/* 左侧 logo，同时平衡右侧 Logout 的视觉宽度 */}
          <div className="w-16 flex items-center">
            <img
              src="/logo-k.png"
              alt=""
              className="h-8 w-8 object-contain"
            />
          </div>

          <h1 className="text-xl font-bold text-center flex-1">
            💃 Kylie Schedule
          </h1>

          {/* Logout */}
          <div className="w-16 flex justify-end">
            <button
              onClick={logout}
              className="text-sm text-white/90 hover:text-white underline"
            >
              Logout
            </button>
          </div>
        </div>

        {/* 当前登录账号（调试用，确认 Vercel 登录的是谁） */}
        {currentUser?.email && (
          <div className="text-center text-[10px] text-white/50 mt-1 tracking-wide">
            {currentUser.email}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 pb-24 overflow-y-auto">
        {children}
      </main>

      {/* ✅ Signature（新增：放在底部导航上方，不挡操作） */}
      <div className="fixed bottom-[72px] left-0 right-0 z-10 pointer-events-none">
        <div className="text-center">
          <span className="font-serif italic tracking-wide text-xs text-gray-600/80">
            By Hanqing Zhang
          </span>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg pb-safe z-20">
        <div className="flex justify-around items-center h-16">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex flex-col items-center justify-center w-full h-full ${
              activeTab === 'dashboard' ? 'text-rose-600' : 'text-gray-400'
            }`}
          >
            <Calendar size={24} />
            <span className="text-xs mt-1">Dashboard</span>
          </button>

          <button
            onClick={() => onTabChange('students')}
            className={`flex flex-col items-center justify-center w-full h-full ${
              activeTab === 'students' ? 'text-rose-600' : 'text-gray-400'
            }`}
          >
            <Users size={24} />
            <span className="text-xs mt-1">Students</span>
          </button>

          <button
            onClick={() => onTabChange('history')}
            className={`flex flex-col items-center justify-center w-full h-full ${
              activeTab === 'history' ? 'text-rose-600' : 'text-gray-400'
            }`}
          >
            <BarChart3 size={24} />
            <span className="text-xs mt-1">History</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Layout;