const readline = require("readline");
const secp = require('ethereum-cryptography/secp256k1');
const { keccak256 } = require("ethereum-cryptography/keccak");
const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function signMessage(hexPrivateKey, utf8Msg) {
    return secp.sign(keccak256(utf8ToBytes(utf8Msg)), hexPrivateKey, { recovered: true });
}

function getAddress(publicKey) {
    let h = keccak256(publicKey.slice(1))
    return h.slice(h.length-20)
}

(async () => {
    let [hexPrivateKey, utf8Msg] = process.argv.slice(2);
    let [sig, r] = await signMessage(hexPrivateKey, utf8Msg);
    console.log("sig: ", toHex(sig));
    console.log("r: ", r);
    pub = secp.recoverPublicKey(keccak256(utf8ToBytes(utf8Msg)), toHex(sig), r)
    console.log("pub: ", toHex(pub))
    console.log(toHex(getAddress(pub)))
    process.exit()
})();