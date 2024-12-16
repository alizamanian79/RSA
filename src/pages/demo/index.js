import React, { useState } from "react";
import NodeRSA from "node-rsa";

export default function Home() {

  
  const rsaKeys=()=>{
    const keys = new NodeRSA({b:1024});
    const publicKey=keys.exportKey('public');
    const privateKey=keys.exportKey('private');
    return {
      publicKey :publicKey,
      privateKey:privateKey
    }
  }

  
  const resDcrypt=(text,key)=>{
    let keyPrivate = new NodeRSA(key);
    let dcrypt = keyPrivate.decrypt(text,'utf8')
    return dcrypt
  }

  const resEncrypt=(text,key)=>{
    let keyPublic = new NodeRSA(key)
    const encrypted = keyPublic.encrypt(text,'base64')
    return encrypted
  }



  const rsa = rsaKeys();

  const [message, setMessage] = useState("");
  const [publicKey, setPublicKey] = useState(rsa.publicKey);
  const [privateKey, setPrivateKey] = useState(rsa.privateKey);

  const handleChange = (setter) => (e) => {
    setter(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
   let res = resEncrypt(message,rsa.privateKey)
   let resDec = resDcrypt(res,rsa.privateKey)
    alert(resDec)
  };




  return (
    <div>
      <form action={"#"} className="flex flex-col justify-center items-center" onSubmit={handleSubmit}>
        <span className="flex w-[100%] h-[100px] mt-5 justify-center items-center">
          Message:
          <input
            className="w-[90%] h-[100px] ml-2"
            placeholder="Message here ..."
            value={message}
            onChange={handleChange(setMessage)}
          />
        </span>

        <span className="flex w-[100%] h-[100px] mt-5 justify-center items-center">
          Public key:
          <input
            className="w-[90%] h-[100px] ml-2"
            placeholder="Public key here"
            value={publicKey}
            onChange={handleChange(setPublicKey)}
          />
        </span>

        <span className="flex w-[100%] h-[100px] mt-5 justify-center items-center">
          Private key:
          <input
            className="w-[90%] h-[100px] ml-2"
            placeholder="Private key here"
            value={privateKey}
            onChange={handleChange(setPrivateKey)}
          />
        </span>

        <button type="submit" className="mt-5 p-2 bg-blue-500 text-white">
          Submit
        </button>
      </form>
    </div>
  );
}
