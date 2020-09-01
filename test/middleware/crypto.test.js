import forge from 'node-forge';
import Crypto from '../../src/middleware/crypto';

const pki = forge.pki;

const obj = {name: "tom", age: 16};
let { publicKey, privateKey } = pki.rsa.generateKeyPair({bits: 2048, e: 0x10001});
publicKey = pki.publicKeyToPem(publicKey);

describe("Crypto test.", () => {
  it('AES加密解密', () => {
    const cipher = new Crypto();
    const encrypted = cipher.encryptByAes(JSON.stringify(obj));
    const decrypted = cipher.decryptByAes(encrypted);
    expect(decrypted).toBe(JSON.stringify(obj));
  });

  it('RSA加密，给定token', () => {
    const cipher = new Crypto(publicKey);

    const bytes = forge.random.getBytesSync(16);
    cipher.token = forge.util.bytesToHex(bytes);

    const encrypted = cipher.encryptByRsa(); // is hex so needs to bytes.
    const decrypted = privateKey.decrypt(forge.util.hexToBytes(encrypted));

    const message = JSON.parse(decrypted);
    expect(message.token).toBe(cipher.token);
  })
});