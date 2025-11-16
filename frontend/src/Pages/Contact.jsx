// Pages/Contact.jsx
import React from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';

const Contact = () => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="neo-card border-0">
            <Card.Body className="p-5">
              <h2 className="text-center text-white mb-4">Contact Us</h2>
              
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-white">Name</Form.Label>
                      <Form.Control 
                        type="text" 
                        placeholder="Your name"
                        className="glass-effect text-white border-secondary"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-white">Email</Form.Label>
                      <Form.Control 
                        type="email" 
                        placeholder="Your email"
                        className="glass-effect text-white border-secondary"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label className="text-white">Message</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={5}
                    placeholder="Your message"
                    className="glass-effect text-white border-secondary"
                  />
                </Form.Group>
                
                <Button type="submit" className="neo-btn w-100 py-2">
                  Send Message
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Contact;