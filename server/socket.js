/*
* socket server
* */

var socketIO = require('socket.io');

module.exports = function (server) {
  var io = socketIO(server);

  // 游戏的 socket 对象
  var gameSockets = {};

  // 手柄连接到服务器处理
  function onGamepadConnected (socket, data) {
    var uid = data.uid;

    socket.clientType = 'gamepad';
    if(gameSockets[uid]) {

      if(data.gamepad.index < 0) {
        gameSockets[uid].gamepadCount++;
        socket.gamepadIndex = data.gamepad.index = gameSockets[uid].gamepadCount -1;
        socket.emit('index-created', {index: data.gamepad.index});
      }

      // 告知游戏已连接到手柄
      gameSockets[uid].emit('gamepad-connect', data.gamepad);
      console.log('gamepad connected', data.gamepad.index);
    } else {
      // 没有对应的游戏
      socket.emit('game-not-found');
    }
  }

  // 游戏连接到服务器处理
  function onGameConnected (socket, data) {
    socket.clientType = 'game';
    socket.gamepadCount = 4; // 初始值是 4，为真实手柄预留 4 个位置
    gameSockets[data.uid] = socket;
    console.log('game connected');
  }

  // client 连接到服务器，可能是手柄，也可能是游戏
  io.on('connection', function (socket) {

    var uid,
        roomId;

    // 告知 client 已经连接到服务器
    socket.emit('server-connected');

    // client 确认连接
    socket.on('connected', function (data) {
      uid = data.uid;
      roomId = data.uid;
      socket.join(roomId);

      if(data.gamepad) {
        onGamepadConnected(socket, data);
      } else {
        onGameConnected(socket, data);
      }
    });

    // 手柄状态更新
    socket.on('gamepad-update', function (data) {
      gameSockets[uid] && gameSockets[uid].emit('gamepad-update', data);
      console.log('gamepad-update');
    });

    // 连接断开
    socket.on('disconnect', function () {
      if(socket.clientType === 'game') {
        socket.to(roomId).broadcast.emit('game-disconnect');
        delete gameSockets[uid];
      } else {
        gameSockets[uid] && gameSockets[uid].emit('gamepad-disconnect', {index: socket.gamepadIndex});
        console.log('gamepad disconnect', socket.gamepadIndex);
      }
    })

  })
}