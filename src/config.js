
var cst = require('./const');

var runtimeConfig = {
  debug:false,
  retryCount: 3, 
  timeout: 6000,
  cacheType: null, // 'memory' | 'localStorage'
  // failStrategy: cst.KEEP_ALL_BEEN_EXECUTED,//针对multiGet 或者 multiPost 并行请求的失败策略
}
var configKeys = Object.keys(runtimeConfig);
var isSetConfig = false;

exports.setConfig = function(config){
  if(isSetConfig===true){
    throw new Error('setConfig can only been called one time');
  }
  configKeys.forEach(key=>{
    if(config.hasOwnProperty(key)){
      runtimeConfig[key] = config[key];
    }
  });
  isSetConfig = true;
}

exports.getConfig = function(){
  return runtimeConfig;
}
