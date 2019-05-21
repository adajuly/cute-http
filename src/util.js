
exports.removeQuery = function (url) {
  var idx = url.indexOf('?');
  if (idx >= 0) {
    return url.substr(0, idx);
  }
  return url;
}

exports.isTimeout = function (error) {
  // error.code === 'ECONNABORTED' && error.message.indexOf('timeout') !== -1
  return error.message.indexOf('timeout') !== -1;
}