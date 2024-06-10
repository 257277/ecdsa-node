import React, { useState } from 'react';

const GenerateKeys = () => {
    const [keys, setKeys] = useState({});
    const [name, setName] = useState("");

    async function generateKeys() {
        try {
            const requestBody = { name };
            const res = await fetch(`http://localhost:3042/generate`, {
                method: "POST",
                body: JSON.stringify(requestBody),
                headers: {
                    "Content-Type": "application/json"
                }
            });
            const data = await res.json();
            if (res.ok) {
                setKeys(data);
            } else {
                if (data.error === 'Please choose another name') {
                    setKeys({});
                    alert(data.error);
                } else {
                    setKeys({});
                    throw new Error('Something went wrong. Please try again after some time!');
                }
            }
        } catch (err) {
            alert(err.message);
        }

    }

    return (
        <div className="container">
            <h1>Generate your keys</h1>
            <p>(And get 100 free coins)</p>
            <input
                placeholder='Enter your name'
                value={name}
                onChange={(e) => setName(e.target.value.trim())}
            /><br/>
            <input
                type="submit"
                className="button"
                value="Generate"
                onClick={generateKeys}
            /><br/>
            <p>Your Private key: {keys.hexPrivateKey}</p>
            <p>Your Public Key: {keys.hexPublicKey}</p>
        </div>
    );
};

export default GenerateKeys;
