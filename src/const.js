
exports.LOCAL_STORAGE = 'localStorage';

exports.MEMORY = 'memory';

exports.ERR_FETCH_FAILED_AFTER_RETRY = 10000;
exports.ERR_RESPONSE_DATA_TYPE_INVALID = 10001;

//多个请求里，错误处理策略
exports.ONE_ERROR_ABORT_ALL = 1;//一个报错，终端所有的请求
exports.KEEP_ALL_BEEN_EXECUTED = 2;//一个报错，不影响其他的请求，调用者需要自己处理返回的错误
