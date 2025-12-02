import React, { useState } from 'react';
import RevokeCertificate from './Revoke';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';
import fontkit from '@pdf-lib/fontkit';
import { Upload } from '../utils/Ipfs';
import { issueNewCertificate, isIssuer } from '../utils/Contract';

export default function CreateCertificate() {
  const [org, setOrg] = useState('My Organization'); // Tên tổ chức
  const [expireDate, setExpireDate] = useState('2024-06-01');
  const [candidate, setCandidate] = useState('Jane Smith'); // Tên người nhận
  const [course, setCourse] = useState('Blockchain 101'); // Tên khóa học
  const [candidateId, setCandidateId] = useState(); // public key của người nhận
  const [id, setId] = useState(); // ID của chứng chỉ
  const [status, setStatus] = useState(null); // { text, type: 'success'|'error'|'warning' }

  const [isLoading, setIsLoading] = useState(false);


  const drawOnPdf = async () => {
    setIsLoading(true);

    try {
      const check = await isIssuer();
      if (!check) {
        setStatus({ text: 'Bạn không có quyền phát hành chứng chỉ từ tổ chức này.', type: 'error' });
        setIsLoading(false);
        return;
      }

      // 1. Tải file PDF template
      const formUrl = '/certificate_template.pdf';
      const formPdfBytes = await fetch(formUrl).then(res => res.arrayBuffer());
      // 2. Load file PDF
      const pdfDoc = await PDFDocument.load(formPdfBytes);
      pdfDoc.registerFontkit(fontkit);
      // 3. Lấy trang mà bạn muốn vẽ đè lên (ví dụ: trang đầu tiên)
      const firstPage = pdfDoc.getPages()[0]; // Lấy trang đầu tiên
      const { width, height } = firstPage.getSize(); // Lấy kích thước trang
      const fontUrl = '/font/BeVietnamPro-Regular.ttf'; // Dùng font đậm cho tên
      const fontBytes = await fetch(fontUrl).then(res => res.arrayBuffer());
      const customFont = await pdfDoc.embedFont(fontBytes);

      // --- 5. Vẽ ĐÈ VĂN BẢN ---
      // Gốc tọa độ (0,0) của PDF là ở góc dưới bên trái.
      // Để dễ hình dung, bạn có thể coi Y là khoảng cách từ đáy lên.
      const yguess = (height / 2) - 50;
      firstPage.drawText(candidate, {
        x: width / 2 - 60,
        y: yguess,
        font: customFont,
        size: 24,
        color: rgb(0.1, 0.1, 0.1)
      });

      firstPage.drawText(course, {
        x: width / 2 - 60,
        y: yguess - 60,
        font: customFont,
        size: 18,
        color: rgb(0.1, 0.1, 0.1)
      });

      firstPage.drawText(org, {
        x: 140,
        y: 140,
        font: customFont,
        size: 18,
        color: rgb(0.1, 0.1, 0.1)
      });

      firstPage.drawText(`Expires: ${expireDate}`, {
        x: width - 300,
        y: 140,
        font: customFont,
        size: 18,
        color: rgb(0.1, 0.1, 0.1)
      });

      // 8. Lưu file PDF đã được sửa
      const pdfBytes = await pdfDoc.save();

      // 10. Upload lên IPFS
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const cid = await Upload({ file: blob });
      console.log('CID của file PDF đã vẽ đè:', cid);

      // 11. Blockchain (CID)
      const Chain = await issueNewCertificate(id, cid, candidateId, expireDate);
      console.log('Chứng chỉ đã được phát hành trên blockchain:', Chain);
      setStatus({ text: 'Chứng chỉ đã được phát hành thành công!', type: 'success' });
      // 9. Tải file về máy người dùng
      const fileName = course.toLowerCase().replace(/\s+/g, '_') + '_' + id + '_' + candidate.replace(/\s+/g, '_') +'_certificate.pdf';
      saveAs(blob, fileName);

    } catch (err) {
      console.error('Lỗi :', err);
      // Extract revert reason if available
      let reason = err?.reason || err?.error?.message || err?.data?.message || err?.message;
      if (!reason && typeof err === 'string') reason = err;
      // Try to extract reason from common patterns
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

      // Classify as warning for common require messages
      const warningKeywords = ['exists', 'does not belong', 'Not authorized', 'no permission', 'Only issuer'];
      const type = warningKeywords.some(k => (reason || '').includes(k)) ? 'warning' : 'error';

      setStatus({ text: reason || 'Đã xảy ra lỗi. Vui lòng kiểm tra console.', type });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h3>Issue new Certificate</h3>
      <div>
        <label>CANDIDATE</label>
        <input
          type="text"
          value={candidate}
          onChange={(e) => setCandidate(e.target.value)}
        />
      </div>


      {/* TODO : ADD COURSE NAME, DATE, ORG*/}
      <label>CERTIFICATE ID</label>
      <input type="text" value={id} onChange={(e) => setId(e.target.value)} />
      <label>COURSE</label>
      <input type="text" value={course} onChange={(e) => setCourse(e.target.value)} />
      <label>EXPIRE DATE</label>
      <input type="date" value={expireDate} onChange={(e) => setExpireDate(e.target.value)} />
      <label>ORGANIZATION</label>
      <input type="text" value={org} onChange={(e) => setOrg(e.target.value)} />
      <label>CANDIDATE ID (Public Key)</label>
      <input type="text" value={candidateId} onChange={(e) => setCandidateId(e.target.value)} />

      <button onClick={drawOnPdf} disabled={isLoading}>
        {isLoading ? 'Đang xử lý...' : 'Vẽ đè và Tải PDF'}
      </button>

      <p style={{
        marginTop: 12,
        fontWeight: 600,
        color:
          status?.type === 'success' ? '#15803d' :
          status?.type === 'warning' ? '#b45309' :
          status?.type === 'error' ? '#b91c1c' : '#374151'
      }}>
        {status?.text || status}
      </p>

      <hr style={{ margin: '24px 0' }} />
      <h3>Revoke Certificate</h3>
      <RevokeCertificate />
    </div>
  );
};