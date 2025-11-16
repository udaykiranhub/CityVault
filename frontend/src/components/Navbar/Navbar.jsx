// components/Navbar/Navbar.jsx
import React from 'react';
import { Navbar as BSNavbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ user, onLoginClick, onAdminClick, onLogout }) => {
  const location = useLocation();

  return (
    <BSNavbar bg="dark" variant="dark" expand="lg" className="py-3 custom-navbar">
      <Container>
        <BSNavbar.Brand 
          as={Link} 
          to="/" 
          className="fw-bold text-white fs-3 brand-text"
          style={{ textShadow: '0 0 10px rgba(100, 150, 255, 0.5)' }}
        >
          🌟 CityVault
        </BSNavbar.Brand>
        
        <BSNavbar.Toggle 
          aria-controls="basic-navbar-nav" 
          className="custom-toggler"
        />
        
        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              as={Link} 
              to="/" 
              className={`mx-2 nav-link-custom ${
                location.pathname === '/' ? 'text-warning fw-bold' : 'text-white'
              }`}
            >
              Home
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/about" 
              className={`mx-2 nav-link-custom ${
                location.pathname === '/about' ? 'text-warning fw-bold' : 'text-white'
              }`}
            >
              About
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/contact" 
              className={`mx-2 nav-link-custom ${
                location.pathname === '/contact' ? 'text-warning fw-bold' : 'text-white'
              }`}
            >
              Contact
            </Nav.Link>
            {user && (
              <Nav.Link 
                as={Link} 
                to="/dashboard" 
                className={`mx-2 nav-link-custom ${
                  location.pathname === '/dashboard' ? 'text-warning fw-bold' : 'text-white'
                }`}
              >
                Dashboard
              </Nav.Link>
            )}
          </Nav>
          
          <Nav className="navbar-buttons">
            {user ? (
              <div className="d-flex align-items-center">
                <span className="text-white me-3 user-welcome">
                  Welcome, <strong className="text-warning">{user.name}</strong> 
                  <span className="text-info"> ({user.role})</span>
                </span>
                <Button 
                  variant="outline-light" 
                  size="sm"
                  onClick={onLogout}
                  className="logout-btn"
                >
                  🚪 Logout
                </Button>
              </div>
            ) : (
              <div className="d-flex gap-2 auth-buttons">
                <Button 
                  onClick={onLoginClick}
                  className="user-login-btn"
                  size="sm"
                >
                  👤 User Login
                </Button>
                <Button 
                  onClick={onAdminClick}
                  className="admin-login-btn"
                  size="sm"
                >
                  👑 Admin
                </Button>
              </div>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
};

export default Navbar;