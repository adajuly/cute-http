var axios = require('axios').default;
var cst = require('./const');
var conf = require('./config');
var util = require('./util');
var cache = require('./cache');
var jsonpAdapter = require('axios-jsonp');


function _retry(fn, args, retryCount, remainRetryCount, cb) {
  if (remainRetryCount === 0) {
    var err = new Error('fetch data failed after retry:' + retryCount + ' times!');
    err.code = cst.ERR_FETCH_FAILED_AFTER_RETRY;
    if(conf.getConfig().debug === true){
      console.debug('重试结束，最终还是没有拿到结果');
    }
    return cb(err);
  } 
  fn.apply(null, args).then(reply => {
    cb(null, reply);
  }).catch(err => {
    if (util.isTimeout(err)) {
      if(conf.getConfig().debug === true){
        console.debug('第'+retryCount+'连接已超时，cute将继续重试');
      }
      return _retry(fn, args, retryCount, --remainRetryCount, cb);
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

  var defaultConfig = conf.getConfig();
  //如果用户没有传入timeout, 使用默认配置的timeout
  if (axiosConfig.timeout === undefined) {
    axiosConfig.timeout = conf.getConfig().timeout;
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
    callbackParamName:callbackParamName,
  }
}

function _callAxiosApi(method, args, conf, resolve, reject) {
  var retryCount = conf.retryCount;
  _retry(axios[method], args, retryCount, retryCount, (err, reply) => {
    err ? reject(err) : resolve(reply);
  });
}

/**
 * 目前只针对get请求做缓存
 */
function _get(url, conf) {
  var result = cache.getResult(conf.cacheType);
  if (result) {
    Promise.resolve(result);
  } else {
    return new Promise((resolve, reject) => {
      _callAxiosApi('get', [url, conf.axiosConfig], conf, resolve, reject);
    });
  }
}

function _post(url, postBody, conf){
  return new Promise((resolve, reject) => {
    _callAxiosApi('post', [url, postBody, conf.axiosConfig], conf, resolve, reject);
  });
}

//@see https://github.com/AdonisLau/axios-jsonp
function _jsonp(url, conf) {
  const retryCount = conf.retryCount;
  return new Promise((resolve, reject) => {
    _retry(axios, {
      url: url, adapter: jsonpAdapter, callbackParamName: conf.callbackParamName, // optional, 'callback' by default
    }, retryCount, retryCount, (err, reply) => {
      err ? reject(err) : resolve(reply);
    });
  });
}

/**
 * 发起多个get请求
 * @param {string} url
 * @param {{failStrategy:number, retryCount:number, cacheType:null|'memory'|'localStorage', [otherAxiosConfigKey]:any}} extendedAxiosConfig 
 */
function get(url, extendedAxiosConfig) {
  var conf = _makeConfig(extendedAxiosConfig);
  return _get(url, conf);
}

/**
 * 发起单个post请求
 * @param {string} url 
 * @param {object} postBody 
 * @param {{failStrategy?:number, retryCount?:number, [otherAxiosConfigKey]:any}} extendedAxiosConfig 
 */
function post(url, postBody, extendedAxiosConfig){
  var conf = _makeConfig(extendedAxiosConfig);
  return _post(url, postBody, conf);
}

/**
 * 发起多个get请求
 * @param {string[]} urls 
 * @param {{failStrategy?:number, retryCount?:number, cacheType?:null|'memory'|'localStorage', [otherAxiosConfigKey]:any}} extendedAxiosConfig 
 */
function multiGet(urls, extendedAxiosConfig) {
  var conf = _makeConfig(extendedAxiosConfig);
  var getTasks = urls.map(function (url) {
    if (conf.failStrategy === cst.KEEP_ALL_BEEN_EXECUTED) {
      return _get(url, conf).catch(function (err) { return err; })
    } else {
      return _get(url, conf);
    }
  });
  return Promise.all(getTasks);
}

/**
 * 发起多个post请求
 * @param {{url:string, body:object}[]} items 
 * @param {{failStrategy?:number, retryCount?:number, [otherAxiosConfigKey]:any}} extendedAxiosConfig 
 */
function multiPost(items, extendedAxiosConfig) {
  var conf = _makeConfig(extendedAxiosConfig);
  var postTasks = items.map(function (item) {
    var url = item.url;
    var body = item.body;
    if (conf.failStrategy === cst.KEEP_ALL_BEEN_EXECUTED) {
      return _post(url, body, conf).catch(function (err) { return err; })
    } else {
      return _post(url, body, conf);
    }
  });
  return Promise.all(postTasks);
}

function jsonp(url, extendedAxiosConfig) {
  var conf = _makeConfig(extendedAxiosConfig);
  return _jsonp(url, conf);
}

/**
 * 发起多个post请求
 * @param {string} urls 
 * @param {{failStrategy?:number, retryCount?:number, callbackParamName?:string, [otherAxiosConfigKey]:any}} extendedAxiosConfig 
 */
function multiJsonp(urls, extendedAxiosConfig) {
  var conf = _makeConfig(extendedAxiosConfig);
  var jsonpTasks = urls.map(function (url) {
    if (conf.failStrategy === cst.KEEP_ALL_BEEN_EXECUTED) {
      return _jsonp(url, conf).catch(function (err) { return err; })
    } else {
      return _jsonp(url, conf);
    }
  });
  return Promise.all(jsonpTasks);
}

/**
 * 发起多个post请求
 * @param {Array<{type:'post', url:string, body:object} | {type:'get', url:string} | {type:'jsonp', url:string} >} items 
 * @param {{failStrategy?:number, retryCount?:number, callbackParamName?:string, [otherAxiosConfigKey]:any}} extendedAxiosConfig 
 */
function multi(items, extendedAxiosConfig){
  var conf = _makeConfig(extendedAxiosConfig);
  var tasks = items.forEach(function (item) {
    var task;
    var type = item.type;
    var url = item.url;

    if (conf.failStrategy === cst.KEEP_ALL_BEEN_EXECUTED) {
      if(type === 'get') task = _get(url, conf).catch(function (err) { return err; });
      else if(type==='post')task = _post(url, item.body, conf).catch(function (err) { return err; });
      else if(type === 'jsonp')task = _jsonp(url, conf).catch(function (err) { return err; });
    } else {
      if(type === 'get') task = _get(url, conf);
      else if(type==='post')task = _post(url, item.body, conf);
      else if(type === 'jsonp')task = _jsonp(url, conf);
    }
    return task;
  });
  return Promise.all(tasks);
}

module.exports = {
  get: get,
  multiGet: multiGet,
  post: post,
  multiPost: multiPost,
  jsonp: jsonp,
  multiJsonp: multiJsonp,
  multi: multi,
  axios: axios,
  const: cst,
  setConfig: conf.setConfig,
  getConfig: conf.getConfig,
};