// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import thư viện Ownable để quản lý quyền
import "@openzeppelin/contracts/access/Ownable.sol";

contract CertificateContract is Ownable {

    event CertificateWrite(address indexed issuedBy, address indexed issuedTo, bytes32 indexed id);
    event CertificateRevoke(address indexed revokedBy, bytes32 indexed id);

    struct Certificate {
        bytes32 id;         // Dùng bytes32 cho ID (ví dụ: hash của thông tin)
        uint256 createdAt;  // Dùng uint256 cho timestamp
        uint256 expireAt;   // 0 nghĩa là không bao giờ hết hạn
        address issuedBy;
        address issuedTo;
        bytes32 dataHash;   // Dùng bytes32 cho hash dữ liệu
    }

    mapping(bytes32 => Certificate) public certificates;
    mapping(bytes32 => bool) public isRevoked;

    // Danh sách các tổ chức/người được phép cấp
    mapping(address => bool) public isIssuer;

    // Chỉ Owner (admin) mới được thêm/xóa người cấp
    function setIssuer(address _issuer, bool _allowed) public onlyOwner {
        isIssuer[_issuer] = _allowed;
    }

    function create(
        bytes32 id,
        bytes32 dataHash,
        address issuedTo,
        uint256 expireAt
    ) public {
        // 1. Kiểm tra Access Control: Chỉ người được phép mới được tạo
        require(isIssuer[msg.sender], "Not authorized to issue certificates");
        
        // 2. Kiểm tra ID đã tồn tại chưa (dùng createdAt)
        require(certificates[id].createdAt == 0, "Certificate ID already exists");

        uint256 createdAt = block.timestamp;
        
        // 3. Kiểm tra logic thời gian
        if (expireAt != 0) {
            require(expireAt > createdAt, "Expiry date must be in the future");
        }

        Certificate memory c = Certificate(id, createdAt, expireAt, msg.sender, issuedTo, dataHash);
        certificates[id] = c;
        
        emit CertificateWrite(msg.sender, issuedTo, id);
    }

    // Hàm thu hồi chứng chỉ
    function revoke(bytes32 id) public {
        // Chỉ người đã cấp hoặc Owner mới được thu hồi
        require(msg.sender == certificates[id].issuedBy || msg.sender == owner(), "Not authorized to revoke");
        require(certificates[id].createdAt != 0, "Certificate does not exist");
        require(!isRevoked[id], "Certificate already revoked");

        isRevoked[id] = true;
        emit CertificateRevoke(msg.sender, id);
    }

    // Hàm verify đã hoàn chỉnh
    function verify(bytes32 id, bytes32 dataHash) public view returns (bool) {
        Certificate memory c = certificates[id];

        // 1. Kiểm tra tồn tại
        if (c.createdAt == 0) return false;

        // 2. Kiểm tra thu hồi
        if (isRevoked[id]) return false;

        // 3. Kiểm tra hết hạn (nếu có)
        if (c.expireAt != 0 && block.timestamp >= c.expireAt) return false;

        // 4. Kiểm tra hash (so sánh bytes32 trực tiếp)
        return c.dataHash == dataHash;
    }
}