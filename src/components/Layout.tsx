import React from 'react';
import { Users, Calendar, BarChart3, NotebookPen, CalendarDays } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type Tab = 'dashboard' | 'students' | 'history' | 'notes' | 'schedule';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: Calendar },
  { key: 'students', label: 'Students', icon: Users },
  { key: 'history', label: 'History', icon: BarChart3 },
  { key: 'notes', label: 'Notes', icon: NotebookPen },
  { key: 'schedule', label: 'Weekly', icon: CalendarDays },
];

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const { logout, currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-paper flex flex-col text-ink">
      {/* Header */}
      <header className="bg-accent text-paper p-4 shadow-sketch sticky top-0 z-10">
        <div className="flex items-center justify-between">
          {/* 左侧 logo，同时平衡右侧 Logout 的视觉宽度 */}
          <div className="w-16 flex items-center">
            <img
              src="/logo-k.png"
              alt=""
              className="h-8 w-8 object-contain"
            />
          </div>

          <h1 className="font-marker text-3xl font-bold text-center flex-1">
            💃 Kylie Schedule
          </h1>

          {/* Logout */}
          <div className="w-16 flex justify-end">
            <button
              onClick={logout}
              className="font-hand text-sm text-paper/90 hover:text-paper underline decoration-dashed underline-offset-2"
            >
              Logout
            </button>
          </div>
        </div>

        {/* 当前登录账号（调试用，确认 Vercel 登录的是谁） */}
        {currentUser?.email && (
          <div className="text-center text-[10px] text-paper/50 mt-1 tracking-wide">
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
          <span className="font-hand tracking-wide text-xs text-ink-muted/80">
            By Hanqing Zhang
          </span>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-scrap border-t border-line shadow-sketch pb-safe z-20">
        <div className="flex justify-around items-center h-16">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              className={`font-hand flex flex-col items-center justify-center w-full h-full ${
                activeTab === key ? 'text-accent' : 'text-ink-muted'
              }`}
            >
              <Icon size={22} />
              <span className="text-[10px] mt-1">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
