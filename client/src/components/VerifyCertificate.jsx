import { useState } from "react";
import { verifyCertificate } from "../utils/Contract";
import { Upload } from "../utils/Ipfs";



export default function VerifyCertificate() {
  const [id, setId] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const Verify = async () => {

    console.log("Verifying certificate ID:", id, "with file:", file);

    const cid = await Upload({ file: file });

    const verifyResult = await verifyCertificate(id, cid);

    setResult(verifyResult);
    console.log("Verification result:", verifyResult);
  }

  return (
    <div>
      <h2>Verify Certificate</h2>
      <input type="text" placeholder="Enter Certificate ID"
        onChange={(e) => setId(e.target.value)} />
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <button onClick={Verify}>Verify</button>

        <div>
          {result !== null && (result
              ? <p style={{ color: "green" }}>Certificate is VERIFIED!</p>
              : <p style={{ color: "red" }}>Certificate is NOT VERIFIED!</p>
          )}
        </div>
    </div>
  );
}
