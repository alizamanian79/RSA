import React, { useState } from "react";
import { PDFDocument, rgb } from 'pdf-lib';
import forge from "node-forge";

export default function Home() {
  const [base64Client, setBase64Client] = useState(process.env.NEXT_PUBLIC_BASE64_PDF);
  const [message, setMessage] = useState("");
  const [publicKey, setPublicKey] = useState(process.env.NEXT_PUBLIC_PUBLIC_KEY || "");
  const [privateKey, setPrivateKey] = useState(process.env.NEXT_PUBLIC_PRIVATE_KEY || "");
  const [encryption, setEncryption] = useState("");
  const [decryption, setDecryption] = useState("");
  const [error, setError] = useState("");

  const handleChange = (setter) => (e) => {
    setter(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(""); // Reset error state

    try {
      const { encryptedMessage, encryptedKey } = encryptMessage(message, publicKey);
      setEncryption(encryptedMessage + '::' + encryptedKey); 
      const decryptedMessage = decryptMessage(encryptedMessage, encryptedKey, privateKey);
      setDecryption(decryptedMessage);
    } catch (err) {
      setError("An error occurred during encryption/decryption: " + err.message);
    }
  };

  const encryptMessage = (message, publicKey) => {
    const aesKey = forge.random.getBytesSync(16);
    const cipher = forge.cipher.createCipher('AES-CBC', aesKey);
    const iv = forge.random.getBytesSync(16);
    cipher.start({ iv: iv });
    cipher.update(forge.util.createBuffer(message));
    cipher.finish();
    
    const encryptedMessage = cipher.output.getBytes();
    const publicKeyObj = forge.pki.publicKeyFromPem(publicKey);
    const encryptedKey = publicKeyObj.encrypt(aesKey);
    
    return { 
      encryptedMessage: forge.util.encode64(encryptedMessage + iv), 
      encryptedKey: forge.util.encode64(encryptedKey) 
    };
  };

  const decryptMessage = (encryptedMessage, encryptedKey, privateKey) => {
    const privateKeyObj = forge.pki.privateKeyFromPem(privateKey);
    const aesKey = privateKeyObj.decrypt(forge.util.decode64(encryptedKey));
    const decodedMessage = forge.util.decode64(encryptedMessage);
    const iv = decodedMessage.slice(-16);
    const encryptedContent = decodedMessage.slice(0, -16);
    
    const decipher = forge.cipher.createDecipher('AES-CBC', aesKey);
    decipher.start({ iv: iv });
    decipher.update(forge.util.createBuffer(encryptedContent));
    decipher.finish();
    
    return decipher.output.toString();
  };

  const downloadSignedPdf = async (base64Pdf, signerName) => {
    const pdfFile = await fetch(base64Pdf).then(res => res.blob());
    const existingPdfBytes = await pdfFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    
    const page = pdfDoc.getPages()[0];
    const { width, height } = page.getSize();

    // Draw the signature
    page.drawText(signerName, {
      x: 20,
      y: 20, // Adjust y position as needed
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

  const handleSignPdf = () => {
    if (!base64Client || !base64Client.startsWith("data:application/pdf;base64,")) {
      setError("Please provide a valid base64 PDF string.");
      return;
    }
    
    // Call the download function
    downloadSignedPdf(base64Client, message || "Signature");
  };

  return (
    <div className="max-w-lg mx-auto p-5 bg-white rounded-lg shadow-md">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Base64:</label>
          <input
            type="text"
            value={base64Client}
            onChange={handleChange(setBase64Client)}
            placeholder="Base64 PDF here ..."
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Your Signature:</label>
          <input
            type="text"
            value={message}
            onChange={handleChange(setMessage)}
            placeholder="Your Signature here ..."
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Public Key:</label>
          <textarea
            value={publicKey}
            onChange={handleChange(setPublicKey)}
            placeholder="Public key here"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Private Key:</label>
          <textarea
            value={privateKey}
            onChange={handleChange(setPrivateKey)}
            placeholder="Private key here"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
          />
        </div>
        <button 
          type="submit" 
          className="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Submit
        </button>
      </form>

      {error && <strong className="text-red-500 mt-4 block">{error}</strong>}
      <strong className="block mt-4">Encryption is:</strong>
      <textarea
        value={encryption}
        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
      />

      <strong className="block">Decryption is: </strong>
      <textarea
        value={decryption}
        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
      />

      <button 
        onClick={handleSignPdf} 
        className="mt-4 w-full bg-green-500 text-white font-semibold py-2 rounded-lg hover:bg-green-600 transition"
      >
        Sign PDF
      </button>
    </div>
  );
}
