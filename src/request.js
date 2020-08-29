import Core from './core';
import Cancel from './cancel/cancel.js';
import CancelToken from './cancel/cancelToken';
import { mergeRequestOptions } from './util';

// 在 core 的基础上包装一层，处理cancel，添加语法糖
const request = function(initOptions = {}) {
  const coreInstance = new Core(initOptions);
  const fetchInst = (url, options = {}) => {
    const mergeOptions = mergeRequestOptions(coreInstance.initOptions, options);
    return coreInstance.request(url, mergeOptions);
  };

  // 中间件
  fetchInst.use = coreInstance.use.bind(coreInstance);
  fetchInst.middlewares = coreInstance.onion.middlewares;

  // 拦截器
  fetchInst.interceptors = {
    request: {
      use: Core.requestUse.bind(coreInstance),
    },
    response: {
      use: Core.responseUse.bind(coreInstance),
    },
  };

  // 请求语法糖： reguest.get request.post ……
  const METHODS = ['get', 'post', 'delete', 'put', 'patch', 'head', 'options', 'rpc'];
  METHODS.forEach(method => {
    fetchInst[method] = (url, options) => fetchInst(url, { ...options, method });
  });

  fetchInst.Cancel = Cancel;
  fetchInst.CancelToken = CancelToken;

  fetchInst.extendOptions = coreInstance.extendOptions.bind(coreInstance);

  return fetchInst;
}

/**
 * initOpions 初始化参数
 * @param {number} maxCache 最大缓存数
 * @param {string} prefix url前缀
 * @param {function} errorHandler 统一错误处理方法
 * @param {object} headers 统一的headers
 */
export const extend = initOptions => request(initOptions);

export const fetch = request({ parseResponse: false });

export default request({});