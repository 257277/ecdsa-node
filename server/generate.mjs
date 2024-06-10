import crypto from 'crypto';
import { secp256k1 } from 'ethereum-cryptography/secp256k1';
import { toHex } from 'ethereum-cryptography/utils';
import * as fs from 'fs/promises';

export async function generateRandomPrivateKey(name) {
    try {
        const privateKey = crypto.randomBytes(32);
        const hexPrivateKey = toHex(privateKey);

        const publicKey = secp256k1.getPublicKey(privateKey);
        const hexPublicKey = toHex(publicKey);

        const newKey = { name: name.toLowerCase(), privateKey: hexPrivateKey, publicKey: hexPublicKey, balance: 100 };

        let data;
        try {
            data = await fs.readFile('./data/keys.txt', 'utf8');
        } catch (err) {
            if (err.code !== 'ENOENT') {
                throw new Error('Error reading keys file');
            }
        }

        let info = { info: [] };
        if (data) {
            try {
                info = JSON.parse(data);
            } catch (parseErr) {
                throw new Error('Error parsing keys file');
            }
        }

        if (info.info.some((item) => item.name === newKey.name)) {
            return { insert: false, error: 'Please choose another name' };
        }

        info.info.push(newKey);
        try {
            await fs.writeFile('./data/keys.txt', JSON.stringify(info, null, 2));
        } catch (writeErr) {
            throw new Error('Error writing to keys file');
        }

        return { hexPrivateKey, hexPublicKey, insert: true };
    } catch (err) {
        return { error: err.message };
    }
}
