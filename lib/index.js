import fetch from 'cross-fetch';
import Crypto from './crypto';
import { stringifyParams } from './utils';

/**
 * check respones status.
 * @param {Response} response 
 */
const checkStatus = function(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  return response.text().then(msg => {
    let error = new Error(msg);
    error.response = response;
    throw error;
  })
}

/**
 * decrypt and parse response.
 * @param {Cipher} cipher
 * @param {Response} response
 */
const parseJson = function(cipher, response) {
  const authorzation = response.headers.get('Authorization')
  const signature = response.headers.get('X-Signature')

  if(authorzation) {
    cipher.token = cipher.decryptByAes(authorzation);
  }else {
    let error = new Error('Response Header Authorization isn\'t exist.');
    throw error;
  }

  if(signature) {
    return response.text().then(res => {
      return new Promise((resolve, reject) => {
        try {
          const decipher = cipher.decryptByAes(res)
          resolve(JSON.parse(decipher))
        } catch (error) {
          reject(error)
        }
      })
    })
  }else {
    return response.json();
  }
}

/**
 * request function.
 * @param {String} endpoint request path.
 * @param {Object} options request options.
 */
const request = function(endpoint, options) {
  options = Object.assign({}, options);
  let _params = Object.assign({}, options.body);
  let _headers = Object.assign({}, options.headers)

  const cipher = new Crypto();

  // set headers
  _headers.Authorization = cipher.encryptByRsa();
  if(!_headers['Content-Type'] && options.method === ("POST" || "PATCH" || "PUT")) {
    _headers['Content-Type'] = 'application/x-www-form-urlencoded'
  }
  options.headers = _headers;

  // set params
  if(options.body) {
    if(options.method === "GET" || options.method === "HEAD") {
      endpoint = endpoint + '?' + stringifyParams(_params);
    }else {
      options.body = cipher.encryptByAes(stringifyParams(_params));
    }
  }

  console.log(endpoint, options)
  
  return fetch(endpoint, options)
    .then(checkStatus)
    .then(parseJson.bind(null, cipher))
}

export default request;