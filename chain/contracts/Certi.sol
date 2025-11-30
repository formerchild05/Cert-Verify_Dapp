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
    address[] public issuers;

    // TODO : GET USERS MANAGED BY ORG, REVOKE USER, revoke cert,

    // Danh sách user mà mỗi ORG quản lý
    mapping(address => mapping(address => bool)) public orgUsers; // kiem tra co thuoc org nao do hay k
    mapping(address => address[]) public orgUserList; // optional: lưu danh sách user của mỗi org

    mapping(address => mapping(address => Certificate[])) public orgUserCertificates; // optional: lưu cert của user theo org (future)

    // Danh sách cert theo user
    mapping(address => Certificate[]) public userCertificates;

    // Admin set issuer status ( set status of org include add/remove )
    function setIssuer(address _issuer, bool _allowed) external onlyOwner {
        isIssuer[_issuer] = _allowed;
        if (_allowed) {
            issuers.push(_issuer);
        } else {
            // Xoá khỏi danh sách issuers
            for (uint i = 0; i < issuers.length; i++) {
                if (issuers[i] == _issuer) {
                    issuers[i] = issuers[issuers.length - 1];
                    issuers.pop();
                    break;
                }
            }
        }
    }

    // ORG thêm user thuộc quyền quản lý của mình ( add/revoke user )
    function addUser(address user) external {
        require(isIssuer[msg.sender], "Only issuer can add user");
        if (!orgUsers[msg.sender][user]) {
            orgUsers[msg.sender][user] = true;
            orgUserList[msg.sender].push(user);
        }
    }
    function revokeUser(address user) external {
        require(isIssuer[msg.sender], "Only issuer can remove user");
        orgUsers[msg.sender][user] = false;

        address[] storage list = orgUserList[msg.sender];
        for (uint i = 0; i < list.length; i++) {
            if (list[i] == user) {
                list[i] = list[list.length - 1]; // Move last element to deleted spot, then pop the last element
                list.pop();
                break;
            }
        }
    }



    // ORG issue certificate
    function create(bytes32 id, bytes32 dataHash, address issuedTo, uint256 expireAt) external {
        require(isIssuer[msg.sender], "Not authorized to issue");
        // Chỉ issue cho user thuộc ORG đó
        require(orgUsers[msg.sender][issuedTo], "User does not belong to this Org");
        require(certificates[id].createdAt == 0, "Certificate ID exists"); // = 0 mean not exist
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
        userCertificates[issuedTo].push(c);

        emit CertificateWrite(msg.sender, issuedTo, id);
    }

    // Thu hồi cert
    function revokeCertificate(bytes32 id) external {
        Certificate memory c = certificates[id];

        // Chỉ người cấp hoặc admin
        require(
            msg.sender == c.issuedBy || msg.sender == owner(),
            "Not authorized to revoke"
        );

        require(c.createdAt != 0, "Certificate does not exist");
        require(!isRevoked[id], "Already revoked");

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
    function getCertificatesByUser(address user) external view returns (Certificate[] memory) {
        return userCertificates[user];
    }

    /**
    check the one calling this is an admin
     */
    function isAdmin() external view returns (bool) {
        return msg.sender == owner();
    }

    /**
    check the one calling is an issuer
     */
    function isOrgIssuer() external view returns (bool) {
        return isIssuer[msg.sender];
    }

    function getAllIssuers() external view returns (address[] memory) {
        require(msg.sender == owner(), "no permission");
        return issuers;
    }

    function getOrgUsers() external view returns (address[] memory) {
        require(isIssuer[msg.sender], "no permission");
        return orgUserList[msg.sender];
    }
}
