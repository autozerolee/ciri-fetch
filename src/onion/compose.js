/**
 * 洋葱中间件-组合函数
 * 返回组合了所有中间件的一个全新中间件
 * @param {Array} middlewares
 * @returns {function} (ctx, next) {};
 */
export default function compose(middlewares) {
  if (!Array.isArray(middlewares)) throw new TypeError('Middlewares must be an array!');
  const midwaresLen = middlewares.length;
  for (let i = 0; i < midwaresLen; i++) {
    if (typeof middlewares[i] !== 'function') {
      throw new TypeError('Middleware must be componsed of function');
    }
  }

  return function wrapMiddlewares(ctx, next) {
    let callno = -1;
    const dispatch = function(index) {
      if(callno >= index) { throw new Error('next() should not be called multiple times in one middleware!') }
      callno = index;
      const fn = middlewares[index] || next;
      if(!fn) return Promise.resolve();
      try {
        return Promise.resolve(fn(ctx, () => dispatch(index + 1)));
      }catch(error) {
        return Promise.reject(error)
      }	
    }

    return dispatch(0);
  }
}