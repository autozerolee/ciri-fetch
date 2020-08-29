import Cancel from './cancel';

class CancelToken {
  constructor(executor) {
    if (typeof executor !== 'function') {
      throw new TypeError('executor must be a function.');
    }

    let resolvePromise;
    this.promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    let token = this;
    executor(function(message) {
      if(token.reason) return; // 取消已经被调用
      token.reason = new Cancel(message);
      resolvePromise();
    })
  }

  // 通过 source 来返回 CancelToken 实例和取消 CancelToken 的函数
  static source = function() {
    let cancel;
    let token = new CancelToken((msg) => { cancel = msg });
    return { token, cancel };
  }

  // 如果请求已经被取消
  throwIfRequested() {
    if (this.reason) {
      throw this.reason;
    }
  }
}

export default CancelToken;