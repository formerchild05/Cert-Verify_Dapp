import { ethers } from "ethers";
import { useState } from "react";
import { getContract, setIssuer, isIssuer, isOwner } from "../utils/Contract";


/**
 * set issuer address in smart contract
 * using public key
 * @returns 
 */
export default function SetIssuer({currentAccount}) {
    const [issuerAdr, setIssuerAdr] = useState("");

    const handleIssuer = async () => {
        if (typeof window.ethereum === 'undefined') {
            alert("MetaMask not found. Please install MetaMask.");
            return;
        }

        if (await isOwner(currentAccount) === false) {
            alert("Only admin can set issuer.");
            return;
        }

        if (issuerAdr.trim() === "") {
            alert("Please enter a valid issuer address.");
            return;
        }

        if (await isIssuer(issuerAdr)) {
            alert("This address is already an issuer.");
            return;
        }



        try {
            const receipt = await setIssuer(issuerAdr, true);
            console.log(`Issuer set successfully at block number ${receipt.blockNumber}:`, receipt.blockHash);

        } catch (err) {
            console.error("Set issuer error:", err);
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
        </div>
    );
};