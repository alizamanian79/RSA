import React, { useState } from "react";
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
      // Encrypt the message using hybrid encryption
      const { encryptedMessage, encryptedKey } = encryptMessage(message, publicKey);
      setEncryption(encryptedMessage + '::' + encryptedKey); // Store both parts

      // Decrypt the message using the private key
      const decryptedMessage = decryptMessage(encryptedMessage, encryptedKey, privateKey);
      setDecryption(decryptedMessage);
    } catch (err) {
      setError("An error occurred during encryption/decryption: " + err.message);
    }
  };

  const encryptMessage = (message, publicKey) => {
    // Generate a random symmetric key (AES)
    const aesKey = forge.random.getBytesSync(16); // AES-128
    const cipher = forge.cipher.createCipher('AES-CBC', aesKey);
    
    // Generate a random IV
    const iv = forge.random.getBytesSync(16);
    cipher.start({ iv: iv });
    cipher.update(forge.util.createBuffer(message));
    cipher.finish();
    
    const encryptedMessage = cipher.output.getBytes();
    
    // Encrypt the AES key with RSA
    const publicKeyObj = forge.pki.publicKeyFromPem(publicKey);
    const encryptedKey = publicKeyObj.encrypt(aesKey);
    
    // Return both encrypted message and encrypted key in Base64
    return { 
      encryptedMessage: forge.util.encode64(encryptedMessage + iv), 
      encryptedKey: forge.util.encode64(encryptedKey) 
    };
  };

  const decryptMessage = (encryptedMessage, encryptedKey, privateKey) => {
    // Decrypt the AES key with RSA
    const privateKeyObj = forge.pki.privateKeyFromPem(privateKey);
    const aesKey = privateKeyObj.decrypt(forge.util.decode64(encryptedKey));

    // Extract the IV from the encrypted message
    const decodedMessage = forge.util.decode64(encryptedMessage);
    const iv = decodedMessage.slice(-16); // Last 16 bytes are the IV
    const encryptedContent = decodedMessage.slice(0, -16);
    
    // Decrypt the message using AES
    const decipher = forge.cipher.createDecipher('AES-CBC', aesKey);
    decipher.start({ iv: iv });
    decipher.update(forge.util.createBuffer(encryptedContent));
    decipher.finish();
    
    return decipher.output.toString();
  };

  const downloadSignedPdf = (base64Pdf, signerName) => {
    // Create a Blob from the base64 string
    const byteCharacters = atob(base64Pdf.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });

    // Create a link element
    const link = document.createElement('a');
    const fileName = `downloaded_signed_by_${signerName}.pdf`; // Set the name for the downloaded file
    link.href = URL.createObjectURL(blob);
    link.download = fileName;

    // Trigger the download
    link.click();

    // Clean up
    URL.revokeObjectURL(link.href);
  };

  const handleSignPdf = () => {
    // Check if base64 is defined and valid
    if (!base64Client || !base64Client.startsWith("data:application/pdf;base64,")) {
      setError("Please provide a valid base64 PDF string.");
      return;
    }
    
    // Call the download function
    downloadSignedPdf(base64Client, "Ali");
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

      <button className="p-3 bg-[green]" onClick={handleSignPdf}>Download Pdf</button>
    </div>
  );
}
