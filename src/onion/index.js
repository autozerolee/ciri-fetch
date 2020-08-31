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
    this.middlewares = [...defaultMiddlewares];
  }

  static globalMiddlewares = []; // 全局中间件
  static globalMiddlewaresLength = 0; // 内置全局中间件长度
  static coreMiddlewares = []; // 内核中间件
  static coreMiddlewaresLength = 0; // 内置内核中间件长度

  use(newMiddleware, opts = { global: false, core: false }) {
    let global = false;
    let core = false;

    if(typeof opts === 'object' || opts) {
      global = opts.global || false;
      core = opts.core || false;
    }

    if (global) {
      Onion.globalMiddlewares.splice(
        Onion.globalMiddlewares.length - Onion.globalMiddlewaresLength,
        0,
        newMiddleware
      );
      return;
    }

    if(core) {
      Onion.coreMiddlewares.splice(
        Onion.coreMiddlewares.length - Onion.coreMiddlewaresLength, 
        0, 
        newMiddleware
      );
      return;
    }
    this.middlewares.push(newMiddleware);
  }

  /**
   * compose middlewares and execute
   * Ctx.req: { !url: {string}, !options: {object} }
   * Ctx.res: {?object}
   * Ctx.cache: {?<MapCache>}, 
   * Ctx.responseInterceptors: {?function[]}}
   * @param {ctx} ctx
   * @return {function} 
   */
  execute(ctx = null) {
    const fn = compose([
      ...this.middlewares,
      ...Onion.globalMiddlewares,
      ...Onion.coreMiddlewares,
    ]);
    return fn(ctx);
  }
}

export default Onion;