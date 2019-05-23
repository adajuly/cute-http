var conf = require('./config');

exports.removeQuery = function (url) {
  var idx = url.indexOf('?');
  if (idx >= 0) {
    return url.substr(0, idx);
  }
  return url;
}

// http://www.baidu.com/app/version?t=22 ---> /app/version
exports.getPath = function(url){
  var config = conf.getConfig();
  var path = exports.removeQuery(url);
  var doubleSlashIndex = path.indexOf('//');

  //截掉协议头
  if(doubleSlashIndex>-1){
    path = path.substr(doubleSlashIndex+1);
  }

  if(config.ignoreHost){
    var firstSlashIdx = path.indexOf('/');
    path = path.substr(firstSlashIdx);
  }
  
  //暂时不考虑#的情况，api请求不需要虚拟路由

  return path;
}

exports.isTimeout = function (error) {
  // error.code === 'ECONNABORTED' && error.message.indexOf('timeout') !== -1
  return error.message.indexOf('timeout') !== -1;
}