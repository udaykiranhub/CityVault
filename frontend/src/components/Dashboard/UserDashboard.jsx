// components/Dashboard/UserDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Button, Modal, Form, 
  Table, Alert, Spinner, Badge, ProgressBar 
} from 'react-bootstrap';
import Web3 from 'web3';
import { uploadToIPFS } from "../../Utils/ipfs"
import { CONTRACT_ADDRESS, CONTRACT_ABI } from  "../../Utils/constants";
import UserFilesDisplay from './UserFilesDisplay';
const UserDashboard = () => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [userFiles, setUserFiles] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalFiles: 0,
    pendingReview: 0,
    sentBack: 0,
    approvedByHOD: 0,
    forwarded: 0,
    approvedByCommissioner: 0
  });
  const [uploadLoading, setUploadLoading] = useState(false);
  const [filesLoading, setFilesLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileStatus, setFileStatus] = useState({});

  // File status mapping with icons
  const fileStatusMap = {
    0: { text: 'Uploaded', variant: 'primary', icon: '📤' },
    1: { text: 'Under Review', variant: 'warning', icon: '👀' },
    2: { text: 'Revisions Needed', variant: 'danger', icon: '↩️' },
    3: { text: 'HOD Approved', variant: 'success', icon: '✅' },
    4: { text: 'Forwarded', variant: 'info', icon: '📨' },
    5: { text: 'Commissioner Approved', variant: 'success', icon: '🏆' }
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
      
      // Request accounts
      console.log('📝 Requesting accounts from MetaMask...');
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      console.log('📋 Accounts received:', accounts);
      console.log('📄 Initializing contract with ABI:', CONTRACT_ABI);
      console.log('📍 Contract address:', CONTRACT_ADDRESS);
      
      const contractInstance = new web3Instance.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
      
      setWeb3(web3Instance);
      setAccount(accounts[0]);
      setContract(contractInstance);
      setIsConnected(true);

      console.log('✅ Wallet connected successfully');
      console.log('👤 Account:', accounts[0]);
      console.log('🌐 Web3 instance:', web3Instance);
      console.log('📑 Contract instance:', contractInstance);

      // Check user registration
      await checkUserRegistration(contractInstance, accounts[0]);
      
    } catch (error) {
      console.error('❌ Error connecting wallet:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
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
      console.log('📊 Raw role from contract:', role);
      
      const roleNumber = parseInt(role);
      console.log('🔢 Parsed role number:', roleNumber);
      
      setUserRole(roleNumber !== 0 ? roleNumber.toString() : null);
      console.log('✅ User role state set to:', roleNumber !== 0 ? roleNumber.toString() : null);
      
    } catch (error) {
      console.error('❌ Error checking user registration:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      setUserRole(null);
    }
  };

  const registerUser = async () => {
    try {
      setLoading(true);
      console.log('📝 Starting user registration...');
      console.log('👤 Registering with account:', account);
      console.log('🎯 Registering as role: 1 (User)');

      // User role is 1 (User) in the enum
      const transaction = await contract.methods.registerUser(1).send({ 
        from: account
      });
      
      console.log('✅ Registration transaction successful:', transaction);
      await checkUserRegistration(contract, account);
      alert('Registration successful! You can now upload files.');
    } catch (error) {
      console.error('❌ Error registering user:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
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
      console.log('Contract:', contract);
      console.log('Account:', account);
      return;
    }
    
    try {
      setFilesLoading(true);
      console.log('📂 Fetching user files...');
      
      const files = await contract.methods.getAllUserFiles(account).call();
      console.log('📦 Raw files from contract:', files);
      
      const formattedFiles = files
        .filter(file => file.id !== '0' && file.ipfsHash !== '')
        .map(file => ({
          id: file.id,
          ipfsHash: file.ipfsHash,
          viewLink: `https://gateway.pinata.cloud/ipfs/${file.ipfsHash}`,
          downloadLink: `https://gateway.pinata.cloud/ipfs/${file.ipfsHash}?download=1`
        }));
      
      console.log('📁 Formatted files:', formattedFiles);
      setUserFiles(formattedFiles);

      // Fetch individual file status
      console.log('🔄 Fetching individual file status...');
      const statusMap = {};
      for (let file of formattedFiles) {
        try {
          const fileData = await contract.methods.files(file.id).call();
          console.log(`📄 File ${file.id} data:`, fileData);
          statusMap[file.id] = fileData.status;
        } catch (error) {
          console.error(`❌ Error fetching status for file ${file.id}:`, error);
          statusMap[file.id] = '0';
        }
      }
      console.log('📊 File status map:', statusMap);
      setFileStatus(statusMap);
    } catch (error) {
      console.error('❌ Error fetching files:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
    } finally {
      setFilesLoading(false);
    }
  };

  // Fetch dashboard stats
  // const fetchDashboardStats = async () => {
  //   if (!contract || !account) {
  //     console.log('❌ Cannot fetch stats: contract or account missing');
  //     return;
  //   }

  //   try {
  //     console.log('📊 Fetching dashboard stats...');
  //     const stats = await contract.methods.getUserDashboardStats(account).call();
  //     console.log('📈 Raw stats from contract:', stats);
      
  //     const formattedStats = {
  //       totalFiles: parseInt(stats.totalFiles) || 0,
  //       pendingReview: parseInt(stats.pendingReview) || 0,
  //       sentBack: parseInt(stats.sentBack) || 0,
  //       approvedByHOD: parseInt(stats.approvedByHOD) || 0,
  //       forwarded: parseInt(stats.forwarded) || 0,
  //       approvedByCommissioner: parseInt(stats.approvedByCommissioner) || 0
  //     };
      
  //     console.log('📊 Formatted dashboard stats:', formattedStats);
  //     setDashboardStats(formattedStats);
  //   } catch (error) {
  //     console.error('❌ Error fetching stats:', error);
  //     console.error('Error details:', {
  //       code: error.code,
  //       message: error.message,
  //       stack: error.stack
  //     });
  //   }
  // };

  // Fetch dashboard stats - Manual calculation since contract function is failing
const fetchDashboardStats = async () => {
  if (!contract || !account) {
    console.log('❌ Cannot fetch stats: contract or account missing');
    return;
  }

  try {
    console.log('📊 Calculating stats manually...');
    
    // Get total file count first
    const totalFilesCount = await contract.methods.getFileCount().call();
    console.log('📊 Total files in contract:', totalFilesCount);
    
    // Since getAllUserFiles is failing, we'll calculate stats from individual files
    let totalFiles = 0;
    let pendingReview = 0;
    let sentBack = 0;
    let approvedByHOD = 0;
    let forwarded = 0;
    let approvedByCommissioner = 0;

    // Check files from ID 1001 to 1020 (adjust range as needed)
    const startId = 1001;
    const endId = startId + 20;
    
    for (let i = startId; i <= endId; i++) {
      try {
        const file = await contract.methods.files(i).call();
        if (file.owner && file.owner.toLowerCase() === account.toLowerCase() && file.ipfsHash) {
          totalFiles++;
          
          // Convert status to number and count
          const status = parseInt(file.status);
          switch(status) {
            case 0: // Uploaded
              break;
            case 1: // Under Review
              pendingReview++;
              break;
            case 2: // Sent Back
              sentBack++;
              break;
            case 3: // Approved by HOD
              approvedByHOD++;
              break;
            case 4: // Forwarded
              forwarded++;
              break;
            case 5: // Commissioner Approved
              approvedByCommissioner++;
              break;
          }
        }
      } catch (err) {
        // File doesn't exist, continue
      }
    }
    
    const formattedStats = {
      totalFiles,
      pendingReview,
      sentBack,
      approvedByHOD,
      forwarded,
      approvedByCommissioner
    };
    
    console.log('✅ Manually calculated stats:', formattedStats);
    setDashboardStats(formattedStats);
    
  } catch (error) {
    console.error('❌ Error calculating stats manually:', error);
    
    // Set zeros on error
    setDashboardStats({
      totalFiles: 0,
      pendingReview: 0,
      sentBack: 0,
      approvedByHOD: 0,
      forwarded: 0,
      approvedByCommissioner: 0
    });
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
    
    // Upload to IPFS
    const ipfsHash = await uploadToIPFS(selectedFile);
    console.log('✅ IPFS upload successful. Hash:', ipfsHash);
    
    // Call smart contract
    const transaction = await contract.methods.uploadFile(fileName, ipfsHash).send({ 
      from: account
    });
    
    console.log('✅ File recorded on blockchain. Transaction:', transaction);
    
    // Trigger refresh of files display
    setRefreshTrigger(prev => prev + 1);
    
    // Reset form
    setSelectedFile(null);
    setFileName('');
    setShowUploadModal(false);
    
    alert('File uploaded successfully! Check "My Uploaded Documents" below.');
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
        console.log('🏷️ Auto-set file name:', nameWithoutExt);
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
    console.log(`🏷️ Status for file ${fileId}:`, status, statusInfo);
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
    const approved = dashboardStats.approvedByCommissioner;
    const progress = Math.round((approved / total) * 100);
    console.log(`📊 Approval progress: ${approved}/${total} = ${progress}%`);
    return progress;
  };

  // Check connection on load
  useEffect(() => {
    console.log('🔍 Checking initial connection...');
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          console.log('🔗 MetaMask detected, checking existing connection...');
          const web3Instance = new Web3(window.ethereum);
          const accounts = await web3Instance.eth.getAccounts();
          console.log('📋 Existing accounts:', accounts);
          
          if (accounts.length > 0) {
            console.log('✅ Existing connection found');
            const contractInstance = new web3Instance.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
            setWeb3(web3Instance);
            setAccount(accounts[0]);
            setContract(contractInstance);
            setIsConnected(true);
            await checkUserRegistration(contractInstance, accounts[0]);
          } else {
            console.log('❌ No existing accounts found');
          }
        } catch (error) {
          console.error('❌ Error checking connection:', error);
        }
      } else {
        console.log('❌ MetaMask not available');
      }
    };

    checkConnection();

    // Listen for account changes
    if (window.ethereum) {
      console.log('👂 Setting up account change listener...');
      window.ethereum.on('accountsChanged', (accounts) => {
        console.log('🔄 Accounts changed:', accounts);
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          checkUserRegistration(contract, accounts[0]);
        } else {
          console.log('🚪 User disconnected wallet');
          setAccount(null);
          setUserRole(null);
          setIsConnected(false);
          setUserFiles([]);
        }
      });
    }

    return () => {
      // Cleanup listeners if needed
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
    } else {
      console.log('❌ Conditions not met for data fetching');
    }
  }, [isConnected, contract, account]);

  // Debug current state
  console.log('📊 Current component state:', {
    isConnected,
    account,
    userRole,
    loading,
    userFilesCount: userFiles.length,
    dashboardStats
  });

  // Not connected state
  if (!isConnected) {
    console.log('🚫 Rendering: Not connected state');
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
                
                <div className="mt-4">
                  <small className="text-muted">
                    Connect your wallet to manage documents securely
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  // Connected but not registered
  if (userRole === null) {
    console.log('🚫 Rendering: Connected but not registered state');
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

                <Button 
                  className="neo-btn px-5 py-3 mb-3" 
                  size="lg"
                  onClick={registerUser}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Registering...
                    </>
                  ) : (
                    '👤 Confirm user Role'
                  )}
                </Button>
                
                <div className="mt-3">
                  <Alert variant="info" className="small">
                    <strong>Note:</strong> This will register you on the blockchain. 
                    Click "Confirm" when MetaMask pops up.
                  </Alert>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  // Main Dashboard - User is connected and registered
  console.log('✅ Rendering: Main dashboard state');
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
              <small className="text-light">Pending Review</small>
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
        <Col md={3} className="mb-3">
          <Card className="neo-card stat-card h-100 border-0">
            <Card.Body className="text-center">
              <div className="text-info display-6 mb-2">🏆</div>
              <h3 className="text-white">{dashboardStats.approvedByCommissioner}</h3>
              <small className="text-light">Final Approved</small>
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
                  <small className="text-light">Uploaded</small>
                  <div className="text-white h5">{dashboardStats.totalFiles}</div>
                </Col>
                <Col>
                  <small className="text-light">Under Review</small>
                  <div className="text-warning h5">{dashboardStats.pendingReview}</div>
                </Col>
                <Col>
                  <small className="text-light">Revisions</small>
                  <div className="text-danger h5">{dashboardStats.sentBack}</div>
                </Col>
                <Col>
                  <small className="text-light">Approved</small>
                  <div className="text-success h5">{dashboardStats.approvedByCommissioner}</div>
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
                onClick={fetchUserFiles}
                disabled={filesLoading}
              >
                🔄 Refresh Data
              </Button>
              <div className="mt-4">
                <small className="text-muted">
                  Last updated: {new Date().toLocaleTimeString()}
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Files Table */}
      <Row>
        <Col>
          <Card className="neo-card border-0">
            <Card.Header className="bg-transparent border-bottom-0 py-3">
              <Row className="align-items-center">
                <Col>
                  <h5 className="text-white mb-0">📋 My Documents</h5>
                </Col>
                <Col xs="auto">
                  <small className="text-light">
                    {userFiles.length} document{userFiles.length !== 1 ? 's' : ''}
                  </small>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body className="p-0">
              {filesLoading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="light" />
                  <p className="text-light mt-2">Loading your documents...</p>
                </div>
              ) : userFiles.length > 0 ? (
                <div className="table-responsive">
                  <Table hover variant="dark" className="mb-0">
                    <thead className="bg-dark">
                      <tr>
                        <th>File ID</th>
                        <th>Document</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userFiles.map((file) => (
                        <tr key={file.id}>
                          <td className="text-light">#{file.id}</td>
                          <td>
                            <div>
                              <div className="text-white">Document {file.id}</div>
                              <small className="text-info">
                                IPFS: {file.ipfsHash.slice(0, 12)}...{file.ipfsHash.slice(-8)}
                              </small>
                            </div>
                          </td>
                          <td>
                            {getStatusBadge(file.id)}
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                size="sm"
                                variant="outline-light"
                                href={file.viewLink}
                                target="_blank"
                                className="d-flex align-items-center gap-1"
                              >
                                👁️ View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-primary"
                                href={file.downloadLink}
                                download
                                className="d-flex align-items-center gap-1"
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
              ) : (
                <div className="text-center py-5">
                  <div className="display-4 text-muted mb-3">📁</div>
                  <h5 className="text-light mb-3">No documents yet</h5>
                  <p className="text-muted mb-4">
                    Upload your first document to get started with the approval process.
                  </p>
                  <Button 
                    className="neo-btn"
                    onClick={() => setShowUploadModal(true)}
                  >
                    Upload Your First Document
                  </Button>
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
    />
  </Col>
</Row>
    </Container>
  );
};

export default UserDashboard;