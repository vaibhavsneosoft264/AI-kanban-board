import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={
            isAuthenticated ? 
              <Navigate to="/dashboard" /> : 
              <Navigate to="/login" />
          } />
          <Route path="/login" element={
            isAuthenticated ? 
              <Navigate to="/dashboard" /> : 
              <div className="App-header">
                <h1>Kanban Board Login</h1>
                <Login onLogin={handleLogin} />
                <p>
                  Don't have an account?{' '}
                  <a href="/register" className="link-button">Register here</a>
                </p>
              </div>
          } />
          <Route path="/register" element={
            isAuthenticated ? 
              <Navigate to="/dashboard" /> : 
              <div className="App-header">
                <h1>Kanban Board Register</h1>
                <Register onSuccess={() => window.location.href = '/login'} />
                <p>
                  Already have an account?{' '}
                  <a href="/login" className="link-button">Login here</a>
                </p>
              </div>
          } />
          <Route path="/dashboard" element={
            isAuthenticated ? 
              <Dashboard user={user} onLogout={handleLogout} /> : 
              <Navigate to="/login" />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
