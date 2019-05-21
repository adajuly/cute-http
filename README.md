## cute-http

### cute-http，一个让你觉得非常可爱的http请求库
* 可以设置重试次数
* 可以对get请求设置缓存策略
>cute对缓存做了优化，同一个url的get请求，如果query参数不变，就优先取缓存结果，取不到再去后端要，如果发生变化，会删除之前的缓存结果看，并去后端请求新结果，这样防止缓存过多无用数据
* 可以发起多个get，多个post请求，多个jsonp请求，或者多个不同类型的请求
* 针对并行请求，cute有两种策略处理结果
> 默认使用保证请求执行完毕，才返回结果，就算有其中一个请求出现错误，也不会影响其他请求
> 用户也可以设置为发起多个请求是，只要有一个请求错误，就全部失败


### 怎么使用
安装cute-http
```
npm i cute-http --save
```
引入
```
import * as cute from 'cute-http';
```

### api
#### 常量
```
const {ONE_ERROR_ABORT_ALL, KEEP_ALL_BEEN_EXECUTED, LOCAL_STORAGE, MEMORY} = cute.const;
```
* ONE_ERROR_ABORT_ALL 一个报错，中断所有的请求
* KEEP_ALL_BEEN_EXECUTED 一个报错，不影响其他的请求，调用者需要自己处理返回的错误
* LOCAL_STORAGE 将get返回结果缓存在`localStorage`
* MEMORY 将get返回结果缓存在`memory`

#### setConfig
顶层api,为cute配置参数
```
cute setConfig({
  retryCount: number,//重试次数
  timeout: 1900,//超时时间
  debug:true,//打开debug模式
  // cacheType: memory, // 默认无，
  // failStrategy: ONE_ERROR_ABORT_ALL, //不设置的话，cute默认采用KEEP_ALL_BEEN_EXECUTED
})
```
#### multi
```
/**
 * 发起多个post请求
 * @param {Array<{type:'post', url:string, body:object} | {type:'get', url:string} | {type:'jsonp', url:string} >} items 
 * @param {{failStrategy?:number, retryCount?:number, callbackParamName?:string, [otherAxiosConfigKey]:any}} extendedAxiosConfig 
 * otherAxiosConfigKey @see https://github.com/axios/axios
 */
cute.multi(urls, extendedAxiosConfig)
```
#### get
```
cute.get(url:string, extendedAxiosConfig:ExtendedAxiosConfig)
```
#### multiGet
```
cute.multiGet(urls:string[], extendedAxiosConfig:ExtendedAxiosConfig)
```
#### post
```
cute.post(url:string, body:object, extendedAxiosConfig:ExtendedAxiosConfig)
```
#### multiPost
```
cute.multiPost({url:string, body:object}[], extendedAxiosConfig:ExtendedAxiosConfig)
```
#### jsonp
```
cute.jsonp(url:string, extendedAxiosConfig:ExtendedAxiosConfig)
```
#### multiJsonp
```
cute.multiJsonp(urls:string[], extendedAxiosConfig:ExtendedAxiosConfig)
```



### 以下代码在test/test-api.js中，用户可以执行node ${your_test_dir}/test-api.js 查看效果
当然，你也可以注释掉某些代码，只看其中一个的效果
```
require('./start-server');
const cute = require('../index');
const process = require('process');


const {ONE_ERROR_ABORT_ALL, KEEP_ALL_BEEN_EXECUTED} = cute.const;

cute.setConfig({
  retryCount: 5,
  timeout: 1900,
  debug:true,
  // cacheType: memory, // 值为 'memory' | 'localStorage' 默认无
  // failStrategy: ONE_ERROR_ABORT_ALL, //不设置的话，cute默认采用KEEP_ALL_BEEN_EXECUTED
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
