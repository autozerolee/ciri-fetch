import compose from './compose';

/** 
 * 中间件挂载对象
 * 1. global middleware
 * 2. core middleware
 * 3. default middleware
 * 4. inst middleware
 */
class Onion {
  constructor(defaultMiddlewares) {
    if (!Array.isArray(defaultMiddlewares)) throw new TypeError('Default middlewares must be an array!');
    this.defaultMiddlewares = [...defaultMiddlewares];
    this.middlewares = [];
  }

  static globalMiddlewares = []; // 全局中间件
  static globalMiddlewaresLength = 0; // 内置全局中间件长度
  static coreMiddlewares = []; // 内核中间件
  static coreMiddlewaresLength = 0; // 内置内核中间件长度

  use(newMiddleware, opts = { global: false, core: false, defaultInstance: false }) {
    let global = false;
    let core = false;
    let defaultInstance = false;

    if (global) {
      Onion.globalMiddlewares.splice(
        Onion.globalMiddlewares.length - Onion.defaultGlobalMiddlewaresLength,
        0,
        newMiddleware
      );
      return;
    }

    if(core) {
      Onion.coreMiddlewares.splice(Onion.coreMiddlewares.length - Onion.defaultCoreMiddlewaresLength, 0, newMiddleware);
      return;
    }

    if (defaultInstance) {
      this.defaultMiddlewares.push(newMiddleware);
      return;
    }

    this.middlewares.push(newMiddleware);
  }

  execute(params = null) {
    const fn = compose([
      ...this.middlewares,
      ...this.defaultMiddlewares,
      ...Onion.globalMiddlewares,
      ...Onion.coreMiddlewares,
    ]);
    return fn(params);
  }
}

export default Onion;