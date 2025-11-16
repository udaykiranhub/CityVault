// Pages/About.jsx
import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const About = () => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="neo-card border-0">
            <Card.Body className="p-5">
              <h2 className="text-center text-white mb-4">About CityVault</h2>
              <p className="text-white-50 lead">
                CityVault is a revolutionary document management system that leverages blockchain 
                technology and IPFS to provide secure, transparent, and efficient government workflows.
              </p>
              
              <Row className="mt-5">
                <Col md={6} className="mb-4">
                  <h5 className="text-primary">🔐 Secure</h5>
                  <p className="text-white-50">
                    Blockchain-verified document storage with military-grade encryption.
                  </p>
                </Col>
                <Col md={6} className="mb-4">
                  <h5 className="text-primary">⚡ Efficient</h5>
                  <p className="text-white-50">
                    Streamlined workflows with real-time tracking and notifications.
                  </p>
                </Col>
                <Col md={6} className="mb-4">
                  <h5 className="text-primary">🌐 Transparent</h5>
                  <p className="text-white-50">
                    Complete audit trail with immutable blockchain records.
                  </p>
                </Col>
                <Col md={6} className="mb-4">
                  <h5 className="text-primary">💼 Role-Based</h5>
                  <p className="text-white-50">
                    Customized dashboards for Users, HODs, and Commissioners.
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default About;