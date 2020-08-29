import { getEnv, readerGBK, safeJsonParse, ResponseError } from '../util';

export default function parseResponseMiddleware(ctx, next) {
  let copy;
  return next()
    .then(() => {
      if (!ctx) return;
      const { res = {}, req = {} } = ctx;
      const {
        options: {
          responseType = 'json',
          charset = 'utf8',
          getResponse = false,
          throwErrIfParseFail = false,
          parseResponse = true,
        } = {},
      } = req || {};

      if(!parseResponse) {return;}
      if (!res || !res.clone) {return;}

      copy = getEnv() === 'BROWSER' ? res.clone() : res;
      copy.useCache = res.useCache || false;

      if(responseType === 'json') {
        return res.text().then(d => safeJsonParse(d, throwErrIfParseFail, copy, req));
      }else if(charset === 'gbk') {
        try {
          return res
            .blob()
            .then(readerGBK)
            .then(d => safeJsonParse(d, false, copy, req));
        } catch (e) {
          throw new ResponseError(copy, e.message, null, req, 'ParseError');
        }
      }
      try {
        // 其他如text, blob, arrayBuffer, formData
        return res[responseType]();
      } catch (e) {
        throw new ResponseError(copy, 'responseType not support', null, req, 'ParseError');
      }
    })
    .then(body => {
      if (!ctx) return;
      const { res = {}, req = {} } = ctx;
      const { options: { getResponse = false } = {} } = req || {};

      if (!copy) {
        return;
      }
      if (copy.status >= 200 && copy.status < 300) {
        // 提供源response, 以便自定义处理
        if (getResponse) {
          ctx.res = { data: body, response: copy };
          return;
        }
        ctx.res = body;
        return;
      }
      throw new ResponseError(copy, 'http error', body, req, 'HttpError');
    })
    .catch(err => {
      if (err instanceof RequestError || err instanceof ResponseError) {
        throw err;
      }
      // 未知错误
      const { req, res } = ctx;
      err.request = err.request || req;
      err.response = err.response || res;
      err.type = err.type || err.name;
      err.data = err.data || undefined;
      throw err;
    })
}