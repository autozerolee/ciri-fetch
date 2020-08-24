export const stringifyParams = function(json) {
  if(isObject(json)) {
    return Object.keys(json).map((key) => {
      return json[key] != null ? `${key}=${encodeURIComponent(json[key])}` : key;
    }).join('&');
  }else {
    return ''
  }
}

export const parseParams = function(url) {
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

function isObject (obj) {
  return Object.prototype.toString.call(obj) === '[object Object]'
} 