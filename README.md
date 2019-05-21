## cute-http

### cute-http，一个让你觉得非常可爱的http请求库
* 可以设置重试次数
* 可以对get请求设置缓存策略
>cute对缓存做了优化，同一个url的get请求，如果query参数不变，就优先缓存结果，如果发生变化，会删除之前的缓存结果看，并去后端请求新结果
* 可以发起多个get，多个post请求，多个jsonp请求，或者多个不能类型的请求
* 针对并行请求，cute有两种策略处理结果
> 默认使用保证请求执行完毕，才返回结果，就算有其中一个请求出现错误，也不会影响其他请求
> 用户也可以设置为发起多个请求是，只要有一个请求错误，就全部失败


### 以下代码在test/test-api.js中，用户可以执行node ${your_test_dir}/test-api.js 查看效果
当然，你也可以注释掉某些代码，只看其中一个的效果
```
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
```

### 彩蛋,test目录下内置了一个mini-express,仅仅用于服务本测试用例^_^