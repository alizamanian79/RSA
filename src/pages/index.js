import React, { useState } from "react";
import forge from "node-forge";

export default function Home() {
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

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Message:</label>
          <input
            value={message}
            onChange={handleChange(setMessage)}
            placeholder="Message here ..."
          />
        </div>
        <div>
          <label>Public Key:</label>
          <textarea
            value={publicKey}
            onChange={handleChange(setPublicKey)}
            placeholder="Public key here"
          />
        </div>
        <div>
          <label>Private Key:</label>
          <textarea
            value={privateKey}
            onChange={handleChange(setPrivateKey)}
            placeholder="Private key here"
          />
        </div>
        <button type="submit">Submit</button>
      </form>

      {error && <strong style={{ color: 'red' }}>{error}</strong>}
      <strong>Encryption is: {encryption}</strong>
      <strong>Decryption is: {decryption}</strong>
    </div>
  );
}
