
// Pages/Home.jsx
import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <Container className="py-5">
      {/* Hero Section */}
      <Row className="align-items-center min-vh-50 py-5">
        <Col lg={6}>
          <div className="text-center text-lg-start">
            <h1 className="display-4 fw-bold mb-4 text-white">
              Secure Document Management with{' '}
              <span className="text-primary" style={{ textShadow: '0 0 10px rgba(100, 150, 255, 0.5)' }}>
                Blockchain
              </span>
            </h1>
            <p className="lead mb-4 text-white-50">
              CityVault provides a secure, transparent, and efficient way to manage government documents 
              with blockchain verification and IPFS storage.
            </p>
            <div className="d-flex gap-3 justify-content-center justify-content-lg-start">
              <Button 
                as={Link} 
                to="/about" 
                size="lg" 
                className="neo-btn px-4"
              >
                Learn More
              </Button>
              <Button 
                variant="outline-light" 
                size="lg" 
                className="px-4"
              >
                Get Started
              </Button>
            </div>
          </div>
        </Col>
        <Col lg={6}>
          <div className="text-center">
            <div className="neo-card p-5">
              <h3 className="text-primary mb-3">🚀 Why Choose CityVault?</h3>
              <p className="text-white-50">
                Experience the future of document management with our blockchain-powered platform 
                that ensures security, transparency, and efficiency for government workflows.
              </p>
            </div>
          </div>
        </Col>
      </Row>

      {/* Features Section */}
      <Row className="py-5 mt-5">
        <Col md={4} className="mb-4">
          <Card className="h-100 neo-card border-0">
            <Card.Body className="text-center p-4">
              <div className="fs-1 mb-3">🔒</div>
              <Card.Title className="text-white">Secure Storage</Card.Title>
              <Card.Text className="text-white-50">
                Documents stored on IPFS with blockchain verification for maximum security.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="h-100 neo-card border-0">
            <Card.Body className="text-center p-4">
              <div className="fs-1 mb-3">⚡</div>
              <Card.Title className="text-white">Fast Processing</Card.Title>
              <Card.Text className="text-white-50">
                Efficient workflow management with real-time status tracking.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="h-100 neo-card border-0">
            <Card.Body className="text-center p-4">
              <div className="fs-1 mb-3">🌐</div>
              <Card.Title className="text-white">Transparent</Card.Title>
              <Card.Text className="text-white-50">
                Complete audit trail with blockchain-based verification.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;