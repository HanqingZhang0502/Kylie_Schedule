import React from 'react';
import { Users, Calendar, BarChart3 } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
    activeTab: 'dashboard' | 'students' | 'history';
    onTabChange: (tab: 'dashboard' | 'students' | 'history') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
            {/* Header */}
            <header className="bg-rose-600 text-white p-4 shadow-md sticky top-0 z-10">
                <h1 className="text-xl font-bold text-center">💃 Kylie Schedule</h1>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 pb-24 overflow-y-auto">
                {children}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg pb-safe">
                <div className="flex justify-around items-center h-16">
                    <button
                        onClick={() => onTabChange('dashboard')}
                        className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'dashboard' ? 'text-rose-600' : 'text-gray-400'}`}
                    >
                        <Calendar size={24} />
                        <span className="text-xs mt-1">Dashboard</span>
                    </button>
                    <button
                        onClick={() => onTabChange('students')}
                        className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'students' ? 'text-rose-600' : 'text-gray-400'}`}
                    >
                        <Users size={24} />
                        <span className="text-xs mt-1">Students</span>
                    </button>
                    <button
                        onClick={() => onTabChange('history')}
                        className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'history' ? 'text-rose-600' : 'text-gray-400'}`}
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
