const express = require('express');
const webpack = require('webpack');
const config = require('./webpack.config.dev');
const compression = require('compression');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const compiler = webpack(config);
const port = 3000;

app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath
}));

app.use(require('webpack-hot-middleware')(compiler));

app.use(compression({
  threshold: 512
}));

app.use('/', express.static('.'));

server.listen(port, '0.0.0.0', function(err) {
  if (err) { throw err; }
  console.log('Listening at http://localhost:' + port);
});

io.on('connection', function(socket) {
  io.set('origins', '*:*');
  console.log('connected');
  socket.emit('update', 'connected');
  socket.on('single', function() {
    socket.emit('update', 'single');
  });
  socket.on('publish', function(data) {
    io.sockets.emit('update', data);
  });
});
