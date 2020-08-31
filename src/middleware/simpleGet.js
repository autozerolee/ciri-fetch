import { isArray, isObject, isURLSearchParams, isDate, isNotExist, forEach2ObjArr, reqStringify } from '../util';

/**
 * 参数序列化
 * @export
 * @param {Object} params
 * @param {function} paramsSerializer
 * @returns
 */
export function paramsSerialize(params, paramsSerializer) {
  let serializedParams;

  if(params) {
    if(paramsSerializer) {
      // 外部传入序列器
      serializedParams = paramsSerializer(params);
    }else if(isURLSearchParams(params)) {
      // URLSearchParams
      serializedParams = params.toString();
    }else {
      if(isArray(params)){
        let arrParams = [];
        forEach2ObjArr(params, function(item) {
          if (isNotExist(item)) {
            arrParams.push(item);
          } else {
            arrParams.push(isObject(item) ? JSON.stringify(item) : item);
          }
        });
        serializedParams = reqStringify(arrParams);
      }else {
        let objParams = {};
        forEach2ObjArr(params, function(value, key) {
          let _objParamsValue = value;
          if (isNotExist(value)) {
            objParams[key] = value;
          } else if (isDate(value)) {
            _objParamsValue = value.valueOf();
          } else if (isArray(value)) {
            _objParamsValue = value.join(',');
          } else if (isObject(value)) {
            _objParamsValue = JSON.stringify(value);
          }
          objParams[key] = _objParamsValue;
        });
        serializedParams = reqStringify(objParams);
      }
    }
  }
  return serializedParams
}

export default function simpleGetMiddleware(ctx, next) {
  if (!ctx) return next();
  const { req: { options = {} } = {} } = ctx;
  const { paramsSerializer, params } = options;
  let { req: { url = '' } = {} } = ctx;
  // 将 method 改为大写
  options.method = options.method ? options.method.toUpperCase() : 'GET';

  // 设置 credentials 默认值为 same-origin，确保当开发者没有设置时，各浏览器对请求是否发送 cookies 保持一致的行为
  // - omit: 从不发送cookies.
  // - same-origin: 只有当URL与响应脚本同源才发送 cookies、 HTTP Basic authentication 等验证信息.(浏览器默认值,在旧版本浏览器，例如safari 11依旧是omit，safari 12已更改)
  // - include: 不论是不是跨域的请求,总是发送请求资源域在本地的 cookies、 HTTP Basic authentication 等验证信息.
  options.credentials = options.credentials || 'same-origin';

  let serializedParams = paramsSerialize(params, paramsSerializer);

  ctx.req.originUrl = url;
  
  if (serializedParams) {
    // 支持参数拼装
    const urlSign = url.indexOf('?') !== -1 ? '&' : '?';
    ctx.req.url = `${url}${urlSign}${serializedParams}`;
  }
  ctx.req.options = options;

  return next();
}