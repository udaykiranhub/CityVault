// // components/AdminAuthModal/AdminAuthModal.jsx
// import React, { useState, useEffect } from 'react';
// import { Modal, Form, Button, Alert, Tab, Tabs, Spinner, Card } from 'react-bootstrap';
// import { authService } from '../../services/auth';
// import { adminAuthService } from '../../services/adminAuth';

// const AdminAuthModal = ({ show, onHide, onLoginSuccess }) => {
//   const [activeTab, setActiveTab] = useState('login');
//   const [formData, setFormData] = useState({
//     name: '',
//     phone: '',
//     password: '',
//     confirmPassword: ''
//   });
//   const [otpData, setOtpData] = useState({ phone: '', otp: '' });
//   const [step, setStep] = useState('credentials');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [message, setMessage] = useState('');

//   useEffect(() => {
//     const checkAdminExists = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         if (token) {
//           setActiveTab('login');
//         }
//       } catch (err) {
//         console.log('No existing admin session');
//       }
//     };
    
//     if (show) {
//       checkAdminExists();
//     }
//   }, [show]);

//   const handleInputChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleOtpChange = (e) => {
//     setOtpData({
//       ...otpData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleAdminRegister = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     if (formData.password !== formData.confirmPassword) {
//       setError("Passwords don't match");
//       setLoading(false);
//       return;
//     }

//     try {
//       const response = await adminAuthService.registerAdmin(formData);
//       setMessage('Admin registered successfully! Please login.');
//       setActiveTab('login');
//       setFormData({ name: '', phone: '', password: '', confirmPassword: '' });
//     } catch (err) {
//       if (err.response?.data?.message?.includes('already exists')) {
//         setError('Admin already exists. Please login instead.');
//         setActiveTab('login');
//       } else {
//         setError(err.response?.data?.message || 'Admin registration failed.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAdminLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       const response = await authService.login({
//         phone: formData.phone,
//         password: formData.password
//       });
//       setOtpData({ ...otpData, phone: formData.phone });
//       setStep('otp');
//       setMessage('OTP sent to your registered phone number.');
//     } catch (err) {
//       setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVerifyOtp = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       const response = await authService.verifyOtp(otpData);
      
//       if (response.role !== 'Admin') {
//         setError('Access denied. Admin privileges required.');
//         return;
//       }

//       onLoginSuccess(response, response.token);
//       setStep('credentials');
//       setOtpData({ phone: '', otp: '' });
//       setFormData({ name: '', phone: '', password: '', confirmPassword: '' });
//     } catch (err) {
//       setError(err.response?.data?.message || 'OTP verification failed.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleClose = () => {
//     setStep('credentials');
//     setError('');
//     setMessage('');
//     setActiveTab('login');
//     onHide();
//   };

//   return (
//     <Modal show={show} onHide={handleClose} centered size="md" className="admin-auth-modal">
//       <Modal.Header closeButton className="modal-header-admin">
//         <Modal.Title className="text-dark fw-bold">
//           {step === 'credentials' ? '👑 Admin Portal' : '📱 Verify OTP'}
//         </Modal.Title>
//       </Modal.Header>
      
//       <Modal.Body className="modal-body-admin p-4">
//         {error && <Alert variant="danger" className="small mb-3">{error}</Alert>}
//         {message && <Alert variant="success" className="small mb-3">{message}</Alert>}

//         {step === 'credentials' ? (
//           <Card className="border-0 shadow-sm">
//             <Card.Body className="p-0">
//               <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-0" fill>
//                 <Tab eventKey="login" title="🛡️ Admin Login" className="border-0">
//                   <div className="p-4">
//                     <Form onSubmit={handleAdminLogin}>
//                       <Form.Group className="mb-3">
//                         <Form.Label>📞 Admin Phone</Form.Label>
//                         <Form.Control
//                           type="text"
//                           name="phone"
//                           value={formData.phone}
//                           onChange={handleInputChange}
//                           placeholder="Enter admin phone number"
//                           required
//                         />
//                       </Form.Group>
//                       <Form.Group className="mb-4">
//                         <Form.Label>🔒 Password</Form.Label>
//                         <Form.Control
//                           type="password"
//                           name="password"
//                           value={formData.password}
//                           onChange={handleInputChange}
//                           placeholder="Enter admin password"
//                           required
//                         />
//                       </Form.Group>
//                       <Button type="submit" className="w-100 admin-auth-button py-2" disabled={loading}>
//                         {loading ? <Spinner size="sm" /> : '🛡️ Admin Login & Send OTP'}
//                       </Button>
//                     </Form>
//                   </div>
//                 </Tab>

//                 <Tab eventKey="register" title="⚙️ Setup Admin" className="border-0">
//                   <div className="p-4">
//                     <Alert variant="warning" className="small">
//                       Only one admin account is allowed. This is for initial setup.
//                     </Alert>
//                     <Form onSubmit={handleAdminRegister}>
//                       <Form.Group className="mb-3">
//                         <Form.Label>👤 Admin Name</Form.Label>
//                         <Form.Control
//                           type="text"
//                           name="name"
//                           value={formData.name}
//                           onChange={handleInputChange}
//                           placeholder="Enter admin full name"
//                           required
//                         />
//                       </Form.Group>
//                       <Form.Group className="mb-3">
//                         <Form.Label>📞 Phone Number</Form.Label>
//                         <Form.Control
//                           type="text"
//                           name="phone"
//                           value={formData.phone}
//                           onChange={handleInputChange}
//                           placeholder="Enter admin phone number"
//                           required
//                         />
//                       </Form.Group>
//                       <Form.Group className="mb-3">
//                         <Form.Label>🔒 Password</Form.Label>
//                         <Form.Control
//                           type="password"
//                           name="password"
//                           value={formData.password}
//                           onChange={handleInputChange}
//                           placeholder="Set admin password"
//                           required
//                         />
//                       </Form.Group>
//                       <Form.Group className="mb-4">
//                         <Form.Label>✅ Confirm Password</Form.Label>
//                         <Form.Control
//                           type="password"
//                           name="confirmPassword"
//                           value={formData.confirmPassword}
//                           onChange={handleInputChange}
//                           placeholder="Confirm admin password"
//                           required
//                         />
//                       </Form.Group>
//                       <Button type="submit" className="w-100 admin-auth-button py-2" disabled={loading}>
//                         {loading ? <Spinner size="sm" /> : '⚙️ Setup Admin Account'}
//                       </Button>
//                     </Form>
//                   </div>
//                 </Tab>
//               </Tabs>
//             </Card.Body>
//           </Card>
//         ) : (



//           <Card className="border-0 shadow-sm">
//             <Card.Body className="p-4 text-center">
//               <div className="mb-3">📱</div>
//               <h5 className="text-dark mb-3">Admin Verification</h5>
//               <p className="text-muted mb-4">OTP sent to <strong>{otpData.phone}</strong></p>
//               <Form onSubmit={handleVerifyOtp}>
//                 <Form.Group className="mb-4">
//                   <Form.Control
//                     type="text"
//                     name="otp"
//                     value={otpData.otp}
//                     onChange={handleOtpChange}
//                     placeholder=""
//                     required
//                     className="text-center fs-3 fw-bold"
//                     style={{letterSpacing: '0.5em'}}
//                     maxLength={6}
//                   />
//                 </Form.Group>
//                 <Button type="submit" className="w-100 admin-auth-button py-2" disabled={loading}>
//                   {loading ? <Spinner size="sm" /> : '🛡️ Verify OTP & Login'}
//                 </Button>
//               </Form>
//             </Card.Body>
//           </Card>




//         )}
//       </Modal.Body>
//     </Modal>
//   );
// };

// export default AdminAuthModal;


// components/AdminAuthModal/AdminAuthModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Tab, Tabs, Spinner, Card } from 'react-bootstrap';
import { authService } from '../../services/auth';
import { adminAuthService } from '../../services/adminAuth';

const AdminAuthModal = ({ show, onHide, onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [otpData, setOtpData] = useState({ phone: '', otp: '' });
  const [step, setStep] = useState('credentials');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkAdminExists = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          setActiveTab('login');
        }
      } catch (err) {
        console.log('No existing admin session');
      }
    };
    
    if (show) {
      checkAdminExists();
    }
  }, [show]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleOtpChange = (e) => {
    setOtpData({
      ...otpData,
      [e.target.name]: e.target.value
    });
  };

  // Handle tab selection with error clearing
  const handleTabSelect = (tabKey) => {
    setActiveTab(tabKey);
    // Clear errors when switching tabs
    setError('');
    setMessage('');
  };

  const handleAdminRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    console.log('📝 Starting admin registration...', formData);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    try {
      const response = await adminAuthService.registerAdmin(formData);
      console.log('✅ Admin registration success:', response);
      setMessage('Admin registered successfully! Please login.');
      setActiveTab('login');
      setFormData({ name: '', phone: '', password: '', confirmPassword: '' });
    } catch (err) {
      console.error('❌ Admin registration error:', {
        response: err.response,
        message: err.message,
        data: err.response?.data
      });
      
      // Show specific error message from backend
      const errorMessage = err.response?.data?.message || 'Admin registration failed. Please try again.';
      setError(errorMessage);
      
      // If admin already exists, switch to login tab
      if (errorMessage.includes('already exists') || errorMessage.includes('already registered')) {
        setActiveTab('login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    console.log('📝 Starting admin login...', { phone: formData.phone });

    try {
      const response = await authService.login({
        phone: formData.phone,
        password: formData.password
      });
      console.log('✅ Admin login OTP sent:', response);
      setOtpData({ ...otpData, phone: formData.phone });
      setStep('otp');
      setMessage('OTP sent to your registered phone number.');
    } catch (err) {
      console.error('❌ Admin login error:', {
        response: err.response,
        message: err.message,
        data: err.response?.data
      });
      
      // Show specific error message from backend
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    console.log('📝 Verifying OTP...', otpData);

    try {
      const response = await authService.verifyOtp(otpData);
      console.log('✅ OTP verification success:', response);
      
      // Check if the logged-in user is actually an admin
      if (response.role !== 'Admin') {
        setError('Access denied. Admin privileges required. Please use the User Login for non-admin accounts.');
        return;
      }

      onLoginSuccess(response, response.token);
      setStep('credentials');
      setOtpData({ phone: '', otp: '' });
      setFormData({ name: '', phone: '', password: '', confirmPassword: '' });
    } catch (err) {
      console.error('❌ OTP verification error:', {
        response: err.response,
        message: err.message,
        data: err.response?.data
      });
      
      // Show specific error message from backend
      const errorMessage = err.response?.data?.message || 'OTP verification failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('credentials');
    setError('');
    setMessage('');
    setActiveTab('login');
    setFormData({ name: '', phone: '', password: '', confirmPassword: '' });
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="md" className="admin-auth-modal">
      <Modal.Header closeButton className="modal-header-admin">
        <Modal.Title className="text-dark fw-bold">
          {step === 'credentials' ? '👑 Admin Portal' : '📱 Verify OTP'}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="modal-body-admin p-4">
        {/* Error Alert - Stays visible until cleared */}
        {error && (
          <Alert variant="danger" className="small mb-3" dismissible onClose={() => setError('')}>
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </Alert>
        )}
        
        {/* Success Message */}
        {message && (
          <Alert variant="success" className="small mb-3" dismissible onClose={() => setMessage('')}>
            <i className="bi bi-check-circle-fill me-2"></i>
            {message}
          </Alert>
        )}

        {step === 'credentials' ? (
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              <Tabs 
                activeKey={activeTab} 
                onSelect={handleTabSelect} 
                className="mb-0" 
                fill
              >
                <Tab eventKey="login" title="🛡️ Admin Login" className="border-0">
                  <div className="p-4">
                    <Form onSubmit={handleAdminLogin}>
                      <Form.Group className="mb-3">
                        <Form.Label className="form-label-custom">📞 Admin Phone</Form.Label>
                        <Form.Control
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Enter admin phone number"
                          required
                          className="form-control-custom"
                        />
                      </Form.Group>
                      <Form.Group className="mb-4">
                        <Form.Label className="form-label-custom">🔒 Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Enter admin password"
                          required
                          className="form-control-custom"
                        />
                      </Form.Group>
                      <Button 
                        type="submit" 
                        className="w-100 admin-auth-button py-2 fw-semibold" 
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-shield-check me-2"></i>
                            Admin Login & Send OTP
                          </>
                        )}
                      </Button>
                    </Form>
                  </div>
                </Tab>

                <Tab eventKey="register" title="⚙️ Setup Admin" className="border-0">
                  <div className="p-4">
                    <Alert variant="warning" className="small mb-3">
                      <i className="bi bi-info-circle me-2"></i>
                      Only one admin account is allowed. This is for initial setup.
                    </Alert>
                    <Form onSubmit={handleAdminRegister}>
                      <Form.Group className="mb-3">
                        <Form.Label className="form-label-custom">👤 Admin Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter admin full name"
                          required
                          className="form-control-custom"
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label className="form-label-custom">📞 Phone Number</Form.Label>
                        <Form.Control
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Enter admin phone number"
                          required
                          className="form-control-custom"
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label className="form-label-custom">🔒 Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Set admin password (min 8 characters)"
                          required
                          className="form-control-custom"
                        />
                        <Form.Text className="text-muted small">
                          Minimum 8 characters
                        </Form.Text>
                      </Form.Group>
                      <Form.Group className="mb-4">
                        <Form.Label className="form-label-custom">✅ Confirm Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="Confirm admin password"
                          required
                          className="form-control-custom"
                        />
                      </Form.Group>
                      <Button 
                        type="submit" 
                        className="w-100 admin-auth-button py-2 fw-semibold" 
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Setting up Admin...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-person-check me-2"></i>
                            Setup Admin Account
                          </>
                        )}
                      </Button>
                    </Form>
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        ) : (
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4 text-center">
              <div className="otp-icon mb-3">
                <i className="bi bi-shield-lock" style={{fontSize: '3rem', color: '#ffc107'}}></i>
              </div>
              <h5 className="text-dark mb-3">Admin Verification</h5>
              <p className="text-muted mb-4">
                We've sent a 6-digit OTP to <strong>{otpData.phone}</strong>
              </p>
              
              <Form onSubmit={handleVerifyOtp}>
                <Form.Group className="mb-4">
                  <Form.Control
                    type="text"
                    name="otp"
                    value={otpData.otp}
                    onChange={handleOtpChange}
                    placeholder=""
                    required
                    className="form-control-custom text-center fs-3 fw-bold"
                    style={{letterSpacing: '0.5em'}}
                    maxLength={6}
                  />
                </Form.Group>
                <Button 
                  type="submit" 
                  className="w-100 admin-auth-button py-2 fw-semibold" 
                  disabled={loading || otpData.otp.length !== 6}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-shield-check me-2"></i>
                      Verify OTP & Login
                    </>
                  )}
                </Button>
              </Form>
              
              <div className="mt-3">
                <Button 
                  variant="link" 
                  className="text-muted small"
                  onClick={() => {
                    setStep('credentials');
                    setError('');
                    setMessage('');
                  }}
                >
                  <i className="bi bi-arrow-left me-1"></i>
                  Back to Admin Login
                </Button>
              </div>
            </Card.Body>
          </Card>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default AdminAuthModal;