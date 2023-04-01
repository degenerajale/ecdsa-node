const express = require("express");
const { keccak256 } = require("ethereum-cryptography/keccak");


const secp = require('ethereum-cryptography/secp256k1');

const app = express();
const cors = require("cors");
const { utf8ToBytes, toHex } = require("ethereum-cryptography/utils");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "8401bced3d2c67064daa11cdfd8be89acea52eae": 100,
  "ea0753b185dc49ba0058a04e8059f02ee7b1ad44": 50,
  "510d5748a900a091af1bb89413b244207c542a6a": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, signature, recoveryBit, amount } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (badSignature(sender, recipient, signature, recoveryBit, amount)) {
    res.status(400).send({ message: "invalid sig" })
  }
  else if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

function getAddress(publicKey) {
  let h = keccak256(publicKey.slice(1))
  return h.slice(h.length-20)
}

function badSignature(sender, recipient, signature, recoveryBit, amount) {
  // recreate the msg to sign
  toSign = JSON.stringify({ "sendAmount": amount, "recipient": recipient })
  pubKey = secp.recoverPublicKey(keccak256(utf8ToBytes(toSign)), signature, recoveryBit)
  valid = toHex(getAddress(pubKey)) === sender
  return !valid
}
