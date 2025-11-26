// //components/Dasboard/ CommissionerDashboard.jsx


// import React, { useState, useEffect } from 'react';
// import { 
//   Container, Row, Col, Card, Button, Modal, 
//   Alert, Spinner, Badge, ProgressBar, Tabs, Tab, Table
// } from 'react-bootstrap';
// import Web3 from 'web3';
// import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../../Utils/constants";

// const CommissionerDashboard = () => {
//   const [web3, setWeb3] = useState(null);
//   const [account, setAccount] = useState(null);
//   const [contract, setContract] = useState(null);
//   const [userRole, setUserRole] = useState(null);
//   const [isConnected, setIsConnected] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [refreshTrigger, setRefreshTrigger] = useState(0);

//   // Commissioner Dashboard States
//   const [files, setFiles] = useState([]);
//   const [dashboardStats, setDashboardStats] = useState({
//     totalFiles: 0,
//     sharedToCommissioner: 0,
//     blockchainVerified: 0,
//     pendingVerification: 0,
//     approvedByHOD: 0,
//     sentBack: 0
//   });

//   const [activeTab, setActiveTab] = useState('all');
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [showFileDetails, setShowFileDetails] = useState(false);
//   const [dashboardLoaded, setDashboardLoaded] = useState(false);

//   // File Status Constants
//   const FILE_STATUS = {
//     Provided: 0,
//     UnderHODReview: 1,
//     SemBack: 2,
//     ApprovedByHOD: 3,
//     Forwarded: 4,
//     CommissionerApproved: 5
//   };

//   const STATUS_CONFIG = {
//     0: { label: 'Pending HOD', variant: 'secondary', icon: '📤' },
//     1: { label: 'Under Review', variant: 'warning', icon: '👀' },
//     2: { label: 'Returned', variant: 'danger', icon: '↩️' },
//     3: { label: 'Approved by HOD', variant: 'success', icon: '✅' },
//     4: { label: 'Forwarded to Commissioner', variant: 'info', icon: '📨' },
//     5: { label: 'Commissioner Approved', variant: 'primary', icon: '🏆' }
//   };

//   // Role Constants
//   const USER_ROLES = {
//     None: 0,
//     User: 1,
//     HOD: 2,
//     Commissioner: 3
//   };

//   // Connect Wallet
//   const connectWallet = async () => {
//     try {
//       setLoading(true);
//       setError('');
//       console.log('🔗 Commissioner: Connecting wallet...');

//       if (!window.ethereum) {
//         throw new Error('Please install MetaMask!');
//       }

//       const web3Instance = new Web3(window.ethereum);
//       const accounts = await window.ethereum.request({ 
//         method: 'eth_requestAccounts' 
//       });
      
//       const contractInstance = new web3Instance.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
      
//       setWeb3(web3Instance);
//       setAccount(accounts[0]);
//       setContract(contractInstance);
//       setIsConnected(true);

//       console.log('✅ Commissioner: Wallet connected:', accounts[0]);
//       await checkUserRegistration(contractInstance, accounts[0]);
      
//     } catch (error) {
//       console.error('❌ Commissioner: Wallet connection error:', error);
//       setError(error.message || 'Failed to connect wallet');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const checkUserRegistration = async (contractInstance, userAddress) => {
//     try {
//       console.log('🔍 Commissioner: Checking user registration...');
//       const role = await contractInstance.methods.getUserRole(userAddress).call();
//       const roleNumber = parseInt(role);
//       console.log('📊 Commissioner: User role:', roleNumber);
      
//       setUserRole(roleNumber);
      
//       if (roleNumber === USER_ROLES.Commissioner) {
//         console.log('✅ Commissioner: User is Commissioner, loading dashboard data...');
//         await loadDashboardData();
//       } else {
//         console.log('ℹ️ Commissioner: User role is:', getRoleName(roleNumber));
//       }
//     } catch (error) {
//       console.error('❌ Commissioner: Registration check error:', error);
//       setUserRole(USER_ROLES.None);
//     }
//   };

//   const getRoleName = (roleNumber) => {
//     switch(parseInt(roleNumber)) {
//       case USER_ROLES.None: return 'Not Registered';
//       case USER_ROLES.User: return 'User';
//       case USER_ROLES.HOD: return 'HOD';
//       case USER_ROLES.Commissioner: return 'Commissioner';
//       default: return 'Unknown';
//     }
//   };

//   const registerUser = async () => {
//     try {
//       setLoading(true);
//       console.log('📝 Commissioner: Registering as Commissioner...');

//       const transaction = await contract.methods.registerUser(USER_ROLES.Commissioner).send({ 
//         from: account
//       });
      
//       console.log('✅ Commissioner: Registration successful:', transaction);
      
//       // Re-check registration after successful registration
//       await checkUserRegistration(contract, account);
//       alert('Commissioner Registration successful!');
      
//     } catch (error) {
//       console.error('❌ Commissioner: Registration error:', error);
//       if (error.code === 4001) {
//         alert('Registration cancelled by user');
//       } else {
//         alert('Registration failed: ' + (error.message || 'Unknown error'));
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Load Dashboard Data
//   const loadDashboardData = async () => {
//     if (!contract || !account) return;

//     try {
//       setLoading(true);
//       setDashboardLoaded(false);
//       console.log('📊 Commissioner: Loading dashboard data...');
//       await fetchAllFiles();
//       setDashboardLoaded(true);
//       console.log('✅ Commissioner: Dashboard data loaded successfully');
//     } catch (error) {
//       console.error('❌ Commissioner: Dashboard data loading error:', error);
//       setError('Failed to load dashboard data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch ALL files from the contract for monitoring
//   const fetchAllFiles = async () => {
//     try {
//       console.log('📂 Commissioner: Fetching ALL files for monitoring...');
//       const allFiles = [];
      
//       // Get file count first
//       let fileCount = 0;
//       try {
//         fileCount = await contract.methods.getFileCount().call();
//         console.log('📁 Commissioner: Total files in system:', fileCount);
//       } catch (error) {
//         console.log('🔄 Commissioner: Using default file count range');
//         fileCount = 50; // fallback
//       }

//       // Fetch files from ID 1001 onwards
//       for (let i = 1001; i <= 1000 + parseInt(fileCount); i++) {
//         try {
//           const file = await contract.methods.files(i).call();
          
//           // Check if file exists (has valid IPFS hash)
//           if (file.id !== '0' && file.ipfsHash && file.ipfsHash !== '') {
//             console.log(`📄 Commissioner: Found file ${i}:`, file);
            
//             // Get file name
//             let fileName = `Document ${i}`;
//             try {
//               const name = await contract.methods.fileNames(i).call();
//               if (name && name !== '') {
//                 fileName = name;
//               }
//             } catch (err) {
//               console.log(`No file name for ${i}`);
//             }

//             // Get HOD remarks if any
//             let hodRemark = '';
//             try {
//               const remark = await contract.methods.hodRemarks(i).call();
//               if (remark && remark !== '') {
//                 hodRemark = remark;
//               }
//             } catch (err) {
//               // No remarks
//             }

//             const fileData = {
//               id: i.toString(),
//               ipfsHash: file.ipfsHash,
//               fileName: fileName,
//               status: file.status,
//               uploadTimestamp: file.uploadTimestamp,
//               lastUpdateTimestamp: file.lastUpdateTimestamp,
//               owner: file.owner,
//               isSharedWithCommissioner: file.isSharedWithCommissioner,
//               hodRemark: hodRemark,
//               viewLink: `https://ipfs.io/ipfs/${file.ipfsHash}`,
//               downloadLink: `https://ipfs.io/ipfs/${file.ipfsHash}?download=1`
//             };

//             allFiles.push(fileData);
//           }
//         } catch (error) {
//           // File doesn't exist, continue to next
//           continue;
//         }
//       }
      
//       console.log('✅ Commissioner: All files loaded:', allFiles);
//       setFiles(allFiles);
//       calculateDashboardStats(allFiles);
      
//     } catch (error) {
//       console.error('❌ Commissioner: Error fetching files:', error);
//       setFiles([]);
//     }
//   };

//   // Calculate dashboard statistics
//   // const calculateDashboardStats = (filesArray) => {
//   //   const stats = {
//   //     totalFiles: filesArray.length,
//   //     sharedToCommissioner: filesArray.filter(f => f.isSharedWithCommissioner).length,
//   //     blockchainVerified: filesArray.filter(f => 
//   //       parseInt(f.status) === FILE_STATUS.Forwarded || 
//   //       parseInt(f.status) === FILE_STATUS.CommissionerApproved
//   //     ).length,
//   //     pendingVerification: filesArray.filter(f => 
//   //       parseInt(f.status) < FILE_STATUS.Forwarded
//   //     ).length,
//   //     approvedByHOD: filesArray.filter(f => 
//   //       parseInt(f.status) === FILE_STATUS.ApprovedByHOD
//   //     ).length,
//   //     sentBack: filesArray.filter(f => 
//   //       parseInt(f.status) === FILE_STATUS.SemBack
//   //     ).length
//   //   };
    
//   //   console.log('📊 Commissioner: Calculated stats:', stats);
//   //   setDashboardStats(stats);
//   // };

//   const calculateDashboardStats = (filesArray) => {
//   const stats = {
//     totalFiles: filesArray.length,
//     sharedToCommissioner: filesArray.filter(f => f.isSharedWithCommissioner).length,
//     blockchainVerified: filesArray.filter(f => 
//       parseInt(f.status) === FILE_STATUS.Forwarded || 
//       parseInt(f.status) === FILE_STATUS.CommissionerApproved
//     ).length,
//     pendingVerification: filesArray.filter(f => 
//       parseInt(f.status) < FILE_STATUS.Forwarded
//     ).length,
//     // FIXED: Approved by HOD includes ApprovedByHOD, Forwarded, and CommissionerApproved
//     approvedByHOD: filesArray.filter(f => 
//       parseInt(f.status) === FILE_STATUS.ApprovedByHOD || 
//       parseInt(f.status) === FILE_STATUS.Forwarded ||
//       parseInt(f.status) === FILE_STATUS.CommissionerApproved
//     ).length,
//     sentBack: filesArray.filter(f => 
//       parseInt(f.status) === FILE_STATUS.SemBack
//     ).length
//   };
  
//   console.log('📊 Commissioner: Calculated stats:', stats);
//   setDashboardStats(stats);
// };
//   // File Actions - Commissioner only monitors, no actions
//   const handleViewFileDetails = async (fileId) => {
//     try {
//       console.log('🔍 Commissioner: Fetching detailed file info for:', fileId);
//       const fileDetails = await contract.methods.files(fileId).call();
//       const fileName = await contract.methods.fileNames(fileId).call();
//       const hodRemark = await contract.methods.hodRemarks(fileId).call();
      
//       console.log('📋 Commissioner: File details:', {
//         fileDetails,
//         fileName,
//         hodRemark
//       });

//       setSelectedFile({
//         id: fileId,
//         fileName,
//         owner: fileDetails.owner,
//         status: fileDetails.status,
//         uploadTimestamp: fileDetails.uploadTimestamp,
//         lastUpdateTimestamp: fileDetails.lastUpdateTimestamp,
//         isSharedWithCommissioner: fileDetails.isSharedWithCommissioner,
//         hodRemark: hodRemark,
//         ipfsHash: fileDetails.ipfsHash
//       });
//       setShowFileDetails(true);
      
//     } catch (error) {
//       console.error('❌ Commissioner: Error fetching file details:', error);
//       alert('Error fetching file details');
//     }
//   };

//   // UI Helpers
//   const getStatusBadge = (status) => {
//     const statusNum = parseInt(status);
//     const config = STATUS_CONFIG[statusNum] || STATUS_CONFIG[0];
//     return (
//       <Badge bg={config.variant} className="d-flex align-items-center gap-1">
//         <span>{config.icon}</span>
//         {config.label}
//       </Badge>
//     );
//   };

//   const getBCStatusBadge = (file) => {
//     const status = parseInt(file.status);
//     if (status === FILE_STATUS.Forwarded || status === FILE_STATUS.CommissionerApproved) {
//       return <Badge bg="success">Blockchain Verified</Badge>;
//     } else {
//       return <Badge bg="warning">Pending Verification</Badge>;
//     }
//   };

//   const getSharedBadge = (isShared) => {
//     return isShared ? 
//       <Badge bg="success">Yes</Badge> : 
//       <Badge bg="secondary">No</Badge>;
//   };

//   const formatAddress = (address) => {
//     if (!address) return 'Unknown';
//     return `${address.slice(0, 6)}...${address.slice(-4)}`;
//   };

//   const formatTimestamp = (timestamp) => {
//     if (!timestamp) return 'Unknown';
//     return new Date(parseInt(timestamp) * 1000).toLocaleDateString();
//   };

//   // Filter files for tabs
//   // const getFilteredFiles = () => {
//   //   switch(activeTab) {
//   //     case 'pending':
//   //       return files.filter(f => parseInt(f.status) === FILE_STATUS.UnderHODReview);
//   //     case 'returned':
//   //       return files.filter(f => parseInt(f.status) === FILE_STATUS.SemBack);
//   //     case 'approved':
//   //       return files.filter(f => parseInt(f.status) === FILE_STATUS.ApprovedByHOD);
//   //     case 'forwarded':
//   //       return files.filter(f => parseInt(f.status) === FILE_STATUS.Forwarded);
//   //     case 'all':
//   //     default:
//   //       return files;
//   //   }
//   // };
//   // Filter files for tabs
// const getFilteredFiles = () => {
//   switch(activeTab) {
//     case 'pending':
//       return files.filter(f => parseInt(f.status) === FILE_STATUS.UnderHODReview);
//     case 'returned':
//       return files.filter(f => parseInt(f.status) === FILE_STATUS.SemBack);
//     case 'approved':
//       // FIXED: Include all files that were approved by HOD
//       return files.filter(f => 
//         parseInt(f.status) === FILE_STATUS.ApprovedByHOD || 
//         parseInt(f.status) === FILE_STATUS.Forwarded ||
//         parseInt(f.status) === FILE_STATUS.CommissionerApproved
//       );
//     case 'forwarded':
//       return files.filter(f => parseInt(f.status) === FILE_STATUS.Forwarded);
//     case 'all':
//     default:
//       return files;
//   }
// };

//   // Effects
//   useEffect(() => {
//     if (isConnected && contract && account && userRole === USER_ROLES.Commissioner) {
//       loadDashboardData();
//     }
//   }, [isConnected, contract, account, userRole, refreshTrigger]);

//   // Connection check on load
//   useEffect(() => {
//     const checkConnection = async () => {
//       if (window.ethereum) {
//         try {
//           const web3Instance = new Web3(window.ethereum);
//           const accounts = await web3Instance.eth.getAccounts();
//           if (accounts.length > 0) {
//             const contractInstance = new web3Instance.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
//             setWeb3(web3Instance);
//             setAccount(accounts[0]);
//             setContract(contractInstance);
//             setIsConnected(true);
//             await checkUserRegistration(contractInstance, accounts[0]);
//           }
//         } catch (error) {
//           console.error('Commissioner: Initial connection error:', error);
//         }
//       }
//     };

//     checkConnection();
//   }, []);

//   // Debug current state
//   console.log('📊 Current Commissioner Dashboard State:', {
//     isConnected,
//     account,
//     userRole,
//     userRoleName: getRoleName(userRole),
//     filesCount: files.length,
//     dashboardStats,
//     activeTab,
//     dashboardLoaded
//   });

//   // Render based on connection and role states
//   if (!isConnected) {
//     return (
//       <Container className="py-5">
//         <Row className="justify-content-center">
//           <Col md={6} lg={4}>
//             <Card className="border-0 shadow">
//               <Card.Body className="text-center p-5">
//                 <h3 className="mb-4">👑 Commissioner Portal</h3>
//                 <p className="text-muted mb-4">
//                   Connect your wallet to access the Commissioner monitoring dashboard
//                 </p>
                
//                 {error && <Alert variant="danger">{error}</Alert>}
                
//                 <Button 
//                   variant="primary" 
//                   size="lg" 
//                   className="w-100"
//                   onClick={connectWallet}
//                   disabled={loading}
//                 >
//                   {loading ? <Spinner size="sm" /> : 'Connect MetaMask'}
//                 </Button>
//               </Card.Body>
//             </Card>
//           </Col>
//         </Row>
//       </Container>
//     );
//   }

//   // Check for both null and 0 (UserRole.None)
//   if (userRole === null || userRole === USER_ROLES.None || userRole !== USER_ROLES.Commissioner) {
//     return (
//       <Container className="py-5">
//         <Row className="justify-content-center">
//           <Col md={8} lg={6}>
//             <Card className="border-0 shadow">
//               <Card.Body className="text-center p-5">
//                 <h3 className="mb-4">
//                   {userRole === null || userRole === USER_ROLES.None ? 'Commissioner Registration Required' : 'Access Restricted'}
//                 </h3>
                
//                 <Card className="mb-4">
//                   <Card.Body>
//                     <Row>
//                       <Col>
//                         <small className="text-muted">Wallet</small>
//                         <div>{formatAddress(account)}</div>
//                       </Col>
//                       <Col>
//                         <small className="text-muted">Role</small>
//                         <div className={userRole === USER_ROLES.Commissioner ? 'text-success' : 'text-warning'}>
//                           {getRoleName(userRole)}
//                         </div>
//                       </Col>
//                     </Row>
//                   </Card.Body>
//                 </Card>

//                 {(userRole === null || userRole === USER_ROLES.None) && (
//                   <>
//                     <Button 
//                       variant="success" 
//                       size="lg"
//                       onClick={registerUser}
//                       disabled={loading}
//                       className="mb-3 w-100"
//                     >
//                       {loading ? <Spinner size="sm" /> : 'Register as Commissioner'}
//                     </Button>
//                     <div className="text-muted mb-3">
//                       <small>You need to register as a Commissioner to access the monitoring dashboard</small>
//                     </div>
//                   </>
//                 )}
                
//                 <Button variant="outline-secondary" onClick={connectWallet} className="w-100">
//                   Switch Account
//                 </Button>
//               </Card.Body>
//             </Card>
//           </Col>
//         </Row>
//       </Container>
//     );
//   }

//   // Main Dashboard (only shown for registered Commissioners)
//   return (
//     <Container fluid className="py-4">
//       {/* Header */}
//       <Row className="mb-4">
//         <Col>
//           <div className="d-flex justify-content-between align-items-center">
//             <div>
//               <h2 className="mb-1">👑 Commissioner Monitoring Dashboard</h2>
//               <p className="text-muted mb-0">Complete Document Tracking & Status Monitoring</p>
//             </div>
//             <div className="d-flex align-items-center gap-3">
//               <Badge bg="primary" className="fs-6 p-2">
//                 Commissioner: {formatAddress(account)}
//               </Badge>
//               <Button 
//                 variant="outline-primary" 
//                 size="sm"
//                 onClick={() => setRefreshTrigger(prev => prev + 1)}
//                 disabled={loading}
//               >
//                 {loading ? <Spinner size="sm" /> : '🔄 Refresh'}
//               </Button>
//             </div>
//           </div>
//         </Col>
//       </Row>

//       {loading && !dashboardLoaded && (
//         <Row className="mb-4">
//           <Col>
//             <Alert variant="info" className="text-center">
//               <Spinner size="sm" className="me-2" />
//               Loading Commissioner Monitoring Dashboard...
//             </Alert>
//           </Col>
//         </Row>
//       )}

//       {/* Statistics Cards */}
//       <Row className="mb-4">
//         <Col xl={2} md={4} className="mb-3">
//           <Card className="h-100 border-0 shadow-sm">
//             <Card.Body className="text-center">
//               <div className="fs-1 text-primary mb-2">📊</div>
//               <h3 className="text-primary">{dashboardStats.totalFiles}</h3>
//               <small className="text-muted">Total Files</small>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col xl={2} md={4} className="mb-3">
//           <Card className="h-100 border-0 shadow-sm">
//             <Card.Body className="text-center">
//               <div className="fs-1 text-info mb-2">📨</div>
//               <h3 className="text-info">{dashboardStats.sharedToCommissioner}</h3>
//               <small className="text-muted">Shared to Commissioner</small>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col xl={2} md={4} className="mb-3">
//           <Card className="h-100 border-0 shadow-sm">
//             <Card.Body className="text-center">
//               <div className="fs-1 text-success mb-2">🔗</div>
//               <h3 className="text-success">{dashboardStats.blockchainVerified}</h3>
//               <small className="text-muted">Blockchain Verified</small>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col xl={2} md={4} className="mb-3">
//           <Card className="h-100 border-0 shadow-sm">
//             <Card.Body className="text-center">
//               <div className="fs-1 text-warning mb-2">⏳</div>
//               <h3 className="text-warning">{dashboardStats.pendingVerification}</h3>
//               <small className="text-muted">Pending Verification</small>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col xl={2} md={4} className="mb-3">
//           <Card className="h-100 border-0 shadow-sm">
//             <Card.Body className="text-center">
//               <div className="fs-1 text-success mb-2">✅</div>
//               <h3 className="text-success">{dashboardStats.approvedByHOD}</h3>
//               <small className="text-muted">Approved by HOD</small>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col xl={2} md={4} className="mb-3">
//           <Card className="h-100 border-0 shadow-sm">
//             <Card.Body className="text-center">
//               <div className="fs-1 text-danger mb-2">↩️</div>
//               <h3 className="text-danger">{dashboardStats.sentBack}</h3>
//               <small className="text-muted">Returned</small>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       {/* Files Section */}
//       <Row>
//         <Col>
//           <Card className="border-0 shadow">
//             <Card.Header className="bg-primary text-white">
//               <div className="d-flex justify-content-between align-items-center">
//                 <h5 className="mb-0">📋 All Documents - Complete Overview</h5>
//                 <div>
//                   <Badge bg="light" text="dark" className="me-2">
//                     Total: {files.length}
//                   </Badge>
//                 </div>
//               </div>
//             </Card.Header>
//             <Card.Body className="p-0">
//               <Tabs
//                 activeKey={activeTab}
//                 onSelect={setActiveTab}
//                 className="px-3 pt-3"
//                 fill
//               >
//                 <Tab eventKey="all" title={
//                   <span>
//                     All Files <Badge bg="primary">{files.length}</Badge>
//                   </span>
//                 }>
//                   <CommissionerFileTable 
//                     files={getFilteredFiles()}
//                     loading={loading}
//                     getStatusBadge={getStatusBadge}
//                     getBCStatusBadge={getBCStatusBadge}
//                     getSharedBadge={getSharedBadge}
//                     formatTimestamp={formatTimestamp}
//                     handleViewFileDetails={handleViewFileDetails}
//                   />
//                 </Tab>

//                 <Tab eventKey="pending" title={
//                   <span>
//                     Pending Review <Badge bg="warning">{dashboardStats.pendingVerification}</Badge>
//                   </span>
//                 }>
//                   <CommissionerFileTable 
//                     files={getFilteredFiles()}
//                     loading={loading}
//                     getStatusBadge={getStatusBadge}
//                     getBCStatusBadge={getBCStatusBadge}
//                     getSharedBadge={getSharedBadge}
//                     formatTimestamp={formatTimestamp}
//                     handleViewFileDetails={handleViewFileDetails}
//                   />
//                 </Tab>

//                 <Tab eventKey="returned" title={
//                   <span>
//                     Returned <Badge bg="danger">{dashboardStats.sentBack}</Badge>
//                   </span>
//                 }>
//                   <CommissionerFileTable 
//                     files={getFilteredFiles()}
//                     loading={loading}
//                     getStatusBadge={getStatusBadge}
//                     getBCStatusBadge={getBCStatusBadge}
//                     getSharedBadge={getSharedBadge}
//                     formatTimestamp={formatTimestamp}
//                     handleViewFileDetails={handleViewFileDetails}
//                   />
//                 </Tab>

//                 <Tab eventKey="approved" title={
//                   <span>
//                     Approved by HOD <Badge bg="success">{dashboardStats.approvedByHOD}</Badge>
//                   </span>
//                 }>
//                   <CommissionerFileTable 
//                     files={getFilteredFiles()}
//                     loading={loading}
//                     getStatusBadge={getStatusBadge}
//                     getBCStatusBadge={getBCStatusBadge}
//                     getSharedBadge={getSharedBadge}
//                     formatTimestamp={formatTimestamp}
//                     handleViewFileDetails={handleViewFileDetails}
//                   />
//                 </Tab>

//                 <Tab eventKey="forwarded" title={
//                   <span>
//                     Forwarded <Badge bg="info">{dashboardStats.sharedToCommissioner}</Badge>
//                   </span>
//                 }>
//                   <CommissionerFileTable 
//                     files={getFilteredFiles()}
//                     loading={loading}
//                     getStatusBadge={getStatusBadge}
//                     getBCStatusBadge={getBCStatusBadge}
//                     getSharedBadge={getSharedBadge}
//                     formatTimestamp={formatTimestamp}
//                     handleViewFileDetails={handleViewFileDetails}
//                   />
//                 </Tab>
//               </Tabs>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       {/* File Details Modal */}
//       <Modal show={showFileDetails} onHide={() => setShowFileDetails(false)} centered size="lg">
//         <Modal.Header closeButton className="bg-primary text-white">
//           <Modal.Title>📋 Document Details</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedFile && (
//             <>
//               <Row className="mb-3">
//                 <Col md={6}>
//                   <strong>Document ID:</strong> F-{selectedFile.id}
//                 </Col>
//                 <Col md={6}>
//                   <strong>Uploaded By:</strong> {formatAddress(selectedFile.owner)}
//                 </Col>
//               </Row>
//               <Row className="mb-3">
//                 <Col md={6}>
//                   <strong>File Name:</strong> {selectedFile.fileName}
//                 </Col>
//                 <Col md={6}>
//                   <strong>Status:</strong> {getStatusBadge(selectedFile.status)}
//                 </Col>
//               </Row>
//               <Row className="mb-3">
//                 <Col md={6}>
//                   <strong>Upload Date:</strong> {formatTimestamp(selectedFile.uploadTimestamp)}
//                 </Col>
//                 <Col md={6}>
//                   <strong>Last Updated:</strong> {formatTimestamp(selectedFile.lastUpdateTimestamp)}
//                 </Col>
//               </Row>
//               <Row className="mb-3">
//                 <Col md={6}>
//                   <strong>Shared with Commissioner:</strong> {getSharedBadge(selectedFile.isSharedWithCommissioner)}
//                 </Col>
//                 <Col md={6}>
//                   <strong>Blockchain Status:</strong> {getBCStatusBadge(selectedFile)}
//                 </Col>
//               </Row>
//               {selectedFile.hodRemark && (
//                 <Row className="mb-3">
//                   <Col>
//                     <strong>HOD Remark:</strong>
//                     <div className="mt-1 p-2 bg-light rounded">
//                       {selectedFile.hodRemark}
//                     </div>
//                   </Col>
//                 </Row>
//               )}
//               <Row className="mt-4">
//                 <Col className="text-center">
//                   <Button
//                     variant="primary"
//                     href={`https://ipfs.io/ipfs/${selectedFile.ipfsHash}`}
//                     target="_blank"
//                     className="me-2"
//                   >
//                     📄 View Document
//                   </Button>
//                   <Button
//                     variant="success"
//                     href={`https://ipfs.io/ipfs/${selectedFile.ipfsHash}?download=1`}
//                   >
//                     ⬇️ Download
//                   </Button>
//                 </Col>
//               </Row>
//             </>
//           )}
//         </Modal.Body>
//       </Modal>
//     </Container>
//   );
// };

// // Commissioner File Table Component
// const CommissionerFileTable = ({ 
//   files, 
//   loading, 
//   getStatusBadge, 
//   getBCStatusBadge, 
//   getSharedBadge, 
//   formatTimestamp, 
//   handleViewFileDetails 
// }) => {
//   if (loading) {
//     return (
//       <div className="text-center py-5">
//         <Spinner animation="border" variant="primary" />
//         <p className="mt-2 text-muted">Loading documents for monitoring...</p>
//       </div>
//     );
//   }

//   if (files.length === 0) {
//     return (
//       <div className="text-center py-5">
//         <div className="fs-1 text-muted mb-3">📭</div>
//         <h5>No documents found</h5>
//         <p className="text-muted">There are no documents in this category.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="table-responsive">
//       <Table hover className="mb-0">
//         <thead className="bg-light">
//           <tr>
//             <th>ID</th>
//             <th>Name</th>
//             <th>HOD Remark</th>
//             <th>Status</th>
//             <th>BC Status</th>
//             <th>Shared</th>
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {files.map((file) => (
//             <tr key={file.id}>
//               <td><strong>F-{file.id}</strong></td>
//               <td>
//                 <div className="fw-bold">{file.fileName}</div>
//                 <small className="text-muted">
//                   Uploaded: {formatTimestamp(file.uploadTimestamp)}
//                 </small>
//               </td>
//               <td>
//                 {file.hodRemark ? (
//                   <small className="text-warning">{file.hodRemark}</small>
//                 ) : (
//                   <small className="text-muted">-</small>
//                 )}
//               </td>
//               <td>{getStatusBadge(file.status)}</td>
//               <td>{getBCStatusBadge(file)}</td>
//               <td>{getSharedBadge(file.isSharedWithCommissioner)}</td>
//               <td>
//                 <div className="d-flex gap-1 flex-wrap">
//                   <Button 
//                     size="sm" 
//                     variant="outline-info"
//                     onClick={() => handleViewFileDetails(file.id)}
//                   >
//                     🔍 Details
//                   </Button>
//                   <Button 
//                     size="sm" 
//                     variant="outline-success"
//                     href={file.downloadLink}
//                     target="_blank"
//                   >
//                     ⬇️ Download
//                   </Button>
//                 </div>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </Table>
//     </div>
//   );
// };

// export default CommissionerDashboard;



// components/Dashboard/CommissionerDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, Row, Col, Card, Button, Modal, 
  Alert, Spinner, Badge, ProgressBar, Tabs, Tab, Table
} from 'react-bootstrap';
import Web3 from 'web3';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../../Utils/constants";
import { useLocation, useNavigate } from 'react-router-dom';

const CommissionerDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { phone, department: loginDepartment } = location.state || {};
  
  console.log("🔍 Location state received in Commissioner-DB:", { phone, department: loginDepartment });

  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [registrationChecked, setRegistrationChecked] = useState(false);

  // Commissioner Dashboard States
  const [files, setFiles] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalFiles: 0,
    pendingReview: 0,
    sentBack: 0,
    approvedByHOD: 0,
    resubmitted: 0
  });

  const [activeTab, setActiveTab] = useState('all');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFileDetails, setShowFileDetails] = useState(false);
  const [dashboardLoaded, setDashboardLoaded] = useState(false);

  // File Status Constants - Updated to match contract
  const FILE_STATUS = {
    Provided: 0,
    UnderHODReview: 1,
    SemBack: 2,
    ApprovedByHOD: 3,
    Resubmitted: 4
  };

  const STATUS_CONFIG = {
    0: { label: 'Uploaded', variant: 'secondary', icon: '📤' },
    1: { label: 'Under HOD Review', variant: 'warning', icon: '👀' },
    2: { label: 'Sent Back', variant: 'danger', icon: '↩️' },
    3: { label: 'Approved by HOD', variant: 'success', icon: '✅' },
    4: { label: 'Resubmitted', variant: 'info', icon: '🔄' }
  };

  // Role Constants
  const USER_ROLES = {
    None: 0,
    User: 1,
    HOD: 2,
    Commissioner: 3
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

  // Check user registration status
  const checkUserRegistration = async (contractInstance, userAddress) => {
    try {
      console.log('🔍 Commissioner: Checking user registration...');
      
      const role = await contractInstance.methods.getUserRole(userAddress).call();
      const roleNumber = parseInt(role);
      console.log('📊 Commissioner: User role from blockchain:', roleNumber);
      
      setUserRole(roleNumber);
      setRegistrationChecked(true);

      if (roleNumber === USER_ROLES.Commissioner) {
        console.log('✅ Commissioner: User is registered Commissioner, loading dashboard...');
        await loadDashboardData();
      } else {
        console.log('ℹ️ Commissioner: User needs registration as Commissioner');
      }

    } catch (error) {
      console.error('❌ Commissioner: Registration check error:', error);
      setUserRole(null);
      setRegistrationChecked(true);
    }
  };

  // Check if user needs registration
  const needsRegistration = useCallback(async (contractInstance, userAddress) => {
    try {
      if (!contractInstance || !userAddress) return true;
      
      const role = await contractInstance.methods.getUserRole(userAddress).call();
      const roleNumber = parseInt(role);
      
      console.log('🔍 Commissioner Registration check - Current role:', roleNumber);
      
      // Return true if user is not registered as Commissioner
      return roleNumber !== USER_ROLES.Commissioner;
    } catch (error) {
      console.error('❌ Commissioner: Error checking registration status:', error);
      return true;
    }
  }, []);

  // Register user as Commissioner
  const registerUser = async () => {
    try {
      // Double-check if already registered before proceeding
      const registrationNeeded = await needsRegistration(contract, account);
      if (!registrationNeeded) {
        console.log('ℹ️ Commissioner already registered, skipping registration');
        await checkUserRegistration(contract, account);
        return;
      }

      setRegistrationLoading(true);
      console.log('📝 Commissioner: Registering as Commissioner...');

      // Commissioner role is 3 in the enum, department should be "None" for Commissioner
      const transaction = await contract.methods.registerUser(USER_ROLES.Commissioner, "None").send({ 
        from: account
      });
      
      console.log('✅ Commissioner: Registration successful:', transaction);
      
      // Re-check registration status
      await checkUserRegistration(contract, account);
      alert('Commissioner Registration successful!');
      
    } catch (error) {
      console.error('❌ Commissioner: Registration error:', error);
      
      if (error.message && error.message.includes('AlreadyRegistered')) {
        console.log('ℹ️ Commissioner already registered, checking status...');
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
    if (!contract || !account || userRole !== USER_ROLES.Commissioner) return;

    try {
      setLoading(true);
      setDashboardLoaded(false);
      console.log('📊 Commissioner: Loading dashboard data...');
      await fetchAllFiles();
      setDashboardLoaded(true);
      console.log('✅ Commissioner: Dashboard data loaded successfully');
    } catch (error) {
      console.error('❌ Commissioner: Dashboard data loading error:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch ALL files using getAllCommissionerSharedFiles from contract
  const fetchAllFiles = async () => {
    try {
      console.log('📂 Commissioner: Fetching ALL files for monitoring...');
      
      // Use the contract function specifically for Commissioner
      const filesArray = await contract.methods.getAllCommissionerSharedFiles().call({ from: account });
      console.log('✅ Commissioner: Raw files from contract:', filesArray);

      const formattedFiles = await Promise.all(
        filesArray.map(async (file) => {
          try {
            // Get file name from fileNames mapping
            let fileName = `Document ${file.id}`;
            try {
              const name = await contract.methods.fileNames(file.id).call();
              if (name && name !== '') {
                fileName = name;
              }
            } catch (err) {
              console.log(`No file name for ${file.id}`);
            }

            return {
              id: file.id.toString(),
              ipfsHash: file.ipfsHash,
              fileName: fileName,
              status: file.status,
              department: file.department,
              hodRemark: file.hodRemark,
              owner: file.owner,
              viewLink: `https://ipfs.io/ipfs/${file.ipfsHash}`,
              downloadLink: `https://ipfs.io/ipfs/${file.ipfsHash}?download=1`
            };
          } catch (error) {
            console.error(`Error processing file ${file.id}:`, error);
            return null;
          }
        })
      );

      // Filter out null values and set files
      const validFiles = formattedFiles.filter(file => file !== null);
      console.log('✅ Commissioner: Formatted files:', validFiles);
      setFiles(validFiles);
      calculateDashboardStats(validFiles);
      
    } catch (error) {
      console.error('❌ Commissioner: Error fetching files:', error);
      // Fallback to manual file fetching if the view function fails
      await fetchAllFilesManually();
    }
  };

  // Manual fallback for fetching files
  const fetchAllFilesManually = async () => {
    try {
      console.log('🔄 Commissioner: Using manual file fetch fallback...');
      const allFiles = [];
      
      // Get file count first
      let fileCount = 0;
      try {
        fileCount = await contract.methods.getFileCount().call();
        console.log('📁 Commissioner: Total files in system:', fileCount);
      } catch (error) {
        console.log('🔄 Commissioner: Using default file count range');
        fileCount = 50; // fallback
      }

      // Fetch files from ID 1001 onwards
      for (let i = 1001; i <= 1000 + parseInt(fileCount) + 10; i++) {
        try {
          const file = await contract.methods.files(i).call();
          
          // Check if file exists (has valid ID and IPFS hash)
          if (file.id !== '0' && file.ipfsHash && file.ipfsHash !== '') {
            // Get file name
            let fileName = `Document ${i}`;
            try {
              const name = await contract.methods.fileNames(i).call();
              if (name && name !== '') {
                fileName = name;
              }
            } catch (err) {
              console.log(`No file name for ${i}`);
            }

            const fileData = {
              id: i.toString(),
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
            };

            allFiles.push(fileData);
          }
        } catch (error) {
          // File doesn't exist, continue to next
          continue;
        }
      }
      
      console.log('✅ Commissioner: Manual files loaded:', allFiles);
      setFiles(allFiles);
      calculateDashboardStats(allFiles);
      
    } catch (error) {
      console.error('❌ Commissioner: Manual file fetch error:', error);
      setFiles([]);
    }
  };

  // Calculate dashboard statistics based on actual contract statuses
  const calculateDashboardStats = (filesArray) => {
    const stats = {
      totalFiles: filesArray.length,
      pendingReview: filesArray.filter(f => parseInt(f.status) === FILE_STATUS.UnderHODReview).length,
      sentBack: filesArray.filter(f => parseInt(f.status) === FILE_STATUS.SemBack).length,
      approvedByHOD: filesArray.filter(f => parseInt(f.status) === FILE_STATUS.ApprovedByHOD).length,
      resubmitted: filesArray.filter(f => parseInt(f.status) === FILE_STATUS.Resubmitted).length
    };
    
    console.log('📊 Commissioner: Calculated stats:', stats);
    setDashboardStats(stats);
  };

  // File Actions - Commissioner only monitors, no actions
  const handleViewFileDetails = (file) => {
    console.log('🔍 Commissioner: Viewing file details:', file);
    setSelectedFile(file);
    setShowFileDetails(true);
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

  const formatAddress = (address) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString();
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

  // Auto-register Commissioner when conditions are met
  useEffect(() => {
    const autoRegisterCommissioner = async () => {
      if (isConnected && 
          contract && 
          account && 
          !registrationLoading && 
          !loading &&
          registrationChecked &&
          userRole !== USER_ROLES.Commissioner) {
        
        const registrationNeeded = await needsRegistration(contract, account);
        
        if (registrationNeeded) {
          console.log('🚀 Auto-registering Commissioner on blockchain...');
          console.log('📋 Registration details:', {
            account,
            currentBlockchainRole: userRole
          });
          
          await registerUser();
        } else {
          console.log('✅ Commissioner already properly registered on blockchain');
          await checkUserRegistration(contract, account);
        }
      }
    };

    autoRegisterCommissioner();
  }, [isConnected, contract, account, registrationLoading, loading, registrationChecked, userRole, needsRegistration]);

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
                <h3 className="mb-4">👑 Commissioner Portal</h3>
                <p className="text-muted mb-4">
                  Connect your wallet to access the Commissioner monitoring dashboard
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
  if (userRole !== USER_ROLES.Commissioner) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="border-0 shadow">
              <Card.Body className="text-center p-5">
                <h3 className="mb-4">
                  {userRole === null || userRole === USER_ROLES.None ? 'Commissioner Registration Required' : 'Access Restricted'}
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
                        <div className={userRole === USER_ROLES.Commissioner ? 'text-success fw-bold' : 'text-warning'}>
                          {getRoleName(userRole)}
                        </div>
                      </Col>
                    </Row>
                    <Row className="mt-3">
                      <Col>
                        <small className="text-muted">Expected Role</small>
                        <div className="text-success fw-bold">Commissioner</div>
                      </Col>
                      <Col>
                        <small className="text-muted">Department</small>
                        <div className="text-info fw-bold">None (Commissioner Role)</div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {(userRole === null || userRole === USER_ROLES.None) && (
                  <div>
                    <p className="text-muted mb-3">
                      You need to register as Commissioner on the blockchain to access the monitoring dashboard.
                    </p>
                    <Button 
                      variant="success" 
                      size="lg"
                      onClick={registerUser}
                      disabled={registrationLoading}
                      className="mb-3 w-100"
                    >
                      {registrationLoading ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          Registering...
                        </>
                      ) : (
                        'Register as Commissioner on Blockchain'
                      )}
                    </Button>
                  </div>
                )}
                
                {userRole === USER_ROLES.HOD && (
                  <Alert variant="warning">
                    Your wallet is registered as HOD, not Commissioner. Please switch accounts.
                  </Alert>
                )}

                {userRole === USER_ROLES.User && (
                  <Alert variant="warning">
                    Your wallet is registered as User, not Commissioner. Please switch accounts.
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

  // Main Dashboard - User is connected and registered as Commissioner
  return (
    <Container fluid className="py-4 app-container">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h2 className="mb-1 text-white">👑 Commissioner Monitoring Dashboard</h2>
              <p className="text-light mb-0">
                Complete Document Tracking & Status Monitoring Across All Departments
              </p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Badge bg="primary" className="fs-6">
                Commissioner: {formatAddress(account)}
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

      {loading && !dashboardLoaded && (
        <Row className="mb-4">
          <Col>
            <Alert variant="info" className="text-center">
              <Spinner size="sm" className="me-2" />
              Loading Commissioner Monitoring Dashboard...
            </Alert>
          </Col>
        </Row>
      )}

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
              <small className="text-light">Pending HOD Review</small>
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
              <h4 className="text-success">{dashboardStats.approvedByHOD}</h4>
              <small className="text-light">Approved by HOD</small>
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
              <h4 className="text-secondary">
                {dashboardStats.totalFiles > 0 
                  ? Math.round((dashboardStats.approvedByHOD / dashboardStats.totalFiles) * 100) 
                  : 0}%
              </h4>
              <small className="text-light">Approval Rate</small>
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
                  All Department Documents - Complete Overview
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
                      { key: 'approved', label: 'Approved', icon: '✅', count: dashboardStats.approvedByHOD, variant: 'success' },
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
                  <CommissionerFileTable 
                    files={getFilteredFiles()}
                    loading={loading}
                    getStatusBadge={getStatusBadge}
                    formatTimestamp={formatTimestamp}
                    formatAddress={formatAddress}
                    handleViewFileDetails={handleViewFileDetails}
                  />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* File Details Modal */}
      <Modal show={showFileDetails} onHide={() => setShowFileDetails(false)} centered size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>📋 Document Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light">
          {selectedFile && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Document ID:</strong> #{selectedFile.id}
                </Col>
                <Col md={6}>
                  <strong>Uploaded By:</strong> {formatAddress(selectedFile.owner)}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>File Name:</strong> {selectedFile.fileName}
                </Col>
                <Col md={6}>
                  <strong>Status:</strong> {getStatusBadge(selectedFile.status)}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Department:</strong> <Badge bg="info">{selectedFile.department}</Badge>
                </Col>
                <Col md={6}>
                  <strong>IPFS Hash:</strong> 
                  <small className="font-monospace d-block text-truncate">{selectedFile.ipfsHash}</small>
                </Col>
              </Row>
              {selectedFile.uploadTimestamp && (
                <Row className="mb-3">
                  <Col md={6}>
                    <strong>Upload Date:</strong> {formatTimestamp(selectedFile.uploadTimestamp)}
                  </Col>
                  <Col md={6}>
                    <strong>Last Updated:</strong> {formatTimestamp(selectedFile.lastUpdateTimestamp)}
                  </Col>
                </Row>
              )}
              {selectedFile.hodRemark && selectedFile.hodRemark !== "" && (
                <Row className="mb-3">
                  <Col>
                    <strong>HOD Remark:</strong>
                    <div className="mt-1 p-2 bg-secondary rounded">
                      {selectedFile.hodRemark}
                    </div>
                  </Col>
                </Row>
              )}
              <Row className="mt-4">
                <Col className="text-center">
                  <Button
                    variant="outline-light"
                    href={selectedFile.viewLink}
                    target="_blank"
                    className="me-2"
                  >
                    📄 View Document
                  </Button>
                  <Button
                    variant="success"
                    href={selectedFile.downloadLink}
                    target="_blank"
                  >
                    ⬇️ Download
                  </Button>
                </Col>
              </Row>
            </>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

// Commissioner File Table Component
const CommissionerFileTable = ({ 
  files, 
  loading, 
  getStatusBadge, 
  formatTimestamp, 
  formatAddress, 
  handleViewFileDetails 
}) => {
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-light">Loading documents for monitoring...</p>
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
              
              <div className="mb-2">
                <small className="text-muted">
                  <strong>Uploaded By:</strong> {formatAddress(file.owner)}
                </small>
              </div>
              
              {file.hodRemark && file.hodRemark !== "" && (
                <div className="mb-2">
                  <small className="text-warning">
                    <strong>HOD Remark:</strong> {file.hodRemark}
                  </small>
                </div>
              )}
              
              <div className="d-flex gap-2 flex-wrap mt-3">
                <Button 
                  size="sm" 
                  variant="outline-info"
                  onClick={() => handleViewFileDetails(file)}
                >
                  🔍 Details
                </Button>
                <Button 
                  size="sm" 
                  variant="outline-success"
                  href={file.downloadLink}
                  target="_blank"
                >
                  ⬇️ Download
                </Button>
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
                <th className="border-0">HOD Remark</th>
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
                  </td>
                  <td className="border-0">
                    <Badge bg="info">{file.department}</Badge>
                  </td>
                  <td className="border-0">
                    <small className="text-muted font-monospace">{formatAddress(file.owner)}</small>
                  </td>
                  <td className="border-0">{getStatusBadge(file.status)}</td>
                  <td className="border-0">
                    {file.hodRemark && file.hodRemark !== "" ? (
                      <small className="text-warning">{file.hodRemark}</small>
                    ) : (
                      <small className="text-muted">-</small>
                    )}
                  </td>
                  <td className="border-0">
                    <div className="d-flex gap-1 flex-wrap">
                      <Button 
                        size="sm" 
                        variant="outline-info"
                        onClick={() => handleViewFileDetails(file)}
                      >
                        🔍 Details
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline-success"
                        href={file.downloadLink}
                        target="_blank"
                      >
                        ⬇️ Download
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default CommissionerDashboard;