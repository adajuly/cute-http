
const cst = require('./const');
const util = require('./util');


const url_cachedResult_ = {};
const hostPath_prevUrl_ = {};

/**
 * 返回传入url的前一个相同hostPath的url
 */
function _getAndRefreshPrevUrl(url) {
  const hostPath = util.removeQuery(url);
  const prevUrl = hostPath_prevUrl_[hostPath];
  hostPath_prevUrl_[hostPath] = url;
  return prevUrl;
}

/**
 * 缓存结果到localStorage里
 * 同时会将url同path的前一个url的缓存结果删掉，换言之，就是对同一个host/path?xxx 的请求只缓存最近的一次返回结果
 */
exports.setResultToLocalStorage= function(url, result) {

  //将同一个hostPath的前一次缓存结果清除掉
  const prevUrl = _getAndRefreshPrevUrl(url);
  if (prevUrl) localStorage.removeItem(prevUrl);

  try {
    localStorage.setItem(url, JSON.stringify(result));
  } catch (err) {
    //因为localStorage的容量限制，可能set失败
    console.error('[setResultToLocalStorage] ', err);
  }
}

/**
 * 缓存结果到内存里，对同一个host/path?xxx 的请求只缓存最近的一次返回结果
 */
exports.setResultToMemory = function(url, result) {
  //将同一个hostPath的前一次缓存结果清除掉
  const prevUrl = _getAndRefreshPrevUrl(url);
  delete url_cachedResult_[prevUrl];
  url_cachedResult_[url] = result;
}

exports.getResultFromLocalStorage = function(url) {
  const resultStr = localStorage.getItem(url);
  try {
    return JSON.parse(resultStr);
  } catch (err) {
    return null;
  }
}

exports.getResultFromMemory = function(url) {
  const cachedResult = url_cachedResult_[url];
  return cachedResult || null;
}

exports.getResult = function(url, cacheType) {
  if (cacheType === cst.MEMORY) {
    return exports.getResultFromMemory(url);
  } else if (cacheType === cst.ONE_ERROR_ABORT_ALL) {
    return exports.getResultFromLocalStorage(url);
  }else{
    return null;
  }
}

