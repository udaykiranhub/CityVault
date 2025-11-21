// // components/Dashboard/HODDashboard.jsx
// import React, { useState, useEffect } from 'react';
// import { 
//   Container, Row, Col, Card, Button, Modal, Form, 
//   Table, Alert, Spinner, Badge, ProgressBar, Tabs, Tab
// } from 'react-bootstrap';
// import Web3 from 'web3';
// import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../../Utils/constants";
// import HODFilesDisplay from './HODFilesDisplay';

// const HODDashboard = () => {
//   const [web3, setWeb3] = useState(null);
//   const [account, setAccount] = useState(null);
//   const [contract, setContract] = useState(null);
//   const [userRole, setUserRole] = useState(null);
//   const [isConnected, setIsConnected] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [refreshTrigger, setRefreshTrigger] = useState(0);

//   // HOD Specific States
//   const [dashboardStats, setDashboardStats] = useState({
//     totalFiles: 0,
//     pendingReview: 0,
//     sentBack: 0,
//     approved: 0,
//     forwarded: 0
//   });

//   const [showReviewModal, setShowReviewModal] = useState(false);
//   const [selectedFileForReview, setSelectedFileForReview] = useState(null);
//   const [reviewRemark, setReviewRemark] = useState('');
//   const [reviewAction, setReviewAction] = useState('');
//   const [reviewLoading, setReviewLoading] = useState(false);
//   const [activeTab, setActiveTab] = useState('pending');

//   // File status mapping for HOD
//   const fileStatusMap = {
//     0: { text: 'Uploaded', variant: 'primary', icon: '📤' },
//     1: { text: 'Under Review', variant: 'warning', icon: '👀' },
//     2: { text: 'Revisions Needed', variant: 'danger', icon: '↩️' },
//     3: { text: 'Approved', variant: 'success', icon: '✅' },
//     4: { text: 'Forwarded', variant: 'info', icon: '📨' },
//     5: { text: 'Commissioner Approved', variant: 'success', icon: '🏆' }
//   };

//   // Connect wallet and check registration
//   const connectWallet = async () => {
//     try {
//       setLoading(true);
//       setError('');
//       console.log('🔗 Starting HOD wallet connection...');

//       if (!window.ethereum) {
//         console.error('❌ MetaMask not detected');
//         setError('Please install MetaMask!');
//         return;
//       }

//       console.log('✅ MetaMask detected');
//       const web3Instance = new Web3(window.ethereum);
      
//       const accounts = await window.ethereum.request({ 
//         method: 'eth_requestAccounts' 
//       });
      
//       console.log('📋 Accounts received:', accounts);
//       const contractInstance = new web3Instance.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
      
//       setWeb3(web3Instance);
//       setAccount(accounts[0]);
//       setContract(contractInstance);
//       setIsConnected(true);

//       console.log('✅ HOD Wallet connected successfully');
//       await checkUserRegistration(contractInstance, accounts[0]);
      
//     } catch (error) {
//       console.error('❌ Error connecting wallet:', error);
//       if (error.code === 4001) {
//         setError('Please approve the connection in MetaMask.');
//       } else {
//         setError('Error connecting wallet. Please try again.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const checkUserRegistration = async (contractInstance, userAddress) => {
//     try {
//       console.log('🔍 Checking HOD registration for:', userAddress);
//       const role = await contractInstance.methods.getUserRole(userAddress).call();
//       console.log('📊 Raw role from contract:', role);
      
//       const roleNumber = parseInt(role);
//       console.log('🔢 Parsed role number:', roleNumber);
      
//       setUserRole(roleNumber !== 0 ? roleNumber.toString() : null);
      
//       if (roleNumber === 2) {
//         console.log('✅ User is HOD');
//       } else if (roleNumber !== 0) {
//         console.log('❌ User is not HOD');
//         setError('Connected account does not have HOD privileges.');
//       }
      
//     } catch (error) {
//       console.error('❌ Error checking user registration:', error);
//       setUserRole(null);
//     }
//   };

//   const registerUser = async () => {
//     try {
//       setLoading(true);
//       console.log('📝 Registering as HOD...');

//       // HOD role is 2 in the enum
//       const transaction = await contract.methods.registerUser(2).send({ 
//         from: account
//       });
      
//       console.log('✅ HOD Registration successful:', transaction);
//       await checkUserRegistration(contract, account);
//       alert('HOD Registration successful! You can now review files.');
//     } catch (error) {
//       console.error('❌ Error registering HOD:', error);
//       if (error.code === 4001) {
//         alert('Registration cancelled. Please click "Confirm" in MetaMask.');
//       } else {
//         alert('Registration failed. Please make sure you are connected to the correct network.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch HOD dashboard stats
//   const fetchHODDashboardStats = async () => {
//     if (!contract || !account) return;

//     try {
//       console.log('📊 Fetching HOD dashboard stats...');
//       const stats = await contract.methods.getHODDashboardStats().call({ from: account });
//       console.log('📈 Raw HOD stats from contract:', stats);
      
//       const formattedStats = {
//         totalFiles: parseInt(stats.totalFiles) || 0,
//         pendingReview: parseInt(stats.pendingReview) || 0,
//         sentBack: parseInt(stats.sentBack) || 0,
//         approved: parseInt(stats.approved) || 0,
//         forwarded: parseInt(stats.forwarded) || 0
//       };
      
//       console.log('📊 Formatted HOD dashboard stats:', formattedStats);
//       setDashboardStats(formattedStats);
//     } catch (error) {
//       console.error('❌ Error fetching HOD stats:', error);
//       // Manual calculation fallback
//       await calculateHODStatsManually();
//     }
//   };

//   // Manual calculation fallback for HOD stats
//   // const calculateHODStatsManually = async () => {
//   //   try {
//   //     console.log('📊 Calculating HOD stats manually...');
      
//   //     let totalFiles = 0;
//   //     let pendingReview = 0;
//   //     let sentBack = 0;
//   //     let approved = 0;
//   //     let forwarded = 0;

//   //     // Check files from ID 1001 to 1020
//   //     const startId = 1001;
//   //     const endId = startId + 20;
      
//   //     for (let i = startId; i <= endId; i++) {
//   //       try {
//   //         const file = await contract.methods.files(i).call();
//   //         if (file.id !== '0' && file.status >= 1) { // Files with HOD-related status
//   //           totalFiles++;
            
//   //           const status = parseInt(file.status);
//   //           switch(status) {
//   //             case 1: // Under Review
//   //               pendingReview++;
//   //               break;
//   //             case 2: // Sent Back
//   //               sentBack++;
//   //               break;
//   //             case 3: // Approved by HOD
//   //               approved++;
//   //               break;
//   //             case 4: // Forwarded
//   //               forwarded++;
//   //               break;
//   //           }
//   //         }
//   //       } catch (err) {
//   //         // File doesn't exist, continue
//   //       }
//   //     }
      
//   //     const formattedStats = {
//   //       totalFiles,
//   //       pendingReview,
//   //       sentBack,
//   //       approved,
//   //       forwarded
//   //     };
      
//   //     console.log('✅ Manually calculated HOD stats:', formattedStats);
//   //     setDashboardStats(formattedStats);
      
//   //   } catch (error) {
//   //     console.error('❌ Error calculating HOD stats manually:', error);
//   //     setDashboardStats({
//   //       totalFiles: 0,
//   //       pendingReview: 0,
//   //       sentBack: 0,
//   //       approved: 0,
//   //       forwarded: 0
//   //     });
//   //   }
//   // };
// // In calculateHODStatsManually function - CHANGE THIS
// const calculateHODStatsManually = async () => {
//   try {
//     console.log('📊 Calculating HOD stats manually...');
    
//     let totalFiles = 0;
//     let pendingReview = 0;
//     let sentBack = 0;
//     let approved = 0;
//     let forwarded = 0;

//     const startId = 1001;
//     const endId = startId + 100;
    
//     for (let i = startId; i <= endId; i++) {
//       try {
//         const file = await contract.methods.files(i).call();
//         // CHANGE: Include ALL files with IPFS hash, not just status >= 1
//         if (file.id !== '0' && file.ipfsHash && file.ipfsHash !== '') {
//           totalFiles++;
          
//           const status = parseInt(file.status);
//           switch(status) {
//             case 0: // Uploaded/Provided - HOD should see these too!
//               pendingReview++; // Count new uploads as pending review
//               break;
//             case 1: // Under Review
//               pendingReview++;
//               break;
//             case 2: // Sent Back
//               sentBack++;
//               break;
//             case 3: // Approved by HOD
//               approved++;
//               break;
//             case 4: // Forwarded
//               forwarded++;
//               break;
//           }
//         }
//       } catch (err) {
//         // File doesn't exist, continue
//       }
//     }
    
//     const formattedStats = {
//       totalFiles,
//       pendingReview,
//       sentBack,
//       approved,
//       forwarded
//     };
    
//     console.log('✅ Manually calculated HOD stats:', formattedStats);
//     setDashboardStats(formattedStats);
    
//   } catch (error) {
//     console.error('❌ Error calculating HOD stats manually:', error);
//     setDashboardStats({
//       totalFiles: 0,
//       pendingReview: 0,
//       sentBack: 0,
//       approved: 0,
//       forwarded: 0
//     });
//   }
// };
//   // Open review modal for a file
//   const openReviewModal = (file, action) => {
//     console.log('📝 Opening review modal for file:', file, 'Action:', action);
//     setSelectedFileForReview(file);
//     setReviewAction(action);
//     setReviewRemark('');
//     setShowReviewModal(true);
//   };

//   // Handle file review
//   const handleFileReview = async (e) => {
//     e.preventDefault();
//     if (!selectedFileForReview || !reviewAction) {
//       alert('Please select an action for the file review.');
//       return;
//     }

//     try {
//       setReviewLoading(true);
//       console.log('👨‍⚖️ Processing file review...');
      
//       let status;
//       switch(reviewAction) {
//         case 'approve':
//           status = 3; // ApprovedByHOD
//           break;
//         case 'sendback':
//           status = 2; // SemBack
//           break;
//         case 'underreview':
//           status = 1; // UnderHODReview
//           break;
//         default:
//           throw new Error('Invalid review action');
//       }

//       console.log(`🔄 Setting file ${selectedFileForReview.id} to status ${status}`);
      
//       const transaction = await contract.methods.reviewFile(
//         selectedFileForReview.id,
//         status,
//         reviewRemark
//       ).send({ 
//         from: account
//       });
      
//       console.log('✅ File review successful:', transaction);
      
//       // Refresh data
//       setRefreshTrigger(prev => prev + 1);
//       setShowReviewModal(false);
//       setSelectedFileForReview(null);
//       setReviewRemark('');
//       setReviewAction('');
      
//       alert(`File ${reviewAction === 'approve' ? 'approved' : reviewAction === 'sendback' ? 'sent back for revisions' : 'marked under review'} successfully!`);
      
//     } catch (error) {
//       console.error('❌ Error reviewing file:', error);
//       if (error.code === 4001) {
//         alert('Review action cancelled. Please click "Confirm" in MetaMask.');
//       } else {
//         alert('Review failed. Please check your connection.');
//       }
//     } finally {
//       setReviewLoading(false);
//     }
//   };

//   // Handle forward to commissioner
//   const handleForwardToCommissioner = async (fileId) => {
//     if (!window.confirm('Are you sure you want to forward this file to the Commissioner? This action cannot be undone.')) {
//       return;
//     }

//     try {
//       setReviewLoading(true);
//       console.log('📨 Forwarding file to commissioner:', fileId);
      
//       const transaction = await contract.methods.forwardToCommissioner(fileId).send({ 
//         from: account
//       });
      
//       console.log('✅ File forwarded successfully:', transaction);
      
//       // Refresh data
//       setRefreshTrigger(prev => prev + 1);
//       alert('File forwarded to Commissioner successfully!');
      
//     } catch (error) {
//       console.error('❌ Error forwarding file:', error);
//       if (error.code === 4001) {
//         alert('Forward action cancelled. Please click "Confirm" in MetaMask.');
//       } else {
//         alert('Forward failed. Please make sure the file is approved by HOD first.');
//       }
//     } finally {
//       setReviewLoading(false);
//     }
//   };

//   // Get status badge for file
//   const getStatusBadge = (status) => {
//     const statusInfo = fileStatusMap[status] || fileStatusMap[0];
//     return (
//       <Badge bg={statusInfo.variant} className="d-flex align-items-center gap-1">
//         <span>{statusInfo.icon}</span>
//         {statusInfo.text}
//       </Badge>
//     );
//   };

//   // Calculate review progress
//   const getReviewProgress = () => {
//     const total = dashboardStats.totalFiles;
//     if (total === 0) return 0;
//     const reviewed = dashboardStats.approved + dashboardStats.forwarded + dashboardStats.sentBack;
//     const progress = Math.round((reviewed / total) * 100);
//     return progress;
//   };

//   // Check connection on load
//   useEffect(() => {
//     console.log('🔍 Checking initial HOD connection...');
//     const checkConnection = async () => {
//       if (window.ethereum) {
//         try {
//           const web3Instance = new Web3(window.ethereum);
//           const accounts = await web3Instance.eth.getAccounts();
          
//           if (accounts.length > 0) {
//             console.log('✅ Existing HOD connection found');
//             const contractInstance = new web3Instance.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
//             setWeb3(web3Instance);
//             setAccount(accounts[0]);
//             setContract(contractInstance);
//             setIsConnected(true);
//             await checkUserRegistration(contractInstance, accounts[0]);
//           }
//         } catch (error) {
//           console.error('❌ Error checking HOD connection:', error);
//         }
//       }
//     };

//     checkConnection();

//     // Listen for account changes
//     if (window.ethereum) {
//       window.ethereum.on('accountsChanged', (accounts) => {
//         console.log('🔄 HOD Accounts changed:', accounts);
//         if (accounts.length > 0) {
//           setAccount(accounts[0]);
//           checkUserRegistration(contract, accounts[0]);
//         } else {
//           setAccount(null);
//           setUserRole(null);
//           setIsConnected(false);
//         }
//       });
//     }

//     return () => {
//       if (window.ethereum) {
//         window.ethereum.removeAllListeners('accountsChanged');
//       }
//     };
//   }, []);








  
//   // Load data when connected
//   useEffect(() => {
//     console.log('🔄 HOD useEffect triggered for connection change', {
//       isConnected,
//       contract: !!contract,
//       account
//     });
    
//     if (isConnected && contract && account && userRole === '2') {
//       console.log('✅ HOD Conditions met, fetching data...');
//       fetchHODDashboardStats();
//     }
//   }, [isConnected, contract, account, userRole]);

//   // Debug current state
//   console.log('📊 Current HOD component state:', {
//     isConnected,
//     account,
//     userRole,
//     loading,
//     dashboardStats
//   });


//   // Not connected state
//   if (!isConnected) {
//     return (
//       <Container className="py-4">
//         <Row className="justify-content-center min-vh-50">
//           <Col md={6} className="text-center">
//             <Card className="neo-card border-0 shadow-lg">
//               <Card.Body className="py-5">
//                 <div className="mb-4">
//                   <h1 className="text-white mb-3">👨‍💼 HOD Portal</h1>
//                   <p className="text-light mb-4">
//                     Head of Department - Document Review System
//                   </p>
//                 </div>
                
//                 {error && (
//                   <Alert variant="warning" className="mb-4">
//                     {error}
//                   </Alert>
//                 )}
                
//                 <Button 
//                   className="neo-btn px-5 py-3" 
//                   size="lg"
//                   onClick={connectWallet}
//                   disabled={loading}
//                 >
//                   {loading ? (
//                     <>
//                       <Spinner animation="border" size="sm" className="me-2" />
//                       Connecting...
//                     </>
//                   ) : (
//                     '🔗 Connect MetaMask'
//                   )}
//                 </Button>
                
//                 <div className="mt-4">
//                   <small className="text-muted">
//                     Connect your HOD wallet to access the review system
//                   </small>
//                 </div>
//               </Card.Body>
//             </Card>
//           </Col>
//         </Row>
//       </Container>
//     );
//   }

//   // Connected but not registered or not HOD
//   if (userRole === null || userRole !== '2') {
//     return (
//       <Container className="py-4">
//         <Row className="justify-content-center">
//           <Col md={8} lg={6}>
//             <Card className="neo-card border-0 shadow-lg">
//               <Card.Body className="text-center py-5">
//                 <div className="mb-4">
//                   <h3 className="text-white mb-2">
//                     {userRole === null ? 'Complete Your HOD Registration' : 'Access Denied'}
//                   </h3>
//                   <p className="text-light mb-4">
//                     {userRole === null 
//                       ? "You're connected! Register as HOD to access the review system."
//                       : "Connected account doesn't have HOD privileges. Please connect with a HOD account."
//                     }
//                   </p>
//                 </div>

//                 <Card className="bg-dark border-secondary mb-4">
//                   <Card.Body>
//                     <Row className="text-start">
//                       <Col sm={6}>
//                         <small className="text-muted">Wallet Address</small>
//                         <div className="text-white">{account}</div>
//                       </Col>
//                       <Col sm={6}>
//                         <small className="text-muted">Current Role</small>
//                         <div className={userRole === '2' ? 'text-success' : 'text-warning'}>
//                           {userRole === '2' ? 'HOD ✓' : 
//                            userRole === '1' ? 'User' : 
//                            userRole === '3' ? 'Commissioner' : 'Not Registered'}
//                         </div>
//                       </Col>
//                     </Row>
//                   </Card.Body>
//                 </Card>

//                 {userRole === null && (
//                   <Button 
//                     className="neo-btn px-5 py-3 mb-3" 
//                     size="lg"
//                     onClick={registerUser}
//                     disabled={loading}
//                   >
//                     {loading ? (
//                       <>
//                         <Spinner animation="border" size="sm" className="me-2" />
//                         Registering...
//                       </>
//                     ) : (
//                       '👨‍💼 Register as HOD'
//                     )}
//                   </Button>
//                 )}
                
//                 {userRole !== '2' && userRole !== null && (
//                   <Button 
//                     className="neo-btn px-5 py-3 mb-3" 
//                     size="lg"
//                     onClick={connectWallet}
//                   >
//                     🔄 Switch HOD Account
//                   </Button>
//                 )}
                
//                 <div className="mt-3">
//                   <Alert variant="info" className="small">
//                     <strong>Note:</strong> {userRole === null 
//                       ? "This will register you as HOD on the blockchain. Click 'Confirm' when MetaMask pops up."
//                       : "Please connect with an account that has HOD privileges."
//                     }
//                   </Alert>
//                 </div>
//               </Card.Body>
//             </Card>
//           </Col>
//         </Row>
//       </Container>
//     );
//   }

//   // Main HOD Dashboard
//   return (
//     <Container fluid className="py-4">
//       {/* Header */}
//       <Row className="mb-4">
//         <Col>
//           <Card className="border-0 bg-transparent">
//             <Card.Body className="p-4">
//               <div className="d-flex justify-content-between align-items-center">
//                 <div>
//                   <h1 className="text-white mb-2 fw-light">
//                     <span className="fw-bold">HOD</span> Review Portal
//                   </h1>
//                   <p className="text-light mb-0 small opacity-75">
//                     Document review and approval workspace
//                   </p>
//                 </div>
                
//                 <div className="text-end">
//                   <div className="d-inline-block bg-dark bg-opacity-50 rounded p-3">
//                     <div className="d-flex align-items-center gap-2 justify-content-end mb-1">
//                       <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50">
//                         ● HOD Connected
//                       </span>
//                     </div>
//                     <div className="text-white font-monospace small">
//                       {account?.slice(0, 10)}...{account?.slice(-8)}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       {/* Quick Stats Row */}
//       <Row className="mb-4">
//         <Col md={3} className="mb-3">
//           <Card className="neo-card stat-card h-100 border-0">
//             <Card.Body className="text-center">
//               <div className="text-primary display-6 mb-2">📊</div>
//               <h3 className="text-white">{dashboardStats.totalFiles}</h3>
//               <small className="text-light">Total Files</small>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col md={3} className="mb-3">
//           <Card className="neo-card stat-card h-100 border-0">
//             <Card.Body className="text-center">
//               <div className="text-warning display-6 mb-2">⏳</div>
//               <h3 className="text-white">{dashboardStats.pendingReview}</h3>
//               <small className="text-light">Pending Review</small>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col md={3} className="mb-3">
//           <Card className="neo-card stat-card h-100 border-0">
//             <Card.Body className="text-center">
//               <div className="text-success display-6 mb-2">✅</div>
//               <h3 className="text-white">{dashboardStats.approved}</h3>
//               <small className="text-light">Approved</small>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col md={3} className="mb-3">
//           <Card className="neo-card stat-card h-100 border-0">
//             <Card.Body className="text-center">
//               <div className="text-info display-6 mb-2">📨</div>
//               <h3 className="text-white">{dashboardStats.forwarded}</h3>
//               <small className="text-light">Forwarded</small>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       {/* Progress and Quick Actions */}
//       <Row className="mb-4">
//         <Col lg={8} className="mb-3">
//           <Card className="neo-card border-0 h-100">
//             <Card.Body>
//               <div className="d-flex justify-content-between align-items-center mb-3">
//                 <h5 className="text-white mb-0">📈 Review Progress</h5>
//                 <Badge bg="primary">{getReviewProgress()}% Complete</Badge>
//               </div>
//               <ProgressBar 
//                 now={getReviewProgress()} 
//                 variant="success" 
//                 className="mb-3"
//                 style={{ height: '10px' }}
//               />
//               <Row className="text-center">
//                 <Col>
//                   <small className="text-light">Pending</small>
//                   <div className="text-warning h5">{dashboardStats.pendingReview}</div>
//                 </Col>
//                 <Col>
//                   <small className="text-light">Sent Back</small>
//                   <div className="text-danger h5">{dashboardStats.sentBack}</div>
//                 </Col>
//                 <Col>
//                   <small className="text-light">Approved</small>
//                   <div className="text-success h5">{dashboardStats.approved}</div>
//                 </Col>
//                 <Col>
//                   <small className="text-light">Forwarded</small>
//                   <div className="text-info h5">{dashboardStats.forwarded}</div>
//                 </Col>
//               </Row>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col lg={4} className="mb-3">
//           <Card className="neo-card border-0 h-100">
//             <Card.Body className="text-center">
//               <h5 className="text-white mb-4">⚡ Quick Actions</h5>
//               <Button 
//                 variant="outline-light" 
//                 className="w-100 mb-2"
//                 onClick={() => setRefreshTrigger(prev => prev + 1)}
//               >
//                 🔄 Refresh All Data
//               </Button>
//               <div className="mt-4">
//                 <small className="text-muted">
//                   Last updated: {new Date().toLocaleTimeString()}
//                 </small>
//               </div>
//               <div className="mt-3 p-3 bg-dark rounded">
//                 <small className="text-info">
//                   <strong>HOD Permissions:</strong><br/>
//                   • Review & Approve Files<br/>
//                   • Request Revisions<br/>
//                   • Forward to Commissioner
//                 </small>
//               </div>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       {/* Files Display Component */}
//       <Row>
//         <Col>
//           <HODFilesDisplay 
//             contract={contract}
//             account={account}
//             refreshTrigger={refreshTrigger}
//             onReviewFile={openReviewModal}
//             onForwardFile={handleForwardToCommissioner}
//             getStatusBadge={getStatusBadge}
//             activeTab={activeTab}
//             onTabChange={setActiveTab}
//           />
//         </Col>
//       </Row>

//       {/* Review Modal */}
//       <Modal 
//         show={showReviewModal} 
//         onHide={() => !reviewLoading && setShowReviewModal(false)}
//         centered
//         size="lg"
//       >
//         <Modal.Header closeButton className="bg-dark text-light">
//           <Modal.Title className="d-flex align-items-center gap-2">
//             👨‍⚖️ Review Document
//           </Modal.Title>
//         </Modal.Header>
//         <Form onSubmit={handleFileReview}>
//           <Modal.Body className="bg-dark">
//             {selectedFileForReview && (
//               <>
//                 <Alert variant="info" className="small">
//                   <strong>Reviewing:</strong> Document #{selectedFileForReview.id}
//                   {selectedFileForReview.fileName && (
//                     <span> - {selectedFileForReview.fileName}</span>
//                   )}
//                 </Alert>
                
//                 <Form.Group className="mb-4">
//                   <Form.Label className="text-light fw-bold">Review Action</Form.Label>
//                   <div>
//                     <Form.Check
//                       type="radio"
//                       name="reviewAction"
//                       label="✅ Approve Document"
//                       value="approve"
//                       checked={reviewAction === 'approve'}
//                       onChange={(e) => setReviewAction(e.target.value)}
//                       className="text-light mb-2"
//                     />
//                     <Form.Check
//                       type="radio"
//                       name="reviewAction"
//                       label="↩️ Send Back for Revisions"
//                       value="sendback"
//                       checked={reviewAction === 'sendback'}
//                       onChange={(e) => setReviewAction(e.target.value)}
//                       className="text-light mb-2"
//                     />
//                     <Form.Check
//                       type="radio"
//                       name="reviewAction"
//                       label="👀 Mark Under Review"
//                       value="underreview"
//                       checked={reviewAction === 'underreview'}
//                       onChange={(e) => setReviewAction(e.target.value)}
//                       className="text-light"
//                     />
//                   </div>
//                 </Form.Group>
                
//                 <Form.Group className="mb-3">
//                   <Form.Label className="text-light fw-bold">
//                     Remarks {reviewAction === 'sendback' && '(Required)'}
//                   </Form.Label>
//                   <Form.Control
//                     as="textarea"
//                     rows={4}
//                     value={reviewRemark}
//                     onChange={(e) => setReviewRemark(e.target.value)}
//                     placeholder={
//                       reviewAction === 'approve' ? 'Add approval notes (optional)...' :
//                       reviewAction === 'sendback' ? 'Explain what needs to be revised...' :
//                       'Add review notes (optional)...'
//                     }
//                     required={reviewAction === 'sendback'}
//                     className="bg-secondary border-0 text-light"
//                   />
//                   <Form.Text className="text-muted">
//                     {reviewAction === 'sendback' 
//                       ? 'Detailed feedback helps users understand what needs improvement.'
//                       : 'Comments will be recorded with the review action.'
//                     }
//                   </Form.Text>
//                 </Form.Group>

//                 {selectedFileForReview.viewLink && (
//                   <div className="text-center mt-3">
//                     <Button
//                       variant="outline-info"
//                       href={selectedFileForReview.viewLink}
//                       target="_blank"
//                       className="d-flex align-items-center gap-2 justify-content-center"
//                     >
//                       👁️ View Document
//                     </Button>
//                   </div>
//                 )}
//               </>
//             )}
//           </Modal.Body>
//           <Modal.Footer className="bg-dark">
//             <Button 
//               variant="outline-light" 
//               onClick={() => setShowReviewModal(false)}
//               disabled={reviewLoading}
//             >
//               Cancel
//             </Button>
//             <Button 
//               type="submit" 
//               className="neo-btn px-4"
//               disabled={reviewLoading || !reviewAction || (reviewAction === 'sendback' && !reviewRemark.trim())}
//             >
//               {reviewLoading ? (
//                 <>
//                   <Spinner animation="border" size="sm" className="me-2" />
//                   Processing...
//                 </>
//               ) : (
//                 `🚀 ${reviewAction === 'approve' ? 'Approve' : reviewAction === 'sendback' ? 'Send Back' : 'Mark Under Review'}`
//               )}
//             </Button>
//           </Modal.Footer>
//         </Form>
//       </Modal>
//     </Container>
//   );
// };

// export default HODDashboard;





import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Button, Modal, Form, 
  Alert, Spinner, Badge, ProgressBar, Tabs, Tab ,Table
} from 'react-bootstrap';
import Web3 from 'web3';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../../Utils/constants";

const HODDashboard = () => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // HOD Dashboard States
  const [files, setFiles] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalFiles: 0,
    pendingReview: 0,
    sentBack: 0,
    approved: 0,
    forwarded: 0
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
    Forwarded: 4,
    CommissionerApproved: 5
  };

  const STATUS_CONFIG = {
    0: { label: 'Uploaded', variant: 'secondary', icon: '📤' },
    1: { label: 'Under Review', variant: 'warning', icon: '👀' },
    2: { label: 'Revisions Needed', variant: 'danger', icon: '↩️' },
    3: { label: 'Approved', variant: 'success', icon: '✅' },
    4: { label: 'Forwarded', variant: 'info', icon: '📨' },
    5: { label: 'Commissioner Approved', variant: 'primary', icon: '🏆' }
  };

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

  const checkUserRegistration = async (contractInstance, userAddress) => {
    try {
      console.log('🔍 Checking user registration...');
      const role = await contractInstance.methods.getUserRole(userAddress).call();
      const roleNumber = parseInt(role);
      console.log('📊 User role:', roleNumber);
      
      setUserRole(roleNumber);
      
      if (roleNumber === 2) {
        console.log('✅ User is HOD, loading dashboard data...');
        await loadDashboardData();
      }
    } catch (error) {
      console.error('❌ Registration check error:', error);
      setUserRole(null);
    }
  };

  const registerUser = async () => {
    try {
      setLoading(true);
      console.log('📝 Registering as HOD...');

      const transaction = await contract.methods.registerUser(2).send({ 
        from: account
      });
      
      console.log('✅ HOD Registration successful:', transaction);
      await checkUserRegistration(contract, account);
      alert('HOD Registration successful!');
    } catch (error) {
      console.error('❌ Registration error:', error);
      alert(error.code === 4001 ? 'Registration cancelled' : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Load Dashboard Data
  const loadDashboardData = async () => {
    if (!contract || !account) return;

    try {
      setLoading(true);
      console.log('📊 Loading dashboard data...');
      await Promise.all([
        fetchAllFiles(),
        fetchDashboardStats()
      ]);
    } catch (error) {
      console.error('❌ Dashboard data loading error:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch ALL files from the contract
  const fetchAllFiles = async () => {
    try {
      console.log('📂 Fetching all files...');
      const allFiles = [];
      
      // Start from file ID 1001 and check next 50 files
      for (let i = 1001; i <= 1050; i++) {
        try {
          const file = await contract.methods.files(i).call();
          
          // Check if file exists (has valid IPFS hash)
          if (file.id !== '0' && file.ipfsHash && file.ipfsHash !== '') {
            console.log(`📄 Found file ${i}:`, file);
            
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
          // File doesn't exist, continue to next
          continue;
        }
      }
      
      console.log('✅ All files loaded:', allFiles);
      setFiles(allFiles);
      
    } catch (error) {
      console.error('❌ Error fetching files:', error);
      setFiles([]);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      console.log('📈 Fetching dashboard stats...');
      
      // Calculate stats from files
      const stats = {
        totalFiles: files.length,
        pendingReview: files.filter(f => parseInt(f.status) === FILE_STATUS.UnderHODReview).length,
        sentBack: files.filter(f => parseInt(f.status) === FILE_STATUS.SemBack).length,
        approved: files.filter(f => parseInt(f.status) === FILE_STATUS.ApprovedByHOD).length,
        forwarded: files.filter(f => parseInt(f.status) === FILE_STATUS.Forwarded).length
      };
      
      console.log('📊 Calculated stats:', stats);
      setDashboardStats(stats);
      
    } catch (error) {
      console.error('❌ Stats calculation error:', error);
    }
  };

  // Update stats when files change
  useEffect(() => {
    if (files.length > 0) {
      fetchDashboardStats();
    }
  }, [files]);

  // File Actions
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
      alert(error.code === 4001 ? 'Review cancelled' : 'Review failed: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleForwardToCommissioner = async (fileId) => {
    if (!window.confirm('Are you sure you want to forward this file to the Commissioner?')) {
      return;
    }

    try {
      setActionLoading(true);
      console.log('📨 Forwarding file to commissioner:', fileId);
      
      const transaction = await contract.methods.forwardToCommissioner(fileId).send({ from: account });
      
      console.log('✅ Forward successful:', transaction);
      
      setRefreshTrigger(prev => prev + 1);
      alert('File forwarded to Commissioner successfully!');
    } catch (error) {
      console.error('❌ Forward error:', error);
      alert(error.code === 4001 ? 'Forward cancelled' : 'Forward failed: ' + error.message);
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
    const reviewed = dashboardStats.approved + dashboardStats.forwarded + dashboardStats.sentBack;
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
      case 'forwarded':
        return files.filter(f => parseInt(f.status) === FILE_STATUS.Forwarded);
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
            <Button 
              size="sm" 
              variant="outline-primary" 
              onClick={() => handleForwardToCommissioner(file.id)}
              disabled={file.isSharedWithCommissioner}
            >
              {file.isSharedWithCommissioner ? 'Forwarded' : 'Forward'}
            </Button>
            <Button size="sm" variant="outline-info" href={file.viewLink} target="_blank">
              View
            </Button>
            <Button size="sm" variant="outline-warning" onClick={() => handleReviewFile(file)}>
              Revoke
            </Button>
          </div>
        );
      
      case FILE_STATUS.Forwarded:
        return (
          <div className="d-flex gap-1 flex-wrap">
            <Button size="sm" variant="outline-secondary" disabled>Forwarded</Button>
            <Button size="sm" variant="outline-info" href={file.viewLink} target="_blank">
              View
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
          console.error('Initial connection error:', error);
        }
      }
    };

    checkConnection();
  }, []);

  // Debug current state
  console.log('📊 Current HOD Dashboard State:', {
    isConnected,
    account,
    userRole,
    filesCount: files.length,
    dashboardStats,
    activeTab
  });

  // Render based on connection and role states
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

  if (userRole !== 2) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="border-0 shadow">
              <Card.Body className="text-center p-5">
                <h3 className="mb-4">
                  {userRole === null ? 'HOD Registration Required' : 'Access Restricted'}
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
                        <div className={userRole === 2 ? 'text-success' : 'text-warning'}>
                          {userRole === 2 ? 'HOD' : 
                           userRole === 1 ? 'User' : 
                           userRole === 3 ? 'Commissioner' : 'Not Registered'}
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {userRole === null && (
                  <Button 
                    variant="success" 
                    size="lg"
                    onClick={registerUser}
                    disabled={loading}
                    className="mb-3"
                  >
                    {loading ? <Spinner size="sm" /> : 'Register as HOD'}
                  </Button>
                )}
                
                <Button variant="outline-secondary" onClick={connectWallet}>
                  Switch Account
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  // Main Dashboard
  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">HOD Review Portal</h2>
              <p className="text-muted mb-0">Document Review & Approval Dashboard</p>
            </div>
            <Badge bg="success" className="fs-6">
              HOD: {formatAddress(account)}
            </Badge>
          </div>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col xl={2} md={4} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              <h4 className="text-primary">{dashboardStats.totalFiles}</h4>
              <small className="text-muted">Total Files</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={2} md={4} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              <h4 className="text-warning">{dashboardStats.pendingReview}</h4>
              <small className="text-muted">Pending Review</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={2} md={4} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              <h4 className="text-danger">{dashboardStats.sentBack}</h4>
              <small className="text-muted">Sent Back</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={2} md={4} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              <h4 className="text-success">{dashboardStats.approved}</h4>
              <small className="text-muted">Approved</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={2} md={4} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              <h4 className="text-info">{dashboardStats.forwarded}</h4>
              <small className="text-muted">Forwarded</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={2} md={4} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              <h4 className="text-secondary">{getReviewProgress()}%</h4>
              <small className="text-muted">Progress</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Progress Bar */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0">Review Progress</h6>
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
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">📋 Documents for Review</h5>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => setRefreshTrigger(prev => prev + 1)}
                  disabled={loading}
                >
                  {loading ? <Spinner size="sm" /> : 'Refresh'}
                </Button>
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
                    All Files <Badge bg="secondary">{files.length}</Badge>
                  </span>
                }>
                  <FileTable 
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
                    Pending Review <Badge bg="warning">{dashboardStats.pendingReview}</Badge>
                  </span>
                }>
                  <FileTable 
                    files={getFilteredFiles()}
                    loading={loading}
                    getStatusBadge={getStatusBadge}
                    getActionButtons={getActionButtons}
                    formatTimestamp={formatTimestamp}
                    formatAddress={formatAddress}
                  />
                </Tab>

                <Tab eventKey="sentback" title={
                  <span>
                    Sent Back <Badge bg="danger">{dashboardStats.sentBack}</Badge>
                  </span>
                }>
                  <FileTable 
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
                  <FileTable 
                    files={getFilteredFiles()}
                    loading={loading}
                    getStatusBadge={getStatusBadge}
                    getActionButtons={getActionButtons}
                    formatTimestamp={formatTimestamp}
                    formatAddress={formatAddress}
                  />
                </Tab>

                <Tab eventKey="forwarded" title={
                  <span>
                    Forwarded <Badge bg="info">{dashboardStats.forwarded}</Badge>
                  </span>
                }>
                  <FileTable 
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

      {/* Review Modal */}
      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Review Document</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleReview}>
          <Modal.Body>
            {selectedFile && (
              <>
                <Alert variant="info">
                  <strong>Reviewing:</strong> {selectedFile.fileName} (ID: {selectedFile.id})
                </Alert>
                
                <Form.Group className="mb-3">
                  <Form.Label><strong>Review Action</strong></Form.Label>
                  <div>
                    <Form.Check
                      type="radio"
                      name="status"
                      label="✅ Approve Document"
                      value="approve"
                      checked={reviewData.status === 'approve'}
                      onChange={(e) => setReviewData({...reviewData, status: e.target.value})}
                      className="mb-2"
                    />
                    <Form.Check
                      type="radio"
                      name="status"
                      label="↩️ Send Back for Revisions"
                      value="sendback"
                      checked={reviewData.status === 'sendback'}
                      onChange={(e) => setReviewData({...reviewData, status: e.target.value})}
                      className="mb-2"
                    />
                    <Form.Check
                      type="radio"
                      name="status"
                      label="👀 Mark Under Review"
                      value="underreview"
                      checked={reviewData.status === 'underreview'}
                      onChange={(e) => setReviewData({...reviewData, status: e.target.value})}
                    />
                  </div>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label><strong>Remarks</strong></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={reviewData.remark}
                    onChange={(e) => setReviewData({...reviewData, remark: e.target.value})}
                    placeholder="Enter your remarks or feedback..."
                  />
                </Form.Group>

                <div className="text-center">
                  <Button
                    variant="outline-primary"
                    href={selectedFile.viewLink}
                    target="_blank"
                  >
                    View Document
                  </Button>
                </div>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowReviewModal(false)}>
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

// File Table Component
const FileTable = ({ files, loading, getStatusBadge, getActionButtons, formatTimestamp, formatAddress }) => {
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-2">Loading documents...</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="fs-1 text-muted mb-3">📭</div>
        <h5>No documents found</h5>
        <p className="text-muted">There are no documents in this category.</p>
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
                    <strong>Remark:</strong> {file.hodRemark}
                  </small>
                )}
              </td>
              <td>
                <small>{formatAddress(file.owner)}</small>
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

export default HODDashboard;