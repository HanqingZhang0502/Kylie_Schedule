import { useState } from 'react';
import { StudentProvider } from './context/StudentContext';
import { NotesProvider } from './context/NotesContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import type { Tab } from './components/Layout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import History from './pages/History';
import QuickNotes from './pages/QuickNotes';
import WeeklySchedule from './pages/WeeklySchedule';
import Login from './pages/Login';

const AuthenticatedApp = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const { currentUser } = useAuth();

  console.log("currentUser:", currentUser?.uid, currentUser?.email);

  if (!currentUser) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'students':
        return <Students />;
      case 'history':
        return <History />;
      case 'notes':
        return <QuickNotes />;
      case 'schedule':
        return <WeeklySchedule />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <StudentProvider>
      <NotesProvider>
        <Layout activeTab={activeTab} onTabChange={setActiveTab}>
          {renderContent()}
        </Layout>
      </NotesProvider>
    </StudentProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default App;
