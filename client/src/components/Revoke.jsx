import { revokeCertificate } from "../utils/Contract";

export default function Revoke() {
    
    const [id, setId] = useState(''); // ID của chứng chỉ


    //TODO : POPUP WHEN USER REVOKE "YOU ARE REVOKING THIS CERTIFICATE"
    const handleRevoke = async () => {
        alert('Revoking certificate with ID: ' + id);
        try {
            const receipt = await revokeCertificate(id);
            console.log('Certificate revoked:', receipt);
            alert('Certificate revoked successfully!');
        } catch (error) {
            console.error('Error revoking certificate:', error);
            alert('Failed to revoke certificate: ' + error.message);
        }
    };

    return (
        <div>
            <h2>Revoke Certificate</h2>
            <input
                type="text"
                placeholder="Enter Certificate ID"
                value={id}
                onChange={(e) => setId(e.target.value)}
            />
            <button onClick={handleRevoke}>Revoke</button>

        </div>
    );
}