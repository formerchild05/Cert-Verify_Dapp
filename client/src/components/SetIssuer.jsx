import { ethers } from "ethers";
import { useState } from "react";
import { getContract } from "../utils/Contract";


/**
 * set issuer address in smart contract
 * using public key
 * @returns 
 */
export default function SetIssuer() {
    const [issuer, setIssuer] = useState("");
    
    const handleIssuer = async () => {
        if(typeof window.ethereum === 'undefined') {
            alert("MetaMask not found. Please install MetaMask.");
            return;
        }

        try {
    const contract = await getContract();

            const tx = await contract.setIssuer(issuer, true);
            
            console.log("Transaction sent. Waiting for confirmation...", tx.hash);
            const block = await tx.wait();
            console.log("Issuer set successfully:", issuer);
            console.log
        } catch (err) {
            console.error("Set issuer error:", err);
        }
    };
    return (
        <div>
            <input
                type="text"
                placeholder="Issuer Address"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
            />

            <button onClick={handleIssuer}>Set Issuer</button>
        </div>
    );
};