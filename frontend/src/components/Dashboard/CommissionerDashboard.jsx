// components/Dashboard/CommissionerDashboard.jsx
import React from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';

const CommissionerDashboard = () => {
  return (
    <Container className="py-4">
      <Row>
        <Col>
          <h2 className="text-white mb-4">Commissioner Dashboard</h2>
        </Col>
      </Row>
      
      <Row>
        <Col md={6} className="mb-3">
          <Card className="neo-card h-100">
            <Card.Body>
              <Card.Title>✅ Final Approvals</Card.Title>
              <Card.Text>
                Give final approval on forwarded documents.
              </Card.Text>
              <div className="d-flex justify-content-between align-items-center">
                <Badge bg="info" className="fs-6">3 Waiting</Badge>
                <Button className="neo-btn">Review Documents</Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} className="mb-3">
          <Card className="neo-card h-100">
            <Card.Body>
              <Card.Title>🏢 Department Overview</Card.Title>
              <Card.Text>
                Monitor all department activities and performance.
              </Card.Text>
              <Button variant="outline-light" className="w-100">View Overview</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CommissionerDashboard;