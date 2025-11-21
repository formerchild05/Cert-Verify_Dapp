import { useState, useEffect } from "react";
import VerifyCertificate from "./components/VerifyCertificate";
import MyCertificates from "./components/FCerti";
import SetIssuer from "./components/SetIssuer";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import CreateCertificate from "./components/CreateCertificate";
import Organization from "./components/Organization";

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);

  useEffect(() => {
    if (!window.ethereum) return;

    window.ethereum.on("accountsChanged", (accounts) => {
      setCurrentAccount(accounts[0] || null);
    });
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
      const current = accounts[0];
      console.log("Current MetaMask wallet:", current);
      setCurrentAccount(current);
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
            <Link to="/issue">
              <button>Issue</button>
            </Link>
            <Link to="/verify">
              <button>Verify</button>
            </Link>

            <Link to="/test"><button>Test</button></Link>

            <Link to="/setIssuer"><button>Set Issuer</button></Link>

            <Link to="/organization"><button>Organization</button></Link>

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
            <Route path="/issue" element={<CreateCertificate />} />
            <Route path="/verify" element={<VerifyCertificate />} />
            <Route path="/test" element={<MyCertificates />} />

            {/* FOR ADMIN (DEPLOYER) */}
            <Route path="/setIssuer" element={<SetIssuer />} />
            {/* FOR ORG ADD NEW CANDIDATE */}
            <Route path="/organization" element={<Organization />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
