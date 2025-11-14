import { useState, useEffect } from "react";
import CreateCertificate from "./components/CreateCertificate";
import VerifyCertificate from "./components/VerifyCertificate";
import UploadCertificate from "./components/UploadCertificate";
import FetchCertificate from "./components/FetchCertificate";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";

function App() {
    const [currentAccount, setCurrentAccount] = useState(null);

    // optional: check if already connected on load
    useEffect(() => {
        const checkWalletIsConnected = async () => {
            if (!window.ethereum) return;
            try {
                const accounts = await window.ethereum.request({
                    method: "eth_accounts",
                });
                if (accounts && accounts.length > 0) {
                    setCurrentAccount(accounts[0]);
                }
            } catch (err) {
                console.error("Error checking accounts:", err);
            }
        };

        checkWalletIsConnected();
    }, []);

    const connectWallet = async () => {
        if (!window.ethereum) {
            alert("MetaMask not found. Please install MetaMask.");
            return;
        }

        try {
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
            if (accounts && accounts.length > 0) {
                setCurrentAccount(accounts[0]);
            }
        } catch (err) {
            console.error("Error connecting wallet:", err);
        }
    };

    const handleCidFromUpload = (cid) => {
        console.log("CID from upload:", cid);
    };

    const shortAddress = (addr) =>
        addr ? addr.slice(0, 6) + "..." + addr.slice(-4) : "";

    return (
        <Router>
            <div className="app-container">
                <nav className="navbar">
                    <h1 className="navbar-title">Blockchain Certificate DApp</h1>

                    <div className="navbar-buttons">
                        <Link to="/upload">
                            <button>Upload</button>
                        </Link>
                        <Link to="/fetch">
                            <button>Fetch</button>
                        </Link>
                        <Link to="/issue">
                            <button>Issue</button>
                        </Link>
                        <Link to="/verify">
                            <button>Verify</button>
                        </Link>

                        {/* Connect MetaMask button */}
                        <button onClick={connectWallet} className="connect-button">
                            {currentAccount
                                ? `Connected: ${shortAddress(currentAccount)}`
                                : "Connect Wallet"}
                        </button>
                    </div>
                </nav>

                <main className="main-content">
                    <Routes>
                        <Route path="/upload" element={<UploadCertificate />} />
                        <Route path="/fetch" element={<FetchCertificate />} />
                        <Route path="/issue" element={<CreateCertificate />} />
                        <Route path="/verify" element={<VerifyCertificate />} />
                        <Route path="*" element={<UploadCertificate />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
