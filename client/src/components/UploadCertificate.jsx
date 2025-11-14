import React, { useState } from "react";
import { create } from "ipfs-http-client";

export default function UploadCertificate({ onCid }) {
  const [file, setFile] = useState(null);
  const [cid, setCid] = useState("");

  // Kết nối IPFS Desktop local node
  const client = create({ url: "http://127.0.0.1:5001/api/v0" });

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Vui lòng chọn file trước!");

    try {
      const added = await client.add(file, { pin: true });
      setCid(added.path);
      alert("Upload thành công! CID: " + added.path);

      if (onCid) onCid(added.path); // gửi CID ra parent (App)
    } catch (err) {
      console.error("Lỗi upload IPFS:", err);
      alert("Upload thất bại!");
    }
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <h2>Upload Certificate</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload to IPFS</button>
      {cid && (
        <p>
          CID: <strong>{cid}</strong>
        </p>
      )}
    </div>
  );
}
