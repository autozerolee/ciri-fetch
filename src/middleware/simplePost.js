import { reqStringify, isObject, isArray } from '../util';

export default function simplePostMiddleware(ctx, next) {
  if (!ctx) return next();
  const { req: { options = {} } = {} } = ctx;
  const { method = 'get' } = options;

  if (['post', 'put', 'patch', 'delete'].indexOf(method.toLowerCase()) === -1) {
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
        options.body = JSON.stringify(data);
      }else if(requestType === 'form') {
        options.headers = {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          ...options.headers,
        };
        options.body = reqStringify(data);
      }
    }else {
      options.headers = {
        Accept: 'application/json',
        ...options.headers,
      };
      options.body = data;
    }
  }
  ctx.req.options = options;

  return next();
}