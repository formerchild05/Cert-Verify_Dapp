import { useEffect, useState } from "react";
import { addCandToOrg, getOrgUsers, revokeUserFromOrg } from "../utils/Contract";
export default function Organization() {
    const [candidate, setCandidate] = useState('');
    const [orgUsers, setOrgUsers] = useState([]);

    useEffect(() => {
        const fetchOrgUsers = async () => {
            try {
                const list = await getOrgUsers();
                console.log("Organization users:", list);
                setOrgUsers(list);
            } catch (err) {
                console.error("Get organization users error:", err);
            }
        };
        fetchOrgUsers();
    }, []);

    const addCandidate = async () => {
        // Logic to add candidate goes here
        try {
            const receipt = await addCandToOrg(candidate);
            console.log(`Candidate added successfully at block number ${receipt.blockNumber}:`, receipt.blockHash);
            setOrgUsers([...orgUsers, candidate]);
            setCandidate('');
        } catch (err) {
            console.error("Add candidate error:", err);
        }
    };

    const revokeCandidate = async (addr) => {
        // Logic to revoke candidate goes here
        try {
            const receipt = await revokeUserFromOrg(addr);
            console.log(`Candidate revoked successfully at block number ${receipt.blockNumber}:`, receipt.blockHash);
            setOrgUsers(orgUsers.filter(user => user !== addr));
        } catch (err) {
            console.error("Revoke candidate error:", err);
        }
    };
    return (
        <div>
            <h2>add new candidate</h2>
            <input type="text" value={candidate} onChange={(e) => setCandidate(e.target.value)} />
            <button onClick={addCandidate}>Add Candidate</button>



            <div>
                <h3>Candidate belong to this organization</h3>
                <ul>
                    {orgUsers.map((user, index) => (
                        <li key={index}>
                            {user}
                            <button onClick={() => revokeCandidate(user)}>Revoke</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}