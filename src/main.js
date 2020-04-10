var axios = require('axios').default;
var cst = require('./const');
var cuteConf = require('./config');
var util = require('./util');
var cache = require('./cache');
var jsonpAdapter = require('axios-jsonp');

function _verifyResponseData(url, data){
  var config = cuteConf.getConfig();
  var dataVerifyRule = config.dataVerifyRule;
  var path_dataVerifyRule_ = config.pathDataVerifyRule;

  var path = util.getPath(url);
  var pathDataRule = path_dataVerifyRule_[path]
  var rule = pathDataRule || dataVerifyRule;
  var errMessage = '';
  if (rule) {
    var keys = Object.keys(rule);
    keys.forEach(key => {
      if (!data.hasOwnProperty(key)) {
        return errMessage += 'no key[' + key + '] defined in data;';
      }
      var expectedType = rule[key];
      var actualType = typeof data[key];
      if (expectedType !== actualType) {
        errMessage += 'key[' + key + '] type error, expected to be ' + expectedType + ' but actually it is ' + actualType;
      }
    });
  }
  if(errMessage){
    var err = new Error(errMessage);
    err.code = cst.ERR_RESPONSE_DATA_TYPE_INVALID;
    throw err;
  }
}

function _retry(fn, args, conf, remainRetryCount, cb) {
  var retryCount = conf.retryCount;
  var config = cuteConf.getConfig();

  if (remainRetryCount === 0) {
    var err = new Error('fetch data failed after retry:' + retryCount + ' times!');
    err.code = cst.ERR_FETCH_FAILED_AFTER_RETRY;
    if (config.debug === true) {
      console.debug('重试结束，最终还是没有拿到结果');
    }
    return cb(err);
  }

  fn.apply(null, args).then(reply => {
    try {
      var url = args[0];
      var cacheType = conf.cacheType;
      _verifyResponseData(url, reply.data);

      if (cacheType === cst.LOCAL_STORAGE) {
        cache.setResultToLocalStorage(url, reply);
      } else if (cacheType === cst.MEMORY) {
        cache.setResultToMemory(url, reply);
      }

      cb(null, reply);
    } catch (err) {
      cb(err);
    }
  }).catch(err => {
    if (util.isTimeout(err)) {
      if (config.debug === true) {
        console.debug('第' + remainRetryCount + '连接已超时，cute将继续重试');
      }
      return _retry(fn, args, conf, --remainRetryCount, cb);
    }
    cb(err);
  });
}

/**
 * 使用用户传入的配置，结合当前默认的配置，为该次请求生成一个合适的配置对象
 */
function _makeConfig(userInputAxiosConfig) {
  var axiosConfig = {};
  if (userInputAxiosConfig) {
    axiosConfig = userInputAxiosConfig;
  }

  var defaultConfig = cuteConf.getConfig();
  //如果用户没有传入timeout, 使用默认配置的timeout
  if (axiosConfig.timeout === undefined) {
    axiosConfig.timeout = cuteConf.getConfig().timeout;
  }

  var retryCount = defaultConfig.retryCount;
  if (axiosConfig.retryCount !== undefined) {
    retryCount = axiosConfig.retryCount;
    delete axiosConfig.retryCount;
  }

  var failStrategy = defaultConfig.failStrategy;
  if (axiosConfig.failStrategy !== undefined) {
    failStrategy = axiosConfig.failStrategy;
    delete axiosConfig.failStrategy;
  }

  var cacheType = defaultConfig.cacheType;
  if (axiosConfig.cacheType !== undefined) {
    cacheType = axiosConfig.cacheType;
    delete axiosConfig.cacheType;
  }

  var callbackParamName = defaultConfig.callbackParamName;
  if (axiosConfig.callbackParamName !== undefined) {
    callbackParamName = axiosConfig.callbackParamName;
    delete axiosConfig.callbackParamName;
  }

  return {
    axiosConfig: axiosConfig,
    retryCount: retryCount,
    failStrategy: failStrategy,
    cacheType: cacheType,
    callbackParamName: callbackParamName,
  }
}

function _callAxiosApi(method, args, conf, resolve, reject) {
  var retryCount = conf.retryCount;
  _retry(axios[method], args, conf, retryCount, (err, reply) => {
    err ? reject(err) : resolve(reply);
  });
}

function _pomisedCallAxiosApi(method, args, conf) {
  return new Promise((resolve, reject) => {
    _callAxiosApi(method, args, conf, resolve, reject);
  });
}



var helper = {
  /** 目前只针对get请求做缓存 */
  get: function (url, data, conf) {
    var result = cache.getResult(conf.cacheType);
    if (result) {
      return Promise.resolve(result);
    } else {
      return _pomisedCallAxiosApi('get', [util.appendDataToUrl(url, data), conf.axiosConfig], conf);
    }
  },
  del: function (url, data, conf) {
    return _pomisedCallAxiosApi('delete', [util.appendDataToUrl(url, data), conf.axiosConfig], conf);
  },
  // conf 参数放第二位，方便和get del统一，动态调用时，参数顺序可以保持一致
  post: function (url, body, conf) {
    return _pomisedCallAxiosApi('post', [url, body, conf.axiosConfig], conf);
  },
  patch: function (url, body, conf) {
    return _pomisedCallAxiosApi('patch', [url, body, conf.axiosConfig], conf);
  },
  put: function (url, body, conf) {
    return _pomisedCallAxiosApi('put', [url, body, conf.axiosConfig], conf);
  },
  jsonp: function (url, data, conf) {
    const retryCount = conf.retryCount;
    const _url = util.appendDataToUrl(url, data);
    return new Promise((resolve, reject) => {
      _retry(axios, {
        url: _url, adapter: jsonpAdapter, callbackParamName: conf.callbackParamName, // optional, 'callback' by default
      }, conf, retryCount, (err, reply) => {
        err ? reject(err) : resolve(reply);
      });
    });
  }
}


/**
 * 发起单个get请求
 * @param {string} url
 * @param {string | object} data
 * @param {{failStrategy:number, retryCount:number, cacheType:null|'memory'|'localStorage', [otherAxiosConfigKey]:any}} extendedAxiosConfig 
 */
function get(url, data, extendedAxiosConfig) {
  var conf = _makeConfig(extendedAxiosConfig);
  return helper.get(url, data, conf);
}

/**
 * 发起单个delete请求
 * @param {*} url 
 * @param {string | object} data
 * @param {*} extendedAxiosConfig 
 */
function del(url, data, extendedAxiosConfig) {
  var conf = _makeConfig(extendedAxiosConfig);
  return helper.del(url, data, conf);
}

/**
 * 发起单个put请求
 * @param {string} url
 * @param {object} body 
 * @param {{failStrategy?:number, retryCount?:number, [otherAxiosConfigKey]:any}} extendedAxiosConfig 
 */
function put(url, body, extendedAxiosConfig) {
  var conf = _makeConfig(extendedAxiosConfig);
  return helper.put(url, body, conf);
}

/**
 * 发起单个post请求
 * @param {string} url 
 * @param {object} body 
 * @param {{failStrategy?:number, retryCount?:number, [otherAxiosConfigKey]:any}} extendedAxiosConfig 
 */
function post(url, body, extendedAxiosConfig) {
  var conf = _makeConfig(extendedAxiosConfig);
  return helper.post(url, body, conf);
}

/**
 * 发起单个patch请求
 * @param {string} url 
 * @param {object} body 
 * @param {{failStrategy?:number, retryCount?:number, [otherAxiosConfigKey]:any}} extendedAxiosConfig 
 */
function patch(url, body, extendedAxiosConfig) {
  var conf = _makeConfig(extendedAxiosConfig);
  return helper.patch(url, body, conf);
}

/**
 *
 * @param {*} reqMethod
 * @param {{url:string, data:string|object}} reqItems
 * @param {*} extendedAxiosConfig
 */
function _multiReq(reqMethod, reqItems, extendedAxiosConfig) {
  var conf = _makeConfig(extendedAxiosConfig);
  var reqTasks = reqItems.map(function (item) {
    if (conf.failStrategy === cst.KEEP_ALL_BEEN_EXECUTED) {
      return helper[reqMethod](item.url, item.data, conf).catch(function (err) { console.log('err:', err); return err; })
    } else {
      return helper[reqMethod](item.url, item.data, conf);
    }
  });
  return Promise.all(reqTasks);
}

/**
 * 发起多个get请求
 * @param {string[] | {url:string, data:string|object}[]} items 
 * @param {{failStrategy?:number, retryCount?:number, cacheType?:null|'memory'|'localStorage', [otherAxiosConfigKey]:any}} extendedAxiosConfig 
 */
function multiGet(items, extendedAxiosConfig) {
  const reqItems = util.transformToReqItems(items);
  return _multiReq('get', reqItems, extendedAxiosConfig);
}

/**
 * 发起多个delete请求
 * @param {string[] | {url:string, data:string|object}[]} items 
 * @param {{failStrategy?:number, retryCount?:number, cacheType?:null|'memory'|'localStorage', [otherAxiosConfigKey]:any}} extendedAxiosConfig 
 */
function multiDel(items, extendedAxiosConfig) {
  const reqItems = util.transformToReqItems(items);
  return _multiReq('del', reqItems, extendedAxiosConfig);
}

/**
 * 发起多个post请求
 * @param {{url:string, body:object}[]} items 
 * @param {{failStrategy?:number, retryCount?:number, [otherAxiosConfigKey]:any}} extendedAxiosConfig 
 */
function multiPost(items, extendedAxiosConfig) {
  return _multiReq('post', items, extendedAxiosConfig);
}

function multiPatch(items, extendedAxiosConfig) {
  return _multiReq('patch', items, extendedAxiosConfig);
}

function multiPut(items, extendedAxiosConfig) {
  return _multiReq('put', items, extendedAxiosConfig);
}

function jsonp(url, extendedAxiosConfig) {
  var conf = _makeConfig(extendedAxiosConfig);
  return _jsonp(url, conf);
}

/**
 * 发起多个jsonp请求
 * @param {{url:string, body:object}[]} items 
 * @param {{failStrategy?:number, retryCount?:number, callbackParamName?:string, [otherAxiosConfigKey]:any}} extendedAxiosConfig 
 */
function multiJsonp(urls, extendedAxiosConfig) {
  return _multiReq('jsonp', items, extendedAxiosConfig);
}

/**
 * 发起多个不同类型请求
 * @param {Array<{type:'post', url:string, data:object} | {type:'get', url:string} | {type:'jsonp', url:string} >} items 
 * @param {{failStrategy?:number, retryCount?:number, callbackParamName?:string, [otherAxiosConfigKey]:any}} extendedAxiosConfig 
 */
function multi(items, extendedAxiosConfig) {
  var conf = _makeConfig(extendedAxiosConfig);
  var tasks = items.map(function (item) {
    var task;
    var type = item.type;
    var url = item.url;
    var data = item.data;

    if(helper[type]){
      task = helper[type](url, data, conf).catch(function (err) { return err; });
    }else{
      throw new Error('type[' + type + '] is not supported currently');
    }
    return task;
  });
  return Promise.all(tasks);
}

/**
 * 发起请求
 * @param {{method:string, url:string, option:ExtendedAxiosConfig, body?:object}} spec 
 */
function request(spec) {
  var body = spec.body;
  var extendedAxiosConfig = spec.option;
  var conf = _makeConfig(extendedAxiosConfig);

  var args = [url];
  if (body) args.push(body);
  args.push(conf.axiosConfig);
  return _pomisedCallAxiosApi(spec.method, args, conf);
}

/**
 * 发起多个请求
 * @param {{method:string, url:string, option:ExtendedAxiosConfig, body?:object}[]} specList 
 * @param {{failStrategy:1 | 2}} option? 
 */
function multiRequest(specList, option) {
  const failStrategy = option && option.failStrategy;
  var tasks = specList.map(function (spec) {
    if (failStrategy === cst.KEEP_ALL_BEEN_EXECUTED) {
      return request(spec).catch(function (err) { console.log('err:', err); return err; })
    } else {
      return request(spec);
    }
  });
  return Promise.all(tasks);
}

module.exports = {
  multiRequest: multiRequest,
  request: request,
  get: get,
  multiGet: multiGet,
  del: del,
  multiDel: multiDel,
  put: put,
  multiPut: multiPut,
  post: post,
  multiPost: multiPost,
  patch: patch,
  multiPatch: multiPatch,
  jsonp: jsonp,
  multiJsonp: multiJsonp,
  multi: multi,
  axios: axios,
  const: cst,
  setConfig: cuteConf.setConfig,
  getConfig: cuteConf.getConfig,
};