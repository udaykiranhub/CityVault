// components/Dashboard/UserDashboard.jsx
import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

const UserDashboard = () => {
  return (
    <Container className="py-4">
      <Row>
        <Col>
          <h2 className="text-white mb-4">User Dashboard</h2>
        </Col>
      </Row>
      
      <Row>
        <Col md={4} className="mb-3">
          <Card className="neo-card h-100">
            <Card.Body>
              <Card.Title>📁 Upload Files</Card.Title>
              <Card.Text>
                Upload your documents for review and approval.
              </Card.Text>
              <Button className="neo-btn w-100">Upload Document</Button>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-3">
          <Card className="neo-card h-100">
            <Card.Body>
              <Card.Title>📊 File Status</Card.Title>
              <Card.Text>
                Track the status of your submitted documents.
              </Card.Text>
              <Button variant="outline-light" className="w-100">View Status</Button>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-3">
          <Card className="neo-card h-100">
            <Card.Body>
              <Card.Title>👤 Profile</Card.Title>
              <Card.Text>
                Manage your account and wallet settings.
              </Card.Text>
              <Button variant="outline-light" className="w-100">Manage Profile</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserDashboard;