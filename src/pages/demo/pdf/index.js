import React, { useState } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';

const PdfSigner = () => {
  const [pdfFile, setPdfFile] = useState(null);

  const handleFileChange = (event) => {
    setPdfFile(event.target.files[0]);
  };

  const handleSignPdf = async () => {
    if (!pdfFile) return;

    const existingPdfBytes = await pdfFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    
    const page = pdfDoc.getPages()[0];
    const { width, height } = page.getSize();

    // Draw the signature
    page.drawText('Ali', {
      x: 20,
      y: 20,
      size: 15,
      color: rgb(0, 0, 0),
    });

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes = await pdfDoc.save();

    // Create a blob and download the signed PDF
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'signed_document.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h1>PDF Signer</h1>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button onClick={handleSignPdf}>Sign PDF</button>
    </div>
  );
};

export default PdfSigner;
