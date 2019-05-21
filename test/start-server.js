const myexpress = require('./mini-express');
const app = myexpress.createApp();
const router = myexpress.router;
const port = 8888;

app.use((req, res, next) => {
  console.log(`收到请求 ${req.method}:${req.url}`);
  next();
});

router.get('/get-books',(req, res)=>{
  res.send([
    {name:'zzk', age:19},
    {name:'aikun', age:18},
  ]);
});
router.get('/mock-timeout',(req, res)=>{
  setTimeout(()=>{
    res.send({message:'故意12秒后返回'});
  }, 12000)
});


router.post('/update-books',(req, res)=>{
  console.log(req.body);
  res.send({statue:true});
});

app.listen(port,()=>{console.log(`server is running on port ${port}`)})