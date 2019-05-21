
require('./start-server');
const cute = require('../index');
const process = require('process');

// ONE_ERROR_ABORT_ALL = 1;//一个报错，终端所有的请求
// KEEP_ALL_BEEN_EXECUTED = 2;//一个报错，不影响其他的请求，调用者需要自己处理返回的错误
const {ONE_ERROR_ABORT_ALL, KEEP_ALL_BEEN_EXECUTED} = cute.const;

cute.setConfig({
  retryCount: 5,
  timeout: 1900,
  debug:true,
  // cacheType: memory, // 值为 'memory' | 'localStorage' 默认无
  // failStrategy: ONE_ERROR_ABORT_ALL, //不设置的，cute默认采用KEEP_ALL_BEEN_EXECUTED
})

const getBooks = 'http://localhost:8888/get-books';
const updateBooks = 'http://localhost:8888/update-books';
const mockTimeout = 'http://localhost:8888/mock-timeout';

function startTest(){
  console.log('startTest');

  cute.get(getBooks).then(re=>{
    console.log('reply1 is', re.data);
  });

  cute.post(updateBooks, {a:1}).then(re=>{
    console.log('reply2 is', re.data);
  });

  cute.get(mockTimeout, {a:1}).then(re=>{
    console.log('reply2 is', re.data);
  });
  
  cute.multiGet([getBooks, getBooks, getBooks]).then(arr=>{
    const [{data:data1}, {data:data2}, {data:data3}] = arr;
    console.log('multiGet reply is', data1, data2, data3);
  });

  cute.multiGet([getBooks, mockTimeout, getBooks]).then(arr=>{
    const [{data:data1}, {data:data2}, {data:data3}] = arr;
    console.log('multiGet reply is', data1, data2, data3);
  });

};

setTimeout(startTest, 600);
process.on('unhandledRejection', (reason)=>{
  console.log(reason.message);
});