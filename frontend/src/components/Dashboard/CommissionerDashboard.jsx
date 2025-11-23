import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Button, Modal, Form, 
  Alert, Spinner, Badge, ProgressBar, Tabs, Tab, Table
} from 'react-bootstrap';
import Web3 from 'web3';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../../Utils/constants";

const CommissionerDashboard = () => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Commissioner Dashboard States
  const [files, setFiles] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalFiles: 0,
    forwarded: 0,
    approved: 0
  });

  const [activeTab, setActiveTab] = useState('all');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [commissionerRemarks, setCommissionerRemarks] = useState('');
  const [dashboardLoaded, setDashboardLoaded] = useState(false);

  // File Status Constants
  const FILE_STATUS = {
    Provided: 0,
    UnderHODReview: 1,
    SemBack: 2,
    ApprovedByHOD: 3,
    Forwarded: 4,
    CommissionerApproved: 5
  };

  const STATUS_CONFIG = {
    0: { label: 'Uploaded', variant: 'secondary', icon: '📤' },
    1: { label: 'Under HOD Review', variant: 'warning', icon: '👀' },
    2: { label: 'Revisions Needed', variant: 'danger', icon: '↩️' },
    3: { label: 'HOD Approved', variant: 'success', icon: '✅' },
    4: { label: 'Forwarded to Commissioner', variant: 'info', icon: '📨' },
    5: { label: 'Commissioner Approved', variant: 'primary', icon: '🏆' }
  };

  // Role Constants
  const USER_ROLES = {
    None: 0,
    User: 1,
    HOD: 2,
    Commissioner: 3
  };

  // Connect Wallet
  const connectWallet = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔗 Commissioner: Connecting wallet...');

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

      console.log('✅ Commissioner: Wallet connected:', accounts[0]);
      await checkUserRegistration(contractInstance, accounts[0]);
      
    } catch (error) {
      console.error('❌ Commissioner: Wallet connection error:', error);
      setError(error.message || 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  const checkUserRegistration = async (contractInstance, userAddress) => {
    try {
      console.log('🔍 Commissioner: Checking user registration...');
      const role = await contractInstance.methods.getUserRole(userAddress).call();
      const roleNumber = parseInt(role);
      console.log('📊 Commissioner: User role:', roleNumber);
      
      setUserRole(roleNumber);
      
      if (roleNumber === USER_ROLES.Commissioner) {
        console.log('✅ Commissioner: User is Commissioner, loading dashboard data...');
        await loadDashboardData();
      } else {
        console.log('ℹ️ Commissioner: User role is:', getRoleName(roleNumber));
      }
    } catch (error) {
      console.error('❌ Commissioner: Registration check error:', error);
      setUserRole(USER_ROLES.None);
    }
  };

  const getRoleName = (roleNumber) => {
    switch(parseInt(roleNumber)) {
      case USER_ROLES.None: return 'Not Registered';
      case USER_ROLES.User: return 'User';
      case USER_ROLES.HOD: return 'HOD';
      case USER_ROLES.Commissioner: return 'Commissioner';
      default: return 'Unknown';
    }
  };

  const registerUser = async () => {
    try {
      setLoading(true);
      console.log('📝 Commissioner: Registering as Commissioner...');

      const transaction = await contract.methods.registerUser(USER_ROLES.Commissioner).send({ 
        from: account
      });
      
      console.log('✅ Commissioner: Registration successful:', transaction);
      
      // Re-check registration after successful registration
      await checkUserRegistration(contract, account);
      alert('Commissioner Registration successful!');
      
    } catch (error) {
      console.error('❌ Commissioner: Registration error:', error);
      if (error.code === 4001) {
        alert('Registration cancelled by user');
      } else {
        alert('Registration failed: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  // Load Dashboard Data
  const loadDashboardData = async () => {
    if (!contract || !account) return;

    try {
      setLoading(true);
      setDashboardLoaded(false);
      console.log('📊 Commissioner: Loading dashboard data...');
      await Promise.all([
        fetchAllCommissionerFiles(),
        fetchDashboardStats()
      ]);
      setDashboardLoaded(true);
      console.log('✅ Commissioner: Dashboard data loaded successfully');
    } catch (error) {
      console.error('❌ Commissioner: Dashboard data loading error:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all files shared with Commissioner
  const fetchAllCommissionerFiles = async () => {
    try {
      console.log('📂 Commissioner: Fetching all commissioner files...');
      
      // Method 1: Use getAllCommissionerSharedFiles if available in contract
      try {
        const commissionerFiles = await contract.methods.getAllCommissionerSharedFiles().call({ from: account });
        console.log('📄 Commissioner: Files from getAllCommissionerSharedFiles:', commissionerFiles);
        
        const processedFiles = await Promise.all(
          commissionerFiles.map(async (file) => {
            try {
              const fileDetails = await contract.methods.files(file.id).call();
              let fileName = `Document ${file.id}`;
              try {
                const name = await contract.methods.fileNames(file.id).call();
                if (name && name !== '') {
                  fileName = name;
                }
              } catch (err) {
                console.log(`No file name for ${file.id}`);
              }

              // Get HOD remarks if any
              let hodRemark = '';
              try {
                const remark = await contract.methods.hodRemarks(file.id).call();
                if (remark && remark !== '') {
                  hodRemark = remark;
                }
              } catch (err) {
                // No remarks
              }

              return {
                id: file.id.toString(),
                ipfsHash: file.ipfsHash,
                fileName: fileName,
                status: fileDetails.status,
                uploadTimestamp: fileDetails.uploadTimestamp,
                lastUpdateTimestamp: fileDetails.lastUpdateTimestamp,
                owner: fileDetails.owner,
                isSharedWithCommissioner: fileDetails.isSharedWithCommissioner,
                hodRemark: hodRemark,
                viewLink: `https://ipfs.io/ipfs/${file.ipfsHash}`,
                downloadLink: `https://ipfs.io/ipfs/${file.ipfsHash}?download=1`
              };
            } catch (error) {
              console.error(`Error processing file ${file.id}:`, error);
              return null;
            }
          })
        );

        const validFiles = processedFiles.filter(file => file !== null);
        console.log('✅ Commissioner: Valid files loaded:', validFiles);
        setFiles(validFiles);
        return;

      } catch (error) {
        console.log('🔄 Commissioner: Falling back to manual file fetching...', error);
      }

      // Method 2: Manual fetching if above method fails
      const allFiles = [];
      const fileCount = await contract.methods.getFileCount().call();
      console.log('📁 Commissioner: Total files in system:', fileCount);
      
      for (let i = 1001; i <= 1000 + parseInt(fileCount); i++) {
        try {
          const file = await contract.methods.files(i).call();
          
          if (file.id !== '0' && file.ipfsHash && file.ipfsHash !== '' && file.isSharedWithCommissioner) {
            console.log(`📄 Commissioner: Found shared file ${i}:`, file);
            
            let fileName = `Document ${i}`;
            try {
              const name = await contract.methods.fileNames(i).call();
              if (name && name !== '') {
                fileName = name;
              }
            } catch (err) {
              console.log(`No file name for ${i}`);
            }

            // Get HOD remarks if any
            let hodRemark = '';
            try {
              const remark = await contract.methods.hodRemarks(i).call();
              if (remark && remark !== '') {
                hodRemark = remark;
              }
            } catch (err) {
              // No remarks
            }

            allFiles.push({
              id: i.toString(),
              ipfsHash: file.ipfsHash,
              fileName: fileName,
              status: file.status,
              uploadTimestamp: file.uploadTimestamp,
              lastUpdateTimestamp: file.lastUpdateTimestamp,
              owner: file.owner,
              isSharedWithCommissioner: file.isSharedWithCommissioner,
              hodRemark: hodRemark,
              viewLink: `https://ipfs.io/ipfs/${file.ipfsHash}`,
              downloadLink: `https://ipfs.io/ipfs/${file.ipfsHash}?download=1`
            });
          }
        } catch (error) {
          continue;
        }
      }
      
      console.log('✅ Commissioner: All shared files loaded:', allFiles);
      setFiles(allFiles);
      
    } catch (error) {
      console.error('❌ Commissioner: Error fetching files:', error);
      setFiles([]);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      console.log('📈 Commissioner: Fetching dashboard stats...');
      
      // Use contract method if available
      try {
        const stats = await contract.methods.getCommissionerDashboardStats().call({ from: account });
        console.log('📊 Commissioner: Stats from contract:', stats);
        
        setDashboardStats({
          totalFiles: parseInt(stats.totalFiles) || 0,
          forwarded: parseInt(stats.forwarded) || 0,
          approved: parseInt(stats.approved) || 0
        });
        return;
      } catch (error) {
        console.log('🔄 Commissioner: Falling back to manual stats calculation...', error);
      }

      // Manual calculation
      const stats = {
        totalFiles: files.length,
        forwarded: files.filter(f => parseInt(f.status) === FILE_STATUS.Forwarded).length,
        approved: files.filter(f => parseInt(f.status) === FILE_STATUS.CommissionerApproved).length
      };
      
      console.log('📊 Commissioner: Calculated stats:', stats);
      setDashboardStats(stats);
      
    } catch (error) {
      console.error('❌ Commissioner: Stats calculation error:', error);
    }
  };

  // Update stats when files change
  useEffect(() => {
    if (files.length > 0) {
      fetchDashboardStats();
    }
  }, [files]);

  // File Actions
  const handleApproveFile = (file) => {
    console.log('✅ Commissioner: Opening approve modal for file:', file);
    setSelectedFile(file);
    setCommissionerRemarks('');
    setShowApproveModal(true);
  };

  const handleCommissionerApprove = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('No file selected!');
      return;
    }

    try {
      setActionLoading(true);
      console.log('👨‍⚖️ Commissioner: Approving file...');
      
      const transaction = await contract.methods.commissionerApprove(
        selectedFile.id
      ).send({ from: account });

      console.log('✅ Commissioner: Approval successful:', transaction);
      
      setShowApproveModal(false);
      setSelectedFile(null);
      setCommissionerRemarks('');
      
      // Refresh data
      setRefreshTrigger(prev => prev + 1);
      alert('File approved successfully!');
      
    } catch (error) {
      console.error('❌ Commissioner: Approval error:', error);
      alert(error.code === 4001 ? 'Approval cancelled' : 'Approval failed: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewFileDetails = async (fileId) => {
    try {
      console.log('🔍 Commissioner: Fetching detailed file info for:', fileId);
      const fileDetails = await contract.methods.files(fileId).call();
      const fileName = await contract.methods.fileNames(fileId).call();
      const hodRemark = await contract.methods.hodRemarks(fileId).call();
      
      console.log('📋 Commissioner: File details:', {
        fileDetails,
        fileName,
        hodRemark
      });
      
      const detailsMessage = `
File Details:
📄 ID: ${fileId}
📁 Name: ${fileName}
👤 Owner: ${fileDetails.owner}
📊 Status: ${STATUS_CONFIG[fileDetails.status]?.label || 'Unknown'}
🕒 Uploaded: ${new Date(parseInt(fileDetails.uploadTimestamp) * 1000).toLocaleString()}
🕒 Last Updated: ${new Date(parseInt(fileDetails.lastUpdateTimestamp) * 1000).toLocaleString()}
${hodRemark ? `💬 HOD Remarks: ${hodRemark}` : ''}
      `.trim();

      alert(detailsMessage);
    } catch (error) {
      console.error('❌ Commissioner: Error fetching file details:', error);
      alert('Error fetching file details');
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

  const getApprovalProgress = () => {
    const total = dashboardStats.totalFiles;
    if (total === 0) return 0;
    return Math.round((dashboardStats.approved / total) * 100);
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
        return files.filter(f => parseInt(f.status) === FILE_STATUS.Forwarded);
      case 'approved':
        return files.filter(f => parseInt(f.status) === FILE_STATUS.CommissionerApproved);
      case 'all':
      default:
        return files;
    }
  };

  // Get action buttons based on file status
  const getActionButtons = (file) => {
    const status = parseInt(file.status);
    
    switch(status) {
      case FILE_STATUS.Forwarded:
        return (
          <div className="d-flex gap-1 flex-wrap">
            <Button 
              size="sm" 
              variant="outline-success" 
              onClick={() => handleApproveFile(file)}
            >
              ✅ Approve
            </Button>
            <Button 
              size="sm" 
              variant="outline-info" 
              href={file.viewLink} 
              target="_blank"
            >
              👁️ View
            </Button>
            <Button 
              size="sm" 
              variant="outline-secondary"
              onClick={() => handleViewFileDetails(file.id)}
            >
              🔍 Details
            </Button>
          </div>
        );
      
      case FILE_STATUS.CommissionerApproved:
        return (
          <div className="d-flex gap-1 flex-wrap">
            <Button size="sm" variant="outline-success" disabled>
              ✅ Approved
            </Button>
            <Button 
              size="sm" 
              variant="outline-info" 
              href={file.viewLink} 
              target="_blank"
            >
              👁️ View
            </Button>
            <Button 
              size="sm" 
              variant="outline-secondary"
              onClick={() => handleViewFileDetails(file.id)}
            >
              🔍 Details
            </Button>
          </div>
        );
      
      default:
        return (
          <div className="d-flex gap-1 flex-wrap">
            <Button 
              size="sm" 
              variant="outline-info" 
              href={file.viewLink} 
              target="_blank"
            >
              👁️ View
            </Button>
            <Button 
              size="sm" 
              variant="outline-secondary"
              onClick={() => handleViewFileDetails(file.id)}
            >
              🔍 Details
            </Button>
          </div>
        );
    }
  };

  // Effects
  useEffect(() => {
    if (isConnected && contract && account && userRole === USER_ROLES.Commissioner) {
      loadDashboardData();
    }
  }, [isConnected, contract, account, userRole, refreshTrigger]);

  // Connection check on load
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
          console.error('Commissioner: Initial connection error:', error);
        }
      }
    };

    checkConnection();
  }, []);

  // Debug current state
  console.log('📊 Current Commissioner Dashboard State:', {
    isConnected,
    account,
    userRole,
    userRoleName: getRoleName(userRole),
    filesCount: files.length,
    dashboardStats,
    activeTab,
    dashboardLoaded
  });

  // Render based on connection and role states
  if (!isConnected) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <Card className="border-0 shadow">
              <Card.Body className="text-center p-5">
                <h3 className="mb-4">👑 Commissioner Portal</h3>
                <p className="text-muted mb-4">
                  Connect your wallet to access the Commissioner dashboard
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

  // Check for both null and 0 (UserRole.None)
  if (userRole === null || userRole === USER_ROLES.None || userRole !== USER_ROLES.Commissioner) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="border-0 shadow">
              <Card.Body className="text-center p-5">
                <h3 className="mb-4">
                  {userRole === null || userRole === USER_ROLES.None ? 'Commissioner Registration Required' : 'Access Restricted'}
                </h3>
                
                <Card className="mb-4">
                  <Card.Body>
                    <Row>
                      <Col>
                        <small className="text-muted">Wallet</small>
                        <div>{formatAddress(account)}</div>
                      </Col>
                      <Col>
                        <small className="text-muted">Role</small>
                        <div className={userRole === USER_ROLES.Commissioner ? 'text-success' : 'text-warning'}>
                          {getRoleName(userRole)}
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {(userRole === null || userRole === USER_ROLES.None) && (
                  <>
                    <Button 
                      variant="success" 
                      size="lg"
                      onClick={registerUser}
                      disabled={loading}
                      className="mb-3 w-100"
                    >
                      {loading ? <Spinner size="sm" /> : 'Register as Commissioner'}
                    </Button>
                    <div className="text-muted mb-3">
                      <small>You need to register as a Commissioner to access this dashboard</small>
                    </div>
                  </>
                )}
                
                <Button variant="outline-secondary" onClick={connectWallet} className="w-100">
                  Switch Account
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  // Main Dashboard (only shown for registered Commissioners)
  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">👑 Commissioner Approval Portal</h2>
              <p className="text-muted mb-0">Final Document Approval Dashboard</p>
            </div>
            <div className="d-flex align-items-center gap-3">
              <Badge bg="primary" className="fs-6 p-2">
                Commissioner: {formatAddress(account)}
              </Badge>
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => setRefreshTrigger(prev => prev + 1)}
                disabled={loading}
              >
                {loading ? <Spinner size="sm" /> : '🔄 Refresh'}
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {loading && !dashboardLoaded && (
        <Row className="mb-4">
          <Col>
            <Alert variant="info" className="text-center">
              <Spinner size="sm" className="me-2" />
              Loading Commissioner Dashboard...
            </Alert>
          </Col>
        </Row>
      )}

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col xl={3} md={6} className="mb-3">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="fs-1 text-primary mb-2">📊</div>
              <h3 className="text-primary">{dashboardStats.totalFiles}</h3>
              <small className="text-muted">Total Files for Review</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} md={6} className="mb-3">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="fs-1 text-info mb-2">📨</div>
              <h3 className="text-info">{dashboardStats.forwarded}</h3>
              <small className="text-muted">Pending Approval</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} md={6} className="mb-3">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="fs-1 text-success mb-2">✅</div>
              <h3 className="text-success">{dashboardStats.approved}</h3>
              <small className="text-muted">Approved Files</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} md={6} className="mb-3">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="fs-1 text-secondary mb-2">📈</div>
              <h3 className="text-secondary">{getApprovalProgress()}%</h3>
              <small className="text-muted">Approval Progress</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Progress Bar */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0">Commissioner Approval Progress</h6>
                <Badge bg="primary">{getApprovalProgress()}% Complete</Badge>
              </div>
              <ProgressBar 
                now={getApprovalProgress()} 
                variant="success" 
                style={{ height: '12px' }}
                animated
              />
              <div className="d-flex justify-content-between mt-2">
                <small className="text-muted">Pending: {dashboardStats.forwarded}</small>
                <small className="text-muted">Approved: {dashboardStats.approved}</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Files Section */}
      <Row>
        <Col>
          <Card className="border-0 shadow">
            <Card.Header className="bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">📋 Documents for Commissioner Approval</h5>
                <div>
                  <Badge bg="light" text="dark" className="me-2">
                    Total: {files.length}
                  </Badge>
                </div>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <Tabs
                activeKey={activeTab}
                onSelect={setActiveTab}
                className="px-3 pt-3"
                fill
              >
                <Tab eventKey="all" title={
                  <span>
                    All Files <Badge bg="primary">{files.length}</Badge>
                  </span>
                }>
                  <CommissionerFileTable 
                    files={getFilteredFiles()}
                    loading={loading}
                    getStatusBadge={getStatusBadge}
                    getActionButtons={getActionButtons}
                    formatTimestamp={formatTimestamp}
                    formatAddress={formatAddress}
                  />
                </Tab>

                <Tab eventKey="pending" title={
                  <span>
                    Pending Approval <Badge bg="info">{dashboardStats.forwarded}</Badge>
                  </span>
                }>
                  <CommissionerFileTable 
                    files={getFilteredFiles()}
                    loading={loading}
                    getStatusBadge={getStatusBadge}
                    getActionButtons={getActionButtons}
                    formatTimestamp={formatTimestamp}
                    formatAddress={formatAddress}
                  />
                </Tab>

                <Tab eventKey="approved" title={
                  <span>
                    Approved <Badge bg="success">{dashboardStats.approved}</Badge>
                  </span>
                }>
                  <CommissionerFileTable 
                    files={getFilteredFiles()}
                    loading={loading}
                    getStatusBadge={getStatusBadge}
                    getActionButtons={getActionButtons}
                    formatTimestamp={formatTimestamp}
                    formatAddress={formatAddress}
                  />
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Approval Modal */}
      <Modal show={showApproveModal} onHide={() => setShowApproveModal(false)} centered>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>✅ Approve Document</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCommissionerApprove}>
          <Modal.Body>
            {selectedFile && (
              <>
                <Alert variant="success">
                  <strong>Final Approval:</strong> {selectedFile.fileName}
                </Alert>
                
                <div className="mb-3">
                  <strong>Document Details:</strong>
                  <ul className="mt-2">
                    <li><strong>ID:</strong> #{selectedFile.id}</li>
                    <li><strong>Uploaded By:</strong> {formatAddress(selectedFile.owner)}</li>
                    <li><strong>Current Status:</strong> {getStatusBadge(selectedFile.status)}</li>
                    {selectedFile.hodRemark && (
                      <li><strong>HOD Remarks:</strong> {selectedFile.hodRemark}</li>
                    )}
                  </ul>
                </div>

                <Form.Group className="mb-3">
                  <Form.Label><strong>Commissioner Remarks (Optional)</strong></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={commissionerRemarks}
                    onChange={(e) => setCommissionerRemarks(e.target.value)}
                    placeholder="Enter any additional remarks or comments..."
                  />
                </Form.Group>

                <div className="text-center">
                  <Button
                    variant="outline-primary"
                    href={selectedFile.viewLink}
                    target="_blank"
                    className="me-2"
                  >
                    📄 View Document
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => handleViewFileDetails(selectedFile.id)}
                  >
                    🔍 View Details
                  </Button>
                </div>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowApproveModal(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="success"
              disabled={actionLoading}
            >
              {actionLoading ? <Spinner size="sm" /> : '✅ Final Approval'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

// Commissioner File Table Component
const CommissionerFileTable = ({ files, loading, getStatusBadge, getActionButtons, formatTimestamp, formatAddress }) => {
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Loading documents for Commissioner review...</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="fs-1 text-muted mb-3">📭</div>
        <h5>No documents found</h5>
        <p className="text-muted">There are no documents requiring Commissioner approval in this category.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <Table hover className="mb-0">
        <thead className="bg-light">
          <tr>
            <th>ID</th>
            <th>Document Name</th>
            <th>Uploaded By</th>
            <th>Status</th>
            <th>Last Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file.id}>
              <td><strong>#{file.id}</strong></td>
              <td>
                <div className="fw-bold">{file.fileName}</div>
                {file.hodRemark && (
                  <small className="text-warning">
                    <strong>HOD Remark:</strong> {file.hodRemark}
                  </small>
                )}
              </td>
              <td>
                <small>{formatAddress(file.owner)}</small>
                <br />
                <small className="text-muted">{formatTimestamp(file.uploadTimestamp)}</small>
              </td>
              <td>{getStatusBadge(file.status)}</td>
              <td>
                <small>{formatTimestamp(file.lastUpdateTimestamp)}</small>
              </td>
              <td>{getActionButtons(file)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default CommissionerDashboard;