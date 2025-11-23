// Pages/Home.jsx
import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
  hover: {
    scale: 1.05,
    y: -10,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  }
};

// Animated component wrapper
const AnimatedSection = ({ children, delay = 0 }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={itemVariants}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
};

const Home = () => {
  const features = [
    {
      icon: '🔒',
      title: 'Secure Storage',
      description: 'Documents stored on IPFS with blockchain verification for maximum security and immutability.'
    },
    {
      icon: '⚡',
      title: 'Fast Processing',
      description: 'Efficient workflow management with real-time status tracking and instant notifications.'
    },
    {
      icon: '🌐',
      title: 'Transparent',
      description: 'Complete audit trail with blockchain-based verification and transparent governance.'
    },
    {
      icon: '💰',
      title: 'Cost Effective',
      description: 'Low transaction fees on Polygon network with optimized gas usage for operations.'
    },
    {
      icon: '🛡️',
      title: 'Role Based Access',
      description: 'Secure role-based access control with hierarchical approval workflows.'
    },
    {
      icon: '📊',
      title: 'Real-time Analytics',
      description: 'Comprehensive dashboard with real-time insights and document tracking.'
    }
  ];

  const stats = [
    { number: '99.9%', label: 'Uptime' },
    { number: '500+', label: 'Documents' },
    { number: '50+', label: 'Active Users' },
    { number: '24/7', label: 'Support' }
  ];

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0c0c2b 0%, #1a1a3e 50%, #0c0c2b 100%)'
    }}>
      <Container className="py-5">
        {/* Hero Section */}
        <Row className="align-items-center min-vh-100 py-5">
          <Col lg={6}>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <AnimatedSection>
                <motion.h1 
                  className="display-4 fw-bold mb-4 text-white"
                  variants={itemVariants}
                >
                  Secure Document Management with{' '}
                  <motion.span 
                    className="text-primary"
                    style={{ 
                      textShadow: '0 0 20px rgba(102, 126, 234, 0.8)',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                    animate={{
                      textShadow: [
                        '0 0 20px rgba(102, 126, 234, 0.8)',
                        '0 0 30px rgba(102, 126, 234, 1)',
                        '0 0 20px rgba(102, 126, 234, 0.8)'
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    Blockchain
                  </motion.span>
                </motion.h1>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <motion.p 
                  className="lead mb-4 text-white-50"
                  variants={itemVariants}
                >
                  CityVault provides a secure, transparent, and efficient way to manage government documents 
                  with blockchain verification and decentralized IPFS storage on Polygon network.
                </motion.p>
              </AnimatedSection>

              <AnimatedSection delay={0.4}>
                <motion.div 
                  className="d-flex gap-3 justify-content-center justify-content-lg-start flex-wrap"
                  variants={itemVariants}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      as={Link} 
                      to="/about" 
                      size="lg" 
                      className="px-4 py-2"
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: '600',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                      }}
                    >
                      Learn More
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* <Button 
                      variant="outline-light" 
                      size="lg" 
                      className="px-4 py-2"
                      style={{
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '10px',
                        fontWeight: '600',
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      View Demo
                    </Button> */}
                  </motion.div>
                </motion.div>
              </AnimatedSection>
            </motion.div>
          </Col>

          <Col lg={6} className="mt-5 mt-lg-0">
            <AnimatedSection delay={0.6}>
              <motion.div
                className="text-center"
                variants={cardVariants}
                whileHover="hover"
              >
                <div 
                  className="p-5"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '20px',
                    boxShadow: `
                      0 8px 32px rgba(0, 0, 0, 0.3),
                      inset 0 1px 0 rgba(255, 255, 255, 0.1)
                    `
                  }}
                >
                  <motion.div
                    animate={{
                      y: [0, -10, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <div className="fs-1 mb-3">🚀</div>
                  </motion.div>
                  <h3 
                    className="mb-3"
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: '700'
                    }}
                  >
                    Why Choose CityVault?
                  </h3>
                  <p className="text-white-50 mb-0">
                    Experience the future of document management with our blockchain-powered platform 
                    that ensures security, transparency, and efficiency for government workflows.
                  </p>
                </div>
              </motion.div>
            </AnimatedSection>
          </Col>
        </Row>

        {/* Stats Section */}
        <Row className="py-5">
          <Col>
            <AnimatedSection delay={0.2}>
              <motion.div
                className="text-center mb-5"
                variants={itemVariants}
              >
                <h2 className="text-white mb-4">Trusted by Government Organizations</h2>
              </motion.div>
            </AnimatedSection>
            
            <Row className="justify-content-center">
              {stats.map((stat, index) => (
                <Col xs={6} md={3} key={stat.label} className="mb-4">
                  <AnimatedSection delay={0.3 + index * 0.1}>
                    <motion.div
                      className="text-center"
                      variants={cardVariants}
                      whileHover="hover"
                    >
                      <div 
                        className="p-4"
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '15px',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                      >
                        <motion.h3 
                          className="text-primary mb-2"
                          style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: '700'
                          }}
                        >
                          {stat.number}
                        </motion.h3>
                        <p className="text-white-50 mb-0 small">{stat.label}</p>
                      </div>
                    </motion.div>
                  </AnimatedSection>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>

        {/* Features Section */}
        <Row className="py-5">
          <Col>
            <AnimatedSection delay={0.3}>
              <motion.div
                className="text-center mb-5"
                variants={itemVariants}
              >
                <h2 className="text-white mb-3">Powerful Features</h2>
                <p className="text-white-50 lead">
                  Everything you need for secure document management
                </p>
              </motion.div>
            </AnimatedSection>

            <Row>
              {features.map((feature, index) => (
                <Col lg={4} md={6} key={feature.title} className="mb-4">
                  <AnimatedSection delay={0.4 + index * 0.1}>
                    <motion.div
                      variants={cardVariants}
                      whileHover="hover"
                    >
                      <Card 
                        className="h-100 border-0"
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '15px',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
                        }}
                      >
                        <Card.Body className="text-center p-4">
                          <motion.div 
                            className="fs-1 mb-3"
                            animate={{
                              rotate: [0, 5, 0, -5, 0]
                            }}
                            transition={{
                              duration: 4,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            {feature.icon}
                          </motion.div>
                          <Card.Title className="text-white mb-3">{feature.title}</Card.Title>
                          <Card.Text className="text-white-50">
                            {feature.description}
                          </Card.Text>
                        </Card.Body>
                      </Card>
                    </motion.div>
                  </AnimatedSection>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>

        {/* CTA Section */}
        <Row className="py-5">
          <Col className="text-center">
            <AnimatedSection delay={0.6}>
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
              >
                <div 
                  className="p-5"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <h2 className="text-white mb-3">Ready to Get Started?</h2>
                  <p className="text-white-50 lead mb-4">
                    Join the future of document management with CityVault
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* <Button 
                      size="lg"
                      className="px-5 py-3"
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '600',
                        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
                      }}
                    >
                      Start Using CityVaultreact-intersection-observe
                    </Button> */}
                  </motion.div>
                </div>
              </motion.div>
            </AnimatedSection>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;