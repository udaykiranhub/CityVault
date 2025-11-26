// // components/Dashboard/UserFilesDisplay.jsx
// import React, { useState, useEffect } from 'react';
// import { Card, Table, Button, Badge, Spinner, Alert, Row, Col } from 'react-bootstrap';

// const UserFilesDisplay = ({ contract, account, refreshTrigger }) => {
//   const [userFiles, setUserFiles] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   // File status mapping with icons
//   const fileStatusMap = {
//     0: { text: 'Uploaded', variant: 'primary', icon: '📤' },
//     1: { text: 'Under Review', variant: 'warning', icon: '👀' },
//     2: { text: 'Revisions Needed', variant: 'danger', icon: '↩️' },
//     3: { text: 'HOD Approved', variant: 'success', icon: '✅' },
//     4: { text: 'Forwarded', variant: 'info', icon: '📨' },
//     5: { text: 'Commissioner Approved', variant: 'success', icon: '🏆' }
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

//   // Format file size (you can get this from IPFS metadata if available)
//   const formatFileSize = (bytes) => {
//     if (!bytes || bytes === 0) return 'Unknown';
//     const k = 1024;
//     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
//   };

//   // Fetch user files directly from contract events and storage
//   const fetchUserFilesDirect = async () => {
//     if (!contract || !account) return;
    
//     try {
//       setLoading(true);
//       setError('');
//       console.log('📂 Fetching user files directly...');

//       // Method 1: Try to get file count first
//       let fileCount = 0;
//       try {
//         fileCount = await contract.methods.getFileCount().call();
//         console.log('📊 Total files in contract:', fileCount);
//       } catch (err) {
//         console.log('❌ Could not get file count, trying alternative approach');
//       }

//       // Method 2: Try to get user files with error handling
//       let files = [];
//       try {
//         files = await contract.methods.getAllUserFiles(account).call();
//         console.log('📦 Raw files from getAllUserFiles:', files);
//       } catch (err) {
//         console.error('❌ getAllUserFiles failed, trying individual file lookup');
//         // If getAllUserFiles fails, try to get files individually
//         files = await getFilesIndividually(fileCount);
//       }

//       // Process files
//       const processedFiles = await processFilesData(files);
//       setUserFiles(processedFiles);
      
//     } catch (error) {
//       console.error('❌ Error fetching user files:', error);
//       setError('Failed to load files. The contract might be having issues.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Alternative method: Get files individually by ID
//   const getFilesIndividually = async (fileCount) => {
//     const files = [];
//     const startId = 1001; // Based on your contract starting at 1000
    
//     for (let i = startId; i < startId + 50; i++) { // Check first 50 files
//       try {
//         const file = await contract.methods.files(i).call();
//         if (file.owner && file.owner.toLowerCase() === account.toLowerCase() && file.ipfsHash) {
//           files.push({
//             id: i.toString(),
//             ipfsHash: file.ipfsHash,
//             owner: file.owner,
//             status: file.status
//           });
//         }
//       } catch (error) {
//         // File doesn't exist or other error, continue
//         continue;
//       }
//     }
    
//     console.log('📦 Files found individually:', files);
//     return files;
//   };

//   // Process files data and get additional info
//   const processFilesData = async (files) => {
//     const processedFiles = [];
    
//     for (let file of files) {
//       if (file.id !== '0' && file.ipfsHash && file.ipfsHash !== '') {
//         try {
//           // Get file details from contract
//           const fileDetails = await contract.methods.files(file.id).call();
          
//           // Try to get file name (you might need to store this in your contract)
//           let fileName = `Document ${file.id}`;
//           try {
//             // If you have a fileNames mapping in your contract
//             const nameFromContract = await contract.methods.fileNames(file.id).call();
//             if (nameFromContract && nameFromContract !== '') {
//               fileName = nameFromContract;
//             }
//           } catch (err) {
//             console.log(`No file name found for file ${file.id}`);
//           }

//           processedFiles.push({
//             id: file.id,
//             ipfsHash: file.ipfsHash,
//             fileName: fileName,
//             status: fileDetails.status,
//             uploadTimestamp: fileDetails.uploadTimestamp,
//             lastUpdateTimestamp: fileDetails.lastUpdateTimestamp,
//             viewLink: `https://gateway.pinata.cloud/ipfs/${file.ipfsHash}`,
//             downloadLink: `https://gateway.pinata.cloud/ipfs/${file.ipfsHash}?download=1`,
//             owner: fileDetails.owner
//           });
//         } catch (error) {
//           console.error(`Error processing file ${file.id}:`, error);
//           // Add basic file info even if details fail
//           processedFiles.push({
//             id: file.id,
//             ipfsHash: file.ipfsHash,
//             fileName: `Document ${file.id}`,
//             status: '0',
//             viewLink: `https://gateway.pinata.cloud/ipfs/${file.ipfsHash}`,
//             downloadLink: `https://gateway.pinata.cloud/ipfs/${file.ipfsHash}?download=1`
//           });
//         }
//       }
//     }
    
//     console.log('✅ Processed files:', processedFiles);
//     return processedFiles;
//   };

//   // Format timestamp
//   const formatTimestamp = (timestamp) => {
//     if (!timestamp) return 'Unknown';
//     return new Date(parseInt(timestamp) * 1000).toLocaleString();
//   };

//   // Refresh data
//   const refreshData = () => {
//     fetchUserFilesDirect();
//   };

//   // Load data on component mount and when refreshTrigger changes
//   useEffect(() => {
//     fetchUserFilesDirect();
//   }, [contract, account, refreshTrigger]);

//   return (
//     <Card className="neo-card border-0">
//       <Card.Header className="bg-transparent border-bottom-0 py-3">
//         <Row className="align-items-center">
//           <Col>
//             <h5 className="text-white mb-0">📋 My Uploaded Documents</h5>
//           </Col>
//           <Col xs="auto">
//             <div className="d-flex align-items-center gap-2">
//               <small className="text-light">
//                 {userFiles.length} document{userFiles.length !== 1 ? 's' : ''}
//               </small>
//               <Button 
//                 variant="outline-light" 
//                 size="sm"
//                 onClick={refreshData}
//                 disabled={loading}
//               >
//                 {loading ? <Spinner animation="border" size="sm" /> : '🔄'}
//               </Button>
//             </div>
//           </Col>
//         </Row>
//       </Card.Header>
      
//       <Card.Body className="p-0">
//         {error && (
//           <Alert variant="warning" className="m-3">
//             {error}
//           </Alert>
//         )}

//         {loading ? (
//           <div className="text-center py-5">
//             <Spinner animation="border" variant="light" />
//             <p className="text-light mt-2">Loading your documents...</p>
//           </div>
//         ) : userFiles.length > 0 ? (
//           <div className="table-responsive">
//             <Table hover variant="dark" className="mb-0">
//               <thead className="bg-dark">
//                 <tr>
//                   <th>File ID</th>
//                   <th>Document Name</th>
//                   <th>IPFS Hash</th>
//                   <th>Status</th>
//                   <th>Upload Date</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {userFiles.map((file) => (
//                   <tr key={file.id}>
//                     <td className="text-light">
//                       <strong>#{file.id}</strong>
//                     </td>
//                     <td>
//                       <div className="text-white fw-bold">{file.fileName}</div>
//                     </td>
//                     <td>
//                       <small className="text-info">
//                         {file.ipfsHash ? 
//                           `${file.ipfsHash.slice(0, 8)}...${file.ipfsHash.slice(-6)}` : 
//                           'No hash'
//                         }
//                       </small>
//                     </td>
//                     <td>
//                       {getStatusBadge(file.status)}
//                     </td>
//                     <td>
//                       <small className="text-light">
//                         {formatTimestamp(file.uploadTimestamp)}
//                       </small>
//                     </td>
//                     <td>
//                       <div className="d-flex gap-2">
//                         <Button
//                           size="sm"
//                           variant="outline-light"
//                           href={file.viewLink}
//                           target="_blank"
//                           className="d-flex align-items-center gap-1"
//                         >
//                           👁️ View
//                         </Button>
//                         <Button
//                           size="sm"
//                           variant="outline-primary"
//                           href={file.downloadLink}
//                           download
//                           className="d-flex align-items-center gap-1"
//                         >
//                           📥 Download
//                         </Button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </Table>
//           </div>
//         ) : (
//           <div className="text-center py-5">
//             <div className="display-4 text-muted mb-3">📁</div>
//             <h5 className="text-light mb-3">No documents found</h5>
//             <p className="text-muted mb-4">
//               {contract && account ? 
//                 "Upload your first document to get started." : 
//                 "Connect your wallet to view documents."
//               }
//             </p>
//             {!loading && (
//               <Button 
//                 variant="outline-info" 
//                 onClick={refreshData}
//                 disabled={loading}
//               >
//                 {loading ? 'Searching...' : '🔍 Search for Files'}
//               </Button>
//             )}
//           </div>
//         )}
//       </Card.Body>
//     </Card>
//   );
// };

// export default UserFilesDisplay;

// components/Dashboard/UserFilesDisplay.jsx
import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Spinner, Alert, Row, Col, InputGroup, Form } from 'react-bootstrap';

const UserFilesDisplay = ({ contract, account, refreshTrigger }) => {
  const [userFiles, setUserFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedHash, setCopiedHash] = useState('');

  // File status mapping with icons - CORRECTED to match smart contract
  const fileStatusMap = {
    0: { text: 'Provided', variant: 'primary', icon: '📤' },
    1: { text: 'Under HOD Review', variant: 'warning', icon: '👀' },
    2: { text: 'Sent Back', variant: 'danger', icon: '↩️' },
    3: { text: 'Approved by HOD', variant: 'success', icon: '✅' },
    4: { text: 'Resubmitted', variant: 'info', icon: '🔄' }
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

  // Copy IPFS hash to clipboard
  const copyToClipboard = (text, fileId) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedHash(fileId);
      setTimeout(() => setCopiedHash(''), 2000);
    });
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp || timestamp === '0') return 'Unknown';
    return new Date(parseInt(timestamp) * 1000).toLocaleString();
  };

  // Fetch user files - CORRECTED implementation
  const fetchUserFilesDirect = async () => {
    if (!contract || !account) return;
    
    try {
      setLoading(true);
      setError('');
      console.log('📂 Fetching user files directly...');

      let files = [];
      
      // Try getAllUserFiles first
      try {
        files = await contract.methods.getAllUserFiles(account).call();
        console.log('✅ Files from getAllUserFiles:', files);
      } catch (err) {
        console.error('❌ getAllUserFiles failed, trying individual file lookup:', err);
        // Fallback: Scan for files
        files = await getFilesByScanning();
      }

      // Process files
      const processedFiles = await processFilesData(files);
      setUserFiles(processedFiles);
      
    } catch (error) {
      console.error('❌ Error fetching user files:', error);
      setError('Failed to load files. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  // Alternative method: Get files by scanning
  const getFilesByScanning = async () => {
    const files = [];
    const startId = 1001;
    const maxFilesToCheck = 100;
    
    for (let i = startId; i < startId + maxFilesToCheck; i++) {
      try {
        const fileData = await contract.methods.files(i).call();
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
    
    console.log('✅ Processed files:', processedFiles);
    return processedFiles;
  };

  // Refresh data
  const refreshData = () => {
    fetchUserFilesDirect();
  };

  // Load data on component mount and when refreshTrigger changes
  useEffect(() => {
    fetchUserFilesDirect();
  }, [contract, account, refreshTrigger]);

  return (
    <Card className="neo-card border-0">
      <Card.Header className="bg-transparent border-bottom-0 py-3">
        <Row className="align-items-center">
          <Col>
            <h5 className="text-white mb-0">📋 All Uploaded Documents</h5>
          </Col>
          <Col xs="auto">
            <div className="d-flex align-items-center gap-2">
              <small className="text-light">
                {userFiles.length} document{userFiles.length !== 1 ? 's' : ''}
              </small>
              <Button 
                variant="outline-light" 
                size="sm"
                onClick={refreshData}
                disabled={loading}
              >
                {loading ? <Spinner animation="border" size="sm" /> : '🔄'}
              </Button>
            </div>
          </Col>
        </Row>
      </Card.Header>
      
      <Card.Body className="p-0">
        {error && (
          <Alert variant="warning" className="m-3">
            {error}
          </Alert>
        )}

        {loading ? (
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
                  <th>Document Name</th>
                  <th>IPFS Hash</th>
                  <th>Status</th>
                  <th>Upload Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {userFiles.map((file) => (
                  <tr key={file.id}>
                    <td className="text-light">
                      <strong>#{file.id}</strong>
                    </td>
                    <td>
                      <div className="text-white fw-bold">{file.fileName}</div>
                    </td>
                    <td>
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
                    <td>
                      {getStatusBadge(file.status)}
                    </td>
                    <td>
                      <small className="text-light">
                        {formatTimestamp(file.uploadTimestamp)}
                      </small>
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
            <h5 className="text-light mb-3">No documents found</h5>
            <p className="text-muted mb-4">
              {contract && account ? 
                "Upload your first document to get started." : 
                "Connect your wallet to view documents."
              }
            </p>
            {!loading && (
              <Button 
                variant="outline-info" 
                onClick={refreshData}
                disabled={loading}
              >
                {loading ? 'Searching...' : '🔍 Search for Files'}
              </Button>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default UserFilesDisplay;