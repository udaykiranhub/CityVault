import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';

const Contact = () => {
  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0c0c2b 0%, #1a1a3e 50%, #0c0c2b 100%)',
    padding: '2rem 0'
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '15px',
    boxShadow: `
      0 8px 32px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1)
    `,
    color: '#ffffff'
  };

  const infoCardStyle = {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '15px',
    padding: '2rem',
    marginBottom: '2rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    height: '100%'
  };

  const socialButtonStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
  };

  return (
    <div style={containerStyle}>
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Row className="justify-content-center">
            <Col lg={10}>
              <Card style={cardStyle} className="p-4">
                <Card.Body>
                  <Row className="text-center mb-5">
                    <Col>
                      <motion.h1 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        style={{ color: '#ffffff', fontWeight: '700', marginBottom: '1rem' }}
                      >
                        Contact Us
                      </motion.h1>
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1.1rem' }}
                      >
                        Get in touch with the CityVault team. We're here to help you with any questions about our decentralized file management system.
                      </motion.p>
                    </Col>
                  </Row>

                  <Row className="mb-5">
                    <Col md={4}>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                      >
                        <div style={infoCardStyle}>
                          <div className="text-center">
                            <i className="fas fa-map-marker-alt fa-2x mb-3" style={{ color: '#667eea' }}></i>
                            <h5 style={{ color: '#ffffff', fontWeight: '600', marginBottom: '1rem' }}>
                              Our Office
                            </h5>
                            <p style={{ color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
                              123 Blockchain Avenue<br />
                              Digital District<br />
                              Web3 City, 10001
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </Col>

                    <Col md={4}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                      >
                        <div style={infoCardStyle}>
                          <div className="text-center">
                            <i className="fas fa-envelope fa-2x mb-3" style={{ color: '#667eea' }}></i>
                            <h5 style={{ color: '#ffffff', fontWeight: '600', marginBottom: '1rem' }}>
                              Email Us
                            </h5>
                            <p style={{ color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
                              support@cityvault.com<br />
                              info@cityvault.com<br />
                              partners@cityvault.com
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </Col>

                    <Col md={4}>
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7, duration: 0.6 }}
                      >
                        <div style={infoCardStyle}>
                          <div className="text-center">
                            <i className="fas fa-phone fa-2x mb-3" style={{ color: '#667eea' }}></i>
                            <h5 style={{ color: '#ffffff', fontWeight: '600', marginBottom: '1rem' }}>
                              Call Us
                            </h5>
                            <p style={{ color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
                              +1 (555) 123-4567<br />
                              +1 (555) 123-4568<br />
                              Mon - Fri: 9AM - 6PM EST
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </Col>
                  </Row>

                  {/* <Row>
                    <Col className="text-center">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9, duration: 0.6 }}
                      >
                        <h3 style={{ color: '#ffffff', fontWeight: '700', marginBottom: '2rem' }}>
                          Connect With Us
                        </h3>
                        
                        <div className="d-flex justify-content-center gap-4 flex-wrap">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Button
                              style={socialButtonStyle}
                              onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-3px)';
                                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                              }}
                            >
                              <i className="fab fa-twitter fa-lg"></i>
                            </Button>
                            <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginTop: '0.5rem' }}>Twitter</p>
                          </motion.div>

                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Button
                              style={socialButtonStyle}
                              onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-3px)';
                                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                              }}
                            >
                              <i className="fab fa-discord fa-lg"></i>
                            </Button>
                            <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginTop: '0.5rem' }}>Discord</p>
                          </motion.div>

                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Button
                              style={socialButtonStyle}
                              onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-3px)';
                                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                              }}
                            >
                              <i className="fab fa-telegram fa-lg"></i>
                            </Button>
                            <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginTop: '0.5rem' }}>Telegram</p>
                          </motion.div>

                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Button
                              style={socialButtonStyle}
                              onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-3px)';
                                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                              }}
                            >
                              <i className="fab fa-github fa-lg"></i>
                            </Button>
                            <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginTop: '0.5rem' }}>GitHub</p>
                          </motion.div>

                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Button
                              style={socialButtonStyle}
                              onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-3px)';
                                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                              }}
                            >
                              <i className="fab fa-linkedin-in fa-lg"></i>
                            </Button>
                            <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginTop: '0.5rem' }}>LinkedIn</p>
                          </motion.div>
                        </div>
                      </motion.div>
                    </Col>
                  </Row> */}

                  <Row className="mt-5">
                    <Col className="text-center">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.1, duration: 0.6 }}
                      >
                        <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontStyle: 'italic' }}>
                          "Building the future of decentralized file management on Polygon"
                        </p>
                        <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem' }}>
                          © 2024 CityVault. All rights reserved. | Powered by Blockchain Technology
                        </p>
                      </motion.div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </motion.div>
      </Container>
    </div>
  );
};

export default Contact;