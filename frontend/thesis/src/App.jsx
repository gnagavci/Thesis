import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import './App.css';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard">
      <h1>Welcome, {user.username}!</h1>
      <button onClick={logout} className="logout-button">
        Logout
      </button>
    </div>
  );
};

const AppContent = () => {
  const { user, login, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return user ? <Dashboard /> : <Login onLoginSuccess={login} />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;