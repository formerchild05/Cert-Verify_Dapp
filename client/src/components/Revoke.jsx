import { useState } from "react";
import { revokeCertificate } from "../utils/Contract";




export default function RevokeCertificate() {
    const [id, setId] = useState(''); // ID của chứng chỉ
    const [status, setStatus] = useState(null); // { text, type: 'success'|'error'|'warning' }

    const handleRevoke = async () => {
        setStatus(null);
        try {
            const receipt = await revokeCertificate(id);
            console.log('Certificate revoked:', receipt);
            setStatus({ text: 'Certificate revoked successfully!', type: 'success' });
        } catch (err) {
            console.error('Error revoking certificate:', err);
            // Extract revert reason similar to CreateCertificate
            let reason = err?.reason || err?.error?.message || err?.data?.message || err?.message;
            if (!reason && typeof err === 'string') reason = err;
            // 1) reason="..."
            let match = (reason || '').match(/reason=\"(.+?)\"/);
            if (!match) {
                // 2) reverted with reason string '...'
                match = (reason || '').match(/reverted with reason string '(.+?)'/i);
            }
            if (!match) {
                // 3) generic quotes '...'
                match = (reason || '').match(/'([^']+)'/);
            }
            if (match) reason = match[1];

            const warningKeywords = ['Already revoked', 'Not authorized', 'Certificate does not exist'];
            const type = warningKeywords.some(k => (reason || '').includes(k)) ? 'warning' : 'error';
            setStatus({ text: reason || 'Failed to revoke certificate', type });
        }
    };

    return (
        <div className="section-card">
            <h2 className="section-title">Revoke Certificate</h2>
            <div className="form-row">
                <div className="input-group">
                    <label>Certificate ID</label>
                    <input
                        type="text"
                        placeholder="Enter Certificate ID"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                    />
                </div>
            </div>
            <div className="actions">
                <button className="btn-danger" onClick={handleRevoke}>Revoke</button>
            </div>

            {status && (
                <div className={`status-banner ${
                    status?.type === 'success' ? 'status-success' :
                    status?.type === 'warning' ? 'status-warning' :
                    status?.type === 'error' ? 'status-error' : ''
                }`}>
                    {status?.text || ''}
                </div>
            )}
        </div>
    );
}