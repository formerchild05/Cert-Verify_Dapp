import { useState } from "react";
import { addCandToOrg } from "../utils/contract";
export default function Organization() {
    const [candidate, setCandidate] = useState('');

const addCandidate = () => {
    // Logic to add candidate goes here
    console.log("Adding candidate:", candidate);

    addCandToOrg(candidate).then((receipt) => {
        console.log("Candidate added successfully. Tx receipt:", receipt);
    }).catch((err) => {
        console.error("Error adding candidate:", err);
    });
}

  return (
    <div>
        <label>add new candidate</label>
        <input type="text" value={candidate} onChange={(e) => setCandidate(e.target.value)} />
        <button onClick={addCandidate}>Add Candidate</button>
    </div>
  );
}