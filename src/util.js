const toString = Object.prototype.toString;

const parse = function(url) {
  let start = typeof url === 'string' ? url.indexOf('?') : null;
  if(start == null || start === -1) return null;
  let seg = url.substr(start).replace(/^\?/,'').split('&');
  return seg.reduce((ret, curr) => {
    const [key, value] = curr.split('=')
    if(value) {
      ret[key] = decodeURIComponent(value)
    }
    return ret
  }, {})
}

// 请求异常
export class RequestError extends Error {
  constructor(text, request, type = 'RequestError') {
    super(text);
    this.name = 'RequestError';
    this.request = request;
    this.type = type;
  }
}

// 响应异常
export class ResponseError extends Error {
  constructor(response, text, data, request, type = 'ResponseError') {
    super(text || response.statusText);
    this.name = 'ResponseError';
    this.data = data;
    this.response = response;
    this.request = request;
    this.type = type;
  }
}

// 支持 File GBK
export function readerGBK(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsText(file, 'GBK'); // setup GBK decoding
  });
}

// JSON.parse 捕捉异常
export function safeJsonParse(data, throwErrIfParseFail = false, response = null, request = null) {
  try {
    return JSON.parse(data);
  } catch (e) {
    if (throwErrIfParseFail) {
      throw new ResponseError(response, 'JSON.parse fail', data, request, 'ParseError');
    }
  } // eslint-disable-line no-empty
  return data;
}

// 延时抛出异常
export function timeout2Throw(msec, request) {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new RequestError(`timeout of ${msec}ms exceeded`, request, 'Timeout'));
    }, msec);
  });
}

// If request options contain 'cancelToken', reject request when token has been canceled
export function cancel2Throw(opt) {
  return new Promise((_, reject) => {
    if (opt.cancelToken) {
      opt.cancelToken.promise.then(cancel => {
        reject(cancel);
      });
    }
  });
}

// Check env is browser or node
export function getEnv() {
  let env;
  // Only Node.JS has a process variable that is of [[Class]] process
  if (typeof process !== 'undefined' && toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    env = 'NODE';
  }
  if (typeof XMLHttpRequest !== 'undefined') {
    env = 'BROWSER';
  }
  return env;
}

export function isNotExist(val) {
  return val === null || typeof val === 'undefined';
}

export function isArray(val) {
  return typeof val === 'object' && toString.call(val) === '[object Array]';
}

export function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

export function isDate(val) {
  return typeof val === 'object' && toString.call(val) === '[object Date]';
}

export function isObject(val) {
  return val !== null && toString.call(val) === '[object Object]';
}

export function forEach2ObjArr(target, callback) {
  if (!target) return;

  if (typeof target !== 'object') {
    target = [target];
  }

  if (isArray(target)) {
    for (let i = 0; i < target.length; i++) {
      callback.call(null, target[i], i, target);
    }
  } else {
    for (let key in target) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        callback.call(null, target[key], key, target);
      }
    }
  }
}

export function getParamObject(val) {
  if (isURLSearchParams(val)) {
    return parse(val.toString(), { strictNullHandling: true });
  }
  if (typeof val === 'string') {
    return [val];
  }
  return val;
}

export function reqStringify(obj) {
  let result = [];
  for(let key in obj) {
    if(obj[key] === null) {
      result.push(key);
    }else if(obj[key] === undefined) {
      continue;
    }else {
      result.push(`${key}=${encodeURIComponent(obj[key])}`);
    }
  }
  return result.join('&');
}

export function mergeRequestOptions(options, options2Merge) {
  return {
    ...options,
    ...options2Merge,
    headers: {
      ...options.headers,
      ...options2Merge.headers,
    },
    params: {
      ...getParamObject(options.params),
      ...getParamObject(options2Merge.params),
    },
    method: (options2Merge.method || options.method || 'get').toLowerCase(),
  };
}

// request 简易缓存
export class MapCache {
  constructor(options) {
    this.cache = new Map();
    this.timer = {};
    this.extendOptions(options);
  }

  extendOptions(options) {
    this.maxCache = options.maxCache || 0;
  }

  get(key) {
    return this.cache.get(JSON.stringify(key));
  }

  set(key, value, ttl = 60000) {
    // 如果超过最大缓存数, 删除头部的第一个缓存.
    if (this.maxCache > 0 && this.cache.size >= this.maxCache) {
      // map.keys return Map.Iterator need turn array
      const keys = [...this.cache.keys()];
      const deleteKey = keys[0];
      this.cache.delete(deleteKey);
      if (this.timer[deleteKey]) {
        clearTimeout(this.timer[deleteKey]);
      }
    }
    const cacheKey = JSON.stringify(key);
    this.cache.set(cacheKey, value);
    if (ttl > 0) {
      this.timer[cacheKey] = setTimeout(() => {
        this.cache.delete(cacheKey);
        delete this.timer[cacheKey];
      }, ttl);
    }
  }

  delete(key) {
    const cacheKey = JSON.stringify(key);
    delete this.timer[cacheKey];
    return this.cache.delete(cacheKey);
  }

  clear() {
    this.timer = {};
    return this.cache.clear();
  }
}