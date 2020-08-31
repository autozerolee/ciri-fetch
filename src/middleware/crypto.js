
import forge from "node-forge";
import { safeJsonParse } from "../util";

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
      timestamp: new Date().valueOf(),
      token: this.token,
      key: forge.util.bytesToHex(this.key)
    });
    return forge.util.bytesToHex(publicKey.encrypt(message));
  }
}

function cryptoMiddleware(ctx, next) {
  const { req: { options = {} } = {} } = ctx;

  const cipher = new Crypto();
  options.headers.Authorization = cipher.encryptByRsa();

  if(options.body) {
    options.body = cipher.encryptByAes(options.body);
  }

  ctx.req.options = options;

  return next()
    .then(() => {
      const { res: { data, response } } = ctx;
      const authorzation = response.headers.get('Authorization');
      const signature = response.headers.get('X-Signature');

      if(authorzation) {
        cipher.token = cipher.decryptByAes(authorzation);
      }else {
        let error = new Error('Response Header Authorization isn\'t exist.');
        throw error;
      }
      
      if(signature) {
        const decipher = cipher.decryptByAes(data);
        const resData = safeJsonParse(decipher);
        ctx.res = resData;
        return;
      }else {
        ctx.res = data;
        return;
      }
    })
}