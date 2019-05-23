
const db = {
  //图书表
  book: [
    { id: 1, name: 'build your dream', author: 'zzk' },
    { id: 2, name: 'love concent', author: 'link' },
    { id: 3, name: 'love cute-http', author: 'ddr' },
    { id: 4, name: 'hello react', author: 'dragon' },
    { id: 5, name: 'hello world', author: 'wow' },
    { id: 6, name: 'hello world', author: 'wow' },
    { id: 7, name: 'hello world', author: 'wow' },
  ],
  //用户表
  user: [
    { id: 1, name: 'fansoul', phone: '11344556677' },
    { id: 2, name: 'mario', phone: '16688886666' },
  ],
  //用户的图书收藏表
  collection: [
    { id: 1, uid: 1, bid: 1, collectTime: Date.now() },
    { id: 2, uid: 1, bid: 2, collectTime: Date.now() },
    { id: 3, uid: 1, bid: 3, collectTime: Date.now() },
    { id: 4, uid: 1, bid: 4, collectTime: Date.now() },
    { id: 5, uid: 1, bid: 5, collectTime: Date.now() },
    { id: 6, uid: 2, bid: 6, collectTime: Date.now() },
    { id: 7, uid: 2, bid: 7, collectTime: Date.now() },
  ]
};

const bid_book_ = db.book.reduce((map, book) => { map[book.id] = book; return map; }, {});

exports.getBooksByUid = function (uid) {
  const intUid = parseInt(uid);
  const bids = db.collection.filter(v => v.uid === intUid).map(v => v.bid);
  const books = bids.map(bid=> bid_book_[bid]);
  return books;
}