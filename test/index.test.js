const forge = require('node-forge');
const pki = forge.pki;
const Crypto = require('../lib/crypto');

const obj = {name: "tom", age: 16};
let { publicKey, privateKey } = pki.rsa.generateKeyPair({bits: 2048, e: 0x10001});
publicKey = pki.publicKeyToPem(publicKey);

describe("Crypto test.", () => {
  it('test aes.', () => {
    const cipher = new Crypto();
    const encrypted = cipher.encryptByAes(JSON.stringify(obj));
    const decrypted = cipher.decryptByAes(encrypted);
    expect(decrypted).toBe(JSON.stringify(obj));
  });

  it('test rsa.', () => {
    const cipher = new Crypto(publicKey);

    const bytes = forge.random.getBytesSync(16);
    cipher.token = forge.util.bytesToHex(bytes);

    const encrypted = cipher.encryptByRsa(); // is hex so needs to bytes.
    const decrypted = privateKey.decrypt(forge.util.hexToBytes(encrypted));

    const message = JSON.parse(decrypted);
    expect(message.token).toBe(cipher.token);
  })
});