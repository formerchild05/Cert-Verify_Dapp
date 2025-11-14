import { useState } from "react";
import { getContract } from "../utils/contract";
import { ethers } from "ethers";

export default function CreateCertificate() {
  const [form, setForm] = useState({
    id: "",
    data: "",
    issuedTo: "",
    expireAt: "", // nhập dạng "YYYY-MM-DD"
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const createCert = async () => {
    try {
      const contract = await getContract();

      // convert sang bytes32
      const idBytes = ethers.encodeBytes32String(form.id);
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes(form.data));
      const expireAt = form.expireAt
        ? Math.floor(new Date(form.expireAt).getTime() / 1000)
        : 0;

      const tx = await contract.create(
        idBytes,
        dataHash,
        form.issuedTo,
        expireAt
      );
      await tx.wait();
      alert("✅ Certificate created successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Error creating certificate!");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Create Certificate</h2>
      <input
        name="id"
        placeholder="Certificate ID"
        value={form.id}
        onChange={handleChange}
      />
      <input
        name="data"
        placeholder="Certificate Data"
        value={form.data}
        onChange={handleChange}
      />
      <input
        name="issuedTo"
        placeholder="Issued To Address"
        value={form.issuedTo}
        onChange={handleChange}
      />
      <input
        type="date"
        name="expireAt"
        placeholder="Expiry Date"
        value={form.expireAt}
        onChange={handleChange}
      />
      <button onClick={createCert} style={{ marginTop: 10 }}>
        Create
      </button>
    </div>
  );
}
