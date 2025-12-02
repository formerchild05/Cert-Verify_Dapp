import { useState } from "react";
import { verifyCertificate } from "../utils/Contract";
import { Upload } from "../utils/Ipfs";



export default function VerifyCertificate() {
  const [id, setId] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const [certUrl, setCertUrl] = useState("");

  const baseUrl = "https://ipfs.io/ipfs/";

  const Verify = async () => {

    console.log("Verifying certificate ID:", id, "with file:", file);

    const cid = await Upload({ file: file });

    const verifyResult = await verifyCertificate(id, cid);

    setResult(verifyResult);

    if (verifyResult) {
      setCertUrl(baseUrl + cid);
    }

    console.log("Verification result:", verifyResult);
  }

  return (
    <div className="section-card">
      <h2 className="section-title">Verify Certificate</h2>
      <div className="form-row">
        <div className="input-group">
          <label>Certificate ID</label>
          <input type="text" placeholder="Enter Certificate ID"
            onChange={(e) => setId(e.target.value)} />
        </div>
        <div className="input-group">
          <label>Upload Certificate PDF</label>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        </div>
      </div>

      <div className="actions">
        <button onClick={Verify} className="btn-secondary">Verify</button>
      </div>

      {result !== null && (
        <div className={`status-banner ${result ? 'status-success' : 'status-error'}`}>
          {result ? 'Certificate is VERIFIED!' : 'Certificate is NOT VERIFIED!'}
        </div>
      )}

      {certUrl && (
        <div style={{ marginTop: '.5rem' }}>
          <a href={certUrl} target="_blank" rel="noopener noreferrer">View Certificate PDF</a>
        </div>
      )}
    </div>
  );
}
