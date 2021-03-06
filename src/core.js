import Onion from './onion';
import { MapCache, mergeRequestOptions } from './util';
import addfixInterceptor from './interceptor/addfix';
import fetchMiddleware from './middleware/fetch';
import parseResponseMiddleware from './middleware/parseResponse';
import requestType from './middleware/requestType';
import serializer from './middleware/serializer';

const globalMiddlewares = [requestType, serializer, parseResponseMiddleware];
const coreMiddlewares = [fetchMiddleware];

Onion.globalMiddlewares = globalMiddlewares;
Onion.defaultGlobalMiddlewaresLength = globalMiddlewares.length;
Onion.coreMiddlewares = coreMiddlewares;
Onion.defaultCoreMiddlewaresLength = coreMiddlewares.length;

class Core {
  constructor(initOptions) {
    this.onion = new Onion([]);
    this.mapCache = new MapCache(initOptions);
    this.initOptions = initOptions;
    this.instReqInterceptors = [addfixInterceptor];
    this.instResInterceptors = [];
  }

  // 无 global interceptor
  static requestUse(handler) {
    if (typeof handler !== 'function') throw new TypeError('Request Interceptor must be function!');
    this.instReqInterceptors.push(handler);
  }

  static responseUse(handler) {
    if (typeof handler !== 'function') throw new TypeError('Response Interceptor must be function!');
    this.instanceResponseInterceptors.push(handler);
  }

  use(newMiddleware, opt = { global: false, core: false }) {
    this.onion.use(newMiddleware, opt);
    return this;
  }

  extendOptions(options) {
    this.initOptions = mergeRequestOptions(this.initOptions, options);
    this.mapCache.extendOptions(options);
  }

  // 执行请求拦截器
  dealRequestInterceptors(ctx) {
    const reducer = (p1, p2) =>
      p1.then((ret = {}) => {
        ctx.req.url = ret.url || ctx.req.url;
        ctx.req.options = ret.options || ctx.req.options;
        return p2(ctx.req.url, ctx.req.options);
      });
    const _interceptors = [...this.instReqInterceptors];
    return _interceptors.reduce(reducer, Promise.resolve()).then((ret = {}) => {
      ctx.req.url = ret.url || ctx.req.url;
      ctx.req.options = ret.options || ctx.req.options;
      return Promise.resolve();
    });
  }

  request(url, options) {
    const ctx = {
      req: { url, options },
      res: null,
      cache: this.mapCache,
      responseInterceptors: [...this.instResInterceptors],
    };
    if (typeof url !== 'string') {
      throw new Error('url MUST be a string');
    }

    return new Promise((resolve, reject) => {
      this.dealRequestInterceptors(ctx)
        .then(() => this.onion.execute(ctx))
        .then(() => {
          resolve(ctx.res);
        })
        .catch(error => {
          const { errorHandler } = ctx.req.options;
          if (errorHandler) {
            try {
              const data = errorHandler(error);
              resolve(data);
            } catch (e) {
              reject(e);
            }
          } else {
            reject(error);
          }
        });
    });
  }
}

export default Core