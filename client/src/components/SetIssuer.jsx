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
        <div>
            <h2>Set Issuer</h2>
            <input
                type="text"
                placeholder="Issuer Address"
                value={issuerAdr}
                onChange={(e) => setIssuerAdr(e.target.value)}
            />
            <button onClick={handleIssuer}>Set Issuer</button>

            <div>
                <h3>All active issuers:</h3>
                <ul>
                    {issuers.map((addr, index) => (
                        <li key={index}>
                            {addr}{" "}
                            <button onClick={() => handleRevoke(addr)}>Revoke</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};