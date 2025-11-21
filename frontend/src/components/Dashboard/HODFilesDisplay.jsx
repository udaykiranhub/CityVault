
// export default HODFilesDisplay;
// components/Dashboard/HODFilesDisplay.jsx
import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Spinner, Alert, Row, Col, Tabs, Tab } from 'react-bootstrap';

const HODFilesDisplay = ({ 
  contract, 
  account, 
  refreshTrigger, 
  onReviewFile, 
  onForwardFile,
  getStatusBadge,
  activeTab,
  onTabChange 
}) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch HOD dashboard files
  const fetchHODFiles = async () => {
    if (!contract || !account) return;
    
    try {
      setLoading(true);
      setError('');
      console.log('📂 Fetching HOD dashboard files...');

      let hodFiles = [];
      try {
        // Try to get files using the contract method
        hodFiles = await contract.methods.getHODDashboardFiles().call({ from: account });
        console.log('📦 Raw HOD files from contract:', hodFiles);
        
        // ADD THIS: If contract returns empty array, use manual lookup
        if (hodFiles.length === 0) {
          console.log('🔄 Contract returned empty, trying manual lookup...');
          hodFiles = await getHODFilesIndividually();
        }
      } catch (err) {
        console.error('❌ getHODDashboardFiles failed, trying alternative approach');
        hodFiles = await getHODFilesIndividually();
      }

      const processedFiles = await processHODFilesData(hodFiles);
      setFiles(processedFiles);
      
    } catch (error) {
      console.error('❌ Error fetching HOD files:', error);
      setError('Failed to load files. The contract might be having issues.');
    } finally {
      setLoading(false);
    }
  };

  // Alternative method: Get HOD files individually by ID
  const getHODFilesIndividually = async () => {
    const hodFiles = [];
    const startId = 1001;
    const endId = startId + 100;
    
    for (let i = startId; i < endId; i++) {
      try {
        const file = await contract.methods.files(i).call();
        
        // Include ALL files (status >= 0), not just status >= 1
        if (file.ipfsHash && file.ipfsHash !== '') {
          hodFiles.push({
            id: i.toString(),
            ipfsHash: file.ipfsHash,
            owner: file.owner,
            status: file.status
          });
        }
      } catch (error) {
        continue;
      }
    }
    
    console.log('📦 HOD files found individually:', hodFiles);
    return hodFiles;
  };

  // Process HOD files data
  const processHODFilesData = async (hodFiles) => {
    const processedFiles = [];
    
    for (let file of hodFiles) {
      if (file.id !== '0' && file.ipfsHash && file.ipfsHash !== '') {
        try {
          const fileDetails = await contract.methods.files(file.id).call();
          
          // Get file name
          let fileName = `Document ${file.id}`;
          try {
            const nameFromContract = await contract.methods.fileNames(file.id).call();
            if (nameFromContract && nameFromContract !== '') {
              fileName = nameFromContract;
            }
          } catch (err) {
            console.log(`No file name found for file ${file.id}`);
          }

          // Get HOD remarks if any
          let hodRemark = '';
          try {
            const remark = await contract.methods.hodRemarks(file.id).call();
            if (remark && remark !== '') {
              hodRemark = remark;
            }
          } catch (err) {
            // No remarks, continue
          }

          processedFiles.push({
            id: file.id,
            ipfsHash: file.ipfsHash,
            fileName: fileName,
            status: fileDetails.status,
            uploadTimestamp: fileDetails.uploadTimestamp,
            lastUpdateTimestamp: fileDetails.lastUpdateTimestamp,
            owner: fileDetails.owner,
            isSharedWithCommissioner: fileDetails.isSharedWithCommissioner,
            hodRemark: hodRemark,
            viewLink: `https://gateway.pinata.cloud/ipfs/${file.ipfsHash}`,
            downloadLink: `https://gateway.pinata.cloud/ipfs/${file.ipfsHash}?download=1`
          });
        } catch (error) {
          console.error(`Error processing HOD file ${file.id}:`, error);
          // Add basic file info
          processedFiles.push({
            id: file.id,
            ipfsHash: file.ipfsHash,
            fileName: `Document ${file.id}`,
            status: file.status || '1',
            viewLink: `https://gateway.pinata.cloud/ipfs/${file.ipfsHash}`,
            downloadLink: `https://gateway.pinata.cloud/ipfs/${file.ipfsHash}?download=1`,
            owner: file.owner
          });
        }
      }
    }
    
    console.log('✅ Processed HOD files:', processedFiles);
    return processedFiles;
  };

  // Filter files by status for tabs
  const getFilteredFiles = () => {
    switch(activeTab) {
      case 'new': // NEW UPLOADS TAB
        return files.filter(file => file.status === '0'); // New uploads
      case 'pending':
        return files.filter(file => file.status === '1'); // UnderHODReview
      case 'sentback':
        return files.filter(file => file.status === '2'); // SemBack
      case 'approved':
        return files.filter(file => file.status === '3'); // ApprovedByHOD
      case 'forwarded':
        return files.filter(file => file.status === '4'); // Forwarded
      default:
        return files;
    }
  };

  // Get action buttons based on file status - COMPLETE HOD FUNCTIONALITY
  const getActionButtons = (file) => {
    const status = parseInt(file.status);
    
    switch(status) {
      case 0: // Uploaded/Provided - HOD CAN REVIEW THESE
        return (
          <div className="d-flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline-success"
              onClick={() => onReviewFile(file, 'approve')}
              className="d-flex align-items-center gap-1"
            >
              ✅ Approve
            </Button>
            <Button
              size="sm"
              variant="outline-warning"
              onClick={() => onReviewFile(file, 'sendback')}
              className="d-flex align-items-center gap-1"
            >
              ↩️ Send Back
            </Button>
            <Button
              size="sm"
              variant="outline-info"
              onClick={() => onReviewFile(file, 'underreview')}
              className="d-flex align-items-center gap-1"
            >
              👀 Start Review
            </Button>
            <Button
              size="sm"
              variant="outline-light"
              href={file.viewLink}
              target="_blank"
              className="d-flex align-items-center gap-1"
            >
              👁️ View
            </Button>
          </div>
        );
      
      case 1: // UnderHODReview
        return (
          <div className="d-flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline-success"
              onClick={() => onReviewFile(file, 'approve')}
              className="d-flex align-items-center gap-1"
            >
              ✅ Approve
            </Button>
            <Button
              size="sm"
              variant="outline-warning"
              onClick={() => onReviewFile(file, 'sendback')}
              className="d-flex align-items-center gap-1"
            >
              ↩️ Send Back
            </Button>
            <Button
              size="sm"
              variant="outline-light"
              href={file.viewLink}
              target="_blank"
              className="d-flex align-items-center gap-1"
            >
              👁️ View
            </Button>
          </div>
        );
      
      case 2: // SemBack
        return (
          <div className="d-flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline-info"
              onClick={() => onReviewFile(file, 'underreview')}
              className="d-flex align-items-center gap-1"
            >
              🔄 Review Again
            </Button>
            <Button
              size="sm"
              variant="outline-light"
              href={file.viewLink}
              target="_blank"
              className="d-flex align-items-center gap-1"
            >
              👁️ View
            </Button>
          </div>
        );
      
      case 3: // ApprovedByHOD
        return (
          <div className="d-flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline-primary"
              onClick={() => onForwardFile(file.id)}
              disabled={file.isSharedWithCommissioner}
              className="d-flex align-items-center gap-1"
            >
              {file.isSharedWithCommissioner ? '📨 Forwarded' : '📨 Forward'}
            </Button>
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
              variant="outline-warning"
              onClick={() => onReviewFile(file, 'sendback')}
              className="d-flex align-items-center gap-1"
            >
              ↩️ Revoke
            </Button>
          </div>
        );
      
      case 4: // Forwarded
        return (
          <div className="d-flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline-secondary"
              disabled
              className="d-flex align-items-center gap-1"
            >
              📨 Forwarded
            </Button>
            <Button
              size="sm"
              variant="outline-light"
              href={file.viewLink}
              target="_blank"
              className="d-flex align-items-center gap-1"
            >
              👁️ View
            </Button>
          </div>
        );
      
      default:
        return (
          <div className="d-flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline-info"
              onClick={() => onReviewFile(file, 'underreview')}
              className="d-flex align-items-center gap-1"
            >
              👀 Review
            </Button>
            <Button
              size="sm"
              variant="outline-light"
              href={file.viewLink}
              target="_blank"
              className="d-flex align-items-center gap-1"
            >
              👁️ View
            </Button>
          </div>
        );
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    return new Date(parseInt(timestamp) * 1000).toLocaleString();
  };

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Refresh data
  const refreshData = () => {
    fetchHODFiles();
  };

  // Load data on component mount and when refreshTrigger changes
  useEffect(() => {
    fetchHODFiles();
  }, [contract, account, refreshTrigger]);

  const filteredFiles = getFilteredFiles();

  return (
    <Card className="neo-card border-0">
      <Card.Header className="bg-transparent border-bottom-0 py-3">
        <Row className="align-items-center">
          <Col>
            <h5 className="text-white mb-0">📋 Documents for Review</h5>
          </Col>
          <Col xs="auto">
            <div className="d-flex align-items-center gap-2">
              <small className="text-light">
                {filteredFiles.length} document{filteredFiles.length !== 1 ? 's' : ''}
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

        {/* Tabs for different file statuses - ADDED NEW UPLOADS TAB */}
        <Tabs
          activeKey={activeTab}
          onSelect={onTabChange}
          className="px-3 pt-3 border-bottom-0"
          fill
        >
          <Tab eventKey="new" title={
            <span>
              📤 New Uploads <Badge bg="primary" className="ms-1">{files.filter(f => f.status === '0').length}</Badge>
            </span>
          }>
            {/* Content will be handled below */}
          </Tab>
          <Tab eventKey="pending" title={
            <span>
              ⏳ Pending <Badge bg="warning" className="ms-1">{files.filter(f => f.status === '1').length}</Badge>
            </span>
          }>
            {/* Content will be handled below */}
          </Tab>
          <Tab eventKey="sentback" title={
            <span>
              ↩️ Sent Back <Badge bg="danger" className="ms-1">{files.filter(f => f.status === '2').length}</Badge>
            </span>
          }>
            {/* Content will be handled below */}
          </Tab>
          <Tab eventKey="approved" title={
            <span>
              ✅ Approved <Badge bg="success" className="ms-1">{files.filter(f => f.status === '3').length}</Badge>
            </span>
          }>
            {/* Content will be handled below */}
          </Tab>
          <Tab eventKey="forwarded" title={
            <span>
              📨 Forwarded <Badge bg="info" className="ms-1">{files.filter(f => f.status === '4').length}</Badge>
            </span>
          }>
            {/* Content will be handled below */}
          </Tab>
          <Tab eventKey="all" title={
            <span>
              📊 All <Badge bg="secondary" className="ms-1">{files.length}</Badge>
            </span>
          }>
            {/* Content will be handled below */}
          </Tab>
        </Tabs>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="light" />
            <p className="text-light mt-2">Loading documents...</p>
          </div>
        ) : filteredFiles.length > 0 ? (
          <div className="table-responsive">
            <Table hover variant="dark" className="mb-0">
              <thead className="bg-dark">
                <tr>
                  <th>File ID</th>
                  <th>Document Name</th>
                  <th>Uploaded By</th>
                  <th>IPFS Hash</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map((file) => (
                  <tr key={file.id}>
                    <td className="text-light">
                      <strong>#{file.id}</strong>
                    </td>
                    <td>
                      <div className="text-white fw-bold">{file.fileName}</div>
                      {file.hodRemark && (
                        <small className="text-warning">
                          <strong>Remark:</strong> {file.hodRemark}
                        </small>
                      )}
                    </td>
                    <td>
                      <small className="text-light">
                        {formatAddress(file.owner)}
                      </small>
                    </td>
                    <td>
                      <small className="text-info">
                        {file.ipfsHash ? 
                          `${file.ipfsHash.slice(0, 8)}...${file.ipfsHash.slice(-6)}` : 
                          'No hash'
                        }
                      </small>
                    </td>
                    <td>
                      {getStatusBadge(file.status)}
                    </td>
                    <td>
                      <small className="text-light">
                        {formatTimestamp(file.lastUpdateTimestamp)}
                      </small>
                    </td>
                    <td>
                      {getActionButtons(file)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-5">
            <div className="display-4 text-muted mb-3">
              {activeTab === 'new' ? '📤' :
               activeTab === 'pending' ? '⏳' :
               activeTab === 'sentback' ? '↩️' :
               activeTab === 'approved' ? '✅' :
               activeTab === 'forwarded' ? '📨' : '📁'}
            </div>
            <h5 className="text-light mb-3">
              {activeTab === 'new' ? 'No new uploads' :
               activeTab === 'pending' ? 'No pending reviews' :
               activeTab === 'sentback' ? 'No sent back documents' :
               activeTab === 'approved' ? 'No approved documents' :
               activeTab === 'forwarded' ? 'No forwarded documents' : 'No documents found'}
            </h5>
            <p className="text-muted mb-4">
              {activeTab === 'new' ? 'All new uploads have been reviewed!' :
               activeTab === 'pending' ? 'All documents have been reviewed!' :
               activeTab === 'sentback' ? 'No documents require revisions at the moment.' :
               activeTab === 'approved' ? 'Approve some documents to see them here.' :
               activeTab === 'forwarded' ? 'Forward approved documents to Commissioner.' : 
               'No documents available for review.'}
            </p>
            {!loading && activeTab !== 'all' && (
              <Button 
                variant="outline-info" 
                onClick={() => onTabChange('all')}
              >
                View All Documents
              </Button>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default HODFilesDisplay;


