const myexpress = require('./mini-express');
const app = myexpress.createApp();
const router = myexpress.router;
const port = 8888;
const dao = require('./dao');

function wrapData(data){
  return {
    data,
    code:0,
    message:'',
  }
}

app.use((req, res, next) => {
  console.log(`收到请求 ${req.method}:${req.url}`);
  next();
});

router.get('/wrong-data-format-response', (req, res) => {
  res.send([1,2,4]);
});


router.get('/get-books', (req, res) => {
  const { uid } = req.query;
  const books = dao.getBooksByUid(uid);
  res.send(wrapData(books));
});

router.get('/timeout/get-books', (req, res) => {
  const { uid } = req.query;
  // 故意12秒后返回
  setTimeout(() => {
    const books = dao.getBooksByUid(uid);
    res.send(wrapData(books));
  }, 12000)
});


router.post('/update-books',(req, res)=>{
  // console.log(req.body);
  res.send(wrapData({status:true}));
});

app.listen(port,()=>{console.log(`server is running on port ${port}`)})