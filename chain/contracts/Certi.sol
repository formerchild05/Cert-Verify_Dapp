// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract CertificateContract is Ownable {

    event CertificateWrite(address indexed issuedBy, address indexed issuedTo, bytes32 indexed id);
    event CertificateRevoke(address indexed revokedBy, bytes32 indexed id);

    struct Certificate {
        bytes32 id;
        uint256 createdAt;
        uint256 expireAt;
        address issuedBy;
        address issuedTo;
        bytes32 dataHash;
    }

    mapping(bytes32 => Certificate) public certificates;
    mapping(bytes32 => bool) public isRevoked;

    // Danh sách tổ chức được issue
    mapping(address => bool) public isIssuer;

    // Danh sách user mà mỗi ORG quản lý
    mapping(address => mapping(address => bool)) public orgUsers;

    // Danh sách cert theo user
    mapping(address => bytes32[]) public userCertificates;

    // Admin thêm org issuer
    function setIssuer(address _issuer, bool _allowed) external onlyOwner {
        isIssuer[_issuer] = _allowed;
    }

    // ORG thêm user thuộc quyền quản lý của mình
    function addUser(address user) external {
        require(isIssuer[msg.sender], "Only issuer can add user");
        orgUsers[msg.sender][user] = true;
    }

    // ORG issue certificate
    function create(bytes32 id, bytes32 dataHash, address issuedTo, uint256 expireAt) external {
        require(isIssuer[msg.sender], "Not authorized to issue");
        
        // Chỉ issue cho user thuộc ORG đó
        require(orgUsers[msg.sender][issuedTo], "User does not belong to this Org");

        require(certificates[id].createdAt == 0, "Certificate ID exists");

        uint256 createdAt = block.timestamp;

        if (expireAt != 0) {
            require(expireAt > createdAt, "Expiry must be future");
        }

        Certificate memory c = Certificate(
            id,
            createdAt,
            expireAt,
            msg.sender,
            issuedTo,
            dataHash
        );

        certificates[id] = c;

        // Lưu chứng chỉ cho user
        userCertificates[issuedTo].push(id);

        emit CertificateWrite(msg.sender, issuedTo, id);
    }

    // Thu hồi cert
    function revoke(bytes32 id) external {
        Certificate memory c = certificates[id];

        require(c.createdAt != 0, "Certificate does not exist");
        require(!isRevoked[id], "Already revoked");

        // Chỉ người cấp hoặc admin
        require(
            msg.sender == c.issuedBy || msg.sender == owner(),
            "Not authorized"
        );

        isRevoked[id] = true;

        emit CertificateRevoke(msg.sender, id);
    }

    // Verify ( cert ID and CID hash )
    function verify(bytes32 id, bytes32 dataHash) external view returns (bool) {
        Certificate memory c = certificates[id];

        if (c.createdAt == 0) return false;
        if (isRevoked[id]) return false;
        if (c.expireAt != 0 && block.timestamp >= c.expireAt) return false;

        return c.dataHash == dataHash;
    }

    // Lấy tất cả certId của user
    function getCertificatesByUser(address user)
        external
        view
        returns (bytes32[] memory)
    {
        return userCertificates[user];
    }
}
