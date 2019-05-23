## cute-http
<p align="center">
  <a href="#">
    <img width="460" src="https://raw.githubusercontent.com/fantasticsoul/static/master/img/cute-http.png">
  </a>
</p>

### cute-http，一个可爱的http请求库，易用&简单
* 可以设置请求超时后的重试次数
* 可以对get请求设置缓存策略
>cute对缓存做了优化，同一个url的get请求，如果query参数不变，就优先取缓存结果，取不到再去后端要，如果发生变化，会删除之前的缓存结果看，并去后端请求新结果，这样防止缓存过多无用数据
* 可以发起多个get，多个post请求，多个jsonp请求，或者多个不同类型的请求
* 针对并行请求，cute有两种策略处理结果
> 默认使用保证请求执行完毕，才返回结果，就算有其中一个请求出现错误，也不会影响其他请求，当然，此时用户需要遍历返回的结果数据，因为可能其中有一个是错误。
> 用户也可以设置为发起多个请求时，只要有一个请求错误，就全部失败。


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
  timeout: 1900,//超时时间（毫秒）
  debug:true,//打开debug模式
  // cacheType: MEMORY, // 默认无，如果开启了缓存，cute只针对get请求做缓存，如需穿透缓存，可以对query参数加随机值，或者调用cute.get时，配置第二个参数{cacheType:null}，表示针对这一次调用不读取缓存值
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
const cute = require('../index');
const {ONE_ERROR_ABORT_ALL, KEEP_ALL_BEEN_EXECUTED, MEMORY} = cute.const;
const axios = cute.axios;//这个是axios模块的引用

cute.setConfig({
  retryCount: 3,//设置重试次数
  timeout: 1900,//设置超时时间
  debug: true,
  dataVerifyRule: {//设置通用的响应数据校验规则，只支持校验json对象的第一层key的值和类型的校验
    data: 'object',
    code: 'number',
    message: 'string',
  },
  pathDataVerifyRule:{//对某些请求设置独立的数据校验规则
    '/staff/foo':{
      reply:'object',
      msg:'string',
    }
  }
  cacheType: MEMORY, // 值为 'memory' | 'localStorage' 默认无
  failStrategy: KEEP_ALL_BEEN_EXECUTED, //不设置的话，cute默认采用ONE_ERROR_ABORT_ALL
})

const updateBook = 'http://localhost:8888/update-book';
const getBooksByUid = uid => `http://localhost:8888/get-books?uid=${uid}`;

async function main(){
  const result1 = await cute.get(getBooksByUid(1));
  const books = result.result1;
  
  const result2 = await cute.multiGet([getBooksByUid(1), getBooksByUid(2)]);
  const [reply1, reply2] = result2;
  
  const result3 = await cute.post(updateBook, {id:1, name:'zk'});
  const updateReply = result.result3;
  
  const result4 = await cute.multiPost([{url:updateBook, body:{id:1, name:'zk'}}, {url:updateBook, body:{id:2, name:'wow'}}]);
  const [updateReply1, updateReply2] = result4;

}

```
>更多示例见/test/test-api.js

### 运行测试用例
运行模拟服务器
```
* npm start
```
执行测试脚本
```
* npm test
```

### 彩蛋,test目录下内置了一个mini-express,仅仅用于服务本测试用例^_^
