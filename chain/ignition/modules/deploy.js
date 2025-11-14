const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

// Chúng ta sẽ định nghĩa một Module
// "CertificateModule" là một ID nội bộ cho Ignition
module.exports = buildModule("CertificateModule", (m) => {
  
  // Lấy tài khoản 0 (mặc định là deployer)
  const deployer = m.getAccount(0);

  // 1. Deploy contract
  // m.contract() sẽ deploy "CertificateContract"
  // [] là mảng các tham số cho constructor (nếu có).
  // Contract của bạn không cần tham số constructor (nếu bạn đã sửa theo Cách 1 hoặc 2), nên để rỗng.
  const certificateContract = m.contract("CertificateContract", []);

  // 2. Tự động gọi hàm setIssuer SAU KHI deploy
  // Đây là phần rất hay của Ignition.
  // Chúng ta gọi hàm `setIssuer` trên contract vừa deploy,
  // với tham số là (địa chỉ deployer, true)
  // và chỉ định `from: deployer` để đảm bảo `msg.sender` là owner.
  m.call(certificateContract, "setIssuer", [deployer, true], {
    from: deployer,
  });

  // Trả về contract đã deploy để Hardhat có thể lưu lại địa chỉ
  return { certificateContract };
});