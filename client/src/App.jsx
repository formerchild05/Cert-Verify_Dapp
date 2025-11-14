import CreateCertificate from "./components/CreateCertificate";
import VerifyCertificate from "./components/VerifyCertificate";
import UploadCertificate from "./components/UploadCertificate";
import FetchCertificate from "./components/FetchCertificate";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";

function App() {
  const handleCidFromUpload = (cid) => {
    console.log("CID nhận từ upload:", cid);
  };

  return (
    <Router>
          <div className="app-container">
            <nav className="navbar">
              <h1 className="navbar-title">Blockchain Certificate DApp</h1>
              <div className="navbar-buttons">
                <Link to="/upload"><button>Upload</button></Link>
                <Link to="/fetch"><button>Fetch</button></Link>
                <Link to="/issue"><button>Issue</button></Link>
                <Link to="/verify"><button>Verify</button></Link>
              </div>
            </nav>

            <main className="main-content">
              <Routes>
                <Route path="/upload" element={<UploadCertificate />} />
                <Route path="/fetch" element={<FetchCertificate />} />
                <Route path="/issue" element={<CreateCertificate />} />
                <Route path="/verify" element={<VerifyCertificate />} />
                <Route path="*" element={<UploadCertificate />} /> {/* default */}
              </Routes>
            </main>
          </div>
        </Router>
  );
}

export default App;
