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
        <div className="section-card">
            <h2 className="section-title">Organization Members</h2>
            <div className="form-row">
                <div className="input-group">
                    <label>Candidate Address</label>
                    <input type="text" value={candidate} onChange={(e) => setCandidate(e.target.value)} />
                </div>
            </div>
            <div className="actions">
                <button onClick={addCandidate}>Add Candidate</button>
            </div>

            <div className="divider" />
            <h3 className="section-title">Candidates in this Organization</h3>
            <ul style={{ listStyle: 'none', paddingLeft: 0, marginTop: '.25rem' }}>
                {orgUsers.map((user, index) => (
                    <li key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.6rem 0.75rem',
                        border: '1px solid rgba(148,163,184,0.3)',
                        borderRadius: '0.75rem',
                        marginBottom: '0.5rem',
                        background: 'rgba(15,23,42,0.6)'
                    }}>
                        <span style={{ wordBreak: 'break-all' }}>{user}</span>
                        <div className="actions">
                            <button className="btn-danger" onClick={() => revokeCandidate(user)}>Revoke</button>
                        </div>
                    </li>
                ))}
                {orgUsers.length === 0 && (
                    <li style={{ color: 'var(--text-secondary)' }}>No candidates yet.</li>
                )}
            </ul>
        </div>
    );
}