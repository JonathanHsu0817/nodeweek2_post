const http = require('http');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const header = require('./views/header');
const handlerSuccess = require('./views/handlerSuccess');
const handlerError = require('./views/handlerError');
const Post = require('./models/post');

dotenv.config({ path: './config.env' });

//連線資料
mongoose.connect(process.env.DATABASE).then(() => {
  console.log('資料庫連線成功');
});

const requestListener = async (req, res) => {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });
  if (req.url === '/posts' && req.method === 'GET') {
    const allPosts = await Post.find();
    handlerSuccess(res, allPosts);
  } else if (req.url === '/posts' && req.method === 'POST') {
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        if (data.content) {
          const newPost = await Post.create({
            name: data.name,
            content: data.content,
            tags: data.tags,
            type: data.type,
          });
          handlerSuccess(res, newPost);
        } else {
          handlerError(res);
        }
      } catch (err) {
        handlerError(res, err);
      }
    });
  } else if (req.url.startsWith('/posts/') && req.method === 'DELETE') {
    const id = req.url.split('/')[2];
    await Post.findByIdAndDelete(id);
    res.writeHead(200, header);
    res.write(
      JSON.stringify({
        status: 'success',
        data: null,
      })
    );
    res.end();
  } else if (req.method === 'OPTIONS') {
    res.writeHead(200, header);
    res.end();
  } else {
    res.writeHead(404, header);
    res.write(
      JSON.stringify({
        status: 'false',
        message: '無此網站路由',
      })
    );
    res.end();
  }
};

const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3005);
