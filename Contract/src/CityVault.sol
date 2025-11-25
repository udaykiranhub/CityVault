// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CityVault - Optimized for Polygon Deployment
 * @dev Gas-optimized file management with IPFS integration
 */
contract CityVault is ReentrancyGuard {
    // Role enumeration - packed for efficiency
    enum UserRole { None, User, HOD, Commissioner }
    enum FileStatus { Provided, UnderHODReview, SemBack, ApprovedByHOD, Resubmitted }

    // Optimized structs - minimize storage
    struct File {
        uint256 id;
        string ipfsHash;
        address owner; 
        FileStatus status;
        uint64 uploadTimestamp;
        uint64 lastUpdateTimestamp;
        string department;
        string hodRemark;
    }

    struct UserProfile {
        UserRole role;
        bool isActive;
        uint32 fileCount;
        string department;
    }

    // Simplified struct for view functions
    struct FileView {
        uint256 id;
        string ipfsHash;
        FileStatus status;
        string department;
        string hodRemark;
        address owner;
    }

    // State variables
    uint256 private fileCounter;
    mapping(uint256 => File) public files;
    mapping(address => UserProfile) public userProfiles;
    mapping(uint256 => string) public fileNames;
    mapping(address => uint256[]) public userFileIds;

    // Events - optimized
    event FileUploaded(uint256 indexed fileId, address indexed owner, string indexed fileHash, string department);
    event FileStatusUpdated(uint256 indexed fileId, FileStatus newStatus, address updatedBy, string remark);
    event UserRegistered(address indexed userAddress, UserRole role, string department);

    // Custom errors to save gas
    error NotFileOwner();
    error FileNotExists();
    error InsufficientRole();
    error UserNotActive();
    error UserNotRegistered();
    error InvalidRole();
    error AlreadyRegistered();
    error FileNameRequired();
    error IPFSHashRequired();
    error UserDepartmentRequired();
    error NotSameDepartment();
    error InvalidHODStatus();
    error NotSentBack();
    error NoAccess();

    // Modifiers
    modifier onlyFileOwner(uint256 _fileId) {
        if (files[_fileId].owner != msg.sender) revert NotFileOwner();
        _;
    }
    
    modifier fileExists(uint256 _fileId) {
        if (files[_fileId].id == 0) revert FileNotExists();
        _;
    }

    modifier onlyWithRole(UserRole _requiredRole) {
        UserProfile memory user = userProfiles[msg.sender];
        if (user.role != _requiredRole) revert InsufficientRole();
        if (!user.isActive) revert UserNotActive();
        _;
    }

    modifier onlyRegisteredUser() {
        UserProfile memory user = userProfiles[msg.sender];
        if (user.role == UserRole.None) revert UserNotRegistered();
        if (!user.isActive) revert UserNotActive();
        _;
    }

    modifier onlySameDepartment(uint256 _fileId) {
        File storage file = files[_fileId];
        UserProfile memory user = userProfiles[msg.sender];
        if (!_stringsEqual(file.department, user.department)) revert NotSameDepartment();
        _;
    }

    constructor() {
        fileCounter = 1000;
    }

    /**
     * @dev Gas-optimized user registration with department
     */
    function registerUser(UserRole _role, string calldata _department) external nonReentrant {
        if (_role == UserRole.None) revert InvalidRole();
        if (userProfiles[msg.sender].role != UserRole.None) revert AlreadyRegistered();

        string memory finalDepartment = _department;

        // Commissioner doesn't need department, Users and HODs require department
        if (_role == UserRole.Commissioner) {
            finalDepartment = "None";
        } else {
            // User and HOD must have a department
            if (bytes(_department).length == 0) revert UserDepartmentRequired();
        }

        userProfiles[msg.sender] = UserProfile({
            role: _role,
            isActive: true,
            fileCount: 0,
            department: finalDepartment
        });

        emit UserRegistered(msg.sender, _role, finalDepartment);
    }

    /**
     * @dev Only users with UserRole.User can upload files
     */
    function uploadFile(
        string calldata _fileName,
        string calldata _ipfsHash
    ) external nonReentrant onlyWithRole(UserRole.User) returns (uint256) {
        if (bytes(_fileName).length == 0) revert FileNameRequired();
        if (bytes(_ipfsHash).length == 0) revert IPFSHashRequired();

        UserProfile memory user = userProfiles[msg.sender];
        if (bytes(user.department).length == 0 || _stringsEqual(user.department, "None")) revert UserDepartmentRequired();
        
        fileCounter++;
        uint256 fileId = fileCounter;
        
        files[fileId] = File({
            id: fileId,
            ipfsHash: _ipfsHash,
            owner: msg.sender,
            status: FileStatus.Provided,
            uploadTimestamp: uint64(block.timestamp),
            lastUpdateTimestamp: uint64(block.timestamp),
            department: user.department,
            hodRemark: ""
        });

        fileNames[fileId] = _fileName;
        userFileIds[msg.sender].push(fileId);
        userProfiles[msg.sender].fileCount++;
        
        emit FileUploaded(fileId, msg.sender, _ipfsHash, user.department);
        emit FileStatusUpdated(fileId, FileStatus.Provided, msg.sender, "");
        
        return fileId;
    }

    /**
     * @dev Only HOD can review files from same department
     */
    function reviewFile(
        uint256 _fileId,
        FileStatus _newStatus,
        string calldata _remark
    ) external 
        fileExists(_fileId) 
        onlyWithRole(UserRole.HOD)
        onlySameDepartment(_fileId)
    {
        if (
            _newStatus != FileStatus.SemBack && 
            _newStatus != FileStatus.ApprovedByHOD &&
            _newStatus != FileStatus.UnderHODReview
        ) revert InvalidHODStatus();

        File storage file = files[_fileId];
        file.status = _newStatus;
        file.lastUpdateTimestamp = uint64(block.timestamp);
        
        if (bytes(_remark).length > 0) {
            file.hodRemark = _remark;
        }

        emit FileStatusUpdated(_fileId, _newStatus, msg.sender, _remark);
    }

    /**
     * @dev User can resubmit file after HOD sends back with remarks
     */
    function resubmitFile(
        uint256 _fileId,
        string calldata _newIpfsHash
    ) external fileExists(_fileId) onlyFileOwner(_fileId) onlyWithRole(UserRole.User) {
        File storage file = files[_fileId];
        
        if (file.status != FileStatus.SemBack) revert NotSentBack();
        if (bytes(_newIpfsHash).length == 0) revert IPFSHashRequired();

        file.ipfsHash = _newIpfsHash;
        file.status = FileStatus.Resubmitted;
        file.lastUpdateTimestamp = uint64(block.timestamp);

        emit FileStatusUpdated(_fileId, FileStatus.Resubmitted, msg.sender, "Resubmitted");
    }

    // Core view functions
    function getAllUserFiles(address _user) external view returns (FileView[] memory) {
        if (
            _user != msg.sender && 
            userProfiles[msg.sender].role != UserRole.HOD && 
            userProfiles[msg.sender].role != UserRole.Commissioner
        ) revert NoAccess();
        
        uint256[] memory fileIds = userFileIds[_user];
        FileView[] memory result = new FileView[](fileIds.length);
        
        for (uint256 i = 0; i < fileIds.length; i++) {
            uint256 fileId = fileIds[i];
            if (files[fileId].id != 0) {
                File storage file = files[fileId];
                result[i] = FileView({
                    id: fileId,
                    ipfsHash: file.ipfsHash,
                    status: file.status,
                    department: file.department,
                    hodRemark: file.hodRemark,
                    owner: file.owner
                });
            }
        }
        return result;
    }

    function getAllCommissionerSharedFiles() external view onlyWithRole(UserRole.Commissioner) returns (FileView[] memory) {
        uint256 count = 0;
        
        for (uint256 i = 1001; i <= fileCounter; i++) {
            if (files[i].id != 0) {
                count++;
            }
        }
        
        FileView[] memory result = new FileView[](count);
        uint256 index = 0;
        
        for (uint256 i = 1001; i <= fileCounter; i++) {
            if (files[i].id != 0) {
                File storage file = files[i];
                result[index] = FileView({
                    id: i,
                    ipfsHash: file.ipfsHash,
                    status: file.status,
                    department: file.department,
                    hodRemark: file.hodRemark,
                    owner: file.owner
                });
                index++;
            }
        }
        
        return result;
    }

    // Dashboard stats
    function getUserDashboardStats(address _user) external view returns (uint256[5] memory stats) {
        if (
            _user != msg.sender && 
            userProfiles[msg.sender].role != UserRole.HOD && 
            userProfiles[msg.sender].role != UserRole.Commissioner
        ) revert NoAccess();
        
        uint256[] memory userFiles = userFileIds[_user];
        for (uint256 i = 0; i < userFiles.length; i++) {
            uint256 fileId = userFiles[i];
            if (files[fileId].id != 0) {
                stats[0]++; // totalFiles
                FileStatus status = files[fileId].status;
                
                if (status == FileStatus.UnderHODReview) stats[1]++; // pendingReview
                else if (status == FileStatus.SemBack) stats[2]++; // sentBack
                else if (status == FileStatus.ApprovedByHOD) stats[3]++; // approvedByHOD
                else if (status == FileStatus.Resubmitted) stats[4]++; // resubmitted
            }
        }
    }

    function getHODDashboardStats() external view onlyWithRole(UserRole.HOD) returns (uint256[5] memory stats) {
        UserProfile memory hod = userProfiles[msg.sender];
        
        for (uint256 i = 1001; i <= fileCounter; i++) {
            if (files[i].id != 0 && _stringsEqual(files[i].department, hod.department)) {
                stats[0]++; // totalFiles
                FileStatus status = files[i].status;
                
                if (status == FileStatus.UnderHODReview) stats[1]++; // pendingReview
                else if (status == FileStatus.SemBack) stats[2]++; // sentBack
                else if (status == FileStatus.ApprovedByHOD) stats[3]++; // approved
                else if (status == FileStatus.Resubmitted) stats[4]++; // resubmitted
            }
        }
    }

    // Internal helper function
    function _stringsEqual(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }

    // Essential utility functions only
    function getFileCount() external view returns (uint256) {
        return fileCounter - 1000;
    }

    function getUserRole(address _user) external view returns (UserRole) {
        return userProfiles[_user].role;
    }

    function isUserActive(address _user) external view returns (bool) {
        return userProfiles[_user].isActive;
    }

    function getUserDepartment(address _user) external view returns (string memory) {
        return userProfiles[_user].department;
    }
}























