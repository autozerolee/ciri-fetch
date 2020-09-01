import { isObject, isArray } from '../util';

export default function requestTypeMiddleware(ctx, next) {
  if (!ctx) return next();
  const { req: { options = {} } = {} } = ctx;

  // 将 method 改为大写
  options.method = options.method ? options.method.toUpperCase() : 'GET';

  // 设置 credentials 默认值为 same-origin，确保当开发者没有设置时，各浏览器对请求是否发送 cookies 保持一致的行为
  // - omit: 从不发送cookies.
  // - same-origin: 只有当URL与响应脚本同源才发送 cookies、 HTTP Basic authentication 等验证信息.(浏览器默认值,在旧版本浏览器，例如safari 11依旧是omit，safari 12已更改)
  // - include: 不论是不是跨域的请求,总是发送请求资源域在本地的 cookies、 HTTP Basic authentication 等验证信息.
  options.credentials = options.credentials || 'same-origin';
  
  if (['POST', 'PUT', 'PATCH', 'DELETE'].indexOf(options.method) === -1) {
    return next();
  }

  const { requestType = 'json', data } = options;
  if(data) {
    if(isObject(data) || isArray(data)) {
      if(requestType === 'json') {
        options.headers = {
          Accept: 'application/json',
          'Content-Type': 'application/json;charset=UTF-8',
          ...options.headers,
        };
      }else if(requestType === 'form') {
        options.headers = {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          ...options.headers,
        };
      }
    }else {
      options.headers = {
        Accept: 'application/json',
        ...options.headers,
      };
    }
  }
  ctx.req.options = options;

  return next();
}