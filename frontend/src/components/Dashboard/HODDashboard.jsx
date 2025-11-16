// components/Dashboard/HODDashboard.jsx
import React from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';

const HODDashboard = () => {
  return (
    <Container className="py-4">
      <Row>
        <Col>
          <h2 className="text-white mb-4">HOD Dashboard</h2>
        </Col>
      </Row>
      
      <Row>
        <Col md={6} className="mb-3">
          <Card className="neo-card h-100">
            <Card.Body>
              <Card.Title>📋 Pending Reviews</Card.Title>
              <Card.Text>
                Review documents submitted by your department.
              </Card.Text>
              <div className="d-flex justify-content-between align-items-center">
                <Badge bg="warning" className="fs-6">5 Pending</Badge>
                <Button className="neo-btn">Start Review</Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} className="mb-3">
          <Card className="neo-card h-100">
            <Card.Body>
              <Card.Title>📈 Department Stats</Card.Title>
              <Card.Text>
                View analytics and performance metrics.
              </Card.Text>
              <Button variant="outline-light" className="w-100">View Analytics</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HODDashboard;