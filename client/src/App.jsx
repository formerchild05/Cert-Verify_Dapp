import { useState, useEffect } from "react";
import VerifyCertificate from "./components/VerifyCertificate";
import MyCertificates from "./components/FCerti";
import SetIssuer from "./components/SetIssuer";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import CreateCertificate from "./components/CreateCertificate";
import Organization from "./components/Organization";
import { isIssuer, isOwner } from "./utils/Contract";
import RevokeCertificate from "./components/Revoke";

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);

  const [role, setRole] = useState('user');

  useEffect(() => {
    if (!window.ethereum) return;

    // check role
    const checkRole = async () => {
      if (await isOwner()) {
        setRole('owner');
      } else if (await isIssuer()) {
        setRole('issuer');
      } else {
        setRole('user');
      }
    }
    checkRole();

    window.ethereum.on("accountsChanged", (accounts) => {
      setCurrentAccount(accounts[0] || null);
      checkRole();
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
      console.log("role:", role);
    } catch (err) {
      console.error("Error connecting wallet:", err);
    }
  };

  const shortAddress = (addr) =>
    addr ? addr.slice(0, 6) + "..." + addr.slice(-4) : "";

  const content = () => {
    if (role === 'owner') {
      return <div>
        <Link to="/certificate"><button>Certificate</button></Link>
        <Link to="/verify"><button>Verify</button></Link>
        <Link to="/setIssuer"><button>Set Issuer</button></Link>
        <Link to="/organization"><button>Organization</button></Link>

      </div>;
    } else if (role === 'issuer') {
      return <div>
        <Link to="/issue"><button>Issue</button></Link>
        <Link to="/verify"><button>Verify</button></Link>
        <Link to="/organization"><button>Organization</button></Link>
      </div>;
    } else {
      return <div>
        <Link to="/verify"><button>Verify</button></Link>
      </div>;
    }
  }

  return (
    <Router>
      <div className="app-container">
        <nav className="navbar">
          <h1 className="navbar-title">Blockchain Certificate DApp</h1>
          <div className="navbar-buttons">

            {content()}

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
            <Route path="/" element={<VerifyCertificate />} />
            <Route path="/certificate" element={<CreateCertificate />} />
            <Route path="/verify" element={<VerifyCertificate />} />
            <Route path="/test" element={<MyCertificates />} />
            <Route path="/revoke" element={<RevokeCertificate />} />
            {/* FOR ADMIN (DEPLOYER) */}
            <Route path="/setIssuer" element={<SetIssuer currentAccount={currentAccount} />} />
            {/* FOR ORG ADD NEW CANDIDATE */}
            <Route path="/organization" element={<Organization />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
