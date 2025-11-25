

// App.jsx - FIXED IMPORTS
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Navbar from './components/Navbar/Navbar';
import AuthModal from './components/AuthModal/AuthModal';
import AdminAuthModal from './components/AdminAuthModal/AdminAuthModal';
import Home from  "./Pages/Home"
import About from './Pages/About';
import Contact from './Pages/Contact';
import UserDashboard from './components/Dashboard/UserDashboard';
import HODDashboard from './components/Dashboard/HODDashboard';
import CommissionerDashboard from './components/Dashboard/CommissionerDashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Create a separate component that uses useNavigate
function AppContent() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminAuthModal, setShowAdminAuthModal] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Now this works correctly

  useEffect(() => {
    // Check if user is logged in on app load
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  // const handleLogin = (userData, token) => {
  //   setUser(userData);
  //   localStorage.setItem('token', token);
  //   localStorage.setItem('user', JSON.stringify(userData));
  //   setShowAuthModal(false);
    
  //   // ✅ AUTOMATIC REDIRECT AFTER LOGIN
  //   navigate('/dashboard');
  // };
// In App.jsx - handleLogin
const handleLogin = (userData, token) => {
  setUser(userData);
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(userData));
  setShowAuthModal(false);
  
  // Pass department in state instead of URL
  navigate('/dashboard', { 
    state: { 
      phone: userData.phone,
      department: userData.department // Make sure this is included in login response
    }
  });
};

  const handleAdminLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setShowAdminAuthModal(false);
    
    // ✅ AUTOMATIC REDIRECT AFTER ADMIN LOGIN
    // navigate('/admin-dashboard');
     navigate('/admin-dashboard', { 
    state: { 
      phone: userData.phone,
      department: userData.department
    }
  });
  };



  
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/'); // Redirect to home after logout
  };

  const ProtectedRoute = ({ children, requiredRole }) => {
    if (!user) {
      return <Navigate to="/" />;
    }
    
    if (requiredRole && user.role !== requiredRole) {
      return <Navigate to="/" />;
    }
    
    return children;
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar 
        user={user} 
        onLoginClick={() => setShowAuthModal(true)} 
        onAdminClick={() => setShowAdminAuthModal(true)}
        onLogout={handleLogout}
      />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              {user?.role === 'Admin' ? <AdminDashboard /> :
               user?.role === 'HOD' ? <HODDashboard /> : 
               user?.role === 'Commissioner' ? <CommissionerDashboard /> : 
               <UserDashboard />}
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute requiredRole="Admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>

      {/* User Auth Modal - Only Login */}
      <AuthModal 
        show={showAuthModal}
        onHide={() => setShowAuthModal(false)}
        onLoginSuccess={handleLogin}
      />

      {/* Admin Auth Modal - Login/Register based on token */}
      <AdminAuthModal 
        show={showAdminAuthModal}
        onHide={() => setShowAdminAuthModal(false)}
        onLoginSuccess={handleAdminLogin}
      />
    </div>
  );
}

// Main App component with Router
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;