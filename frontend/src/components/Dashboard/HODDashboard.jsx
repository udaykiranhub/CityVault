// components/Dashboard/HODDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, Row, Col, Card, Button, Modal, Form, 
  Alert, Spinner, Badge, ProgressBar, Table
} from 'react-bootstrap';
import Web3 from 'web3';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../../Utils/constants";
import { useLocation, useNavigate } from 'react-router-dom';

const HODDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { phone, department: loginDepartment } = location.state || {};
  
  console.log("🔍 Location state received in HOD-DB:", { phone, department: loginDepartment });

  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userDepartment, setUserDepartment] = useState(loginDepartment || '');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [registrationChecked, setRegistrationChecked] = useState(false);

  // HOD Dashboard States
  const [files, setFiles] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalFiles: 0,
    pendingReview: 0,
    sentBack: 0,
    approved: 0,
    resubmitted: 0
  });

  const [activeTab, setActiveTab] = useState('all');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [reviewData, setReviewData] = useState({
    status: '',
    remark: ''
  });
  const [actionLoading, setActionLoading] = useState(false);

  // File Status Constants
  const FILE_STATUS = {
    Provided: 0,
    UnderHODReview: 1,
    SemBack: 2,
    ApprovedByHOD: 3,
    Resubmitted: 4
  };

  const STATUS_CONFIG = {
    0: { label: 'Uploaded', variant: 'secondary', icon: '📤' },
    1: { label: 'Under Review', variant: 'warning', icon: '👀' },
    2: { label: 'Sent Back', variant: 'danger', icon: '↩️' },
    3: { label: 'Approved', variant: 'success', icon: '✅' },
    4: { label: 'Resubmitted', variant: 'info', icon: '🔄' }
  };

  // Filter out harmless console errors
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      if (args[0] && args[0].includes('decimals') && args[0].includes('execution reverted')) {
        console.warn('⚠️ MetaMask token detection failed - This is normal for non-token contracts');
        return;
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  // Connect Wallet
  const connectWallet = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔗 Connecting wallet...');

      if (!window.ethereum) {
        throw new Error('Please install MetaMask!');
      }

      const web3Instance = new Web3(window.ethereum);
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      const contractInstance = new web3Instance.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
      
      setWeb3(web3Instance);
      setAccount(accounts[0]);
      setContract(contractInstance);
      setIsConnected(true);

      console.log('✅ Wallet connected:', accounts[0]);
      await checkUserRegistration(contractInstance, accounts[0]);
      
    } catch (error) {
      console.error('❌ Wallet connection error:', error);
      setError(error.message || 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  // Check user registration status
  const checkUserRegistration = async (contractInstance, userAddress) => {
    try {
      console.log('🔍 Checking user registration...');
      
      const role = await contractInstance.methods.getUserRole(userAddress).call();
      const hodDepartment = await contractInstance.methods.getUserDepartment(userAddress).call();
      
      const roleNumber = parseInt(role);
      console.log('📊 User role from blockchain:', roleNumber);
      console.log('🏢 HOD Department from blockchain:', hodDepartment);
      console.log('🏢 Department from login:', loginDepartment);
      
      setUserRole(roleNumber);
      
      // Priority: Blockchain department > Login department
      if (hodDepartment && hodDepartment !== "None" && hodDepartment !== "") {
        setUserDepartment(hodDepartment);
        console.log('✅ Using department from blockchain:', hodDepartment);
      } else if (loginDepartment && loginDepartment !== "") {
        setUserDepartment(loginDepartment);
        console.log('ℹ️ Using department from login:', loginDepartment);
      } else {
        console.log('❌ No department found');
      }
      
      setRegistrationChecked(true);

      if (roleNumber === 2) {
        console.log('✅ User is registered HOD, loading dashboard...');
        await loadDashboardData();
      } else {
        console.log('ℹ️ User needs registration as HOD');
      }

    } catch (error) {
      console.error('❌ Registration check error:', error);
      setUserRole(null);
      setRegistrationChecked(true);
    }
  };

  // Register user as HOD
  const registerUser = async () => {
    try {
      setRegistrationLoading(true);
      console.log('📝 Registering as HOD...');
      console.log('🏢 Department for registration:', userDepartment);

      if (!userDepartment || userDepartment.trim() === '') {
        alert('Department information is required for HOD registration.');
        return;
      }

      // HOD role is 2 in the enum
      const transaction = await contract.methods.registerUser(2, userDepartment).send({ 
        from: account
      });
      
      console.log('✅ HOD Registration successful:', transaction);
      
      // Re-check registration status
      await checkUserRegistration(contract, account);
      alert('HOD Registration successful!');
      
    } catch (error) {
      console.error('❌ Registration error:', error);
      
      if (error.message && error.message.includes('AlreadyRegistered')) {
        console.log('ℹ️ User already registered, checking status...');
        await checkUserRegistration(contract, account);
      } else if (error.code === 4001) {
        alert('Registration cancelled by user');
      } else {
        alert('Registration failed: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setRegistrationLoading(false);
    }
  };

  // Load Dashboard Data
  const loadDashboardData = async () => {
    if (!contract || !account || userRole !== 2) return;

    try {
      setLoading(true);
      console.log('📊 Loading HOD dashboard data...');
      await Promise.all([
        fetchDepartmentFiles(),
        fetchDashboardStats()
      ]);
    } catch (error) {
      console.error('❌ Dashboard data loading error:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch only department-specific files
  const fetchDepartmentFiles = async () => {
    try {
      console.log('📂 Fetching department files for:', userDepartment);
      
      if (!userDepartment) {
        console.error('❌ No department specified for HOD');
        return;
      }

      const departmentFiles = [];
      let fileId = 1001;
      let maxAttempts = 100; // Safety limit to prevent infinite loops
      let attempts = 0;

      // Iterate through files until we find empty ones
      while (attempts < maxAttempts) {
        try {
          const file = await contract.methods.files(fileId).call();
          
          // Check if file exists and belongs to HOD's department
          if (file.id !== '0' && file.ipfsHash && file.ipfsHash !== '') {
            if (file.department === userDepartment) {
              // Get file name
              let fileName = `Document ${fileId}`;
              try {
                const name = await contract.methods.fileNames(fileId).call();
                if (name && name !== '') {
                  fileName = name;
                }
              } catch (err) {
                console.log(`No file name for ${fileId}`);
              }

              departmentFiles.push({
                id: fileId.toString(),
                ipfsHash: file.ipfsHash,
                fileName: fileName,
                status: file.status,
                uploadTimestamp: file.uploadTimestamp,
                lastUpdateTimestamp: file.lastUpdateTimestamp,
                owner: file.owner,
                department: file.department,
                hodRemark: file.hodRemark,
                viewLink: `https://ipfs.io/ipfs/${file.ipfsHash}`,
                downloadLink: `https://ipfs.io/ipfs/${file.ipfsHash}?download=1`
              });
            }
            fileId++;
            attempts = 0; // Reset attempts when we find a valid file
          } else {
            attempts++; // Increment attempts when file doesn't exist
            fileId++;
          }
        } catch (error) {
          attempts++;
          fileId++;
          continue;
        }
      }
      
      console.log('✅ Department files loaded:', departmentFiles.length);
      setFiles(departmentFiles);
      
    } catch (error) {
      console.error('❌ Error fetching department files:', error);
      setFiles([]);
    }
  };

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      console.log('📈 Fetching HOD dashboard stats...');
      
      const statsArray = await contract.methods.getHODDashboardStats().call({ from: account });
      
      const stats = {
        totalFiles: parseInt(statsArray[0]) || 0,
        pendingReview: parseInt(statsArray[1]) || 0,
        sentBack: parseInt(statsArray[2]) || 0,
        approved: parseInt(statsArray[3]) || 0,
        resubmitted: parseInt(statsArray[4]) || 0
      };
      
      console.log('📊 HOD Stats:', stats);
      setDashboardStats(stats);
      
    } catch (error) {
      console.error('❌ Stats fetch error:', error);
      // Fallback to manual calculation from files
      calculateStatsManually();
    }
  };

  // Manual stats calculation fallback
  const calculateStatsManually = () => {
    const stats = {
      totalFiles: files.length,
      pendingReview: files.filter(f => parseInt(f.status) === FILE_STATUS.UnderHODReview).length,
      sentBack: files.filter(f => parseInt(f.status) === FILE_STATUS.SemBack).length,
      approved: files.filter(f => parseInt(f.status) === FILE_STATUS.ApprovedByHOD).length,
      resubmitted: files.filter(f => parseInt(f.status) === FILE_STATUS.Resubmitted).length
    };
    
    console.log('📊 Manually calculated stats:', stats);
    setDashboardStats(stats);
  };

  // File review handler
  const handleReviewFile = (file) => {
    console.log('📝 Opening review modal for file:', file);
    setSelectedFile(file);
    setReviewData({
      status: '',
      remark: file.hodRemark || ''
    });
    setShowReviewModal(true);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!selectedFile || !reviewData.status) {
      alert('Please select a review action!');
      return;
    }

    try {
      setActionLoading(true);
      console.log('👨‍⚖️ Processing file review...');
      
      let statusValue;
      switch(reviewData.status) {
        case 'approve':
          statusValue = FILE_STATUS.ApprovedByHOD;
          break;
        case 'sendback':
          statusValue = FILE_STATUS.SemBack;
          break;
        case 'underreview':
          statusValue = FILE_STATUS.UnderHODReview;
          break;
        default:
          throw new Error('Invalid status');
      }

      console.log(`🔄 Setting file ${selectedFile.id} to status ${statusValue}`);
      
      const transaction = await contract.methods.reviewFile(
        selectedFile.id,
        statusValue,
        reviewData.remark
      ).send({ from: account });

      console.log('✅ Review successful:', transaction);
      
      setShowReviewModal(false);
      setSelectedFile(null);
      setReviewData({ status: '', remark: '' });
      
      // Refresh data
      setRefreshTrigger(prev => prev + 1);
      alert('Review submitted successfully!');
      
    } catch (error) {
      console.error('❌ Review error:', error);
      
      if (error.code === 4001) {
        alert('Review cancelled by user');
      } else if (error.message && error.message.includes('revert')) {
        alert('Review failed: You may not have permission to review this file or the file status is invalid.');
      } else {
        alert('Review failed: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setActionLoading(false);
    }
  };

  // UI Helpers
  const getStatusBadge = (status) => {
    const statusNum = parseInt(status);
    const config = STATUS_CONFIG[statusNum] || STATUS_CONFIG[0];
    return (
      <Badge bg={config.variant} className="d-flex align-items-center gap-1">
        <span>{config.icon}</span>
        {config.label}
      </Badge>
    );
  };

  const getReviewProgress = () => {
    const total = dashboardStats.totalFiles;
    if (total === 0) return 0;
    const reviewed = dashboardStats.approved + dashboardStats.sentBack + dashboardStats.resubmitted;
    return Math.round((reviewed / total) * 100);
  };

  const formatAddress = (address) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString();
  };

  // Filter files for tabs
  const getFilteredFiles = () => {
    switch(activeTab) {
      case 'pending':
        return files.filter(f => parseInt(f.status) === FILE_STATUS.UnderHODReview);
      case 'sentback':
        return files.filter(f => parseInt(f.status) === FILE_STATUS.SemBack);
      case 'approved':
        return files.filter(f => parseInt(f.status) === FILE_STATUS.ApprovedByHOD);
      case 'resubmitted':
        return files.filter(f => parseInt(f.status) === FILE_STATUS.Resubmitted);
      case 'all':
      default:
        return files;
    }
  };

  // Get action buttons based on file status
  const getActionButtons = (file) => {
    const status = parseInt(file.status);
    
    switch(status) {
      case FILE_STATUS.Provided:
      case FILE_STATUS.UnderHODReview:
      case FILE_STATUS.Resubmitted:
        return (
          <div className="d-flex gap-1 flex-wrap">
            <Button size="sm" variant="outline-success" onClick={() => handleReviewFile(file)}>
              Review
            </Button>
            <Button size="sm" variant="outline-info" href={file.viewLink} target="_blank">
              View
            </Button>
          </div>
        );
      
      case FILE_STATUS.SemBack:
        return (
          <div className="d-flex gap-1 flex-wrap">
            <Button size="sm" variant="outline-warning" onClick={() => handleReviewFile(file)}>
              Re-review
            </Button>
            <Button size="sm" variant="outline-info" href={file.viewLink} target="_blank">
              View
            </Button>
          </div>
        );
      
      case FILE_STATUS.ApprovedByHOD:
        return (
          <div className="d-flex gap-1 flex-wrap">
            <Button size="sm" variant="outline-success" disabled>Approved</Button>
            <Button size="sm" variant="outline-info" href={file.viewLink} target="_blank">
              View
            </Button>
            <Button size="sm" variant="outline-warning" onClick={() => handleReviewFile(file)}>
              Revoke
            </Button>
          </div>
        );
      
      default:
        return (
          <Button size="sm" variant="outline-info" href={file.viewLink} target="_blank">
            View
          </Button>
        );
    }
  };

  // Effects
  useEffect(() => {
    if (isConnected && contract && account && userRole === 2) {
      loadDashboardData();
    }
  }, [isConnected, contract, account, userRole, refreshTrigger]);

  // Auto-connect on component mount
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          const accounts = await web3Instance.eth.getAccounts();
          if (accounts.length > 0) {
            const contractInstance = new web3Instance.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
            setWeb3(web3Instance);
            setAccount(accounts[0]);
            setContract(contractInstance);
            setIsConnected(true);
            await checkUserRegistration(contractInstance, accounts[0]);
          }
        } catch (error) {
          console.error('Initial connection error:', error);
        }
      }
    };

    checkConnection();
  }, []);

  // Update stats when files change
  useEffect(() => {
    if (files.length > 0) {
      calculateStatsManually();
    }
  }, [files]);

  // Debug current state
  console.log('📊 Current HOD Dashboard State:', {
    isConnected,
    account,
    userRole,
    userDepartment,
    filesCount: files.length,
    dashboardStats,
    activeTab,
    registrationChecked
  });

  // Show loading while checking registration
  if (isConnected && !registrationChecked) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-light">Checking registration status...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  // Not connected state
  if (!isConnected) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <Card className="border-0 shadow">
              <Card.Body className="text-center p-5">
                <h3 className="mb-4">👨‍💼 HOD Portal</h3>
                <p className="text-muted mb-4">
                  Connect your wallet to access the HOD dashboard
                </p>
                
                {error && <Alert variant="danger">{error}</Alert>}
                
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-100"
                  onClick={connectWallet}
                  disabled={loading}
                >
                  {loading ? <Spinner size="sm" /> : 'Connect MetaMask'}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  // Not registered or wrong role state
  if (userRole !== 2) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="border-0 shadow">
              <Card.Body className="text-center p-5">
                <h3 className="mb-4">
                  {userRole === null || userRole === 0 ? 'HOD Registration Required' : 'Access Restricted'}
                </h3>
                
                <Card className="mb-4 bg-light">
                  <Card.Body>
                    <Row>
                      <Col>
                        <small className="text-muted">Wallet Address</small>
                        <div className="font-monospace">{formatAddress(account)}</div>
                      </Col>
                      <Col>
                        <small className="text-muted">Blockchain Role</small>
                        <div className={userRole === 2 ? 'text-success fw-bold' : 'text-warning'}>
                          {userRole === 2 ? 'HOD' : 
                           userRole === 1 ? 'User' : 
                           userRole === 3 ? 'Commissioner' : 'Not Registered'}
                        </div>
                      </Col>
                    </Row>
                    <Row className="mt-3">
                      <Col>
                        <small className="text-muted">Expected Role</small>
                        <div className="text-success fw-bold">HOD</div>
                      </Col>
                      <Col>
                        <small className="text-muted">Department</small>
                        <div className="text-info fw-bold">{userDepartment || 'Not Set'}</div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {(userRole === null || userRole === 0) && (
                  <div>
                    <p className="text-muted mb-3">
                      You need to register as HOD on the blockchain to access the dashboard.
                    </p>
                    <Button 
                      variant="success" 
                      size="lg"
                      onClick={registerUser}
                      disabled={registrationLoading || !userDepartment}
                      className="mb-3"
                    >
                      {registrationLoading ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          Registering...
                        </>
                      ) : (
                        'Register as HOD on Blockchain'
                      )}
                    </Button>
                    {!userDepartment && (
                      <Alert variant="warning" className="mt-3">
                        Department information is required for HOD registration.
                      </Alert>
                    )}
                  </div>
                )}
                
                {userRole === 1 && (
                  <Alert variant="warning">
                    Your wallet is registered as a regular User, not HOD. Please contact administrator.
                  </Alert>
                )}
                
                <div className="mt-3">
                  <Button variant="outline-secondary" onClick={connectWallet} className="me-2">
                    Switch Account
                  </Button>
                  <Button variant="outline-primary" onClick={() => navigate('/login')}>
                    Back to Login
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  // Main Dashboard - User is connected and registered as HOD
  return (
    <Container fluid className="py-4 app-container">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h2 className="mb-1 text-white">HOD Review Portal</h2>
              <p className="text-light mb-0">
                Document Review & Approval Dashboard
                {userDepartment && (
                  <span className="ms-2">• Department: <strong>{userDepartment}</strong></span>
                )}
              </p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Badge bg="success" className="fs-6">
                HOD: {formatAddress(account)}
              </Badge>
              {/* <Button 
                variant="outline-light" 
                size="sm"
                onClick={() => navigate('/login')}
              >
                Logout
              </Button> */}
            </div>
          </div>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col xl={2} md={4} className="mb-3">
          <Card className="h-100 border-0 neo-card">
            <Card.Body className="text-center">
              <h4 className="text-primary">{dashboardStats.totalFiles}</h4>
              <small className="text-light">Total Files</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={2} md={4} className="mb-3">
          <Card className="h-100 border-0 neo-card">
            <Card.Body className="text-center">
              <h4 className="text-warning">{dashboardStats.pendingReview}</h4>
              <small className="text-light">Pending Review</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={2} md={4} className="mb-3">
          <Card className="h-100 border-0 neo-card">
            <Card.Body className="text-center">
              <h4 className="text-danger">{dashboardStats.sentBack}</h4>
              <small className="text-light">Sent Back</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={2} md={4} className="mb-3">
          <Card className="h-100 border-0 neo-card">
            <Card.Body className="text-center">
              <h4 className="text-success">{dashboardStats.approved}</h4>
              <small className="text-light">Approved</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={2} md={4} className="mb-3">
          <Card className="h-100 border-0 neo-card">
            <Card.Body className="text-center">
              <h4 className="text-info">{dashboardStats.resubmitted}</h4>
              <small className="text-light">Resubmitted</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={2} md={4} className="mb-3">
          <Card className="h-100 border-0 neo-card">
            <Card.Body className="text-center">
              <h4 className="text-secondary">{getReviewProgress()}%</h4>
              <small className="text-light">Progress</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Progress Bar */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 neo-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0 text-white">Review Progress</h6>
                <Badge bg="primary">{getReviewProgress()}% Complete</Badge>
              </div>
              <ProgressBar 
                now={getReviewProgress()} 
                variant="success" 
                style={{ height: '10px' }}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Files Section */}
      <Row>
        <Col>
          <Card className="shadow-sm border-0 neo-card">
            <Card.Header className="bg-transparent py-3 border-secondary">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <h5 className="mb-0 d-flex align-items-center gap-2 text-white">
                  <span className="fs-5">📋</span>
                  Department Documents for Review
                </h5>
                <div className="d-flex gap-2">
                  <Button 
                    variant="outline-light" 
                    size="sm"
                    onClick={() => setRefreshTrigger(prev => prev + 1)}
                    disabled={loading}
                    className="d-flex align-items-center gap-1"
                  >
                    {loading ? <Spinner size="sm" /> : '🔄 Refresh'}
                  </Button>
                </div>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="position-relative">
                {/* Scrollable tabs container */}
                <div className="d-flex overflow-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <div className="d-flex flex-nowrap px-2 px-md-3 pt-3 gap-1" style={{ minWidth: 'max-content' }}>
                    {[
                      { key: 'all', label: 'All', icon: '📁', count: files.length, variant: 'secondary' },
                      { key: 'pending', label: 'Pending', icon: '⏳', count: dashboardStats.pendingReview, variant: 'warning' },
                      { key: 'sentback', label: 'Sent Back', icon: '↩️', count: dashboardStats.sentBack, variant: 'danger' },
                      { key: 'approved', label: 'Approved', icon: '✅', count: dashboardStats.approved, variant: 'success' },
                      { key: 'resubmitted', label: 'Resubmitted', icon: '🔄', count: dashboardStats.resubmitted, variant: 'info' }
                    ].map(tab => (
                      <Button
                        key={tab.key}
                        variant={activeTab === tab.key ? 'primary' : 'outline-light'}
                        size="sm"
                        onClick={() => setActiveTab(tab.key)}
                        className="d-flex align-items-center gap-1 flex-nowrap text-nowrap"
                        style={{ borderRadius: '20px' }}
                      >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                        <Badge bg={tab.variant} className="ms-1">
                          {tab.count}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </div>
                
                {/* Tab content */}
                <div className="mt-3">
                  <FileTable 
                    files={getFilteredFiles()}
                    loading={loading}
                    getStatusBadge={getStatusBadge}
                    getActionButtons={getActionButtons}
                    formatTimestamp={formatTimestamp}
                    formatAddress={formatAddress}
                  />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Review Modal */}
      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} centered size="lg">
        <Modal.Header closeButton className="bg-dark text-light">
          <Modal.Title>Review Document</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleReview}>
          <Modal.Body className="bg-dark">
            {selectedFile && (
              <>
                <Alert variant="info">
                  <strong>Reviewing:</strong> {selectedFile.fileName} (ID: {selectedFile.id})
                  <br />
                  <strong>Department:</strong> {selectedFile.department}
                  <br />
                  <strong>Uploaded By:</strong> {formatAddress(selectedFile.owner)}
                </Alert>
                
                <Form.Group className="mb-3">
                  <Form.Label className="text-light"><strong>Review Action</strong></Form.Label>
                  <div>
                    <Form.Check
                      type="radio"
                      name="status"
                      label="✅ Approve Document"
                      value="approve"
                      checked={reviewData.status === 'approve'}
                      onChange={(e) => setReviewData({...reviewData, status: e.target.value})}
                      className="mb-2 text-light"
                    />
                    <Form.Check
                      type="radio"
                      name="status"
                      label="↩️ Send Back for Revisions"
                      value="sendback"
                      checked={reviewData.status === 'sendback'}
                      onChange={(e) => setReviewData({...reviewData, status: e.target.value})}
                      className="mb-2 text-light"
                    />
                    <Form.Check
                      type="radio"
                      name="status"
                      label="👀 Mark Under Review"
                      value="underreview"
                      checked={reviewData.status === 'underreview'}
                      onChange={(e) => setReviewData({...reviewData, status: e.target.value})}
                      className="text-light"
                    />
                  </div>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label className="text-light"><strong>Remarks</strong></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={reviewData.remark}
                    onChange={(e) => setReviewData({...reviewData, remark: e.target.value})}
                    placeholder="Enter your remarks or feedback..."
                    className="bg-secondary border-0 text-light"
                  />
                </Form.Group>

                <div className="text-center">
                  <Button
                    variant="outline-light"
                    href={selectedFile.viewLink}
                    target="_blank"
                    className="mb-2"
                  >
                    📄 View Document
                  </Button>
                </div>
              </>
            )}
          </Modal.Body>
          <Modal.Footer className="bg-dark">
            <Button variant="outline-light" onClick={() => setShowReviewModal(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={actionLoading || !reviewData.status}
            >
              {actionLoading ? <Spinner size="sm" /> : 'Submit Review'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

// File Table Component with mobile optimization
const FileTable = ({ files, loading, getStatusBadge, getActionButtons, formatTimestamp, formatAddress }) => {
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-light">Loading documents...</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="text-muted mb-3" style={{ fontSize: '3rem' }}>📭</div>
        <h6 className="text-light">No documents found</h6>
        <p className="text-muted small">There are no documents in this category.</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Cards View */}
      <div className="d-block d-lg-none">
        {files.map((file) => (
          <Card key={file.id} className="mb-3 shadow-sm bg-dark text-light">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <h6 className="mb-1 text-primary">#{file.id}</h6>
                  <h6 className="mb-2 fw-bold">{file.fileName}</h6>
                </div>
                {getStatusBadge(file.status)}
              </div>
              
              <div className="mb-2">
                <small className="text-info">
                  <strong>Department:</strong> {file.department}
                </small>
              </div>
              
              {file.hodRemark && (
                <div className="mb-2">
                  <small className="text-warning">
                    <strong>Remark:</strong> {file.hodRemark}
                  </small>
                </div>
              )}
              
              <div className="row text-muted small mb-3">
                <div className="col-6">
                  <strong>Uploaded By:</strong><br />
                  {formatAddress(file.owner)}
                </div>
                <div className="col-6">
                  <strong>Last Updated:</strong><br />
                  {formatTimestamp(file.lastUpdateTimestamp)}
                </div>
              </div>
              
              <div className="d-flex gap-2 flex-wrap">
                {getActionButtons(file)}
              </div>
            </Card.Body>
          </Card>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="d-none d-lg-block">
        <div className="table-responsive">
          <Table hover className="mb-0 align-middle bg-dark text-light">
            <thead className="bg-secondary">
              <tr>
                <th className="border-0">ID</th>
                <th className="border-0">Document Name</th>
                <th className="border-0">Department</th>
                <th className="border-0">Uploaded By</th>
                <th className="border-0">Status</th>
                <th className="border-0">Last Updated</th>
                <th className="border-0">Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id}>
                  <td className="border-0">
                    <strong className="text-primary">#{file.id}</strong>
                  </td>
                  <td className="border-0">
                    <div className="fw-bold text-light">{file.fileName}</div>
                    {file.hodRemark && (
                      <small className="text-warning d-block mt-1">
                        <strong>Remark:</strong> {file.hodRemark}
                      </small>
                    )}
                  </td>
                  <td className="border-0">
                    <Badge bg="info">{file.department}</Badge>
                  </td>
                  <td className="border-0">
                    <small className="text-muted font-monospace">{formatAddress(file.owner)}</small>
                  </td>
                  <td className="border-0">{getStatusBadge(file.status)}</td>
                  <td className="border-0">
                    <small className="text-muted">{formatTimestamp(file.lastUpdateTimestamp)}</small>
                  </td>
                  <td className="border-0">{getActionButtons(file)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default HODDashboard;