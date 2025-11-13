// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";


/**
 * @title CityVault - Optimized for Polygon Deployment
 * @dev Gas-optimized file management with IPFS integration
 */
contract CityVault is ReentrancyGuard {
    // Role enumeration - packed for efficiency
    enum UserRole { None, User, HOD, Commissioner }
    enum FileStatus { Provided, UnderHODReview, SemBack, ApprovedByHOD, Forwarded, CommissionerApproved }

    // Optimized structs - minimize storage
    struct File {
        uint256 id;
        string ipfsHash;
        address owner;
        FileStatus status;
        uint64 uploadTimestamp;
        uint64 lastUpdateTimestamp;
        bool isSharedWithCommissioner;
    }

    struct UserProfile {
        UserRole role;
        bool isActive;
        uint32 fileCount;
    }

    // New struct for returning file data with hash
    struct FileWithHash {
        uint256 id;
        string ipfsHash;
    }

    // State variables
    uint256 private fileCounter;
    mapping(uint256 => File) public files;
    mapping(address => UserProfile) public userProfiles;
    mapping(uint256 => string) public fileNames;
    mapping(uint256 => string) public hodRemarks;
    mapping(address => uint256[]) public userFileIds;
    uint256[] public commissionerFileIds;

    // Events
    event FileUploaded(
        uint256 indexed fileId,
        address indexed owner,
        string indexed fileHash
    );
    
    event FileStatusUpdated(
        uint256 indexed fileId,
        FileStatus newStatus,
        address updatedBy
    );

    event UserRegistered(
        address indexed userAddress,
        UserRole role
    );

    // Modifiers
    modifier onlyFileOwner(uint256 _fileId) {
        require(files[_fileId].owner == msg.sender, "Not file owner");
        _;
    }
    
    modifier fileExists(uint256 _fileId) {
        require(files[_fileId].id != 0, "File does not exist");
        _;
    }

    modifier onlyWithRole(UserRole _requiredRole) {
        UserProfile memory user = userProfiles[msg.sender];
        require(user.role == _requiredRole, "Insufficient role privileges");
        require(user.isActive, "User account is not active");
        _;
    }

    modifier onlyRegisteredUser() {
        UserProfile memory user = userProfiles[msg.sender];
        require(user.role != UserRole.None, "User not registered");
        require(user.isActive, "User account is not active");
        _;
    }

    constructor() {
        fileCounter = 1000;
    }

    /**
     * @dev Gas-optimized user registration
     */
    function registerUser(UserRole _role) external nonReentrant {
        require(_role != UserRole.None, "Invalid role");
        require(userProfiles[msg.sender].role == UserRole.None, "Already registered");

        userProfiles[msg.sender] = UserProfile({
            role: _role,
            isActive: true,
            fileCount: 0
        });

        emit UserRegistered(msg.sender, _role);
    }

    /**
     * @dev Only users with UserRole.User can upload files
     */
    function uploadFile(
        string calldata _fileName,
        string calldata _ipfsHash
    ) external nonReentrant onlyWithRole(UserRole.User) returns (uint256) {
        require(bytes(_fileName).length > 0, "File name required");
        require(bytes(_ipfsHash).length > 0, "IPFS hash required");

        fileCounter++;
        uint256 fileId = fileCounter;
        
        files[fileId] = File({
            id: fileId,
            ipfsHash: _ipfsHash,
            owner: msg.sender,
            status: FileStatus.Provided,
            uploadTimestamp: uint64(block.timestamp),
            lastUpdateTimestamp: uint64(block.timestamp),
            isSharedWithCommissioner: false
        });

        fileNames[fileId] = _fileName;
        userFileIds[msg.sender].push(fileId);
        userProfiles[msg.sender].fileCount++;
        
        emit FileUploaded(fileId, msg.sender, _ipfsHash);
        emit FileStatusUpdated(fileId, FileStatus.Provided, msg.sender);
        
        return fileId;
    }

    /**
     * @dev Only HOD can review files
     */
    function reviewFile(
        uint256 _fileId,
        FileStatus _newStatus,
        string calldata _remark
    ) external fileExists(_fileId) onlyWithRole(UserRole.HOD) {
        File storage file = files[_fileId];
        
        require(
            _newStatus == FileStatus.SemBack || 
            _newStatus == FileStatus.ApprovedByHOD ||
            _newStatus == FileStatus.UnderHODReview,
            "Invalid HOD status"
        );

        file.status = _newStatus;
        file.lastUpdateTimestamp = uint64(block.timestamp);
        
        if (bytes(_remark).length > 0) {
            hodRemarks[_fileId] = _remark;
        }

        emit FileStatusUpdated(_fileId, _newStatus, msg.sender);
    }

    /**
     * @dev Only HOD can forward to commissioner
     */
    function forwardToCommissioner(uint256 _fileId) 
        external 
        fileExists(_fileId) 
        onlyWithRole(UserRole.HOD) 
    {
        File storage file = files[_fileId];
        
        require(file.status == FileStatus.ApprovedByHOD, "Not approved by HOD");
        require(!file.isSharedWithCommissioner, "Already shared");

        file.isSharedWithCommissioner = true;
        file.status = FileStatus.Forwarded;
        file.lastUpdateTimestamp = uint64(block.timestamp);

        commissionerFileIds.push(_fileId);

        emit FileStatusUpdated(_fileId, FileStatus.Forwarded, msg.sender);
    }

    /**
     * @dev Only Commissioner can approve files
     */
    function commissionerApprove(uint256 _fileId) 
        external 
        fileExists(_fileId) 
        onlyWithRole(UserRole.Commissioner) 
    {
        File storage file = files[_fileId];
        
        require(file.isSharedWithCommissioner, "Not shared with commissioner");
        require(file.status == FileStatus.Forwarded, "Not in forwarded status");

        file.status = FileStatus.CommissionerApproved;
        file.lastUpdateTimestamp = uint64(block.timestamp);

        emit FileStatusUpdated(_fileId, FileStatus.CommissionerApproved, msg.sender);
    }

    /**
     * @dev Get all files uploaded by a specific user with hashes
     */
    function getAllUserFiles(address _user) external view returns (FileWithHash[] memory) {
        require(
            _user == msg.sender || 
            userProfiles[msg.sender].role == UserRole.HOD || 
            userProfiles[msg.sender].role == UserRole.Commissioner,
            "No access to view user files"
        );
        
        uint256[] memory fileIds = userFileIds[_user];
        FileWithHash[] memory result = new FileWithHash[](fileIds.length);
        
        for (uint256 i = 0; i < fileIds.length; i++) {
            uint256 fileId = fileIds[i];
            if (files[fileId].id != 0) {
                result[i] = FileWithHash({
                    id: fileId,
                    ipfsHash: files[fileId].ipfsHash
                });
            }
        }
        return result;
    }

    /**
     * @dev Get all files approved by HOD with hashes
     */
    function getHODApprovedFiles() external view returns (FileWithHash[] memory) {
        return _getFilesWithHashByStatus(FileStatus.ApprovedByHOD);
    }

    /**
     * @dev Get all files approved by Commissioner with hashes
     */
    function getCommissionerApprovedFiles() external view returns (FileWithHash[] memory) {
        return _getFilesWithHashByStatus(FileStatus.CommissionerApproved);
    }

    /**
     * @dev Get all files pending HOD review with hashes
     */
    function getPendingHODReviewFiles() external view returns (FileWithHash[] memory) {
        return _getFilesWithHashByStatus(FileStatus.UnderHODReview);
    }

    /**
     * @dev Get all files sent back by HOD with hashes
     */
    function getSentBackFiles() external view returns (FileWithHash[] memory) {
        return _getFilesWithHashByStatus(FileStatus.SemBack);
    }

    /**
     * @dev Get all files forwarded to commissioner with hashes
     */
    function getForwardedFiles() external view returns (FileWithHash[] memory) {
        return _getFilesWithHashByStatus(FileStatus.Forwarded);
    }

    /**
     * @dev Get all files shared with commissioner with hashes
     */
    function getAllCommissionerSharedFiles() external view onlyWithRole(UserRole.Commissioner) returns (FileWithHash[] memory) {
        uint256 count = 0;
        
        for (uint256 i = 1001; i <= fileCounter; i++) {
            if (files[i].id != 0 && files[i].isSharedWithCommissioner) {
                count++;
            }
        }
        
        FileWithHash[] memory result = new FileWithHash[](count);
        uint256 index = 0;
        
        for (uint256 i = 1001; i <= fileCounter; i++) {
            if (files[i].id != 0 && files[i].isSharedWithCommissioner) {
                result[index] = FileWithHash({
                    id: i,
                    ipfsHash: files[i].ipfsHash
                });
                index++;
            }
        }
        
        return result;
    }

    /**
     * @dev Get user dashboard statistics
     */
    function getUserDashboardStats(address _user) external view returns (
        uint256 totalFiles,
        uint256 pendingReview,
        uint256 sentBack,
        uint256 approvedByHOD,
        uint256 forwarded,
        uint256 approvedByCommissioner
    ) {
        require(
            _user == msg.sender || 
            userProfiles[msg.sender].role == UserRole.HOD || 
            userProfiles[msg.sender].role == UserRole.Commissioner,
            "No access to view user stats"
        );
        
        uint256[] memory userFiles = userFileIds[_user];
        
        for (uint256 i = 0; i < userFiles.length; i++) {
            uint256 fileId = userFiles[i];
            if (files[fileId].id != 0) {
                totalFiles++;
                FileStatus status = files[fileId].status;
                
                if (status == FileStatus.UnderHODReview) pendingReview++;
                else if (status == FileStatus.SemBack) sentBack++;
                else if (status == FileStatus.ApprovedByHOD) approvedByHOD++;
                else if (status == FileStatus.Forwarded) forwarded++;
                else if (status == FileStatus.CommissionerApproved) approvedByCommissioner++;
            }
        }
    }

    /**
     * @dev Get HOD dashboard statistics
     */
    function getHODDashboardStats() external view onlyWithRole(UserRole.HOD) returns (
        uint256 totalFiles,
        uint256 pendingReview,
        uint256 sentBack,
        uint256 approved,
        uint256 forwarded
    ) {
        for (uint256 i = 1001; i <= fileCounter; i++) {
            if (files[i].id != 0 && files[i].status >= FileStatus.UnderHODReview) {
                totalFiles++;
                FileStatus status = files[i].status;
                
                if (status == FileStatus.UnderHODReview) pendingReview++;
                else if (status == FileStatus.SemBack) sentBack++;
                else if (status == FileStatus.ApprovedByHOD) approved++;
                else if (status == FileStatus.Forwarded) forwarded++;
            }
        }
    }

    /**
     * @dev Get Commissioner dashboard statistics
     */
    function getCommissionerDashboardStats() external view onlyWithRole(UserRole.Commissioner) returns (
        uint256 totalFiles,
        uint256 forwarded,
        uint256 approved
    ) {
        for (uint256 i = 1001; i <= fileCounter; i++) {
            if (files[i].id != 0 && files[i].isSharedWithCommissioner) {
                totalFiles++;
                FileStatus status = files[i].status;
                
                if (status == FileStatus.Forwarded) forwarded++;
                else if (status == FileStatus.CommissionerApproved) approved++;
            }
        }
    }

    /**
     * @dev Get HOD dashboard files with hashes
     */
    function getHODDashboardFiles() external view onlyWithRole(UserRole.HOD) returns (FileWithHash[] memory) {
        uint256 count = 0;
        
        for (uint256 i = 1001; i <= fileCounter; i++) {
            if (files[i].id != 0 && files[i].status >= FileStatus.UnderHODReview) {
                count++;
            }
        }
        
        FileWithHash[] memory result = new FileWithHash[](count);
        uint256 index = 0;
        
        for (uint256 i = 1001; i <= fileCounter; i++) {
            if (files[i].id != 0 && files[i].status >= FileStatus.UnderHODReview) {
                result[index] = FileWithHash({
                    id: i,
                    ipfsHash: files[i].ipfsHash
                });
                index++;
            }
        }
        
        return result;
    }

    /**
     * @dev Get Commissioner dashboard files with hashes
     */
    function getCommissionerDashboardFiles() external view onlyWithRole(UserRole.Commissioner) returns (FileWithHash[] memory) {
        uint256 count = 0;
        
        for (uint256 i = 1001; i <= fileCounter; i++) {
            if (files[i].id != 0 && files[i].isSharedWithCommissioner) {
                count++;
            }
        }
        
        FileWithHash[] memory result = new FileWithHash[](count);
        uint256 index = 0;
        
        for (uint256 i = 1001; i <= fileCounter; i++) {
            if (files[i].id != 0 && files[i].isSharedWithCommissioner) {
                result[index] = FileWithHash({
                    id: i,
                    ipfsHash: files[i].ipfsHash
                });
                index++;
            }
        }
        
        return result;
    }

    /**
     * @dev Internal function to get files with hashes by status
     */
    function _getFilesWithHashByStatus(FileStatus _status) internal view returns (FileWithHash[] memory) {
        uint256 count = 0;
        
        for (uint256 i = 1001; i <= fileCounter; i++) {
            if (files[i].id != 0 && files[i].status == _status && hasAccessToFile(i, msg.sender)) {
                count++;
            }
        }
        
        FileWithHash[] memory result = new FileWithHash[](count);
        uint256 index = 0;
        
        for (uint256 i = 1001; i <= fileCounter; i++) {
            if (files[i].id != 0 && files[i].status == _status && hasAccessToFile(i, msg.sender)) {
                result[index] = FileWithHash({
                    id: i,
                    ipfsHash: files[i].ipfsHash
                });
                index++;
            }
        }
        
        return result;
    }

    // Internal functions
    function hasAccessToFile(uint256 _fileId, address _user) internal view returns (bool) {
        UserProfile memory user = userProfiles[_user];
        File storage file = files[_fileId];
        
        return file.owner == _user ||
               (user.role == UserRole.HOD && file.status >= FileStatus.UnderHODReview) ||
               (user.role == UserRole.Commissioner && file.isSharedWithCommissioner);
    }

    // Utility functions
    function getFileCount() external view returns (uint256) {
        return fileCounter - 1000;
    }

    function getUserRole(address _user) external view returns (UserRole) {
        return userProfiles[_user].role;
    }

    function isUserActive(address _user) external view returns (bool) {
        return userProfiles[_user].isActive;
    }
}