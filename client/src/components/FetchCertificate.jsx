import React, { useState } from "react";

export default function FetchCertificate() {
  const [cid, setCid] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  const handleFetch = () => {
    if (!cid) return alert("Vui lòng nhập CID!");
    // Sử dụng gateway local của IPFS Desktop
    const url = `http://127.0.0.1:8080/ipfs/${cid}`;
    setFileUrl(url);
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>Fetch Certificate</h2>
      <input
        type="text"
        placeholder="Nhập CID"
        value={cid}
        onChange={(e) => setCid(e.target.value)}
      />
      <button onClick={handleFetch}>Fetch</button>

      {fileUrl && (
        <div style={{ marginTop: "10px" }}>
          <p>File URL:</p>
          <a href={fileUrl} target="_blank" rel="noreferrer">
            {fileUrl}
          </a>
        </div>
      )}
    </div>
  );
}
