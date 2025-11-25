
// components/Dashboard/UserDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Button, Modal, Form, 
  Table, Alert, Spinner, Badge, ProgressBar 
} from 'react-bootstrap';
import Web3 from 'web3';
import { useLocation } from 'react-router-dom';
import { uploadToIPFS } from "../../Utils/ipfs";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from  "../../Utils/constants";
import UserFilesDisplay from './UserFilesDisplay';
import { departmentService } from "../../services/department"; 

const UserDashboard = () => {
  const location = useLocation();
  const { phone, department } = location.state || {};
  
  console.log("🔍 Location state received:", { phone, department });
  
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userDepartment, setUserDepartment] = useState(department || '');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [showUploadModal, setShowUploadModal] = useState(false);
  // const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [userFiles, setUserFiles] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalFiles: 0,
    pendingReview: 0,
    sentBack: 0,
    approvedByHOD: 0,
    resubmitted: 0
  });
  const [uploadLoading, setUploadLoading] = useState(false);
  const [filesLoading, setFilesLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileStatus, setFileStatus] = useState({});
  // const [departmentInput, setDepartmentInput] = useState('');
  const [departmentLoading, setDepartmentLoading] = useState(false);

  // File status mapping with icons
  const fileStatusMap = {
    0: { text: 'Provided', variant: 'primary', icon: '📤' },
    1: { text: 'Under HOD Review', variant: 'warning', icon: '👀' },
    2: { text: 'Sent Back', variant: 'danger', icon: '↩️' },
    3: { text: 'Approved by HOD', variant: 'success', icon: '✅' },
    4: { text: 'Resubmitted', variant: 'info', icon: '🔄' }
  };

  // Fetch department if not available from location state
  useEffect(() => {
    const fetchDepartmentIfNeeded = async () => {
      if (!userDepartment && phone) {
        console.log('🔄 Department not in location state, fetching from API...');
        await fetchUserDepartment(phone);
      } else if (userDepartment) {
        console.log('✅ Using department from location state:', userDepartment);
      }
    };

    fetchDepartmentIfNeeded();
  }, [userDepartment, phone]);

  const fetchUserDepartment = async (phoneNumber) => {
    try {
      setDepartmentLoading(true);
      console.log('📞 Fetching department for phone:', phoneNumber);
      
      const response = await departmentService.getDepartmentByPhone(phoneNumber);
      console.log('🏢 Department API response:', response);
      
      if (response.user && response.user.department) {
        setUserDepartment(response.user.department);
        console.log('✅ Department set from API:', response.user.department);
      } else {
        console.log('⚠️ No department found in API response');
        // Keep the existing userDepartment value
      }
    } catch (error) {
      console.error('❌ Error fetching department from API:', error);
      // Keep the existing userDepartment value
    } finally {
      setDepartmentLoading(false);
    }
  };

  // Connect wallet and check registration
  const connectWallet = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔗 Starting wallet connection...');

      if (!window.ethereum) {
        console.error('❌ MetaMask not detected');
        setError('Please install MetaMask!');
        return;
      }

      console.log('✅ MetaMask detected');
      const web3Instance = new Web3(window.ethereum);
      
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      const contractInstance = new web3Instance.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
      
      setWeb3(web3Instance);
      setAccount(accounts[0]);
      setContract(contractInstance);
      setIsConnected(true);

      console.log('✅ Wallet connected successfully');
      console.log('👤 Account:', accounts[0]);

      await checkUserRegistration(contractInstance, accounts[0]);
      
    } catch (error) {
      console.error('❌ Error connecting wallet:', error);
      if (error.code === 4001) {
        setError('Please approve the connection in MetaMask.');
      } else {
        setError('Error connecting wallet. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const checkUserRegistration = async (contractInstance, userAddress) => {
    try {
      console.log('🔍 Checking user registration for:', userAddress);
      const role = await contractInstance.methods.getUserRole(userAddress).call();
      const contractDepartment = await contractInstance.methods.getUserDepartment(userAddress).call();
      
      console.log('📊 Raw role from contract:', role);
      console.log('🏢 User department from contract:', contractDepartment);
      
      const roleNumber = parseInt(role);
      console.log('🔢 Parsed role number:', roleNumber);
      
      setUserRole(roleNumber !== 0 ? roleNumber.toString() : null);
      
      // Only update department from contract if it's not already set
      if (contractDepartment && contractDepartment !== "None" && contractDepartment !== "" && !userDepartment) {
        setUserDepartment(contractDepartment);
        console.log('✅ Using department from contract:', contractDepartment);
      } else {
        console.log('ℹ️ Department already set or not available in contract:', { 
          userDepartment, 
          contractDepartment 
        });
      }
      
    } catch (error) {
      console.error('❌ Error checking user registration:', error);
      setUserRole(null);
    }
  };

  // const registerUser = async () => {
  //   try {
  //     setLoading(true);
  //     console.log('📝 Starting user registration...');
  //     console.log('👤 Registering with account:', account);
  //     console.log('🎯 Registering as role: 1 (User)');
  //     console.log('🏢 Department to use for registration:', userDepartment);

  //     // Use userDepartment from state (from login) instead of departmentInput
  //     const departmentToUse = userDepartment || departmentInput;
      
  //     if (!departmentToUse || departmentToUse.trim() === '') {
  //       alert('Please enter your department');
  //       return;
  //     }

  //     // User role is 1 (User) in the enum
  //     const transaction = await contract.methods.registerUser(1, departmentToUse).send({ 
  //       from: account
  //     });
      
  //     console.log('✅ Registration transaction successful:', transaction);
  //     await checkUserRegistration(contract, account);
  //     setShowDepartmentModal(false);
  //     alert('Registration successful! You can now upload files.');
  //   } catch (error) {
  //     console.error('❌ Error registering user:', error);
  //     if (error.code === 4001) {
  //       alert('Registration cancelled. Please click "Confirm" in MetaMask.');
  //     } else {
  //       alert('Registration failed. Please make sure you are connected to the correct network.');
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  const registerUser = async () => {
  try {
    setLoading(true);
    console.log('📝 Starting user registration...');
    console.log('👤 Registering with account:', account);
    console.log('🎯 Registering as role: 1 (User)');
    console.log('🏢 Department from login:', userDepartment);

    // Use userDepartment directly from state (from login navigation)
    if (!userDepartment || userDepartment.trim() === '') {
      alert('Department information not available. Please contact administrator.');
      return;
    }

    // User role is 1 (User) in the enum, department from login
    const transaction = await contract.methods.registerUser(1, userDepartment).send({ 
      from: account
    });
    
    console.log('✅ Registration transaction successful:', transaction);
    await checkUserRegistration(contract, account);
    alert('Registration successful! You can now upload files.');
  } catch (error) {
    console.error('❌ Error registering user:', error);
    if (error.code === 4001) {
      alert('Registration cancelled. Please click "Confirm" in MetaMask.');
    } else {
      alert('Registration failed. Please make sure you are connected to the correct network.');
    }
  } finally {
    setLoading(false);
  }
};
  // Fetch user files
  const fetchUserFiles = async () => {
    if (!contract || !account) {
      console.log('❌ Cannot fetch files: contract or account missing');
      return;
    }
    
    try {
      setFilesLoading(true);
      console.log('📂 Fetching user files...');
      
      const files = await contract.methods.getAllUserFiles(account).call();
      
      const formattedFiles = files
        .filter(file => file.id !== '0' && file.ipfsHash !== '')
        .map(file => ({
          id: file.id,
          ipfsHash: file.ipfsHash,
          status: file.status,
          department: file.department,
          hodRemark: file.hodRemark,
          owner: file.owner,
          viewLink: `https://gateway.pinata.cloud/ipfs/${file.ipfsHash}`,
          downloadLink: `https://gateway.pinata.cloud/ipfs/${file.ipfsHash}?download=1`
        }));
      
      setUserFiles(formattedFiles);

      const statusMap = {};
      formattedFiles.forEach(file => {
        statusMap[file.id] = file.status;
      });
      
      setFileStatus(statusMap);
    } catch (error) {
      console.error('❌ Error fetching files:', error);
    } finally {
      setFilesLoading(false);
    }
  };

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    if (!contract || !account) {
      console.log('❌ Cannot fetch stats: contract or account missing');
      return;
    }

    try {
      console.log('📊 Fetching dashboard stats...');
      const statsArray = await contract.methods.getUserDashboardStats(account).call();
      
      const formattedStats = {
        totalFiles: parseInt(statsArray[0]) || 0,
        pendingReview: parseInt(statsArray[1]) || 0,
        sentBack: parseInt(statsArray[2]) || 0,
        approvedByHOD: parseInt(statsArray[3]) || 0,
        resubmitted: parseInt(statsArray[4]) || 0
      };
      
      setDashboardStats(formattedStats);
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      await calculateStatsManually();
    }
  };

  // Manual calculation fallback
  const calculateStatsManually = async () => {
    try {
      console.log('📊 Calculating stats manually...');
      
      let totalFiles = 0;
      let pendingReview = 0;
      let sentBack = 0;
      let approvedByHOD = 0;
      let resubmitted = 0;

      const files = await contract.methods.getAllUserFiles(account).call();
      
      files.forEach(file => {
        if (file.id !== '0') {
          totalFiles++;
          const status = parseInt(file.status);
          switch(status) {
            case 0: break;
            case 1: pendingReview++; break;
            case 2: sentBack++; break;
            case 3: approvedByHOD++; break;
            case 4: resubmitted++; break;
          }
        }
      });
      
      setDashboardStats({ totalFiles, pendingReview, sentBack, approvedByHOD, resubmitted });
    } catch (error) {
      console.error('❌ Error in manual stats calculation:', error);
      setDashboardStats({ totalFiles: 0, pendingReview: 0, sentBack: 0, approvedByHOD: 0, resubmitted: 0 });
    }
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !fileName.trim()) {
      alert('Please select a file and enter a file name');
      return;
    }

    try {
      setUploadLoading(true);
      console.log('🚀 Starting file upload process...');
      
      const ipfsHash = await uploadToIPFS(selectedFile);
      console.log('✅ IPFS upload successful. Hash:', ipfsHash);
      
      const transaction = await contract.methods.uploadFile(fileName, ipfsHash).send({ 
        from: account
      });
      
      console.log('✅ File recorded on blockchain. Transaction:', transaction);
      setRefreshTrigger(prev => prev + 1);
      setSelectedFile(null);
      setFileName('');
      setShowUploadModal(false);
      alert('File uploaded successfully!');
    } catch (error) {
      console.error('❌ Error uploading file:', error);
      if (error.code === 4001) {
        alert('Upload cancelled. Please click "Confirm" in MetaMask.');
      } else {
        alert('Upload failed. Please check your connection.');
      }
    } finally {
      setUploadLoading(false);
    }
  };

  // File input change handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('📄 File selected:', file.name, 'Size:', file.size);
      if (file.size > 10 * 1024 * 1024) {
        alert('File size too large. Please select a file smaller than 10MB.');
        return;
      }
      setSelectedFile(file);
      if (!fileName) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setFileName(nameWithoutExt);
      }
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get status badge for file
  const getStatusBadge = (fileId) => {
    const status = fileStatus[fileId];
    const statusInfo = fileStatusMap[status] || fileStatusMap[0];
    return (
      <Badge bg={statusInfo.variant} className="d-flex align-items-center gap-1">
        <span>{statusInfo.icon}</span>
        {statusInfo.text}
      </Badge>
    );
  };

  // Calculate approval progress
  const getApprovalProgress = () => {
    const total = dashboardStats.totalFiles;
    if (total === 0) return 0;
    const approved = dashboardStats.approvedByHOD;
    const progress = Math.round((approved / total) * 100);
    return progress;
  };

  // Check connection on load
  useEffect(() => {
    console.log('🔍 Checking initial connection...');
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
          console.error('❌ Error checking connection:', error);
        }
      }
    };

    checkConnection();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        console.log('🔄 Accounts changed:', accounts);
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          checkUserRegistration(contract, accounts[0]);
        } else {
          setAccount(null);
          setUserRole(null);
          setUserDepartment('');
          setIsConnected(false);
          setUserFiles([]);
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, []);

  // Load data when connected
  useEffect(() => {
    console.log('🔄 useEffect triggered for connection change', {
      isConnected,
      contract: !!contract,
      account
    });
    
    if (isConnected && contract && account) {
      console.log('✅ Conditions met, fetching data...');
      fetchUserFiles();
      fetchDashboardStats();
    }
  }, [isConnected, contract, account, refreshTrigger]);

  // Debug current state
  console.log('📊 Current component state:', {
    isConnected,
    account,
    userRole,
    userDepartment,
    loading,
    userFilesCount: userFiles.length,
    dashboardStats
  });

  // Not connected state
  if (!isConnected) {
    return (
      <Container className="py-4">
        <Row className="justify-content-center min-vh-50">
          <Col md={6} className="text-center">
            <Card className="neo-card border-0 shadow-lg">
              <Card.Body className="py-5">
                <div className="mb-4">
                  <h1 className="text-white mb-3">🏛️ CityVault</h1>
                  <p className="text-light mb-4">
                    Secure document management on the blockchain
                  </p>
                </div>
                
                {error && (
                  <Alert variant="warning" className="mb-4">
                    {error}
                  </Alert>
                )}
                
                <Button 
                  className="neo-btn px-5 py-3" 
                  size="lg"
                  onClick={connectWallet}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Connecting...
                    </>
                  ) : (
                    '🔗 Connect MetaMask'
                  )}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  // Connected but not registered
// Connected but not registered
if (userRole === null) {
  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="neo-card border-0 shadow-lg">
            <Card.Body className="text-center py-5">
              <div className="mb-4">
                <h3 className="text-white mb-2">Complete Your Registration</h3>
                <p className="text-light mb-4">
                  You're connected! One more step to start using CityVault.
                </p>
              </div>

              <Card className="bg-dark border-secondary mb-4">
                <Card.Body>
                  <Row className="text-start">
                    <Col sm={6}>
                      <small className="text-muted">Wallet Address</small>
                      <div className="text-white">{account}</div>
                    </Col>
                    <Col sm={6}>
                      <small className="text-muted">Network</small>
                      <div className="text-success">Connected ✓</div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Show department info if available */}
              {userDepartment && (
                <Alert variant="info" className="mb-3">
                  <strong>Your Department:</strong> {userDepartment}
                </Alert>
              )}

              {/* CHANGE THIS BUTTON - Remove setShowDepartmentModal and call registerUser directly */}
              <Button 
                className="neo-btn px-5 py-3 mb-3" 
                size="lg"
                onClick={registerUser} // Direct call to registerUser
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Registering...
                  </>
                ) : (
                  '👤 Register as User'
                )}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* REMOVE THIS ENTIRE DEPARTMENT MODAL SECTION */}
    </Container>
  );
}

  // Main Dashboard - User is connected and registered
  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 bg-transparent">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h1 className="text-white mb-2 fw-light">
                    <span className="fw-bold">Document</span> Vault
                  </h1>
                  <p className="text-light mb-0 small opacity-75">
                    Your secure document workspace
                    {userDepartment && userDepartment !== "None" && (
                      <span className="ms-2">• Department: {userDepartment}</span>
                    )}
                    {departmentLoading && (
                      <span className="ms-2">• <Spinner animation="border" size="sm" /> Loading department...</span>
                    )}
                  </p>
                </div>
                
                <div className="text-end">
                  <div className="d-inline-block bg-dark bg-opacity-50 rounded p-3">
                    <div className="d-flex align-items-center gap-2 justify-content-end mb-1">
                      <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50">
                        ● Connected
                      </span>
                    </div>
                    <div className="text-white font-monospace small">
                      {account?.slice(0, 10)}...{account?.slice(-8)}
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Rest of your dashboard JSX remains exactly the same */}
      {/* Quick Stats Row */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="neo-card stat-card h-100 border-0">
            <Card.Body className="text-center">
              <div className="text-primary display-6 mb-2">📊</div>
              <h3 className="text-white">{dashboardStats.totalFiles}</h3>
              <small className="text-light">Total Files</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="neo-card stat-card h-100 border-0">
            <Card.Body className="text-center">
              <div className="text-warning display-6 mb-2">⏳</div>
              <h3 className="text-white">{dashboardStats.pendingReview}</h3>
              <small className="text-light">Under Review</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="neo-card stat-card h-100 border-0">
            <Card.Body className="text-center">
              <div className="text-danger display-6 mb-2">↩️</div>
              <h3 className="text-white">{dashboardStats.sentBack}</h3>
              <small className="text-light">Sent Back</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="neo-card stat-card h-100 border-0">
            <Card.Body className="text-center">
              <div className="text-success display-6 mb-2">✅</div>
              <h3 className="text-white">{dashboardStats.approvedByHOD}</h3>
              <small className="text-light">HOD Approved</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Progress and Quick Actions */}
      <Row className="mb-4">
        <Col lg={8} className="mb-3">
          <Card className="neo-card border-0 h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="text-white mb-0">📈 Approval Progress</h5>
                <Badge bg="primary">{getApprovalProgress()}% Complete</Badge>
              </div>
              <ProgressBar 
                now={getApprovalProgress()} 
                variant="success" 
                className="mb-3"
                style={{ height: '10px' }}
              />
              <Row className="text-center">
                <Col>
                  <small className="text-light">Total</small>
                  <div className="text-white h5">{dashboardStats.totalFiles}</div>
                </Col>
                <Col>
                  <small className="text-light">Under Review</small>
                  <div className="text-warning h5">{dashboardStats.pendingReview}</div>
                </Col>
                <Col>
                  <small className="text-light">Sent Back</small>
                  <div className="text-danger h5">{dashboardStats.sentBack}</div>
                </Col>
                <Col>
                  <small className="text-light">HOD Approved</small>
                  <div className="text-success h5">{dashboardStats.approvedByHOD}</div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4} className="mb-3">
          <Card className="neo-card border-0 h-100">
            <Card.Body className="text-center">
              <h5 className="text-white mb-4">🚀 Quick Actions</h5>
              <Button 
                className="neo-btn w-100 mb-3 py-3"
                onClick={() => setShowUploadModal(true)}
              >
                📤 Upload New File
              </Button>
              <Button 
                variant="outline-light" 
                className="w-100 mb-2"
                onClick={() => {
                  fetchUserFiles();
                  fetchDashboardStats();
                }}
                disabled={filesLoading}
              >
                {filesLoading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Refreshing...
                  </>
                ) : (
                  '🔄 Refresh Data'
                )}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Files Display Section */}
      <Row className="mt-4">
        <Col>
          <Card className="neo-card border-0">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="text-white mb-0">📁 My Uploaded Documents</h5>
                <Badge bg="primary">{userFiles.length} files</Badge>
              </div>
              
              {userFiles.length === 0 ? (
                <div className="text-center py-5">
                  <div className="text-muted mb-3" style={{ fontSize: '3rem' }}>📄</div>
                  <h5 className="text-light">No documents uploaded yet</h5>
                  <p className="text-muted">Upload your first document to get started</p>
                  <Button 
                    className="neo-btn"
                    onClick={() => setShowUploadModal(true)}
                  >
                    📤 Upload First Document
                  </Button>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover variant="dark" className="mb-0">
                    <thead>
                      <tr>
                        <th>File ID</th>
                        <th>Status</th>
                        <th>Department</th>
                        <th>HOD Remarks</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userFiles.map((file) => (
                        <tr key={file.id}>
                          <td className="fw-bold">#{file.id}</td>
                          <td>{getStatusBadge(file.id)}</td>
                          <td>
                            <Badge bg="secondary">{file.department}</Badge>
                          </td>
                          <td>
                            {file.hodRemark ? (
                              <small className="text-warning">{file.hodRemark}</small>
                            ) : (
                              <small className="text-muted">No remarks</small>
                            )}
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                size="sm"
                                variant="outline-primary"
                                href={file.viewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                👁️ View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-success"
                                href={file.downloadLink}
                                download
                              >
                                📥 Download
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Upload Modal */}
      <Modal 
        show={showUploadModal} 
        onHide={() => !uploadLoading && setShowUploadModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="bg-dark text-light">
          <Modal.Title className="d-flex align-items-center gap-2">
            📤 Upload New Document
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleFileUpload}>
          <Modal.Body className="bg-dark">
            <Alert variant="info" className="small">
              <strong>How it works:</strong> Your file will be uploaded to IPFS and recorded on the blockchain for secure tracking.
              {userDepartment && userDepartment !== "None" && (
                <div className="mt-1">
                  <strong>Department:</strong> {userDepartment} (from your profile)
                </div>
              )}
            </Alert>
            
            <Form.Group className="mb-4">
              <Form.Label className="text-light fw-bold">Select Document</Form.Label>
              <Form.Control
                type="file"
                onChange={handleFileChange}
                required
                disabled={uploadLoading}
                className="bg-secondary border-0 text-light"
              />
              <Form.Text className="text-muted">
                Supported formats: PDF, DOC, DOCX, Images (Max: 10MB)
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label className="text-light fw-bold">Document Name</Form.Label>
              <Form.Control
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="e.g., Annual Report 2024, Project Proposal..."
                required
                disabled={uploadLoading}
                className="bg-secondary border-0 text-light"
              />
            </Form.Group>
            
            {selectedFile && (
              <Card className="bg-secondary border-0">
                <Card.Body>
                  <Row>
                    <Col>
                      <strong className="text-light">Selected File:</strong>
                      <div className="text-light">{selectedFile.name}</div>
                      {userDepartment && userDepartment !== "None" && (
                        <div className="text-info small mt-1">
                          Will be assigned to: {userDepartment} department
                        </div>
                      )}
                    </Col>
                    <Col xs="auto">
                      <Badge bg="info">{formatFileSize(selectedFile.size)}</Badge>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            )}
          </Modal.Body>
          <Modal.Footer className="bg-dark">
            <Button 
              variant="outline-light" 
              onClick={() => setShowUploadModal(false)}
              disabled={uploadLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="neo-btn px-4"
              disabled={uploadLoading || !selectedFile || !fileName.trim()}
            >
              {uploadLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Uploading to Blockchain...
                </>
              ) : (
                '🚀 Upload Document'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Files Display Component */}
      <Row className="mt-4">
        <Col>
          <UserFilesDisplay 
            contract={contract}
            account={account}
            refreshTrigger={refreshTrigger}
            userDepartment={userDepartment}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default UserDashboard;