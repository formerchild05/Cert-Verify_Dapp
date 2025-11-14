import { useState } from "react";
import { getContract } from "../utils/contract";
import { ethers } from "ethers";

export default function VerifyCertificate() {
  const [id, setId] = useState("");
  const [result, setResult] = useState(null);

const verifyCert = async () => {
  try {
    const contract = await getContract();
    const idBytes = ethers.encodeBytes32String(id);
    const cert = await contract.certificates(idBytes);

    if (cert.createdAt === 0n) {
      setResult("❌ Certificate not found");
      return;
    }

    setResult({
      id: ethers.decodeBytes32String(cert.id),
      issuedTo: cert.issuedTo,
      issuedBy: cert.issuedBy,
      createdAt: new Date(Number(cert.createdAt) * 1000).toLocaleString(),
      expireAt:
        cert.expireAt != 0n
          ? new Date(Number(cert.expireAt) * 1000).toLocaleString()
          : "Never",
      data: cert.dataHash,
    });
  } catch (err) {
    console.error(err);
    setResult("❌ Error verifying certificate");
  }
};

  return (
    <div style={{ padding: 20 }}>
      <h2>Verify Certificate</h2>
      <input
        value={id}
        onChange={(e) => setId(e.target.value)}
        placeholder="Certificate ID"
      />
      <button onClick={verifyCert} style={{ marginLeft: 10 }}>
        Verify
      </button>

      {result && (
        <div style={{ marginTop: 20 }}>
          {typeof result === "string" ? (
            <p>{result}</p>
          ) : (
            <>
              <p><b>ID:</b> {result.id}</p>
              <p><b>Issued To:</b> {result.issuedTo}</p>
              <p><b>Issued By:</b> {result.issuedBy}</p>
              <p><b>Created:</b> {result.createdAt}</p>
              <p><b>Expires:</b> {result.expireAt}</p>
              <p><b>Data Hash:</b> {result.data}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
