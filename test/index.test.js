import request from '../lib/index';

const host = "http://39.104.88.98:8090/api"

describe('request test', () => {
  describe('Request Header', () => {
    it('set header.Authorization', () => {
    
    });
    it('set header.ContentType', () => {

    });
    it('default header.ContentType', () => {

    })
  });

  describe('Request Params', () => {
    it('get/header', () => {

    });
    it('post/put/patch', () => {

    });
  });

  it('Request Status', () => {

  });

  describe('Response', () => {
    it('header.Authorization and set token', () => {
      if(cipher.auth) {
        // 解密后的token 与 cipher.token 一致
      }else {
        // 抛出异常
      }
    });

    it('header.Xsignature', () => {
      if(signature) {
        // res === forge解密后的数据
      }else {
        // 直接返回一个对象.
      }
    })
  });
})