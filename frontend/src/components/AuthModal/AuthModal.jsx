// // components/AuthModal/AuthModal.jsx
// import React, { useState } from 'react';
// import { Modal, Form, Button, Alert, Spinner, Card } from 'react-bootstrap';
// import { authService } from '../../services/auth';

// const AuthModal = ({ show, onHide, onLoginSuccess }) => {
//   const [formData, setFormData] = useState({
//     phone: '',
//     password: '',
//   });
//   const [otpData, setOtpData] = useState({ phone: '', otp: '' });
//   const [step, setStep] = useState('credentials');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [message, setMessage] = useState('');

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

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//     console.log('📝 User login attempt...', { phone: formData.phone });

//     try {
//       const response = await authService.login({
//         phone: formData.phone,
//         password: formData.password
//       });
//       console.log('✅ Login OTP sent:', response);
//       setOtpData({ ...otpData, phone: formData.phone });
//       setStep('otp');
//       setMessage('OTP sent to your registered phone number.');
//     } catch (err) {
//       console.error('❌ Login error:', err);
//       setError(err.response?.data?.message || 'Login failed. Please check your credentials provided by admin.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVerifyOtp = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//     console.log('📝 Verifying OTP...', otpData);

//     try {
//       const response = await authService.verifyOtp(otpData);
//       console.log('✅ OTP verification success:', response);
      
//       // Prevent admin login through user modal
//       if (response.role === 'Admin') {
//         setError('Please use Admin portal for admin login.');
//         return;
//       }

//       onLoginSuccess(response, response.token);
//       setStep('credentials');
//       setOtpData({ phone: '', otp: '' });
//       setFormData({ phone: '', password: '' });
//     } catch (err) {
//       console.error('❌ OTP verification error:', err);
//       setError(err.response?.data?.message || 'OTP verification failed.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleClose = () => {
//     setStep('credentials');
//     setError('');
//     setMessage('');
//     setFormData({ phone: '', password: '' });
//     onHide();
//   };

//   return (
//     <Modal 
//       show={show} 
//       onHide={handleClose} 
//       centered 
//       size="md"
//       className="auth-modal"
//     >
//       <Modal.Header closeButton className="modal-header-custom">
//         <Modal.Title className="text-dark fw-bold">
//           {step === 'credentials' ? '🔐 User Login' : '📱 Verify OTP'}
//         </Modal.Title>
//       </Modal.Header>
      
//       <Modal.Body className="modal-body-custom p-4">
//         {error && (
//           <Alert variant="danger" className="small mb-3 border-0 shadow-sm">
//             <i className="bi bi-exclamation-triangle-fill me-2"></i>
//             {error}
//           </Alert>
//         )}
//         {message && (
//           <Alert variant="success" className="small mb-3 border-0 shadow-sm">
//             <i className="bi bi-check-circle-fill me-2"></i>
//             {message}
//           </Alert>
//         )}

//         {step === 'credentials' ? (
//           <Card className="border-0 shadow-sm">
//             <Card.Body className="p-4">
//               <Alert variant="info" className="small">
//                 <i className="bi bi-info-circle me-2"></i>
//                 Use credentials provided by your administrator
//               </Alert>
              
//               <Form onSubmit={handleLogin}>
//                 <Form.Group className="mb-3">
//                   <Form.Label className="form-label-custom">📞 Phone Number</Form.Label>
//                   <Form.Control
//                     type="text"
//                     name="phone"
//                     value={formData.phone}
//                     onChange={handleInputChange}
//                     placeholder="Enter your phone number"
//                     required
//                     className="form-control-custom"
//                   />
//                 </Form.Group>

//                 <Form.Group className="mb-4">
//                   <Form.Label className="form-label-custom">🔒 Password</Form.Label>
//                   <Form.Control
//                     type="password"
//                     name="password"
//                     value={formData.password}
//                     onChange={handleInputChange}
//                     placeholder="Enter your password"
//                     required
//                     className="form-control-custom"
//                   />
//                 </Form.Group>

//                 <Button 
//                   type="submit" 
//                   className="w-100 auth-button py-2 fw-semibold"
//                   disabled={loading}
//                 >
//                   {loading ? (
//                     <>
//                       <Spinner animation="border" size="sm" className="me-2" />
//                       Processing...
//                     </>
//                   ) : (
//                     <>
//                       <i className="bi bi-send-check me-2"></i>
//                       Login & Send OTP
//                     </>
//                   )}
//                 </Button>
//               </Form>
//             </Card.Body>
//           </Card>
//         ) : (
//           <Card className="border-0 shadow-sm">
//             <Card.Body className="p-4 text-center">
//               <div className="otp-icon mb-3">
//                 <i className="bi bi-phone" style={{fontSize: '3rem', color: '#0d6efd'}}></i>
//               </div>
//               <h5 className="text-dark mb-3">Enter Verification Code</h5>
//               <p className="text-muted mb-4">
//                 We've sent a 6-digit OTP to <strong>{otpData.phone}</strong>
//               </p>
              
//               <Form onSubmit={handleVerifyOtp}>
//                 <Form.Group className="mb-4">
//                   <Form.Control
//                     type="text"
//                     name="otp"
//                     value={otpData.otp}
//                     onChange={handleOtpChange}
//                     placeholder=""
//                     required
//                     className="form-control-custom text-center fs-3 fw-bold"
//                     style={{letterSpacing: '0.5em'}}
//                     maxLength={6}
//                   />
//                 </Form.Group>

//                 <Button 
//                   type="submit" 
//                   className="w-100 auth-button py-2 fw-semibold"
//                   disabled={loading}
//                 >
//                   {loading ? (
//                     <>
//                       <Spinner animation="border" size="sm" className="me-2" />
//                       Verifying...
//                     </>
//                   ) : (
//                     <>
//                       <i className="bi bi-shield-check me-2"></i>
//                       Verify OTP
//                     </>
//                   )}
//                 </Button>
//               </Form>
              
//               <div className="mt-3">
//                 <Button 
//                   variant="link" 
//                   className="text-muted small"
//                   onClick={() => setStep('credentials')}
//                 >
//                   <i className="bi bi-arrow-left me-1"></i>
//                   Back to Login
//                 </Button>
//               </div>
//             </Card.Body>
//           </Card>
//         )}
//       </Modal.Body>
//     </Modal>
//   );
// };

// export default AuthModal;



// components/AuthModal/AuthModal.jsx
import React, { useState } from 'react';
import { Modal, Form, Button, Alert, Spinner, Card } from 'react-bootstrap';
import { authService } from '../../services/auth';

const AuthModal = ({ show, onHide, onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });
  const [otpData, setOtpData] = useState({ phone: '', otp: '' });
  const [step, setStep] = useState('credentials');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleOtpChange = (e) => {
    setOtpData({
      ...otpData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    console.log('📝 User login attempt...', { phone: formData.phone });

    try {
      const response = await authService.login({
        phone: formData.phone,
        password: formData.password
      });
      console.log('✅ Login OTP sent:', response);
      setOtpData({ ...otpData, phone: formData.phone });
      setStep('otp');
      setMessage('OTP sent to your registered phone number.');
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials provided by admin.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    console.log('📝 Verifying OTP...', otpData);

    try {
      const response = await authService.verifyOtp(otpData);
      console.log('✅ OTP verification success:', response);
      
      // Prevent admin login through user modal
      if (response.role === 'Admin') {
        setError('Please use Admin portal for admin login.');
        return;
      }

      // ✅ FIXED: Include department in user data
      const userData = {
        id: response.id || response.user?.id,
        name: response.name || response.user?.name,
        phone: response.phone || response.user?.phone,
        role: response.role || response.user?.role,
        department: response.department || response.user?.department, // Include department
        email: response.email || response.user?.email,
        token: response.token
      };

      console.log('👤 User data to pass to dashboard:', userData);
      
      onLoginSuccess(userData, response.token);
      setStep('credentials');
      setOtpData({ phone: '', otp: '' });
      setFormData({ phone: '', password: '' });
    } catch (err) {
      console.error('❌ OTP verification error:', err);
      setError(err.response?.data?.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('credentials');
    setError('');
    setMessage('');
    setFormData({ phone: '', password: '' });
    onHide();
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      centered 
      size="md"
      className="auth-modal"
    >
      <Modal.Header closeButton className="modal-header-custom">
        <Modal.Title className="text-dark fw-bold">
          {step === 'credentials' ? '🔐 User Login' : '📱 Verify OTP'}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="modal-body-custom p-4">
        {error && (
          <Alert variant="danger" className="small mb-3 border-0 shadow-sm">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </Alert>
        )}
        {message && (
          <Alert variant="success" className="small mb-3 border-0 shadow-sm">
            <i className="bi bi-check-circle-fill me-2"></i>
            {message}
          </Alert>
        )}

        {step === 'credentials' ? (
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <Alert variant="info" className="small">
                <i className="bi bi-info-circle me-2"></i>
                Use credentials provided by your administrator
              </Alert>
              
              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-custom">📞 Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
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
                    placeholder="Enter your password"
                    required
                    className="form-control-custom"
                  />
                </Form.Group>

                <Button 
                  type="submit" 
                  className="w-100 auth-button py-2 fw-semibold"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send-check me-2"></i>
                      Login & Send OTP
                    </>
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        ) : (
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4 text-center">
              <div className="otp-icon mb-3">
                <i className="bi bi-phone" style={{fontSize: '3rem', color: '#0d6efd'}}></i>
              </div>
              <h5 className="text-dark mb-3">Enter Verification Code</h5>
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
                  className="w-100 auth-button py-2 fw-semibold"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-shield-check me-2"></i>
                      Verify OTP
                    </>
                  )}
                </Button>
              </Form>
              
              <div className="mt-3">
                <Button 
                  variant="link" 
                  className="text-muted small"
                  onClick={() => setStep('credentials')}
                >
                  <i className="bi bi-arrow-left me-1"></i>
                  Back to Login
                </Button>
              </div>
            </Card.Body>
          </Card>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default AuthModal;