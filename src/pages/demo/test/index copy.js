// src/PdfSigner.js
import React, { useState, useEffect } from 'react';
import signpdf from '@signpdf/signpdf';
import forge from 'node-forge';

const PdfSigner = () => {
  const [file, setFile] = useState(null);
  const [signedPdf, setSignedPdf] = useState(null);
  const [privateKey, setPrivateKey] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const privateKeyResponse = await fetch('/path/to/privateKey.PEM'); // Use absolute paths
        const publicKeyResponse = await fetch('/path/to/publicKey.PEM');

        if (!privateKeyResponse.ok || !publicKeyResponse.ok) {
          throw new Error('Failed to fetch keys');
        }

        const privateKeyText = await privateKeyResponse.text();
        const publicKeyText = await publicKeyResponse.text();

        setPrivateKey(privateKeyText);
        setPublicKey(publicKeyText);
      } catch (error) {
        console.error('Error fetching keys:', error);
        setError('Failed to load keys. Please check the console for details.');
      }
    };

    fetchKeys();
  }, []);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSignPdf = async () => {
    if (!file || !privateKey) {
      alert('Please select a PDF file and ensure the private key is loaded.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const pdfData = e.target.result;

      // Convert the private key from PEM format
      const privateKeyObj = forge.pki.privateKeyFromPem(privateKey);

      // Sign the PDF
      const signedData = await signpdf.sign(pdfData, privateKeyObj);

      const blob = new Blob([signedData], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setSignedPdf(url);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <h1>PDF Signer</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error if any */}
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button onClick={handleSignPdf}>Sign PDF</button>
      {signedPdf && (
        <a href={signedPdf} download="signed.pdf">
          Download Signed PDF
        </a>
      )}
    </div>
  );
};

export default PdfSigner;



