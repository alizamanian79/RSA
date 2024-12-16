import React, { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");

  const handleChange = (setter) => (e) => {
    setter(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Message:", message);
    console.log("Public Key:", publicKey);
    console.log("Private Key:", privateKey);
   
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
