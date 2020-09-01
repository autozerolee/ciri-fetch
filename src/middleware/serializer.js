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

export default function serializerMiddleware(ctx, next) {
  if (!ctx) return next();
  const { req: { options = {} } = {} } = ctx;
  const { paramsSerializer, params, data } = options;
  let { req: { url = '' } = {} } = ctx;

  let serializedParams = paramsSerialize(params, paramsSerializer);
  let serializedData = JSON.stringify(data);

  ctx.req.originUrl = url;
  
  if (serializedParams) {
    // 支持参数拼装
    const urlSign = url.indexOf('?') !== -1 ? '&' : '?';
    ctx.req.url = `${url}${urlSign}${serializedParams}`;
  }

  if(serializedData) {
    options.body = serializedData;
  }
  ctx.req.options = options;

  return next();
}