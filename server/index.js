/*
* A simple http server
* */

var http = require('http'),
  path = require('path'),
  fs = require('fs'),
  mime = require('./mime'),
  socket = require('./socket'),
  server;


server = http.createServer(function (req, res) {
  var url = req.url === '/' ? '/index.html' : req.url.split('?')[0],
    ext = url.substr(url.lastIndexOf('.') + 1, url.length),
    filePath = path.join(__dirname, '../public'+ url);

  console.log(req.method + ':', url);
  fs.readFile(filePath, function (err, data) {
    if (err) {
      res.writeHead(404);
      res.end('404! not found:' + url);
    }

    var mimeType = mime[ext] || 'text/html';
    res.writeHead(200, {
      'Content-Type': mimeType
    });
    res.end(data);
  })
});

socket(server);

server.listen(3000);
console.log('server start: http://localhost:3000');

