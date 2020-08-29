/**
 * 中间件组合
 * 返回组合了所有中间件的一个全新中间件
 * 中间件执行校验，Promise传递
 * @param {Array} middlewares
 * @returns Middleware
 */
export default function compose(middlewares) {
  if (!Array.isArray(middlewares)) throw new TypeError('Middlewares must be an array!');
  const midwaresLen = middlewares.length;
  for (let i = 0; i < middlewaresLen; i++) {
    if (typeof middlewares[i] !== 'function') {
      throw new TypeError('Middleware must be componsed of function');
    }
  }

  return function wrapMiddlewares(params, next) {
    let index = -1;
    function dispatch(i) {
      if(i <= index) {
        return Promise.reject(new Error('next() should not be called multiple times in one middleware!'));
      }
      index = i;
      const fn = middlewares[i] || next;
      if (!fn) return Promise.resolve();
      try {
        return Promise.resolve(fn(params, () => dispatch(i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return dispatch(0);
  }
}