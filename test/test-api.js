
// require('./start-server');
const cute = require('../index');
const process = require('process');
const test = require('ava');

// ONE_ERROR_ABORT_ALL = 1;//一个报错，终端所有的请求
// KEEP_ALL_BEEN_EXECUTED = 2;//一个报错，不影响其他的请求，调用者需要自己处理返回的错误
const { ONE_ERROR_ABORT_ALL, KEEP_ALL_BEEN_EXECUTED, ERR_FETCH_FAILED_AFTER_RETRY } = cute.const;

cute.setConfig({
  retryCount: 3,
  timeout: 1900,
  debug: true,
  generalVerifyRule: {
    a: 'string',
  },
  urlVerifyRule: {
    '/app/version': {
      data: 'object',
      message: 'string',
    }
  },
  // ignoreHost: true,
  // cacheType: memory, // 值为 'memory' | 'localStorage' 默认无
  failStrategy: KEEP_ALL_BEEN_EXECUTED, //不设置的，cute默认采用ONE_ERROR_ABORT_ALL
})

const getBooksByUid = uid => `http://localhost:8888/get-books?uid=${uid}`;
const getBooksByUidTimeout = uid => `http://localhost:8888/timeout/get-books?uid=${uid}`;
const updateBooks = 'http://localhost:8888/update-books';

test('test cute.get', async t => {
  const result = await cute.get(getBooksByUid(1));
  t.true(result !== undefined);
  t.true(result.data !== undefined);
  const books = result.data;
  t.true(Array.isArray(books));
  t.true(books.length === 5);
});

test('test cute.post', async t => {
  const result = await cute.post(updateBooks);
  t.true(result.data.status === true);
});

test('test cute.multiGet', async t => {
  const resultArr = await cute.multiGet([getBooksByUid(1), getBooksByUid(2)]);
  t.true(Array.isArray(resultArr));
  t.true(resultArr.length === 2);
  const [{ data: books1 }, { data: books2 }] = resultArr;
  t.is(books1.length, 5);
  t.is(books2.length, 2);
})

test('测试cute.multiGet，一个正常请求，一个超时的情况', async t => {
  const resultArr = await cute.multiGet([getBooksByUid(1), getBooksByUidTimeout(2)]);
  t.true(Array.isArray(resultArr));
  t.true(resultArr.length === 2);
  const [{ data: books1 }, err] = resultArr;

  t.is(books1.length, 5);

  t.true(err instanceof Error);
  t.is(err.code, ERR_FETCH_FAILED_AFTER_RETRY);
})


// setTimeout(startTest, 600);
process.on('unhandledRejection', (reason) => {
  console.log('unhandledRejection:', reason.code, reason.message);
});