requirejs.config({
  basePath: './',
  paths: {

    // 配置 socket.io 的路径，一定要用这个名字
    socketio: 'http://cdnjs.cloudflare.com/ajax/libs/socket.io/1.3.5/socket.io.min',
    webgamepad: '../../../client/web-gamepad'
  }
});

require(['tester'], function(app) {
  app.init();
});