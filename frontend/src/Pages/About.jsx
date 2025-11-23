// Pages/About.jsx
import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
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
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5
    }
  },
  hover: {
    scale: 1.02,
    y: -5,
    transition: {
      duration: 0.3
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

const About = () => {
  const features = [
    {
      icon: '🔐',
      title: 'Secure',
      description: 'Blockchain-verified document storage with military-grade encryption and IPFS decentralized storage.'
    },
    {
      icon: '⚡',
      title: 'Efficient',
      description: 'Streamlined workflows with real-time tracking, notifications, and automated approval processes.'
    },
    {
      icon: '🌐',
      title: 'Transparent',
      description: 'Complete audit trail with immutable blockchain records and transparent governance.'
    },
    {
      icon: '💼',
      title: 'Role-Based',
      description: 'Customized dashboards for Users, HODs, and Commissioners with hierarchical access control.'
    },
    {
      icon: '💰',
      title: 'Cost Effective',
      description: 'Built on Polygon network with optimized gas fees and efficient smart contract operations.'
    },
    {
      icon: '🛡️',
      title: 'Immutable',
      description: 'Once recorded, documents cannot be altered or tampered with, ensuring data integrity.'
    }
  ];

  const stats = [
    { number: '100%', label: 'Secure', icon: '🔒' },
    { number: '24/7', label: 'Available', icon: '⏱️' },
    { number: '0%', label: 'Downtime', icon: '🚀' },
    { number: '1000+', label: 'Transactions', icon: '📊' }
  ];

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0c0c2b 0%, #1a1a3e 50%, #0c0c2b 100%)',
      padding: '2rem 0'
    }}>
      <Container className="py-5">
        {/* Header Section */}
        <Row className="justify-content-center mb-5">
          <Col lg={10}>
            <AnimatedSection>
              <motion.div
                className="text-center"
                variants={itemVariants}
              >
                <motion.h1 
                  className="display-4 fw-bold text-white mb-4"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  About CityVault
                </motion.h1>
                <motion.p 
                  className="lead text-white-50 mb-4"
                  variants={itemVariants}
                >
                  Revolutionizing government document management with blockchain technology and decentralized storage
                </motion.p>
              </motion.div>
            </AnimatedSection>
          </Col>
        </Row>

        {/* Main Content Card */}
        <Row className="justify-content-center mb-5">
          <Col lg={10}>
            <AnimatedSection delay={0.2}>
              <motion.div
                variants={cardVariants}
                whileHover="hover"
              >
                <Card 
                  className="border-0"
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
                  <Card.Body className="p-5">
                    <Row className="align-items-center">
                      <Col lg={6}>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          <h3 className="text-white mb-4">
                            The Future of Document Management is Here
                          </h3>
                          <p className="text-white-50 lead mb-4">
                            CityVault is a cutting-edge document management system that leverages 
                            blockchain technology and IPFS to provide secure, transparent, and 
                            efficient government workflows on the Polygon network.
                          </p>
                          <p className="text-white-50">
                            Our platform ensures that every document is securely stored, easily 
                            accessible, and completely tamper-proof through the power of 
                            decentralized technology.
                          </p>
                        </motion.div>
                      </Col>
                      <Col lg={6} className="text-center">
                        <motion.div
                          animate={{
                            y: [0, -10, 0],
                            rotate: [0, 2, 0, -2, 0]
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <div 
                            className="p-4 mx-auto"
                            style={{
                              background: 'rgba(255, 255, 255, 0.05)',
                              borderRadius: '15px',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              maxWidth: '200px'
                            }}
                          >
                            <div className="fs-1">🏛️</div>
                            <p className="text-white-50 mb-0 mt-2">Government Grade Security</p>
                          </div>
                        </motion.div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </motion.div>
            </AnimatedSection>
          </Col>
        </Row>

        {/* Stats Section */}
        <Row className="justify-content-center mb-5">
          <Col lg={10}>
            <AnimatedSection delay={0.3}>
              <motion.div
                className="text-center mb-4"
                variants={itemVariants}
              >
                <h3 className="text-white mb-4">Why Cities Trust CityVault</h3>
              </motion.div>
            </AnimatedSection>
            
            <Row className="g-4">
              {stats.map((stat, index) => (
                <Col lg={3} md={6} key={stat.label}>
                  <AnimatedSection delay={0.4 + index * 0.1}>
                    <motion.div
                      variants={cardVariants}
                      whileHover="hover"
                    >
                      <Card 
                        className="border-0 text-center h-100"
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '15px'
                        }}
                      >
                        <Card.Body className="p-4">
                          <motion.div 
                            className="fs-2 mb-2"
                            animate={{
                              scale: [1, 1.1, 1]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            {stat.icon}
                          </motion.div>
                          <motion.h4 
                            className="text-white mb-2"
                            style={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent'
                            }}
                          >
                            {stat.number}
                          </motion.h4>
                          <p className="text-white-50 mb-0 small">{stat.label}</p>
                        </Card.Body>
                      </Card>
                    </motion.div>
                  </AnimatedSection>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>

        {/* Features Grid */}
        <Row className="justify-content-center">
          <Col lg={10}>
            <AnimatedSection delay={0.5}>
              <motion.div
                className="text-center mb-5"
                variants={itemVariants}
              >
                <h3 className="text-white mb-4">Key Features</h3>
                <p className="text-white-50">
                  Everything you need for modern document management
                </p>
              </motion.div>
            </AnimatedSection>

            <Row className="g-4">
              {features.map((feature, index) => (
                <Col lg={4} md={6} key={feature.title}>
                  <AnimatedSection delay={0.6 + index * 0.1}>
                    <motion.div
                      variants={cardVariants}
                      whileHover="hover"
                    >
                      <Card 
                        className="border-0 h-100"
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '15px'
                        }}
                      >
                        <Card.Body className="p-4 text-center">
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
                          <h5 
                            className="text-white mb-3"
                            style={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent'
                            }}
                          >
                            {feature.title}
                          </h5>
                          <p className="text-white-50 mb-0">
                            {feature.description}
                          </p>
                        </Card.Body>
                      </Card>
                    </motion.div>
                  </AnimatedSection>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>

        {/* Mission Statement */}
        <Row className="justify-content-center mt-5">
          <Col lg={8}>
            <AnimatedSection delay={0.8}>
              <motion.div
                className="text-center"
                variants={itemVariants}
              >
                <div 
                  className="p-5"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <motion.h4 
                    className="text-white mb-4"
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    Our Mission
                  </motion.h4>
                  <p className="text-white-50 lead mb-0">
                    To transform government document management through blockchain technology, 
                    making it more secure, transparent, and efficient for citizens and 
                    administrators alike.
                  </p>
                </div>
              </motion.div>
            </AnimatedSection>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default About;