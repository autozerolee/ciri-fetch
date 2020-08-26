
import forge from "node-forge";

const publicKey = "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0IFgGUpwipWFy9isfYtP\nyrArl8msAs/9srHPpc+GGUgoauRxrrj8QFhC/IOczj2P5yHymMMz+0Tb6M3D+eB0\nNeVhrOkVWqybkrFkqO5Vklbgm8YNwCYyKyIZOt8y4b5eYQNTB1xL4AjSAe1oRmm7\nWWiGrATEhaLspZZwL3ndMBUS+cwe58pfIoLu+Wxr5bNCO1KkY1JkgI3W3exEeWfV\nv5XeKNAkTMHS7b1gfB7Ww2aPcUh+rUaUAbYtl9q0Ja/65qhekjkjMih7JJ4+0Eej\nYc9GgWhFl8Pv9COvAEY3yHbwq2rYeREp1MjjeisxwiQFYicwCFg4CjCQShkP0W2n\neQIDAQAB\n-----END PUBLIC KEY-----";

export default class Crypto {
  constructor(pubkey) {
    this.key = forge.random.getBytesSync(16);
    this.token = null;
    this.pubkey = pubkey || publicKey;
  }
  /**
   * encrypt by aes.
   * @param {String} message
   * @returns {String} encrypted hex string.
   */
  encryptByAes(message) {
    const cipher = forge.cipher.createCipher('AES-ECB', this.key)
    cipher.start();
    cipher.update(forge.util.createBuffer(message));
    cipher.finish();
    return cipher.output.toHex();
  }

  /**
   * decrypt by aes.
   * @param {String} message hex string.
   * @returns {String} decrypted string.
   */
  decryptByAes(message) {
    const encrypted = forge.util.hexToBytes(message);
    const decipher = forge.cipher.createDecipher('AES-ECB', this.key);
    decipher.start();
    decipher.update(forge.util.createBuffer(encrypted));
    decipher.finish();
    return decipher.output.toString();
  }

  /**
   * encrypt by rsa.
   * @returns {String} encrypted hex string.
   */
  encryptByRsa() {
    const pki = forge.pki;
    const publicKey = pki.publicKeyFromPem(this.pubkey);
    const message = JSON.stringify({
      timestamp: new Date().getTime(),
      token: this.token,
      key: forge.util.bytesToHex(this.key)
    });
    return forge.util.bytesToHex(publicKey.encrypt(message));
  }
}