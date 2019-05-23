/**
 * 一个超级迷你版本的express
 */
const middlewares = [];
const method_handler_ = {};
const jsonHead = { 'Content-Type': 'application/json' };
const querystring = require('querystring');

const util = {
  extractQueryAndPath(url) {
    const idx = url.indexOf('?');
    let path = '', query = {};
    if (idx >= 0) {
      path = url.substr(0, idx);
      const queryStr = url.substr(idx + 1);
      query = querystring.parse(queryStr);
    } else {
      path = url;
    }
    return { path, query };
  }
}

exports.createApp = (config) => {
  return {
    use(fn) {
      middlewares.push(fn);
    },
    listen(port, cb) {
      require('http').createServer((req, res) => {
        execute(req, res);
      }).listen(port, cb);
    }
  }
}

exports.router = {
  get: (path, fn) => {
    mapPathHandler('GET', path, fn);
  },
  post: (path, fn) => {
    mapPathHandler('POST', path, fn);
  }
}

function execute(req, res) {
  res.send = obj => res.end(JSON.stringify(obj))
  const { method, url } = req;
  const path_handler_ = method_handler_[method];
  if (!path_handler_) {
    res.writeHead(404, jsonHead);
    return res.end(`404 not found ${method} ${url}`);
  }
  const {path, query} = util.extractQueryAndPath(url);
  req.path = path;
  req.query = query;

  const fn = path_handler_[path];
  if (!fn) {
    res.writeHead(404, jsonHead);
    return res.end(`404 not found ${method} ${url}`);
  }

  res.writeHead(200, jsonHead);
  const fnCount = middlewares.length;
  let doneCount = 0;
  if (fnCount > 0) {

    function next() {
      if (doneCount == fnCount) {
        fn(req, res);
      } else {
        doneCount++;
        let handler = middlewares[doneCount - 1];
        handler(req, res, next);
      }
    }

    next();
  } else {
    fn(req, res);
  }

}

function mapPathHandler(method, path, fn) {
  let path_handler_ = method_handler_[method];
  if (!path_handler_) path_handler_ = method_handler_[method] = {};
  path_handler_[path] = fn;
}