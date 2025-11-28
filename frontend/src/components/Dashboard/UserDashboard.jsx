// // components/Dashboard/UserDashboard.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import { 
//   Container, Row, Col, Card, Button, Modal, Form, 
//   Table, Alert, Spinner, Badge, ProgressBar, InputGroup 
// } from 'react-bootstrap';
// import Web3 from 'web3';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { uploadToIPFS } from "../../Utils/ipfs";
// import { CONTRACT_ADDRESS, CONTRACT_ABI } from  "../../Utils/constants";
// import UserFilesDisplay from './UserFilesDisplay';
// import { departmentService } from "../../services/department"; 

// const UserDashboard = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { phone, department } = location.state || {};
  
//   console.log("🔍 Location state received:", { phone, department });
  
//   const [web3, setWeb3] = useState(null);
//   const [account, setAccount] = useState(null);
//   const [contract, setContract] = useState(null);
//   const [userRole, setUserRole] = useState(null);
//   const [userDepartment, setUserDepartment] = useState(department || '');
//   const [isConnected, setIsConnected] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [registrationLoading, setRegistrationLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [refreshTrigger, setRefreshTrigger] = useState(0);
//   const [registrationChecked, setRegistrationChecked] = useState(false);

//   const [showUploadModal, setShowUploadModal] = useState(false);
//   const [showResubmitModal, setShowResubmitModal] = useState(false);
//   const [selectedFileForResubmit, setSelectedFileForResubmit] = useState(null);
//   const [userFiles, setUserFiles] = useState([]);
//   const [dashboardStats, setDashboardStats] = useState({
//     totalFiles: 0,
//     pendingReview: 0,
//     sentBack: 0,
//     approvedByHOD: 0,
//     resubmitted: 0
//   });
//   const [uploadLoading, setUploadLoading] = useState(false);
//   const [resubmitLoading, setResubmitLoading] = useState(false);
//   const [filesLoading, setFilesLoading] = useState(false);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [fileName, setFileName] = useState('');
//   const [resubmitIpfsHash, setResubmitIpfsHash] = useState('');
//   const [fileStatus, setFileStatus] = useState({});
//   const [departmentLoading, setDepartmentLoading] = useState(false);
//   const [copiedHash, setCopiedHash] = useState('');

//   // File status mapping with icons - UPDATED to match smart contract
//   const fileStatusMap = {
//     0: { text: 'Provided', variant: 'primary', icon: '📤' },
//     1: { text: 'Under HOD Review', variant: 'warning', icon: '👀' },
//     2: { text: 'Sent Back', variant: 'danger', icon: '↩️' },
//     3: { text: 'Approved by HOD', variant: 'success', icon: '✅' },
//     4: { text: 'Resubmitted', variant: 'info', icon: '🔄' }
//   };

//   // Role Constants
//   const USER_ROLES = {
//     None: 0,
//     User: 1,
//     HOD: 2,
//     Commissioner: 3
//   };

//   // FILE_STATUS enum from smart contract
//   const FILE_STATUS = {
//     Provided: 0,
//     UnderHODReview: 1,
//     SemBack: 2,
//     ApprovedByHOD: 3,
//     Resubmitted: 4
//   };

//   // Filter out harmless console errors
//   useEffect(() => {
//     const originalError = console.error;
//     console.error = (...args) => {
//       if (args[0] && args[0].includes('decimals') && args[0].includes('execution reverted')) {
//         console.warn('⚠️ MetaMask token detection failed - This is normal for non-token contracts');
//         return;
//       }
//       originalError.apply(console, args);
//     };

//     return () => {
//       console.error = originalError;
//     };
//   }, []);

//   // Fetch department if not available from location state
//   useEffect(() => {
//     const fetchDepartmentIfNeeded = async () => {
//       if (!userDepartment && phone) {
//         console.log('🔄 Department not in location state, fetching from API...');
//         await fetchUserDepartment(phone);
//       } else if (userDepartment) {
//         console.log('✅ Using department from location state:', userDepartment);
//       }
//     };

//     fetchDepartmentIfNeeded();
//   }, [userDepartment, phone]);

//   const fetchUserDepartment = async (phoneNumber) => {
//     try {
//       setDepartmentLoading(true);
//       console.log('📞 Fetching department for phone:', phoneNumber);
      
//       const response = await departmentService.getDepartmentByPhone(phoneNumber);
//       console.log('🏢 Department API response:', response);
      
//       if (response.user && response.user.department) {
//         setUserDepartment(response.user.department);
//         console.log('✅ Department set from API:', response.user.department);
//       } else {
//         console.log('⚠️ No department found in API response');
//       }
//     } catch (error) {
//       console.error('❌ Error fetching department from API:', error);
//     } finally {
//       setDepartmentLoading(false);
//     }
//   };

//   // Connect wallet and check registration
//   const connectWallet = async () => {
//     try {
//       setLoading(true);
//       setError('');
//       console.log('🔗 Starting wallet connection...');

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
      
//       const contractInstance = new web3Instance.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
      
//       setWeb3(web3Instance);
//       setAccount(accounts[0]);
//       setContract(contractInstance);
//       setIsConnected(true);

//       console.log('✅ Wallet connected successfully');
//       console.log('👤 Account:', accounts[0]);

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

//   // Check if user needs registration
//   const needsRegistration = useCallback(async (contractInstance, userAddress) => {
//     try {
//       if (!contractInstance || !userAddress) return true;
      
//       const role = await contractInstance.methods.getUserRole(userAddress).call();
//       const roleNumber = parseInt(role);
      
//       console.log('🔍 Registration check - Current role:', roleNumber);
      
//       // Return true if user is not registered as User
//       return roleNumber !== USER_ROLES.User;
//     } catch (error) {
//       console.error('❌ Error checking registration status:', error);
//       return true; // Assume needs registration if check fails
//     }
//   }, []);

//   const checkUserRegistration = async (contractInstance, userAddress) => {
//     try {
//       console.log('🔍 Checking user registration for:', userAddress);
//       const role = await contractInstance.methods.getUserRole(userAddress).call();
//       const contractDepartment = await contractInstance.methods.getUserDepartment(userAddress).call();
      
//       console.log('📊 Raw role from contract:', role);
//       console.log('🏢 User department from contract:', contractDepartment);
      
//       const roleNumber = parseInt(role);
//       console.log('🔢 Parsed role number:', roleNumber);
      
//       setUserRole(roleNumber);
      
//       // Priority: Contract department > Location department
//       if (contractDepartment && contractDepartment !== "None" && contractDepartment !== "") {
//         setUserDepartment(contractDepartment);
//         console.log('✅ Using department from contract:', contractDepartment);
//       } else if (userDepartment && userDepartment !== "") {
//         console.log('ℹ️ Using department from login state:', userDepartment);
//         // Keep the department from login state
//       } else {
//         console.log('❌ No department available');
//       }
      
//       setRegistrationChecked(true);

//       if (roleNumber === USER_ROLES.User) {
//         console.log('✅ User is registered, loading dashboard...');
//         await loadDashboardData();
//       } else {
//         console.log('ℹ️ User needs registration');
//       }
      
//     } catch (error) {
//       console.error('❌ Error checking user registration:', error);
//       setUserRole(null);
//       setRegistrationChecked(true);
//     }
//   };

//   const registerUser = async () => {
//     try {
//       // Double-check if already registered before proceeding
//       const registrationNeeded = await needsRegistration(contract, account);
//       if (!registrationNeeded) {
//         console.log('ℹ️ User already registered, skipping registration');
//         await checkUserRegistration(contract, account);
//         return;
//       }

//       setRegistrationLoading(true);
//       console.log('📝 Starting user registration...');
//       console.log('👤 Registering with account:', account);
//       console.log('🎯 Registering as role: 1 (User)');
//       console.log('🏢 Department for registration:', userDepartment);

//       // Use userDepartment directly from state (from login navigation)
//       if (!userDepartment || userDepartment.trim() === '') {
//         alert('Department information not available. Please contact administrator.');
//         return;
//       }

//       // User role is 1 (User) in the enum, department from login
//       const transaction = await contract.methods.registerUser(USER_ROLES.User, userDepartment).send({ 
//         from: account
//       });
      
//       console.log('✅ Registration transaction successful:', transaction);
      
//       // Re-check registration status
//       await checkUserRegistration(contract, account);
//       alert('Registration successful! You can now upload files.');
      
//     } catch (error) {
//       console.error('❌ Error registering user:', error);
      
//       if (error.message && error.message.includes('AlreadyRegistered')) {
//         console.log('ℹ️ User already registered, checking status...');
//         await checkUserRegistration(contract, account);
//       } else if (error.code === 4001) {
//         alert('Registration cancelled by user');
//       } else {
//         alert('Registration failed: ' + (error.message || 'Unknown error'));
//       }
//     } finally {
//       setRegistrationLoading(false);
//     }
//   };

//   // Auto-register user when conditions are met
//   useEffect(() => {
//     const autoRegisterUser = async () => {
//       if (isConnected && 
//           contract && 
//           account && 
//           userDepartment && 
//           userDepartment !== '' && 
//           !registrationLoading && 
//           !loading &&
//           registrationChecked &&
//           userRole !== USER_ROLES.User) {
        
//         const registrationNeeded = await needsRegistration(contract, account);
        
//         if (registrationNeeded) {
//           console.log('🚀 Auto-registering user on blockchain...');
//           console.log('📋 Registration details:', {
//             account,
//             department: userDepartment,
//             currentBlockchainRole: userRole
//           });
          
//           await registerUser();
//         } else {
//           console.log('✅ User already properly registered on blockchain');
//           await checkUserRegistration(contract, account);
//         }
//       }
//     };

//     autoRegisterUser();
//   }, [isConnected, contract, account, userDepartment, registrationLoading, loading, registrationChecked, userRole, needsRegistration]);

//   // Load Dashboard Data
//   const loadDashboardData = async () => {
//     if (!contract || !account || userRole !== USER_ROLES.User) return;

//     try {
//       setLoading(true);
//       console.log('📊 Loading dashboard data...');
//       await Promise.all([
//         fetchUserFiles(),
//         fetchDashboardStats()
//       ]);
//     } catch (error) {
//       console.error('❌ Dashboard data loading error:', error);
//       setError('Failed to load dashboard data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch user files - UPDATED to get complete file data
//   const fetchUserFiles = async () => {
//     if (!contract || !account) {
//       console.log('❌ Cannot fetch files: contract or account missing');
//       return;
//     }
    
//     try {
//       setFilesLoading(true);
//       console.log('📂 Fetching user files...');
      
//       // Use getAllUserFiles from contract which returns FileView struct
//       const files = await contract.methods.getAllUserFiles(account).call();
//       console.log('📄 Raw files from contract getAllUserFiles:', files);
      
//       const formattedFiles = await Promise.all(
//         files
//           .filter(file => file.id !== '0' && file.ipfsHash !== '')
//           .map(async (file) => {
//             try {
//               // Get additional file details from files mapping
//               const fileDetails = await contract.methods.files(file.id).call();
//               const fileNameFromContract = await contract.methods.fileNames(file.id).call();
              
//               return {
//                 id: file.id,
//                 ipfsHash: file.ipfsHash,
//                 fileName: fileNameFromContract && fileNameFromContract !== '' ? fileNameFromContract : `Document ${file.id}`,
//                 status: parseInt(file.status),
//                 department: file.department,
//                 hodRemark: file.hodRemark,
//                 owner: file.owner,
//                 uploadTimestamp: fileDetails.uploadTimestamp,
//                 lastUpdateTimestamp: fileDetails.lastUpdateTimestamp,
//                 viewLink: `https://gateway.pinata.cloud/ipfs/${file.ipfsHash}`,
//                 downloadLink: `https://gateway.pinata.cloud/ipfs/${file.ipfsHash}?download=1`
//               };
//             } catch (error) {
//               console.error(`Error processing file ${file.id}:`, error);
//               return {
//                 id: file.id,
//                 ipfsHash: file.ipfsHash,
//                 fileName: `Document ${file.id}`,
//                 status: parseInt(file.status),
//                 department: file.department,
//                 hodRemark: file.hodRemark,
//                 owner: file.owner,
//                 viewLink: `https://gateway.pinata.cloud/ipfs/${file.ipfsHash}`,
//                 downloadLink: `https://gateway.pinata.cloud/ipfs/${file.ipfsHash}?download=1`
//               };
//             }
//           })
//       );
      
//       console.log('✅ Formatted files with status:', formattedFiles);
//       setUserFiles(formattedFiles);

//       // Update file status mapping
//       const statusMap = {};
//       formattedFiles.forEach(file => {
//         statusMap[file.id] = file.status;
//       });
      
//       setFileStatus(statusMap);
//     } catch (error) {
//       console.error('❌ Error fetching files:', error);
//       setUserFiles([]);
//     } finally {
//       setFilesLoading(false);
//     }
//   };

//   // Fetch dashboard stats - UPDATED to use contract method
//   const fetchDashboardStats = async () => {
//     if (!contract || !account) {
//       console.log('❌ Cannot fetch stats: contract or account missing');
//       return;
//     }

//     try {
//       console.log('📊 Fetching dashboard stats from contract...');
//       const statsArray = await contract.methods.getUserDashboardStats(account).call();
      
//       const formattedStats = {
//         totalFiles: parseInt(statsArray[0]) || 0,
//         pendingReview: parseInt(statsArray[1]) || 0,
//         sentBack: parseInt(statsArray[2]) || 0,
//         approvedByHOD: parseInt(statsArray[3]) || 0,
//         resubmitted: parseInt(statsArray[4]) || 0
//       };
      
//       console.log('📈 Dashboard stats from contract:', formattedStats);
//       setDashboardStats(formattedStats);
//     } catch (error) {
//       console.error('❌ Error fetching stats from contract, calculating manually:', error);
//       // Fallback to manual calculation
//       calculateStatsManually();
//     }
//   };

//   // Manual calculation fallback - UPDATED with correct status mapping
//   const calculateStatsManually = () => {
//     try {
//       console.log('📊 Calculating stats manually from files...');
      
//       const stats = {
//         totalFiles: userFiles.length,
//         pendingReview: userFiles.filter(f => parseInt(f.status) === FILE_STATUS.UnderHODReview).length,
//         sentBack: userFiles.filter(f => parseInt(f.status) === FILE_STATUS.SemBack).length,
//         approvedByHOD: userFiles.filter(f => parseInt(f.status) === FILE_STATUS.ApprovedByHOD).length,
//         resubmitted: userFiles.filter(f => parseInt(f.status) === FILE_STATUS.Resubmitted).length
//       };
      
//       console.log('📊 Manually calculated stats:', stats);
//       setDashboardStats(stats);
//     } catch (error) {
//       console.error('❌ Error in manual stats calculation:', error);
//       setDashboardStats({ totalFiles: 0, pendingReview: 0, sentBack: 0, approvedByHOD: 0, resubmitted: 0 });
//     }
//   };

//   // Handle file upload
//   const handleFileUpload = async (e) => {
//     e.preventDefault();
//     if (!selectedFile || !fileName.trim()) {
//       alert('Please select a file and enter a file name');
//       return;
//     }

//     try {
//       setUploadLoading(true);
//       console.log('🚀 Starting file upload process...');
      
//       const ipfsHash = await uploadToIPFS(selectedFile);
//       console.log('✅ IPFS upload successful. Hash:', ipfsHash);
      
//       const transaction = await contract.methods.uploadFile(fileName, ipfsHash).send({ 
//         from: account
//       });
      
//       console.log('✅ File recorded on blockchain. Transaction:', transaction);
//       setRefreshTrigger(prev => prev + 1);
//       setSelectedFile(null);
//       setFileName('');
//       setShowUploadModal(false);
//       alert('File uploaded successfully!');
//     } catch (error) {
//       console.error('❌ Error uploading file:', error);
//       if (error.code === 4001) {
//         alert('Upload cancelled. Please click "Confirm" in MetaMask.');
//       } else {
//         alert('Upload failed: ' + (error.message || 'Please check your connection.'));
//       }
//     } finally {
//       setUploadLoading(false);
//     }
//   };

//   // Handle file resubmission - NEW FUNCTION
//   const handleFileResubmit = async (e) => {
//     e.preventDefault();
//     if (!selectedFileForResubmit || !resubmitIpfsHash.trim()) {
//       alert('Please select a file and enter IPFS hash');
//       return;
//     }

//     try {
//       setResubmitLoading(true);
//       console.log('🔄 Starting file resubmission process...');
      
//       const transaction = await contract.methods.resubmitFile(
//         selectedFileForResubmit.id, 
//         resubmitIpfsHash
//       ).send({ 
//         from: account
//       });
      
//       console.log('✅ File resubmitted on blockchain. Transaction:', transaction);
//       setRefreshTrigger(prev => prev + 1);
//       setSelectedFileForResubmit(null);
//       setResubmitIpfsHash('');
//       setShowResubmitModal(false);
//       alert('File resubmitted successfully!');
//     } catch (error) {
//       console.error('❌ Error resubmitting file:', error);
//       if (error.code === 4001) {
//         alert('Resubmission cancelled. Please click "Confirm" in MetaMask.');
//       } else if (error.message && error.message.includes('NotSentBack')) {
//         alert('This file cannot be resubmitted. Only files with "Sent Back" status can be resubmitted.');
//       } else {
//         alert('Resubmission failed: ' + (error.message || 'Please check your connection.'));
//       }
//     } finally {
//       setResubmitLoading(false);
//     }
//   };

//   // Open resubmit modal - NEW FUNCTION
//   const openResubmitModal = (file) => {
//     if (parseInt(file.status) !== FILE_STATUS.SemBack) {
//       alert('Only files with "Sent Back" status can be resubmitted.');
//       return;
//     }
//     setSelectedFileForResubmit(file);
//     setResubmitIpfsHash('');
//     setShowResubmitModal(true);
//   };

//   // Copy IPFS hash to clipboard - NEW FUNCTION
//   const copyToClipboard = (text, fileId) => {
//     navigator.clipboard.writeText(text).then(() => {
//       setCopiedHash(fileId);
//       setTimeout(() => setCopiedHash(''), 2000);
//     });
//   };

//   // File input change handler
//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       console.log('📄 File selected:', file.name, 'Size:', file.size);
//       if (file.size > 10 * 1024 * 1024) {
//         alert('File size too large. Please select a file smaller than 10MB.');
//         return;
//       }
//       setSelectedFile(file);
//       if (!fileName) {
//         const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
//         setFileName(nameWithoutExt);
//       }
//     }
//   };

//   // Format file size
//   const formatFileSize = (bytes) => {
//     if (bytes === 0) return '0 Bytes';
//     const k = 1024;
//     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
//   };

//   // Get status badge for file - UPDATED with correct status mapping
//   const getStatusBadge = (status) => {
//     const statusNumber = parseInt(status);
//     const statusInfo = fileStatusMap[statusNumber] || fileStatusMap[0];
//     return (
//       <Badge bg={statusInfo.variant} className="d-flex align-items-center gap-1">
//         <span>{statusInfo.icon}</span>
//         {statusInfo.text}
//       </Badge>
//     );
//   };

//   // Calculate approval progress
//   const getApprovalProgress = () => {
//     const total = dashboardStats.totalFiles;
//     if (total === 0) return 0;
//     const approved = dashboardStats.approvedByHOD;
//     const progress = Math.round((approved / total) * 100);
//     return progress;
//   };

//   const formatAddress = (address) => {
//     if (!address) return 'Unknown';
//     return `${address.slice(0, 6)}...${address.slice(-4)}`;
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

//   // Check connection on load
//   useEffect(() => {
//     console.log('🔍 Checking initial connection...');
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
//           console.error('❌ Error checking connection:', error);
//         }
//       }
//     };

//     checkConnection();

//     if (window.ethereum) {
//       window.ethereum.on('accountsChanged', (accounts) => {
//         console.log('🔄 Accounts changed:', accounts);
//         if (accounts.length > 0) {
//           setAccount(accounts[0]);
//           checkUserRegistration(contract, accounts[0]);
//         } else {
//           setAccount(null);
//           setUserRole(null);
//           setIsConnected(false);
//           setUserFiles([]);
//         }
//       });
//     }

//     return () => {
//       if (window.ethereum) {
//         window.ethereum.removeAllListeners('accountsChanged');
//       }
//     };
//   }, []);

//   // Load data when connected and registered
//   useEffect(() => {
//     console.log('🔄 useEffect triggered for connection change', {
//       isConnected,
//       contract: !!contract,
//       account,
//       userRole
//     });
    
//     if (isConnected && contract && account && userRole === USER_ROLES.User) {
//       console.log('✅ Conditions met, fetching data...');
//       loadDashboardData();
//     }
//   }, [isConnected, contract, account, userRole, refreshTrigger]);

//   // Update stats when files change
//   useEffect(() => {
//     if (userFiles.length > 0) {
//       calculateStatsManually();
//     }
//   }, [userFiles]);

//   // Debug current state
//   console.log('📊 Current component state:', {
//     isConnected,
//     account,
//     userRole,
//     userRoleName: getRoleName(userRole),
//     userDepartment,
//     loading,
//     userFilesCount: userFiles.length,
//     dashboardStats,
//     registrationChecked
//   });

//   // Show loading while checking registration
//   if (isConnected && !registrationChecked) {
//     return (
//       <Container className="py-5">
//         <Row className="justify-content-center">
//           <Col md={6} className="text-center">
//             <Spinner animation="border" variant="primary" />
//             <p className="mt-3 text-light">Checking registration status...</p>
//           </Col>
//         </Row>
//       </Container>
//     );
//   }

//   // Not connected state
//   if (!isConnected) {
//     return (
//       <Container className="py-4">
//         <Row className="justify-content-center min-vh-50">
//           <Col md={6} className="text-center">
//             <Card className="neo-card border-0 shadow-lg">
//               <Card.Body className="py-5">
//                 <div className="mb-4">
//                   <h1 className="text-white mb-3">🏛️ CityVault</h1>
//                   <p className="text-light mb-4">
//                     Secure document management on the blockchain
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
//               </Card.Body>
//             </Card>
//           </Col>
//         </Row>
//       </Container>
//     );
//   }

//   // Connected but not registered as User
//   if (userRole !== USER_ROLES.User) {
//     return (
//       <Container className="py-4">
//         <Row className="justify-content-center">
//           <Col md={8} lg={6}>
//             <Card className="neo-card border-0 shadow-lg">
//               <Card.Body className="text-center py-5">
//                 <div className="mb-4">
//                   <h3 className="text-white mb-2">Complete Your Registration</h3>
//                   <p className="text-light mb-4">
//                     You're connected! One more step to start using CityVault.
//                   </p>
//                 </div>

//                 <Card className="bg-dark border-secondary mb-4">
//                   <Card.Body>
//                     <Row className="text-start">
//                       <Col sm={6}>
//                         <small className="text-muted">Wallet Address</small>
//                         <div className="text-white font-monospace small">{formatAddress(account)}</div>
//                       </Col>
//                       <Col sm={6}>
//                         <small className="text-muted">Blockchain Role</small>
//                         <div className={userRole === USER_ROLES.User ? 'text-success fw-bold' : 'text-warning'}>
//                           {getRoleName(userRole)}
//                         </div>
//                       </Col>
//                     </Row>
//                     <Row className="mt-3">
//                       <Col sm={6}>
//                         <small className="text-muted">Expected Role</small>
//                         <div className="text-success fw-bold">User</div>
//                       </Col>
//                       <Col sm={6}>
//                         <small className="text-muted">Department</small>
//                         <div className="text-info fw-bold">{userDepartment || 'Not Set'}</div>
//                       </Col>
//                     </Row>
//                   </Card.Body>
//                 </Card>

//                 {userDepartment && (
//                   <Alert variant="info" className="mb-3">
//                     <strong>Your Department:</strong> {userDepartment}
//                   </Alert>
//                 )}

//                 {!userDepartment && (
//                   <Alert variant="warning" className="mb-3">
//                     Department information is required for registration.
//                   </Alert>
//                 )}

//                 <Button 
//                   className="neo-btn px-5 py-3 mb-3" 
//                   size="lg"
//                   onClick={registerUser}
//                   disabled={registrationLoading || !userDepartment}
//                 >
//                   {registrationLoading ? (
//                     <>
//                       <Spinner animation="border" size="sm" className="me-2" />
//                       Registering...
//                     </>
//                   ) : (
//                     '👤 Register as User'
//                   )}
//                 </Button>

//                 <div className="mt-3">
//                   <Button variant="outline-light" onClick={connectWallet} className="me-2">
//                     Switch Account
//                   </Button>
//                   <Button variant="outline-primary" onClick={() => navigate('/login')}>
//                     Back to Login
//                   </Button>
//                 </div>
//               </Card.Body>
//             </Card>
//           </Col>
//         </Row>
//       </Container>
//     );
//   }

//   // Main Dashboard - User is connected and registered
//   return (
//     <Container fluid className="py-4 app-container">
//       {/* Header */}
//       <Row className="mb-4">
//         <Col>
//           <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
//             <div>
//               <h2 className="mb-1 text-white">📁 User Document Portal</h2>
//               <p className="text-light mb-0">
//                 Manage and track your document submissions
//                 {userDepartment && (
//                   <span className="ms-2">• Department: <strong>{userDepartment}</strong></span>
//                 )}
//               </p>
//             </div>
//             <div className="d-flex align-items-center gap-2">
//               <Badge bg="success" className="fs-6">
//                 User: {formatAddress(account)}
//               </Badge>
//             </div>
//           </div>
//         </Col>
//       </Row>

//       {/* Quick Stats Row */}
//       <Row className="mb-4">
//         <Col xl={2} md={4} className="mb-3">
//           <Card className="neo-card stat-card h-100 border-0">
//             <Card.Body className="text-center">
//               <h4 className="text-primary">{dashboardStats.totalFiles}</h4>
//               <small className="text-light">Total Files</small>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col xl={2} md={4} className="mb-3">
//           <Card className="neo-card stat-card h-100 border-0">
//             <Card.Body className="text-center">
//               <h4 className="text-warning">{dashboardStats.pendingReview}</h4>
//               <small className="text-light">Under Review</small>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col xl={2} md={4} className="mb-3">
//           <Card className="neo-card stat-card h-100 border-0">
//             <Card.Body className="text-center">
//               <h4 className="text-danger">{dashboardStats.sentBack}</h4>
//               <small className="text-light">Sent Back</small>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col xl={2} md={4} className="mb-3">
//           <Card className="neo-card stat-card h-100 border-0">
//             <Card.Body className="text-center">
//               <h4 className="text-success">{dashboardStats.approvedByHOD}</h4>
//               <small className="text-light">HOD Approved</small>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col xl={2} md={4} className="mb-3">
//           <Card className="neo-card stat-card h-100 border-0">
//             <Card.Body className="text-center">
//               <h4 className="text-info">{dashboardStats.resubmitted}</h4>
//               <small className="text-light">Resubmitted</small>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col xl={2} md={4} className="mb-3">
//           <Card className="neo-card stat-card h-100 border-0">
//             <Card.Body className="text-center">
//               <h4 className="text-secondary">{getApprovalProgress()}%</h4>
//               <small className="text-light">Approval Rate</small>
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
//                 <h5 className="text-white mb-0">📈 Approval Progress</h5>
//                 <Badge bg="primary">{getApprovalProgress()}% Complete</Badge>
//               </div>
//               <ProgressBar 
//                 now={getApprovalProgress()} 
//                 variant="success" 
//                 className="mb-3"
//                 style={{ height: '10px' }}
//               />
//               <Row className="text-center">
//                 <Col>
//                   <small className="text-light">Total</small>
//                   <div className="text-white h5">{dashboardStats.totalFiles}</div>
//                 </Col>
//                 <Col>
//                   <small className="text-light">Under Review</small>
//                   <div className="text-warning h5">{dashboardStats.pendingReview}</div>
//                 </Col>
//                 <Col>
//                   <small className="text-light">Sent Back</small>
//                   <div className="text-danger h5">{dashboardStats.sentBack}</div>
//                 </Col>
//                 <Col>
//                   <small className="text-light">HOD Approved</small>
//                   <div className="text-success h5">{dashboardStats.approvedByHOD}</div>
//                 </Col>
//               </Row>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col lg={4} className="mb-3">
//           <Card className="neo-card border-0 h-100">
//             <Card.Body className="text-center">
//               <h5 className="text-white mb-4">🚀 Quick Actions</h5>
//               <Button 
//                 className="neo-btn w-100 mb-3 py-3"
//                 onClick={() => setShowUploadModal(true)}
//               >
//                 📤 Upload New File
//               </Button>
//               <Button 
//                 variant="outline-light" 
//                 className="w-100 mb-2"
//                 onClick={() => setRefreshTrigger(prev => prev + 1)}
//                 disabled={filesLoading}
//               >
//                 {filesLoading ? (
//                   <>
//                     <Spinner animation="border" size="sm" className="me-2" />
//                     Refreshing...
//                   </>
//                 ) : (
//                   '🔄 Refresh Data'
//                 )}
//               </Button>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       {/* Files Display Section */}
//       <Row className="mt-4">
//         <Col>
//           <Card className="neo-card border-0">
//             <Card.Body>
//               <div className="d-flex justify-content-between align-items-center mb-4">
//                 <h5 className="text-white mb-0">📁 My Uploaded Documents</h5>
//                 <Badge bg="primary">{userFiles.length} files</Badge>
//               </div>
              
//               {userFiles.length === 0 ? (
//                 <div className="text-center py-5">
//                   <div className="text-muted mb-3" style={{ fontSize: '3rem' }}>📄</div>
//                   <h5 className="text-light">No documents uploaded yet</h5>
//                   <p className="text-muted">Upload your first document to get started</p>
//                   <Button 
//                     className="neo-btn"
//                     onClick={() => setShowUploadModal(true)}
//                   >
//                     📤 Upload First Document
//                   </Button>
//                 </div>
//               ) : (
//                 <div className="table-responsive">
//                   <Table hover className="mb-0 align-middle bg-dark text-light">
//                     <thead className="bg-secondary">
//                       <tr>
//                         <th className="border-0">File ID</th>
//                         <th className="border-0">Document Name</th>
//                         <th className="border-0">IPFS Hash</th>
//                         <th className="border-0">Status</th>
//                         <th className="border-0">Department</th>
//                         <th className="border-0">HOD Remarks</th>
//                         <th className="border-0">Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {userFiles.map((file) => (
//                         <tr key={file.id}>
//                           <td className="border-0">
//                             <strong className="text-primary">#{file.id}</strong>
//                           </td>
//                           <td className="border-0">
//                             <div className="text-white fw-bold">{file.fileName}</div>
//                           </td>
//                           <td className="border-0">
//                             <InputGroup size="sm">
//                               <Form.Control
//                                 value={file.ipfsHash}
//                                 readOnly
//                                 className="bg-dark text-info border-secondary font-monospace small"
//                               />
//                               <Button
//                                 variant={copiedHash === file.id ? "success" : "outline-info"}
//                                 size="sm"
//                                 onClick={() => copyToClipboard(file.ipfsHash, file.id)}
//                               >
//                                 {copiedHash === file.id ? '✅' : '📋'}
//                               </Button>
//                             </InputGroup>
//                           </td>
//                           <td className="border-0">{getStatusBadge(file.status)}</td>
//                           <td className="border-0">
//                             <Badge bg="info">{file.department}</Badge>
//                           </td>
//                           <td className="border-0">
//                             {file.hodRemark && file.hodRemark !== "" ? (
//                               <small className="text-warning">{file.hodRemark}</small>
//                             ) : (
//                               <small className="text-muted">-</small>
//                             )}
//                           </td>
//                           <td className="border-0">
//                             <div className="d-flex gap-1 flex-wrap">
//                               <Button
//                                 size="sm"
//                                 variant="outline-info"
//                                 href={file.viewLink}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                               >
//                                 👁️ View
//                               </Button>
//                               <Button
//                                 size="sm"
//                                 variant="outline-success"
//                                 href={file.downloadLink}
//                                 download
//                               >
//                                 📥 Download
//                               </Button>
//                               {parseInt(file.status) === FILE_STATUS.SemBack && (
//                                 <Button
//                                   size="sm"
//                                   variant="warning"
//                                   onClick={() => openResubmitModal(file)}
//                                 >
//                                   🔄 Resubmit
//                                 </Button>
//                               )}
//                             </div>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </Table>
//                 </div>
//               )}
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       {/* Upload Modal */}
//       <Modal 
//         show={showUploadModal} 
//         onHide={() => !uploadLoading && setShowUploadModal(false)}
//         centered
//         size="lg"
//       >
//         <Modal.Header closeButton className="bg-dark text-light">
//           <Modal.Title className="d-flex align-items-center gap-2">
//             📤 Upload New Document
//           </Modal.Title>
//         </Modal.Header>
//         <Form onSubmit={handleFileUpload}>
//           <Modal.Body className="bg-dark">
//             <Alert variant="info" className="small">
//               <strong>How it works:</strong> Your file will be uploaded to IPFS and recorded on the blockchain for secure tracking.
//               {userDepartment && userDepartment !== "None" && (
//                 <div className="mt-1">
//                   <strong>Department:</strong> {userDepartment} (from your profile)
//                 </div>
//               )}
//             </Alert>
            
//             <Form.Group className="mb-4">
//               <Form.Label className="text-light fw-bold">Select Document</Form.Label>
//               <Form.Control
//                 type="file"
//                 onChange={handleFileChange}
//                 required
//                 disabled={uploadLoading}
//                 className="bg-secondary border-0 text-light"
//               />
//               <Form.Text className="text-muted">
//                 Supported formats: PDF, DOC, DOCX, Images (Max: 10MB)
//               </Form.Text>
//             </Form.Group>
            
//             <Form.Group className="mb-3">
//               <Form.Label className="text-light fw-bold">Document Name</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={fileName}
//                 onChange={(e) => setFileName(e.target.value)}
//                 placeholder="e.g., Annual Report 2024, Project Proposal..."
//                 required
//                 disabled={uploadLoading}
//                 className="bg-secondary border-0 text-light"
//               />
//             </Form.Group>
            
//             {selectedFile && (
//               <Card className="bg-secondary border-0">
//                 <Card.Body>
//                   <Row>
//                     <Col>
//                       <strong className="text-light">Selected File:</strong>
//                       <div className="text-light">{selectedFile.name}</div>
//                       {userDepartment && userDepartment !== "None" && (
//                         <div className="text-info small mt-1">
//                           Will be assigned to: {userDepartment} department
//                         </div>
//                       )}
//                     </Col>
//                     <Col xs="auto">
//                       <Badge bg="info">{formatFileSize(selectedFile.size)}</Badge>
//                     </Col>
//                   </Row>
//                 </Card.Body>
//               </Card>
//             )}
//           </Modal.Body>
//           <Modal.Footer className="bg-dark">
//             <Button 
//               variant="outline-light" 
//               onClick={() => setShowUploadModal(false)}
//               disabled={uploadLoading}
//             >
//               Cancel
//             </Button>
//             <Button 
//               type="submit" 
//               className="neo-btn px-4"
//               disabled={uploadLoading || !selectedFile || !fileName.trim()}
//             >
//               {uploadLoading ? (
//                 <>
//                   <Spinner animation="border" size="sm" className="me-2" />
//                   Uploading to Blockchain...
//                 </>
//               ) : (
//                 '🚀 Upload Document'
//               )}
//             </Button>
//           </Modal.Footer>
//         </Form>
//       </Modal>

//       {/* Resubmit Modal - NEW MODAL */}
//       <Modal 
//         show={showResubmitModal} 
//         onHide={() => !resubmitLoading && setShowResubmitModal(false)}
//         centered
//         size="lg"
//       >
//         <Modal.Header closeButton className="bg-dark text-light">
//           <Modal.Title className="d-flex align-items-center gap-2">
//             🔄 Resubmit Document
//           </Modal.Title>
//         </Modal.Header>
//         <Form onSubmit={handleFileResubmit}>
//           <Modal.Body className="bg-dark">
//             <Alert variant="warning" className="small">
//               <strong>Resubmission Required:</strong> Your file was sent back by HOD. Please upload the corrected version and provide the new IPFS hash.
//             </Alert>
            
//             {selectedFileForResubmit && (
//               <Card className="bg-secondary border-0 mb-3">
//                 <Card.Body>
//                   <Row>
//                     <Col>
//                       <strong className="text-light">File to Resubmit:</strong>
//                       <div className="text-light">{selectedFileForResubmit.fileName}</div>
//                       <div className="text-warning small">
//                         HOD Remarks: {selectedFileForResubmit.hodRemark || 'No remarks provided'}
//                       </div>
//                     </Col>
//                     <Col xs="auto">
//                       <Badge bg="danger">Sent Back</Badge>
//                     </Col>
//                   </Row>
//                 </Card.Body>
//               </Card>
//             )}
            
//             <Form.Group className="mb-4">
//               <Form.Label className="text-light fw-bold">Upload Corrected Document</Form.Label>
//               <Form.Control
//                 type="file"
//                 onChange={(e) => {
//                   const file = e.target.files[0];
//                   if (file) {
//                     // Auto-generate IPFS hash placeholder or you can upload to IPFS here
//                     setSelectedFile(file);
//                   }
//                 }}
//                 required
//                 disabled={resubmitLoading}
//                 className="bg-secondary border-0 text-light"
//               />
//               <Form.Text className="text-muted">
//                 Upload the corrected version of your document
//               </Form.Text>
//             </Form.Group>
            
//             <Form.Group className="mb-3">
//               <Form.Label className="text-light fw-bold">New IPFS Hash</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={resubmitIpfsHash}
//                 onChange={(e) => setResubmitIpfsHash(e.target.value)}
//                 placeholder="QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco"
//                 required
//                 disabled={resubmitLoading}
//                 className="bg-secondary border-0 text-light font-monospace"
//               />
//               <Form.Text className="text-muted">
//                 After uploading the corrected file to IPFS, paste the new hash here
//               </Form.Text>
//             </Form.Group>
//           </Modal.Body>
//           <Modal.Footer className="bg-dark">
//             <Button 
//               variant="outline-light" 
//               onClick={() => setShowResubmitModal(false)}
//               disabled={resubmitLoading}
//             >
//               Cancel
//             </Button>
//             <Button 
//               type="submit" 
//               className="neo-btn px-4"
//               disabled={resubmitLoading || !resubmitIpfsHash.trim()}
//             >
//               {resubmitLoading ? (
//                 <>
//                   <Spinner animation="border" size="sm" className="me-2" />
//                   Resubmitting...
//                 </>
//               ) : (
//                 '🔄 Resubmit Document'
//               )}
//             </Button>
//           </Modal.Footer>
//         </Form>
//       </Modal>

//       {/* Files Display Component */}
//       <Row className="mt-4">
//         <Col>
//           <UserFilesDisplay 
//             contract={contract}
//             account={account}
//             refreshTrigger={refreshTrigger}
//             userDepartment={userDepartment}
//           />
//         </Col>
//       </Row>
//     </Container>
//   );
// };

// export default UserDashboard;







// components/Dashboard/UserDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, Row, Col, Card, Button, Modal, Form, 
  Table, Alert, Spinner, Badge, ProgressBar, InputGroup 
} from 'react-bootstrap';
import Web3 from 'web3';
import { useLocation, useNavigate } from 'react-router-dom';
import { uploadToIPFS } from "../../Utils/ipfs";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from  "../../Utils/constants";
import UserFilesDisplay from './UserFilesDisplay';
import { departmentService } from "../../services/department"; 

const UserDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { phone, department } = location.state || {};
  
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userDepartment, setUserDepartment] = useState(department || '');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [registrationChecked, setRegistrationChecked] = useState(false);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showResubmitModal, setShowResubmitModal] = useState(false);
  const [selectedFileForResubmit, setSelectedFileForResubmit] = useState(null);
  const [userFiles, setUserFiles] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalFiles: 0,
    pendingReview: 0,
    sentBack: 0,
    approvedByHOD: 0,
    resubmitted: 0
  });
  const [uploadLoading, setUploadLoading] = useState(false);
  const [resubmitLoading, setResubmitLoading] = useState(false);
  const [filesLoading, setFilesLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [resubmitIpfsHash, setResubmitIpfsHash] = useState('');
  const [fileStatus, setFileStatus] = useState({});
  const [departmentLoading, setDepartmentLoading] = useState(false);
  const [copiedHash, setCopiedHash] = useState('');

  // File status mapping with icons - CORRECTED to match smart contract
  const fileStatusMap = {
    0: { text: 'Provided', variant: 'primary', icon: '📤' },
    1: { text: 'Under HOD Review', variant: 'warning', icon: '👀' },
    2: { text: 'Sent Back', variant: 'danger', icon: '↩️' },
    3: { text: 'Approved by HOD', variant: 'success', icon: '✅' },
    4: { text: 'Resubmitted', variant: 'info', icon: '🔄' }
  };

  // Role Constants
  const USER_ROLES = {
    None: 0,
    User: 1,
    HOD: 2,
    Commissioner: 3
  };

  // FILE_STATUS enum from smart contract
  const FILE_STATUS = {
    Provided: 0,
    UnderHODReview: 1,
    SemBack: 2,
    ApprovedByHOD: 3,
    Resubmitted: 4
  };

  // Connect wallet and check registration
  const connectWallet = async () => {
    try {
      setLoading(true);
      setError('');

      if (!window.ethereum) {
        setError('Please install MetaMask!');
        return;
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

      await checkUserRegistration(contractInstance, accounts[0]);
      
    } catch (error) {
      console.error('Error connecting wallet:', error);
      if (error.code === 4001) {
        setError('Please approve the connection in MetaMask.');
      } else {
        setError('Error connecting wallet. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Check if user needs registration
  const needsRegistration = useCallback(async (contractInstance, userAddress) => {
    try {
      if (!contractInstance || !userAddress) return true;
      
      const role = await contractInstance.methods.getUserRole(userAddress).call();
      const roleNumber = parseInt(role);
      
      return roleNumber !== USER_ROLES.User;
    } catch (error) {
      console.error('Error checking registration status:', error);
      return true;
    }
  }, []);

  const checkUserRegistration = async (contractInstance, userAddress) => {
    try {
      const role = await contractInstance.methods.getUserRole(userAddress).call();
      const contractDepartment = await contractInstance.methods.getUserDepartment(userAddress).call();
      
      const roleNumber = parseInt(role);
      setUserRole(roleNumber);
      
      if (contractDepartment && contractDepartment !== "None" && contractDepartment !== "") {
        setUserDepartment(contractDepartment);
      }
      
      setRegistrationChecked(true);

      if (roleNumber === USER_ROLES.User) {
        await loadDashboardData();
      }
      
    } catch (error) {
      console.error('Error checking user registration:', error);
      setUserRole(null);
      setRegistrationChecked(true);
    }
  };

  const registerUser = async () => {
    try {
      const registrationNeeded = await needsRegistration(contract, account);
      if (!registrationNeeded) {
        await checkUserRegistration(contract, account);
        return;
      }

      setRegistrationLoading(true);

      if (!userDepartment || userDepartment.trim() === '') {
        alert('Department information not available. Please contact administrator.');
        return;
      }

      const transaction = await contract.methods.registerUser(USER_ROLES.User, userDepartment).send({ 
        from: account
      });
      
      await checkUserRegistration(contract, account);
      alert('Registration successful! You can now upload files.');
      
    } catch (error) {
      console.error('Error registering user:', error);
      
      if (error.message && error.message.includes('AlreadyRegistered')) {
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
    if (!contract || !account || userRole !== USER_ROLES.User) return;

    try {
      setLoading(true);
      await Promise.all([
        fetchUserFiles(),
        fetchDashboardStats()
      ]);
    } catch (error) {
      console.error('Dashboard data loading error:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // CORRECTED: Fetch user files - Fixed the Web3 validation error
  const fetchUserFiles = async () => {
    if (!contract || !account) return;
    
    try {
      setFilesLoading(true);
      console.log('📂 Fetching user files...');
      
      // Method 1: Try getAllUserFiles first (this should work based on your contract)
      let files = [];
      try {
        files = await contract.methods.getAllUserFiles(account).call();
        console.log('✅ Files from getAllUserFiles:', files);
      } catch (error) {
        console.error('❌ getAllUserFiles failed, trying alternative method:', error);
        // Method 2: Try to get files by scanning
        files = await getFilesByScanning();
      }

      // Process the files data
      const processedFiles = await processFilesData(files);
      setUserFiles(processedFiles);
      console.log('✅ Processed files:', processedFiles);

    } catch (error) {
      console.error('❌ Error fetching files:', error);
      setUserFiles([]);
    } finally {
      setFilesLoading(false);
    }
  };

  // Alternative method to get files by scanning
  const getFilesByScanning = async () => {
    const files = [];
    const startId = 1001;
    const maxFilesToCheck = 100; // Check up to 100 files
    
    for (let i = startId; i < startId + maxFilesToCheck; i++) {
      try {
        const fileData = await contract.methods.files(i).call();
        // Check if file exists and belongs to current user
        if (fileData.id !== '0' && 
            fileData.owner && 
            fileData.owner.toLowerCase() === account.toLowerCase() && 
            fileData.ipfsHash && 
            fileData.ipfsHash !== '') {
          
          files.push({
            id: fileData.id,
            ipfsHash: fileData.ipfsHash,
            owner: fileData.owner,
            status: fileData.status,
            department: fileData.department,
            hodRemark: fileData.hodRemark,
            uploadTimestamp: fileData.uploadTimestamp,
            lastUpdateTimestamp: fileData.lastUpdateTimestamp
          });
        }
      } catch (error) {
        // File doesn't exist, continue to next
        continue;
      }
    }
    
    console.log('📦 Files found by scanning:', files);
    return files;
  };

  // Process files data
  const processFilesData = async (files) => {
    const processedFiles = [];
    
    for (let file of files) {
      if (file.id !== '0' && file.ipfsHash && file.ipfsHash !== '') {
        try {
          // Get file name from contract
          let fileName = `Document ${file.id}`;
          try {
            const nameFromContract = await contract.methods.fileNames(file.id).call();
            if (nameFromContract && nameFromContract !== '') {
              fileName = nameFromContract;
            }
          } catch (err) {
            console.log(`No file name found for file ${file.id}`);
          }

          processedFiles.push({
            id: file.id,
            ipfsHash: file.ipfsHash,
            fileName: fileName,
            status: parseInt(file.status),
            department: file.department,
            hodRemark: file.hodRemark,
            owner: file.owner,
            uploadTimestamp: file.uploadTimestamp,
            lastUpdateTimestamp: file.lastUpdateTimestamp,
            viewLink: `https://gateway.pinata.cloud/ipfs/${file.ipfsHash}`,
            downloadLink: `https://gateway.pinata.cloud/ipfs/${file.ipfsHash}?download=1`
          });
        } catch (error) {
          console.error(`Error processing file ${file.id}:`, error);
          // Add basic file info
          processedFiles.push({
            id: file.id,
            ipfsHash: file.ipfsHash,
            fileName: `Document ${file.id}`,
            status: 0,
            viewLink: `https://gateway.pinata.cloud/ipfs/${file.ipfsHash}`,
            downloadLink: `https://gateway.pinata.cloud/ipfs/${file.ipfsHash}?download=1`
          });
        }
      }
    }
    
    return processedFiles;
  };

  // Fetch dashboard stats - CORRECTED
  const fetchDashboardStats = async () => {
    if (!contract || !account) return;

    try {
      console.log('📊 Fetching dashboard stats...');
      
      // Try to get stats from contract
      try {
        const statsArray = await contract.methods.getUserDashboardStats(account).call();
        
        const formattedStats = {
          totalFiles: parseInt(statsArray[0]) || 0,
          pendingReview: parseInt(statsArray[1]) || 0,
          sentBack: parseInt(statsArray[2]) || 0,
          approvedByHOD: parseInt(statsArray[3]) || 0,
          resubmitted: parseInt(statsArray[4]) || 0
        };
        
        console.log('✅ Stats from contract:', formattedStats);
        setDashboardStats(formattedStats);
      } catch (contractError) {
        console.log('❌ Contract stats failed, calculating manually...');
        calculateStatsManually();
      }
      
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      calculateStatsManually();
    }
  };

  // Manual calculation fallback
  const calculateStatsManually = () => {
    try {
      console.log('📊 Calculating stats manually...');
      
      const stats = {
        totalFiles: userFiles.length,
        pendingReview: userFiles.filter(f => parseInt(f.status) === FILE_STATUS.UnderHODReview).length,
        sentBack: userFiles.filter(f => parseInt(f.status) === FILE_STATUS.SemBack).length,
        approvedByHOD: userFiles.filter(f => parseInt(f.status) === FILE_STATUS.ApprovedByHOD).length,
        resubmitted: userFiles.filter(f => parseInt(f.status) === FILE_STATUS.Resubmitted).length
      };
      
      console.log('✅ Manual stats:', stats);
      setDashboardStats(stats);
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
        alert('Upload failed: ' + (error.message || 'Please check your connection.'));
      }
    } finally {
      setUploadLoading(false);
    }
  };

  // Handle file resubmission - ADDED
  const handleFileResubmit = async (e) => {
    e.preventDefault();
    if (!selectedFileForResubmit || !selectedFile) {
      alert('Please upload corrected file');
      return;
    }

    try {
      setResubmitLoading(true);
      console.log('🔄 Starting file resubmission...');
      
      // Upload new file to IPFS
      const newIpfsHash = await uploadToIPFS(selectedFile);
      console.log('✅ New IPFS hash:', newIpfsHash);
      
      const transaction = await contract.methods.resubmitFile(
        selectedFileForResubmit.id, 
        newIpfsHash
      ).send({ 
        from: account
      });
      
      console.log('✅ File resubmitted. Transaction:', transaction);
      setRefreshTrigger(prev => prev + 1);
      setSelectedFileForResubmit(null);
      setSelectedFile(null);
      setShowResubmitModal(false);
      alert('File resubmitted successfully!');
    } catch (error) {
      console.error('❌ Error resubmitting file:', error);
      if (error.code === 4001) {
        alert('Resubmission cancelled.');
      } else if (error.message && error.message.includes('NotSentBack')) {
        alert('Only files with "Sent Back" status can be resubmitted.');
      } else {
        alert('Resubmission failed: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setResubmitLoading(false);
    }
  };

  // Open resubmit modal - ADDED
  const openResubmitModal = (file) => {
    if (parseInt(file.status) !== FILE_STATUS.SemBack) {
      alert('Only files with "Sent Back" status can be resubmitted.');
      return;
    }
    setSelectedFileForResubmit(file);
    setSelectedFile(null);
    setShowResubmitModal(true);
  };

  // Copy IPFS hash to clipboard - ADDED
  const copyToClipboard = (text, fileId) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedHash(fileId);
      setTimeout(() => setCopiedHash(''), 2000);
    });
  };

  // File input change handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
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
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get status badge for file
  const getStatusBadge = (status) => {
    const statusNumber = parseInt(status);
    const statusInfo = fileStatusMap[statusNumber] || fileStatusMap[0];
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
    return progress > 100 ? 100 : progress;
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp || timestamp === '0') return 'Unknown';
    return new Date(parseInt(timestamp) * 1000).toLocaleString();
  };

  const formatAddress = (address) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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

  // Auto-register user when conditions are met
  useEffect(() => {
    const autoRegisterUser = async () => {
      if (isConnected && 
          contract && 
          account && 
          userDepartment && 
          userDepartment !== '' && 
          !registrationLoading && 
          !loading &&
          registrationChecked &&
          userRole !== USER_ROLES.User) {
        
        const registrationNeeded = await needsRegistration(contract, account);
        
        if (registrationNeeded) {
          await registerUser();
        } else {
          await checkUserRegistration(contract, account);
        }
      }
    };

    autoRegisterUser();
  }, [isConnected, contract, account, userDepartment, registrationLoading, loading, registrationChecked, userRole, needsRegistration]);

  // Check connection on load
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
          console.error('Error checking connection:', error);
        }
      }
    };

    checkConnection();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          checkUserRegistration(contract, accounts[0]);
        } else {
          setAccount(null);
          setUserRole(null);
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

  // Load data when connected and registered
  useEffect(() => {
    if (isConnected && contract && account && userRole === USER_ROLES.User) {
      loadDashboardData();
    }
  }, [isConnected, contract, account, userRole, refreshTrigger]);

  // Update stats when files change
  useEffect(() => {
    if (userFiles.length > 0) {
      calculateStatsManually();
    }
  }, [userFiles]);

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

  // Connected but not registered as User
  if (userRole !== USER_ROLES.User) {
    return (
      <Container className="py-4">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="neo-card border-0 shadow-lg">
              <Card.Body className="text-center py-5">
                <div className="mb-4">
                  <h3 className="text-white mb-2">Complete Your Registration</h3>
                  <p className="text-light mb-4">
                    You need to register on the blockchain to continue.
                  </p>
                </div>

                <Card className="bg-dark border-secondary mb-4">
                  <Card.Body>
                    <Row className="text-start">
                      <Col sm={6}>
                        <small className="text-muted">Wallet Address</small>
                        <div className="text-white font-monospace small">{formatAddress(account)}</div>
                      </Col>
                      <Col sm={6}>
                        <small className="text-muted">Current Role</small>
                        <div className="text-warning">{getRoleName(userRole)}</div>
                      </Col>
                    </Row>
                    <Row className="mt-3">
                      <Col sm={6}>
                        <small className="text-muted">Registering As</small>
                        <div className="text-success fw-bold">User</div>
                      </Col>
                      <Col sm={6}>
                        <small className="text-muted">Department</small>
                        <div className="text-info fw-bold">{userDepartment || 'Not Set'}</div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                <Button 
                  className="neo-btn px-5 py-3 mb-3" 
                  size="lg"
                  onClick={registerUser}
                  disabled={registrationLoading || !userDepartment}
                >
                  {registrationLoading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Registering...
                    </>
                  ) : (
                    '👤 Register as User'
                  )}
                </Button>

                <div className="mt-3">
                  <Button variant="outline-light" onClick={connectWallet} className="me-2">
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

  return (
    <Container fluid className="py-4 app-container">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h2 className="mb-1 text-white">📁 User Document Portal</h2>
              <p className="text-light mb-0">
                Manage and track your document submissions
                {userDepartment && (
                  <span className="ms-2">• Department: <strong>{userDepartment}</strong></span>
                )}
              </p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Badge bg="success" className="fs-6">
                User: {formatAddress(account)}
              </Badge>
            </div>
          </div>
        </Col>
      </Row>

      {/* Quick Stats Row */}
      <Row className="mb-4">
        <Col xl={2} md={4} className="mb-3">
          <Card className="neo-card stat-card h-100 border-0">
            <Card.Body className="text-center">
              <h4 className="text-primary mb-1">{dashboardStats.totalFiles}</h4>
              <small className="text-light">Total Files</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={2} md={4} className="mb-3">
          <Card className="neo-card stat-card h-100 border-0">
            <Card.Body className="text-center">
              <h4 className="text-warning mb-1">{dashboardStats.pendingReview}</h4>
              <small className="text-light">Under Review</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={2} md={4} className="mb-3">
          <Card className="neo-card stat-card h-100 border-0">
            <Card.Body className="text-center">
              <h4 className="text-danger mb-1">{dashboardStats.sentBack}</h4>
              <small className="text-light">Sent Back</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={2} md={4} className="mb-3">
          <Card className="neo-card stat-card h-100 border-0">
            <Card.Body className="text-center">
              <h4 className="text-success mb-1">{dashboardStats.approvedByHOD}</h4>
              <small className="text-light">HOD Approved</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={2} md={4} className="mb-3">
          <Card className="neo-card stat-card h-100 border-0">
            <Card.Body className="text-center">
              <h4 className="text-info mb-1">{dashboardStats.resubmitted}</h4>
              <small className="text-light">Resubmitted</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={2} md={4} className="mb-3">
          <Card className="neo-card stat-card h-100 border-0">
            <Card.Body className="text-center">
              <h4 className="text-secondary mb-1">{getApprovalProgress()}%</h4>
              <small className="text-light">Approval Rate</small>
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
                onClick={() => setRefreshTrigger(prev => prev + 1)}
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
                <div className="d-flex align-items-center gap-2">
                  <Badge bg="primary">{userFiles.length} files</Badge>
                  <Button 
                    variant="outline-info" 
                    size="sm"
                    onClick={() => setRefreshTrigger(prev => prev + 1)}
                    disabled={filesLoading}
                  >
                    {filesLoading ? <Spinner size="sm" /> : '🔄'}
                  </Button>
                </div>
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
                  <Table hover className="mb-0 align-middle bg-dark text-light">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="border-0">File ID</th>
                        <th className="border-0">Document Name</th>
                        <th className="border-0">IPFS Hash</th>
                        <th className="border-0">Status</th>
                        <th className="border-0">Upload Date</th>
                        <th className="border-0">HOD Remarks</th>
                        <th className="border-0">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userFiles.map((file) => (
                        <tr key={file.id}>
                          <td className="border-0">
                            <strong className="text-primary">#{file.id}</strong>
                          </td>
                          <td className="border-0">
                            <div className="text-dark fw-bold">{file.fileName}</div>
                          </td>
                          <td className="border-0">
                            <InputGroup size="sm">
                              <Form.Control
                                value={file.ipfsHash}
                                readOnly
                                className="bg-dark text-info border-secondary font-monospace small"
                                style={{ fontSize: '0.7rem' }}
                              />
                              <Button
                                variant={copiedHash === file.id ? "success" : "outline-info"}
                                size="sm"
                                onClick={() => copyToClipboard(file.ipfsHash, file.id)}
                              >
                                {copiedHash === file.id ? '✅' : '📋'}
                              </Button>
                            </InputGroup>
                          </td>
                          <td className="border-0">{getStatusBadge(file.status)}</td>
                          <td className="border-0">
                            <small className="text-dark">
                              {formatTimestamp(file.uploadTimestamp)}
                            </small>
                          </td>
                          <td className="border-0">
                            {file.hodRemark && file.hodRemark !== "" ? (
                              <small className="text-warning">{file.hodRemark}</small>
                            ) : (
                              <small className="text-dark">-</small>
                            )}
                          </td>
                          <td className="border-0">
                            <div className="d-flex gap-1 flex-wrap">
                              <Button
                                size="sm"
                                variant="outline-info"
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
                              {/* RESUBMIT BUTTON - ONLY SHOWS FOR SENT BACK FILES */}
                              {parseInt(file.status) === FILE_STATUS.SemBack && (
                                <Button
                                  size="sm"
                                  variant="warning"
                                  onClick={() => openResubmitModal(file)}
                                >
                                  🔄 Resubmit
                                </Button>
                              )}
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
          <Modal.Title>📤 Upload New Document</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleFileUpload}>
          <Modal.Body className="bg-dark">
            <Form.Group className="mb-4">
              <Form.Label className="text-light fw-bold">Select Document</Form.Label>
              <Form.Control
                type="file"
                onChange={handleFileChange}
                required
                disabled={uploadLoading}
                className="bg-secondary border-0 text-light"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label className="text-light fw-bold">Document Name</Form.Label>
              <Form.Control
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Enter document name..."
                required
                disabled={uploadLoading}
                className="bg-secondary border-0 text-light"
              />
            </Form.Group>
            
            {selectedFile && (
              <Card className="bg-secondary border-0">
                <Card.Body>
                  <strong className="text-light">Selected File:</strong>
                  <div className="text-light">{selectedFile.name}</div>
                  <Badge bg="info" className="mt-1">{formatFileSize(selectedFile.size)}</Badge>
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
                  Uploading...
                </>
              ) : (
                '🚀 Upload Document'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Resubmit Modal */}
      <Modal 
        show={showResubmitModal} 
        onHide={() => !resubmitLoading && setShowResubmitModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="bg-dark text-light">
          <Modal.Title>🔄 Resubmit Document</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleFileResubmit}>
          <Modal.Body className="bg-dark">
            {selectedFileForResubmit && (
              <Alert variant="warning" className="mb-3">
                <strong>File: {selectedFileForResubmit.fileName}</strong>
                <br />
                <strong>HOD Remarks:</strong> {selectedFileForResubmit.hodRemark || 'No remarks provided'}
              </Alert>
            )}
            
            <Form.Group className="mb-4">
              <Form.Label className="text-light fw-bold">Upload Corrected Document</Form.Label>
              <Form.Control
                type="file"
                onChange={handleFileChange}
                required
                disabled={resubmitLoading}
                className="bg-secondary border-0 text-light"
              />
              <Form.Text className="text-muted">
                Upload the corrected version of your document
              </Form.Text>
            </Form.Group>
            
            {selectedFile && (
              <Card className="bg-secondary border-0 mb-3">
                <Card.Body>
                  <strong className="text-light">File to Upload:</strong>
                  <div className="text-light">{selectedFile.name}</div>
                  <Badge bg="info" className="mt-1">{formatFileSize(selectedFile.size)}</Badge>
                </Card.Body>
              </Card>
            )}
          </Modal.Body>
          <Modal.Footer className="bg-dark">
            <Button 
              variant="outline-light" 
              onClick={() => setShowResubmitModal(false)}
              disabled={resubmitLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="neo-btn px-4"
              disabled={resubmitLoading || !selectedFile}
            >
              {resubmitLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Resubmitting...
                </>
              ) : (
                '🔄 Resubmit Document'
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