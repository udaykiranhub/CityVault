
// // components/Dashboard/AdminDashboard.jsx
// import React, { useState, useEffect } from 'react';
// import {
//   Container, Row, Col, Card, Button, Table, Badge,
//   Modal, Form, Alert, InputGroup, FormControl,
//   Pagination, Spinner, Tooltip, OverlayTrigger
// } from 'react-bootstrap';
// import { adminUserService } from '../../services/adminUserService';
// import './AdminDashboard.css'; // Import the CSS file

// const AdminDashboard = () => {
//   const [users, setUsers] = useState([]);
//   const [filteredUsers, setFilteredUsers] = useState([]);
//   const [statistics, setStatistics] = useState(null);
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [message, setMessage] = useState('');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [roleFilter, setRoleFilter] = useState('All');
//   const [statusFilter, setStatusFilter] = useState('All');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(8);
//   const [copiedPassword, setCopiedPassword] = useState(null);
//   const [actionLoading, setActionLoading] = useState(null);

//   // const [newUser, setNewUser] = useState({
//   //   name: '',
//   //   phone: '',
//   //   email: '',
//   //   role: 'User',
//   //   department: ''
//   // });
//   const [newUser, setNewUser] = useState({
//   name: '',
//   phone: '',
//   email: '',
//   role: 'User',
//   department: '' // This already exists, keep it
// });

//   useEffect(() => {
//     loadUsers();
//     loadStatistics();
//   }, []);

//   useEffect(() => {
//     filterUsers();
//   }, [users, searchQuery, roleFilter, statusFilter]);

//   const loadUsers = async () => {
//     try {
//       setLoading(true);
//       const response = await adminUserService.getAllUsers();
//       setUsers(response.users);
//     } catch (err) {
//       setError('Failed to load users');
//       console.error('Failed to load users:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadStatistics = async () => {
//     try {
//       const response = await adminUserService.getUserStatistics();
//       setStatistics(response.statistics);
//     } catch (err) {
//       console.error('Failed to load statistics:', err);
//     }
//   };

//   const filterUsers = () => {
//     let filtered = users;

//     // Search filter
//     if (searchQuery) {
//       filtered = filtered.filter(user =>
//         user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//        user.phone?.toString().includes(searchQuery)||
//         user.department?.toLowerCase().includes(searchQuery.toLowerCase())
//       );
//     }

//     // Role filter
//     if (roleFilter !== 'All') {
//       filtered = filtered.filter(user => user.role === roleFilter);
//     }

//     // Status filter
//     if (statusFilter !== 'All') {
//       filtered = filtered.filter(user => 
//         statusFilter === 'Active' ? user.isActive : !user.isActive
//       );
//     }

//     setFilteredUsers(filtered);
//     setCurrentPage(1);
//   };

//   const handleCreateUser = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       const response = await adminUserService.createUser(newUser);
//       setMessage(`User created successfully! Password: ${response.generatedPassword} - Make sure to copy this password as it won't be shown again.`);
//       setShowCreateModal(false);
//       setNewUser({ name: '', phone: '', email: '', role: 'User', department: '' });
//       loadUsers();
//       loadStatistics();
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to create user');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleInputChange = (e) => {
//     setNewUser({
//       ...newUser,
//       [e.target.name]: e.target.value
//     });
//   };

//   const toggleUserStatus = async (userId, currentStatus) => {
//     try {
//       setActionLoading(userId);
//       // FIX: Use the corrected service call
//       await adminUserService.toggleUserStatus(userId);
//       setMessage(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
//       loadUsers(); // Reload to get updated data
//     } catch (err) {
//       console.error('Toggle status error:', err);
//       setError(err.response?.data?.message || 'Failed to update user status');
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   const copyToClipboard = (text, userId) => {
//     if (!text) return;
    
//     navigator.clipboard.writeText(text).then(() => {
//       setCopiedPassword(userId);
//       setTimeout(() => setCopiedPassword(null), 2000);
//     });
//   };

//   const clearFilters = () => {
//     setSearchQuery('');
//     setRoleFilter('All');
//     setStatusFilter('All');
//   };

//   // Pagination
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

//   const getRoleBadgeVariant = (role) => {
//     switch (role) {
//       case 'Admin': return 'danger';
//       case 'HOD': return 'warning';
//       case 'Commissioner': return 'info';
//       default: return 'secondary';
//     }
//   };

//   const PasswordDisplay = ({ password, userId }) => (
//     <OverlayTrigger
//       placement="top"
//       overlay={<Tooltip>{copiedPassword === userId ? 'Copied!' : 'Click to copy'}</Tooltip>}
//     >
//       <div
//         className="password-display d-flex align-items-center gap-2 cursor-pointer"
//         onClick={() => copyToClipboard(password, userId)}
//         style={{ cursor: 'pointer' }}
//       >
//         <code className="text-muted bg-light p-1 rounded flex-grow-1 text-truncate">
//           {password ? `${password.substring(0, 10)}...` : 'Not set'}
//         </code>
//         <i className={`bi ${copiedPassword === userId ? 'bi-check text-success' : 'bi-clipboard'} flex-shrink-0`}></i>
//       </div>
//     </OverlayTrigger>
//   );

//   // Mobile User Card Component
//   const MobileUserCard = ({ user }) => (
//     <Card className="mb-3 user-card-mobile">
//       <Card.Body>
//         <div className="d-flex justify-content-between align-items-start mb-2">
//           <div className="flex-grow-1">
//             <h6 className="mb-1 fw-bold">{user.name}</h6>
//             <div className="d-flex flex-wrap gap-2 mb-2">
//               <Badge bg={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
//               <Badge bg={user.isActive ? 'success' : 'danger'}>
//                 {user.isActive ? 'Active' : 'Inactive'}
//               </Badge>
//             </div>
//           </div>
//         </div>
        
//         <div className="user-details-mobile">
//           <div className="mb-1">
//             <i className="bi bi-telephone me-2 text-muted"></i>
//             <small>{user.phone}</small>
//           </div>
//           <div className="mb-1 text-truncate">
//             <i className="bi bi-envelope me-2 text-muted"></i>
//             <small>{user.email}</small>
//           </div>
//           {user.department && (
//             <div className="mb-2">
//               <i className="bi bi-building me-2 text-muted"></i>
//               <small>{user.department}</small>
//             </div>
//           )}
//           <div className="mb-2">
//             <strong>Password: </strong>
//             <PasswordDisplay password={user.generatedPassword} userId={user._id} />
//           </div>
//         </div>

//         <div className="d-grid gap-2">
//           <Button
//             size="sm"
//             variant={user.isActive ? "outline-warning" : "outline-success"}
//             onClick={() => toggleUserStatus(user._id, user.isActive)}
//             disabled={actionLoading === user._id}
//           >
//             {actionLoading === user._id ? (
//               <Spinner animation="border" size="sm" className="me-2" />
//             ) : (
//               <i className={`bi bi-${user.isActive ? 'pause' : 'play'}-fill me-2`}></i>
//             )}
//             {user.isActive ? 'Deactivate' : 'Activate'}
//           </Button>
//         </div>
//       </Card.Body>
//     </Card>
//   );

//   return (
//     <Container fluid className="py-3 admin-dashboard">
//       {/* Header Section */}
//       <Row className="mb-4 align-items-center">
//         <Col xs={12} lg={6}>
//           <div className="d-flex align-items-center mb-3 mb-lg-0">
//             <div className="admin-badge bg-primary rounded-circle d-flex align-items-center justify-content-center me-3">
//               <i className="bi bi-shield-lock text-white fs-4"></i>
//             </div>
//             <div>
//               <h1 className="h4 h3-lg text-white mb-1">👑 Admin Dashboard</h1>
//               <p className="text-white-50 mb-0 d-none d-sm-block">Manage users and system access</p>
//             </div>
//           </div>
//         </Col>
//         <Col xs={12} lg={6}>
//           <div className="d-flex flex-column flex-sm-row gap-2 justify-content-lg-end">
//             <Button
//               className="admin-primary-btn fw-semibold"
//               onClick={() => setShowCreateModal(true)}
//               size="lg"
//             >
//               <i className="bi bi-person-plus me-2"></i>
//               <span className="d-none d-sm-inline">Create New User</span>
//               <span className="d-sm-none">Create User</span>
//             </Button>
//           </div>
//         </Col>
//       </Row>

//       {/* Alerts */}
//       {error && (
//         <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-3">
//           <i className="bi bi-exclamation-triangle me-2"></i>
//           {error}
//         </Alert>
//       )}
//       {message && (
//         <Alert variant="success" dismissible onClose={() => setMessage('')} className="mb-3">
//           <i className="bi bi-check-circle me-2"></i>
//           {message}
//         </Alert>
//       )}

//       {/* Statistics Cards - Mobile Optimized */}
//       {statistics && (
//         <Row className="mb-4 g-2">
//           <Col xs={6} lg={3} className="mb-2">
//             <Card className="stat-card h-100 border-0 shadow-sm">
//               <Card.Body className="p-3">
//                 <div className="d-flex align-items-center">
//                   <div className="stat-icon bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-3">
//                     <i className="bi bi-people fs-5"></i>
//                   </div>
//                   <div className="flex-grow-1">
//                     <h4 className="text-primary mb-0">{statistics.totalUsers}</h4>
//                     <small className="text-muted">Total Users</small>
//                   </div>
//                 </div>
//               </Card.Body>
//             </Card>
//           </Col>
//           <Col xs={6} lg={3} className="mb-2">
//             <Card className="stat-card h-100 border-0 shadow-sm">
//               <Card.Body className="p-3">
//                 <div className="d-flex align-items-center">
//                   <div className="stat-icon bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center me-3">
//                     <i className="bi bi-person-check fs-5"></i>
//                   </div>
//                   <div className="flex-grow-1">
//                     <h4 className="text-success mb-0">{statistics.activeUsers}</h4>
//                     <small className="text-muted">Active</small>
//                   </div>
//                 </div>
//               </Card.Body>
//             </Card>
//           </Col>
//           <Col xs={6} lg={3} className="mb-2">
//             <Card className="stat-card h-100 border-0 shadow-sm">
//               <Card.Body className="p-3">
//                 <div className="d-flex align-items-center">
//                   <div className="stat-icon bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center me-3">
//                     <i className="bi bi-person-plus fs-5"></i>
//                   </div>
//                   <div className="flex-grow-1">
//                     <h4 className="text-warning mb-0">{statistics.recentUsersLast7Days}</h4>
//                     <small className="text-muted">New This Week</small>
//                   </div>
//                 </div>
//               </Card.Body>
//             </Card>
//           </Col>
//           <Col xs={6} lg={3} className="mb-2">
//             <Card className="stat-card h-100 border-0 shadow-sm">
//               <Card.Body className="p-3">
//                 <div className="d-flex align-items-center">
//                   <div className="stat-icon bg-info bg-opacity-10 text-info rounded-circle d-flex align-items-center justify-content-center me-3">
//                     <i className="bi bi-shield-check fs-5"></i>
//                   </div>
//                   <div className="flex-grow-1">
//                     <h4 className="text-info mb-0">{statistics.verifiedUsers}</h4>
//                     <small className="text-muted">Verified</small>
//                   </div>
//                 </div>
//               </Card.Body>
//             </Card>
//           </Col>
//         </Row>
//       )}

//       {/* User Management Section */}
//       <Card className="main-card border-0 shadow">
//         <Card.Header className="bg-white border-0 py-3">
//           <Row className="align-items-center">
//             <Col md={6} className="mb-2 mb-md-0">
//               <h5 className="mb-1 text-dark">
//                 <i className="bi bi-people me-2 text-primary"></i>
//                 User Management
//               </h5>
//               <small className="text-muted">
//                 Showing {filteredUsers.length} of {users.length} users
//               </small>
//             </Col>
//             <Col md={6}>
//               <div className="d-flex flex-column flex-md-row gap-2">
//                 <InputGroup size="sm">
//                   <InputGroup.Text className="bg-light">
//                     <i className="bi bi-search"></i>
//                   </InputGroup.Text>
//                   <FormControl
//                     placeholder="Search users..."
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     className="bg-light"
//                   />
//                 </InputGroup>
//                 <div className="d-flex gap-1">
//                   <Form.Select
//                     value={roleFilter}
//                     onChange={(e) => setRoleFilter(e.target.value)}
//                     size="sm"
//                     className="w-auto flex-grow-1"
//                   >
//                     <option value="All">All Roles</option>
//                     <option value="User">User</option>
//                     <option value="HOD">HOD</option>
//                     <option value="Commissioner">Commissioner</option>
//                   </Form.Select>
//                   <Form.Select
//                     value={statusFilter}
//                     onChange={(e) => setStatusFilter(e.target.value)}
//                     size="sm"
//                     className="w-auto flex-grow-1"
//                   >
//                     <option value="All">All Status</option>
//                     <option value="Active">Active</option>
//                     <option value="Inactive">Inactive</option>
//                   </Form.Select>
//                   {(searchQuery || roleFilter !== 'All' || statusFilter !== 'All') && (
//                     <Button
//                       variant="outline-secondary"
//                       onClick={clearFilters}
//                       size="sm"
//                       title="Clear filters"
//                     >
//                       <i className="bi bi-arrow-clockwise"></i>
//                     </Button>
//                   )}
//                 </div>
//               </div>
//             </Col>
//           </Row>
//         </Card.Header>

//         <Card.Body className="p-0">
//           {loading ? (
//             <div className="text-center py-5">
//               <Spinner animation="border" variant="primary" />
//               <p className="mt-2 text-muted">Loading users...</p>
//             </div>
//           ) : (
//             <>
//               {/* Mobile View - Cards */}
//               <div className="d-block d-lg-none p-3">
//                 {currentUsers.length === 0 ? (
//                   <div className="text-center py-4">
//                     <i className="bi bi-people display-4 text-muted d-block mb-3"></i>
//                     <h5 className="text-muted">No users found</h5>
//                     <p className="text-muted">Try adjusting your search or filters</p>
//                     {(searchQuery || roleFilter !== 'All' || statusFilter !== 'All') && (
//                       <Button variant="outline-primary" onClick={clearFilters} size="sm">
//                         Clear filters
//                       </Button>
//                     )}
//                   </div>
//                 ) : (
//                   currentUsers.map(user => (
//                     <MobileUserCard key={user._id} user={user} />
//                   ))
//                 )}
//               </div>

//               {/* Desktop View - Table */}
//               <div className="d-none d-lg-block">
//                 <div className="table-responsive">
//                   <Table hover className="align-middle mb-0">
//                     <thead className="bg-light">
//                       <tr>
//                         <th className="border-0 ps-3">User Info</th>
//                         <th className="border-0">Contact</th>
//                         <th className="border-0">Role</th>
//                         <th className="border-0">Department</th>
//                         <th className="border-0">Status</th>
//                         <th className="border-0">Password</th>
//                         <th className="border-0 text-center pe-3">Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {currentUsers.length === 0 ? (
//                         <tr>
//                           <td colSpan="7" className="text-center py-5">
//                             <div className="text-muted">
//                               <i className="bi bi-people display-4 d-block mb-3"></i>
//                               <h5>No users found</h5>
//                               <p>Try adjusting your search or filters</p>
//                               {(searchQuery || roleFilter !== 'All' || statusFilter !== 'All') && (
//                                 <Button variant="outline-primary" onClick={clearFilters}>
//                                   Clear filters
//                                 </Button>
//                               )}
//                             </div>
//                           </td>
//                         </tr>
//                       ) : (
//                         currentUsers.map(user => (
//                           <tr key={user._id} className={!user.isActive ? 'bg-light' : ''}>
//                             <td className="ps-3">
//                               <div className="d-flex align-items-center">
//                                 <div className="user-avatar bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-3">
//                                   <i className="bi bi-person"></i>
//                                 </div>
//                                 <div>
//                                   <strong className="d-block">{user.name}</strong>
//                                   <small className="text-muted">
//                                     Joined {new Date(user.createdAt).toLocaleDateString()}
//                                   </small>
//                                 </div>
//                               </div>
//                             </td>
//                             <td>
//                               <div>
//                                 <div className="d-flex align-items-center mb-1">
//                                   <i className="bi bi-phone me-2 text-muted"></i>
//                                   <span>{user.phone}</span>
//                                 </div>
//                                 <div className="d-flex align-items-center">
//                                   <i className="bi bi-envelope me-2 text-muted"></i>
//                                   <small className="text-truncate" style={{maxWidth: '200px'}}>
//                                     {user.email}
//                                   </small>
//                                 </div>
//                               </div>
//                             </td>
//                             <td>
//                               <Badge bg={getRoleBadgeVariant(user.role)}>
//                                 {user.role}
//                               </Badge>
//                             </td>
//                             <td>
//                               {user.department ? (
//                                 <Badge bg="light" text="dark">
//                                   {user.department}
//                                 </Badge>
//                               ) : (
//                                 <span className="text-muted">-</span>
//                               )}
//                             </td>
//                             <td>
//                               <Badge bg={user.isActive ? 'success' : 'danger'}>
//                                 <i className={`bi bi-${user.isActive ? 'check' : 'x'}-circle me-1`}></i>
//                                 {user.isActive ? 'Active' : 'Inactive'}
//                               </Badge>
//                             </td>
//                             <td>
//                               <PasswordDisplay 
//                                 password={user.generatedPassword} 
//                                 userId={user._id}
//                               />
//                             </td>
//                             <td className="text-center pe-3">
//                               <div className="d-flex justify-content-center">
//                                 <OverlayTrigger
//                                   placement="top"
//                                   overlay={
//                                     <Tooltip>
//                                       {user.isActive ? 'Deactivate user' : 'Activate user'}
//                                     </Tooltip>
//                                   }
//                                 >
//                                   <Button
//                                     size="sm"
//                                     variant={user.isActive ? "outline-warning" : "outline-success"}
//                                     onClick={() => toggleUserStatus(user._id, user.isActive)}
//                                     disabled={actionLoading === user._id}
//                                   >
//                                     {actionLoading === user._id ? (
//                                       <Spinner animation="border" size="sm" />
//                                     ) : (
//                                       <>
//                                         <i className={`bi bi-${user.isActive ? 'pause' : 'play'}-fill me-1`}></i>
//                                         {user.isActive ? 'Deactivate' : 'Activate'}
//                                       </>
//                                     )}
//                                   </Button>
//                                 </OverlayTrigger>
//                               </div>
//                             </td>
//                           </tr>
//                         ))
//                       )}
//                     </tbody>
//                   </Table>
//                 </div>
//               </div>

//               {/* Pagination - Mobile Optimized */}
//               {totalPages > 1 && (
//                 <div className="d-flex flex-column flex-md-row justify-content-between align-items-center p-3 border-top gap-2">
//                   <div className="text-muted text-center text-md-start">
//                     <small>
//                       Page {currentPage} of {totalPages} • {filteredUsers.length} users
//                     </small>
//                   </div>
//                   <Pagination className="mb-0 flex-wrap justify-content-center">
//                     <Pagination.Prev
//                       disabled={currentPage === 1}
//                       onClick={() => setCurrentPage(currentPage - 1)}
//                     />
//                     {[...Array(Math.min(5, totalPages))].map((_, index) => {
//                       const pageNum = currentPage <= 3 
//                         ? index + 1 
//                         : currentPage >= totalPages - 2 
//                           ? totalPages - 4 + index 
//                           : currentPage - 2 + index;
                      
//                       if (pageNum > 0 && pageNum <= totalPages) {
//                         return (
//                           <Pagination.Item
//                             key={pageNum}
//                             active={pageNum === currentPage}
//                             onClick={() => setCurrentPage(pageNum)}
//                           >
//                             {pageNum}
//                           </Pagination.Item>
//                         );
//                       }
//                       return null;
//                     })}
//                     <Pagination.Next
//                       disabled={currentPage === totalPages}
//                       onClick={() => setCurrentPage(currentPage + 1)}
//                     />
//                   </Pagination>
//                 </div>
//               )}
//             </>
//           )}
//         </Card.Body>
//       </Card>

//       {/* Create User Modal */}
//       <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg" centered>
//         <Modal.Header closeButton className="bg-light">
//           <Modal.Title className="d-flex align-items-center">
//             <i className="bi bi-person-plus text-primary me-2"></i>
//             Create New User
//           </Modal.Title>
//         </Modal.Header>
//         <Form onSubmit={handleCreateUser}>
//           <Modal.Body>
//             <Row>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label className="fw-semibold">Full Name *</Form.Label>
//                   <Form.Control
//                     type="text"
//                     name="name"
//                     value={newUser.name}
//                     onChange={handleInputChange}
//                     required
//                     placeholder="Enter full name"
//                   />
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label className="fw-semibold">Phone Number *</Form.Label>
//                   <Form.Control
//                     type="tel"
//                     name="phone"
//                     value={newUser.phone}
//                     onChange={handleInputChange}
//                     required
//                     placeholder="Enter phone number"
//                   />
//                 </Form.Group>
//               </Col>
//             </Row>

//             <Form.Group className="mb-3">
//               <Form.Label className="fw-semibold">Email Address *</Form.Label>
//               <Form.Control
//                 type="email"
//                 name="email"
//                 value={newUser.email}
//                 onChange={handleInputChange}
//                 required
//                 placeholder="Enter email address"
//               />
//             </Form.Group>

//             <Row>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label className="fw-semibold">Role *</Form.Label>
//                   <Form.Select
//                     name="role"
//                     value={newUser.role}
//                     onChange={handleInputChange}
//                   >
//                     <option value="User">Regular User</option>
//                     <option value="HOD">Head of Department</option>
//                     <option value="Commissioner">Commissioner</option>
//                   </Form.Select>
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 {newUser.role === 'HOD' && (
//                   <Form.Group className="mb-3">
//                     <Form.Label className="fw-semibold">Department *</Form.Label>
//                     <Form.Control
//                       type="text"
//                       name="department"
//                       value={newUser.department}
//                       onChange={handleInputChange}
//                       placeholder="Enter department name"
//                       required={newUser.role === 'HOD'}
//                     />
//                   </Form.Group>
//                 )}
//               </Col>
//             </Row>

//             <Alert variant="info" className="mt-3">
//               <i className="bi bi-info-circle me-2"></i>
//               A secure UUID password will be automatically generated and shown after creation.
//             </Alert>
//           </Modal.Body>
//           <Modal.Footer>
//             <Button variant="outline-secondary" onClick={() => setShowCreateModal(false)}>
//               Cancel
//             </Button>
//             <Button 
//               type="submit" 
//               className="admin-primary-btn" 
//               disabled={loading}
//             >
//               {loading ? (
//                 <>
//                   <Spinner animation="border" size="sm" className="me-2" />
//                   Creating...
//                 </>
//               ) : (
//                 <>
//                   <i className="bi bi-person-plus me-2"></i>
//                   Create User
//                 </>
//               )}
//             </Button>
//           </Modal.Footer>
//         </Form>
//       </Modal>
//     </Container>
//   );
// };

// export default AdminDashboard;




// components/Dashboard/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Button, Table, Badge,
  Modal, Form, Alert, InputGroup, FormControl,
  Pagination, Spinner, Tooltip, OverlayTrigger
} from 'react-bootstrap';
import { adminUserService } from '../../services/adminUserService';
import './AdminDashboard.css'; // Import the CSS file

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [copiedPassword, setCopiedPassword] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const [newUser, setNewUser] = useState({
    name: '',
    phone: '',
    email: '',
    role: 'User',
    department: ''
  });

  useEffect(() => {
    loadUsers();
    loadStatistics();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, roleFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminUserService.getAllUsers();
      setUsers(response.users);
    } catch (err) {
      setError('Failed to load users');
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await adminUserService.getUserStatistics();
      setStatistics(response.statistics);
    } catch (err) {
      console.error('Failed to load statistics:', err);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       user.phone?.toString().includes(searchQuery)||
        user.department?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'All') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(user => 
        statusFilter === 'Active' ? user.isActive : !user.isActive
      );
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await adminUserService.createUser(newUser);
      setMessage(`User created successfully! Password: ${response.generatedPassword} - Make sure to copy this password as it won't be shown again.`);
      setShowCreateModal(false);
      setNewUser({ name: '', phone: '', email: '', role: 'User', department: '' });
      loadUsers();
      loadStatistics();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setNewUser({
      ...newUser,
      [e.target.name]: e.target.value
    });
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      setActionLoading(userId);
      // FIX: Use the corrected service call
      await adminUserService.toggleUserStatus(userId);
      setMessage(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      loadUsers(); // Reload to get updated data
    } catch (err) {
      console.error('Toggle status error:', err);
      setError(err.response?.data?.message || 'Failed to update user status');
    } finally {
      setActionLoading(null);
    }
  };

  const copyToClipboard = (text, userId) => {
    if (!text) return;
    
    navigator.clipboard.writeText(text).then(() => {
      setCopiedPassword(userId);
      setTimeout(() => setCopiedPassword(null), 2000);
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setRoleFilter('All');
    setStatusFilter('All');
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'Admin': return 'danger';
      case 'HOD': return 'warning';
      case 'Commissioner': return 'info';
      default: return 'secondary';
    }
  };

  const PasswordDisplay = ({ password, userId }) => (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip>{copiedPassword === userId ? 'Copied!' : 'Click to copy'}</Tooltip>}
    >
      <div
        className="password-display d-flex align-items-center gap-2 cursor-pointer"
        onClick={() => copyToClipboard(password, userId)}
        style={{ cursor: 'pointer' }}
      >
        <code className="text-muted bg-light p-1 rounded flex-grow-1 text-truncate">
          {password ? `${password.substring(0, 10)}...` : 'Not set'}
        </code>
        <i className={`bi ${copiedPassword === userId ? 'bi-check text-success' : 'bi-clipboard'} flex-shrink-0`}></i>
      </div>
    </OverlayTrigger>
  );

  // Mobile User Card Component
  const MobileUserCard = ({ user }) => (
    <Card className="mb-3 user-card-mobile">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="flex-grow-1">
            <h6 className="mb-1 fw-bold">{user.name}</h6>
            <div className="d-flex flex-wrap gap-2 mb-2">
              <Badge bg={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
              <Badge bg={user.isActive ? 'success' : 'danger'}>
                {user.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="user-details-mobile">
          <div className="mb-1">
            <i className="bi bi-telephone me-2 text-muted"></i>
            <small>{user.phone}</small>
          </div>
          <div className="mb-1 text-truncate">
            <i className="bi bi-envelope me-2 text-muted"></i>
            <small>{user.email}</small>
          </div>
          {user.department && (
            <div className="mb-2">
              <i className="bi bi-building me-2 text-muted"></i>
              <small>{user.department}</small>
            </div>
          )}
          <div className="mb-2">
            <strong>Password: </strong>
            <PasswordDisplay password={user.generatedPassword} userId={user._id} />
          </div>
        </div>

        <div className="d-grid gap-2">
          <Button
            size="sm"
            variant={user.isActive ? "outline-warning" : "outline-success"}
            onClick={() => toggleUserStatus(user._id, user.isActive)}
            disabled={actionLoading === user._id}
          >
            {actionLoading === user._id ? (
              <Spinner animation="border" size="sm" className="me-2" />
            ) : (
              <i className={`bi bi-${user.isActive ? 'pause' : 'play'}-fill me-2`}></i>
            )}
            {user.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <Container fluid className="py-3 admin-dashboard">
      {/* Header Section */}
      <Row className="mb-4 align-items-center">
        <Col xs={12} lg={6}>
          <div className="d-flex align-items-center mb-3 mb-lg-0">
            <div className="admin-badge bg-primary rounded-circle d-flex align-items-center justify-content-center me-3">
              <i className="bi bi-shield-lock text-white fs-4"></i>
            </div>
            <div>
              <h1 className="h4 h3-lg text-white mb-1">👑 Admin Dashboard</h1>
              <p className="text-white-50 mb-0 d-none d-sm-block">Manage users and system access</p>
            </div>
          </div>
        </Col>
        <Col xs={12} lg={6}>
          <div className="d-flex flex-column flex-sm-row gap-2 justify-content-lg-end">
            <Button
              className="admin-primary-btn fw-semibold"
              onClick={() => setShowCreateModal(true)}
              size="lg"
            >
              <i className="bi bi-person-plus me-2"></i>
              <span className="d-none d-sm-inline">Create New User</span>
              <span className="d-sm-none">Create User</span>
            </Button>
          </div>
        </Col>
      </Row>

      {/* Alerts */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-3">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}
      {message && (
        <Alert variant="success" dismissible onClose={() => setMessage('')} className="mb-3">
          <i className="bi bi-check-circle me-2"></i>
          {message}
        </Alert>
      )}

      {/* Statistics Cards - Mobile Optimized */}
      {statistics && (
        <Row className="mb-4 g-2">
          <Col xs={6} lg={3} className="mb-2">
            <Card className="stat-card h-100 border-0 shadow-sm">
              <Card.Body className="p-3">
                <div className="d-flex align-items-center">
                  <div className="stat-icon bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-3">
                    <i className="bi bi-people fs-5"></i>
                  </div>
                  <div className="flex-grow-1">
                    <h4 className="text-primary mb-0">{statistics.totalUsers}</h4>
                    <small className="text-muted">Total Users</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} lg={3} className="mb-2">
            <Card className="stat-card h-100 border-0 shadow-sm">
              <Card.Body className="p-3">
                <div className="d-flex align-items-center">
                  <div className="stat-icon bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center me-3">
                    <i className="bi bi-person-check fs-5"></i>
                  </div>
                  <div className="flex-grow-1">
                    <h4 className="text-success mb-0">{statistics.activeUsers}</h4>
                    <small className="text-muted">Active</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} lg={3} className="mb-2">
            <Card className="stat-card h-100 border-0 shadow-sm">
              <Card.Body className="p-3">
                <div className="d-flex align-items-center">
                  <div className="stat-icon bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center me-3">
                    <i className="bi bi-person-plus fs-5"></i>
                  </div>
                  <div className="flex-grow-1">
                    <h4 className="text-warning mb-0">{statistics.recentUsersLast7Days}</h4>
                    <small className="text-muted">New This Week</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} lg={3} className="mb-2">
            <Card className="stat-card h-100 border-0 shadow-sm">
              <Card.Body className="p-3">
                <div className="d-flex align-items-center">
                  <div className="stat-icon bg-info bg-opacity-10 text-info rounded-circle d-flex align-items-center justify-content-center me-3">
                    <i className="bi bi-shield-check fs-5"></i>
                  </div>
                  <div className="flex-grow-1">
                    <h4 className="text-info mb-0">{statistics.verifiedUsers}</h4>
                    <small className="text-muted">Verified</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* User Management Section */}
      <Card className="main-card border-0 shadow">
        <Card.Header className="bg-white border-0 py-3">
          <Row className="align-items-center">
            <Col md={6} className="mb-2 mb-md-0">
              <h5 className="mb-1 text-dark">
                <i className="bi bi-people me-2 text-primary"></i>
                User Management
              </h5>
              <small className="text-muted">
                Showing {filteredUsers.length} of {users.length} users
              </small>
            </Col>
            <Col md={6}>
              <div className="d-flex flex-column flex-md-row gap-2">
                <InputGroup size="sm">
                  <InputGroup.Text className="bg-light">
                    <i className="bi bi-search"></i>
                  </InputGroup.Text>
                  <FormControl
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-light"
                  />
                </InputGroup>
                <div className="d-flex gap-1">
                  <Form.Select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    size="sm"
                    className="w-auto flex-grow-1"
                  >
                    <option value="All">All Roles</option>
                    <option value="User">User</option>
                    <option value="HOD">HOD</option>
                    <option value="Commissioner">Commissioner</option>
                  </Form.Select>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    size="sm"
                    className="w-auto flex-grow-1"
                  >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </Form.Select>
                  {(searchQuery || roleFilter !== 'All' || statusFilter !== 'All') && (
                    <Button
                      variant="outline-secondary"
                      onClick={clearFilters}
                      size="sm"
                      title="Clear filters"
                    >
                      <i className="bi bi-arrow-clockwise"></i>
                    </Button>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Loading users...</p>
            </div>
          ) : (
            <>
              {/* Mobile View - Cards */}
              <div className="d-block d-lg-none p-3">
                {currentUsers.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="bi bi-people display-4 text-muted d-block mb-3"></i>
                    <h5 className="text-muted">No users found</h5>
                    <p className="text-muted">Try adjusting your search or filters</p>
                    {(searchQuery || roleFilter !== 'All' || statusFilter !== 'All') && (
                      <Button variant="outline-primary" onClick={clearFilters} size="sm">
                        Clear filters
                      </Button>
                    )}
                  </div>
                ) : (
                  currentUsers.map(user => (
                    <MobileUserCard key={user._id} user={user} />
                  ))
                )}
              </div>

              {/* Desktop View - Table */}
              <div className="d-none d-lg-block">
                <div className="table-responsive">
                  <Table hover className="align-middle mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="border-0 ps-3">User Info</th>
                        <th className="border-0">Contact</th>
                        <th className="border-0">Role</th>
                        <th className="border-0">Department</th>
                        <th className="border-0">Status</th>
                        <th className="border-0">Password</th>
                        <th className="border-0 text-center pe-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentUsers.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center py-5">
                            <div className="text-muted">
                              <i className="bi bi-people display-4 d-block mb-3"></i>
                              <h5>No users found</h5>
                              <p>Try adjusting your search or filters</p>
                              {(searchQuery || roleFilter !== 'All' || statusFilter !== 'All') && (
                                <Button variant="outline-primary" onClick={clearFilters}>
                                  Clear filters
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        currentUsers.map(user => (
                          <tr key={user._id} className={!user.isActive ? 'bg-light' : ''}>
                            <td className="ps-3">
                              <div className="d-flex align-items-center">
                                <div className="user-avatar bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-3">
                                  <i className="bi bi-person"></i>
                                </div>
                                <div>
                                  <strong className="d-block">{user.name}</strong>
                                  <small className="text-muted">
                                    Joined {new Date(user.createdAt).toLocaleDateString()}
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div>
                                <div className="d-flex align-items-center mb-1">
                                  <i className="bi bi-phone me-2 text-muted"></i>
                                  <span>{user.phone}</span>
                                </div>
                                <div className="d-flex align-items-center">
                                  <i className="bi bi-envelope me-2 text-muted"></i>
                                  <small className="text-truncate" style={{maxWidth: '200px'}}>
                                    {user.email}
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <Badge bg={getRoleBadgeVariant(user.role)}>
                                {user.role}
                              </Badge>
                            </td>
                            <td>
                              {user.department ? (
                                <Badge bg="light" text="dark">
                                  {user.department}
                                </Badge>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>
                              <Badge bg={user.isActive ? 'success' : 'danger'}>
                                <i className={`bi bi-${user.isActive ? 'check' : 'x'}-circle me-1`}></i>
                                {user.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </td>
                            <td>
                              <PasswordDisplay 
                                password={user.generatedPassword} 
                                userId={user._id}
                              />
                            </td>
                            <td className="text-center pe-3">
                              <div className="d-flex justify-content-center">
                                <OverlayTrigger
                                  placement="top"
                                  overlay={
                                    <Tooltip>
                                      {user.isActive ? 'Deactivate user' : 'Activate user'}
                                    </Tooltip>
                                  }
                                >
                                  <Button
                                    size="sm"
                                    variant={user.isActive ? "outline-warning" : "outline-success"}
                                    onClick={() => toggleUserStatus(user._id, user.isActive)}
                                    disabled={actionLoading === user._id}
                                  >
                                    {actionLoading === user._id ? (
                                      <Spinner animation="border" size="sm" />
                                    ) : (
                                      <>
                                        <i className={`bi bi-${user.isActive ? 'pause' : 'play'}-fill me-1`}></i>
                                        {user.isActive ? 'Deactivate' : 'Activate'}
                                      </>
                                    )}
                                  </Button>
                                </OverlayTrigger>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              </div>

              {/* Pagination - Mobile Optimized */}
              {totalPages > 1 && (
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center p-3 border-top gap-2">
                  <div className="text-muted text-center text-md-start">
                    <small>
                      Page {currentPage} of {totalPages} • {filteredUsers.length} users
                    </small>
                  </div>
                  <Pagination className="mb-0 flex-wrap justify-content-center">
                    <Pagination.Prev
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    />
                    {[...Array(Math.min(5, totalPages))].map((_, index) => {
                      const pageNum = currentPage <= 3 
                        ? index + 1 
                        : currentPage >= totalPages - 2 
                          ? totalPages - 4 + index 
                          : currentPage - 2 + index;
                      
                      if (pageNum > 0 && pageNum <= totalPages) {
                        return (
                          <Pagination.Item
                            key={pageNum}
                            active={pageNum === currentPage}
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Pagination.Item>
                        );
                      }
                      return null;
                    })}
                    <Pagination.Next
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Create User Modal */}


{/* 

      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="d-flex align-items-center">
            <i className="bi bi-person-plus text-primary me-2"></i>
            Create New User
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateUser}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Full Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={newUser.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter full name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Phone Number *</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={newUser.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter phone number"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Email Address *</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={newUser.email}
                onChange={handleInputChange}
                required
                placeholder="Enter email address"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Role *</Form.Label>
                  <Form.Select
                    name="role"
                    value={newUser.role}
                    onChange={handleInputChange}
                  >
                    <option value="User">Regular User</option>
                    <option value="HOD">Head of Department</option>
                    <option value="Commissioner">Commissioner</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Department *</Form.Label>
                  <Form.Control
                    type="text"
                    name="department"
                    value={newUser.department}
                    onChange={handleInputChange}
                    placeholder="Enter department name"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Alert variant="info" className="mt-3">
              <i className="bi bi-info-circle me-2"></i>
              A secure UUID password will be automatically generated and shown after creation.
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="admin-primary-btn" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Creating...
                </>
              ) : (
                <>
                  <i className="bi bi-person-plus me-2"></i>
                  Create User
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

 */}
{/* Create User Modal */}
<Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg" centered>
  <Modal.Header closeButton className="bg-light">
    <Modal.Title className="d-flex align-items-center">
      <i className="bi bi-person-plus text-primary me-2"></i>
      Create New User
    </Modal.Title>
  </Modal.Header>
  <Form onSubmit={handleCreateUser}>
    <Modal.Body>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Full Name *</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={newUser.name}
              onChange={handleInputChange}
              required
              placeholder="Enter full name"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Phone Number *</Form.Label>
            <Form.Control
              type="tel"
              name="phone"
              value={newUser.phone}
              onChange={handleInputChange}
              required
              placeholder="Enter phone number"
            />
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">Email Address *</Form.Label>
        <Form.Control
          type="email"
          name="email"
          value={newUser.email}
          onChange={handleInputChange}
          required
          placeholder="Enter email address"
        />
      </Form.Group>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Role *</Form.Label>
            <Form.Select
              name="role"
              value={newUser.role}
              onChange={handleInputChange}
            >
              <option value="User">Regular User</option>
              <option value="HOD">Head of Department</option>
              <option value="Commissioner">Commissioner</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          {/* Show department field only for User and HOD roles */}
          {(newUser.role === 'User' || newUser.role === 'HOD') && (
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Department *</Form.Label>
              <Form.Control
                type="text"
                name="department"
                value={newUser.department}
                onChange={handleInputChange}
                placeholder="Enter department name"
                required
              />
            </Form.Group>
          )}
        </Col>
      </Row>

      <Alert variant="info" className="mt-3">
        <i className="bi bi-info-circle me-2"></i>
        A secure UUID password will be automatically generated and shown after creation.
      </Alert>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="outline-secondary" onClick={() => setShowCreateModal(false)}>
        Cancel
      </Button>
      <Button 
        type="submit" 
        className="admin-primary-btn" 
        disabled={loading}
      >
        {loading ? (
          <>
            <Spinner animation="border" size="sm" className="me-2" />
            Creating...
          </>
        ) : (
          <>
            <i className="bi bi-person-plus me-2"></i>
            Create User
          </>
        )}
      </Button>
    </Modal.Footer>
  </Form>
</Modal>


    </Container>
  );
};

export default AdminDashboard;