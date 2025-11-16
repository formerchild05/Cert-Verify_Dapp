import { useState } from "react";
import { ethers } from "ethers";
import abi from "../abi/CertificateContract.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // đổi thành contract của bạn

export default function FCerti() {
  const [certs, setCerts] = useState([]);

  async function fetchUserCertificates(userAddress) {
    // 🟢 ethers v5: dùng Web3Provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi.abi, signer);

    // 1) Lấy danh sách ID của user
    const ids = await contract.getCertificatesByUser(userAddress);

    // 2) Fetch từng certificate detail
    const certificates = await Promise.all(
      ids.map(async (id) => {
        const cert = await contract.certificates(id);
        return {
          id: id,
          issuedBy: cert.issuedBy,
          issuedTo: cert.issuedTo,
          createdAt: Number(cert.createdAt),
          expireAt: Number(cert.expireAt),
          dataHash: cert.dataHash,
        };
      })
    );

    return certificates;
  }

  const load = async () => {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const user = await signer.getAddress();

      const list = await fetchUserCertificates(user);
      setCerts(list);
    } catch (err) {
      console.error("Load error:", err);
    }
  };

  return (
    <div>
      <h2>My Certificates</h2>
      <button onClick={load}>Load</button>

      <ul>
        {certs.map((c, i) => (
          <li key={i}>
            <strong>ID:</strong> {c.id} <br />
            <strong>Issued By:</strong> {c.issuedBy} <br />
            <strong>Data Hash:</strong> {c.dataHash} <br />
            <strong>Created:</strong>{" "}
            {new Date(c.createdAt * 1000).toLocaleString()}
            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
}
