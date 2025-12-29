import { useState } from 'react';
import { StudentProvider } from './context/StudentContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import History from './pages/History';
import Login from './pages/Login';

const AuthenticatedApp = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'history'>('dashboard');
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
      default:
        return <Dashboard />;
    }
  };

  return (
    <StudentProvider>
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderContent()}
      </Layout>
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
