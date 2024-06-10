import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { generateRandomPrivateKey } from "./generate.mjs";
import * as fs from 'fs/promises';
import { keccak256 } from "ethereum-cryptography/keccak";
import { utf8ToBytes } from "ethereum-cryptography/utils";
import { toHex } from "ethereum-cryptography/utils";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { sha256 } from "ethereum-cryptography/sha256.js";
const app = express();
app.use(bodyParser.json());

const port = 3042;


app.use(cors());
app.use(express.json());

let data = await fs.readFile('./data/keys.txt', 'utf8');
let info = JSON.parse(data);
app.get("/balance/:address", async (req, res) => {
  const { address } = req.params;
  data = await fs.readFile('./data/keys.txt', 'utf8')
  info = JSON.parse(data);
  let senderInfo = info.info.filter((item) => {

    return item.privateKey == address;
  })
  console.log("========>", senderInfo);
  const balance = senderInfo[0].balance || 0;
  const privatekey = senderInfo[0].privateKey;
  console.log(balance);
  res.send({ balance, privatekey });
});

app.post("/send", async (req, res) => {

  const { sender, recipient, amount, signature, recoveryBit } = req.body;

  const message = sender + recipient + amount
  const messageLength = message.length.toString();
  const formattedMessage = "\x19Ethereum Signed Message:\n" + messageLength + message;
  const messageHash = hashMessage(formattedMessage);
  let sig = secp256k1.sign(messageHash, sender);

  const recovered = secp256k1.verify(sig, messageHash, toHex(secp256k1.getPublicKey(sender)));

  if (!recovered) {
    return res.status(400).send({ message: "Invalid signature" });
  }

  let senderInfo;
  let receiverInfo;
  info.info.filter((item) => {
    if (item.publicKey == toHex(secp256k1.getPublicKey(sender))) {
      senderInfo = item;
    }
    if (item.publicKey == recipient) {
      receiverInfo = item;
    }
  })
  let balance = 0;
  if (senderInfo.balance < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    info.info.map((item) => {
      if (item.publicKey == toHex(secp256k1.getPublicKey(sender))) {
        item.balance -= amount;
        balance = item.balance;
      }
      if (item.publicKey == recipient) {
        item.balance += amount;
      }
    })
    await fs.writeFile('./data/keys.txt', JSON.stringify(info, null, 2));
    res.status(200).send({ message: "Transaction Successfull!", balance });
  }
});


app.post("/generate", async (req, res) => {
  console.log("generate");
  try {
    if (req.body.name == "" || req.body == undefined) {
      res.status(400).send({ error: "Please enter a unique name" });
    }
    const result = await generateRandomPrivateKey(req.body.name);
    if (result.error) {
      if (result.error === 'Please choose another name') {
        res.status(400).send({ error: result.error });
      } else {
        res.status(500).send({ error: result.error });
      }
    } else {
      res.send(result);
    }
  } catch (err) {
    res.status(500).send({ error: 'Failed to generate private key' });
  }
});
function hashMessage(message) {
  const bytes = utf8ToBytes(message);
  return keccak256(bytes);
}




app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

