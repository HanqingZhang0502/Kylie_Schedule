import { useState } from 'react';
import { StudentProvider } from './context/StudentContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import History from './pages/History';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'history'>('dashboard');

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
}

export default App;
