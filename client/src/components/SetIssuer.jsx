import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { setIssuer, isIssuer, isOwner, getAllIssuers } from "../utils/Contract";


/**
 * set issuer address in smart contract
 * using public key
 * @returns 
 */
export default function SetIssuer() {
    const [issuerAdr, setIssuerAdr] = useState("");
    const [issuers, setIssuers] = useState([]);

    useEffect(() => {
        const fetchIssuers = async () => {
            try {
                const list = await getAllIssuers();
                console.log("All issuers:", list);
                setIssuers(list);
            } catch (err) {
                console.error("Get all issuers error:", err);
            }
        };
        fetchIssuers();
    }, []);



    const handleIssuer = async () => {
        if (typeof window.ethereum === 'undefined') {
            alert("MetaMask not found. Please install MetaMask.");
            return;
        }
        if (await isOwner() === false) {
            alert("Only admin can set issuer.");
            return;
        }
        if (issuerAdr.trim() === "") {
            alert("Please enter a valid issuer address.");
            return;
        }

        if (issuers.includes(issuerAdr)) {
            alert("This address is already an issuer.");
            return;
        }

        try {
            const receipt = await setIssuer(issuerAdr, true);
            console.log(`Issuer set successfully at block number ${receipt.blockNumber}:`, receipt.blockHash);
            setIssuers([...issuers, issuerAdr]);
        } catch (err) {
            console.error("Set issuer error:", err);
        }
    };

    const handleRevoke = async (addr) => {
        if (!window.ethereum) {
            alert("MetaMask not found. Please install MetaMask.");
            return;
        }

        if (!(await isOwner())) {
            alert("Only admin can revoke issuer.");
            return;
        }

        try {
            const receipt = await setIssuer(addr, false);
            console.log(`Issuer revoked at block ${receipt.blockNumber}`);

            // Cập nhật state issuer ngay lập tức
            setIssuers(prev => prev.filter(a => a.toLowerCase() !== addr.toLowerCase()));
        } catch (err) {
            console.error("Revoke issuer error:", err);
        }
    };
    return (
        <div className="section-card">
            <h2 className="section-title">Set Issuer</h2>

            <div className="form-row">
                <div className="input-group" style={{ flex: '2 1 320px' }}>
                    <label>Issuer Address</label>
                    <input
                        type="text"
                        placeholder="0x..."
                        value={issuerAdr}
                        onChange={(e) => setIssuerAdr(e.target.value)}
                    />
                </div>
            </div>

            <div className="actions">
                <button onClick={handleIssuer}>Set Issuer</button>
            </div>

            <div className="divider" />
            <h3 className="section-title">All active issuers</h3>
            <ul style={{ listStyle: 'none', paddingLeft: 0, marginTop: '.25rem' }}>
                {issuers.map((addr, index) => (
                    <li
                        key={index}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.6rem 0.75rem',
                            border: '1px solid rgba(148,163,184,0.3)',
                            borderRadius: '0.75rem',
                            marginBottom: '0.5rem',
                            background: 'rgba(15,23,42,0.6)'
                        }}
                    >
                        <span style={{ wordBreak: 'break-all' }}>{addr}</span>
                        <div className="actions">
                            <button className="btn-danger" onClick={() => handleRevoke(addr)}>Revoke</button>
                        </div>
                    </li>
                ))}
                {issuers.length === 0 && (
                    <li style={{ color: 'var(--text-secondary)' }}>No issuers yet.</li>
                )}
            </ul>
        </div>
    );
};