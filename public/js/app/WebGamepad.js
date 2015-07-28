/*
* Gamepad
* */


define([
  'app/utils',
  'lib/socket.io.min'
],function (utils, io) {

  var uid = utils.getUrlParam('uid');

  var WebGamepad = {};

  // 按钮和摇杆对应的索引值
  WebGamepad.BUTTONS = {
    FACE_1: 0, // 按钮 1，2，3，4
    FACE_2: 1,
    FACE_3: 2,
    FACE_4: 3,
    LEFT_SHOULDER: 4, // L1
    RIGHT_SHOULDER: 5, // R1
    LEFT_SHOULDER_BOTTOM: 6, // L2
    RIGHT_SHOULDER_BOTTOM: 7, // R2
    SELECT: 8,
    START: 9,
    LEFT_ANALOGUE_STICK: 10, // 左摇杆按下的按钮（目前没做）
    RIGHT_ANALOGUE_STICK: 11,
    PAD_TOP: 12, // 上
    PAD_BOTTOM: 13, // 下
    PAD_LEFT: 14, // 左
    PAD_RIGHT: 15 // 右
  };

  WebGamepad.AXES = {
    LEFT_ANALOGUE_HOR: 0, // 左摇杆水平方向
    LEFT_ANALOGUE_VERT: 1, // 左摇杆垂直方向
    RIGHT_ANALOGUE_HOR: 2,
    RIGHT_ANALOGUE_VERT: 3
  };

  // 按钮数量(0-15)
  WebGamepad.TYPICAL_BUTTON_COUNT = 16;

  // 手柄对象
  WebGamepad.gamepad = (function () {
    var id = 'WEB GAMEPAD (version: 0.1.1)';
    // 初始化按钮的值
    var buttons = [],
        index = parseInt(sessionStorage.getItem(uid)) || -1;

    for(var i = 0; i < WebGamepad.TYPICAL_BUTTON_COUNT; i++) {
      buttons.push(0);
    }

    if(index != -1) {
      id += '(index: '+ index +')';
    }

    return {
      // 手柄描述
      id: id,

      // 用于区分手柄
      index: index,

      // 上一次状态更新的时间
      timestamp: new Date().getTime(),

      // 摇杆
      axes: [0,0,0,0],

      // 按钮
      buttons: buttons
    }
  })();

  // gamepad 的 socket 对象
  WebGamepad.socket = {};

  // 连接 socket 服务器
  WebGamepad.connect = function () {
    var socket = WebGamepad.socket = io.connect();

    function showError(msg) {
      sessionStorage.removeItem(uid);
      $('#tips').html(msg).show();
      $('#gamepad').hide();
    }

    socket.on('server-connected', function () {
      socket.emit('connected', {uid: uid, gamepad: WebGamepad.gamepad});
    });

    // 从服务器那里获得手柄的 index
    socket.on('index-created', function (data) {
      WebGamepad.gamepad.index = data.index;
      WebGamepad.gamepad.id = WebGamepad.gamepad.id + '(index: '+ data.index +')';
      sessionStorage.setItem(uid, data.index);
      console.log('index-created', data);
    });

    socket.on('game-disconnected', function () {
      showError('游戏连接失败，请重新扫描二维码');
    });
    
    socket.on('game-not-found', function () {
      showError('游戏不存在，请重新扫描二维码');
    });

    // TODO: 这个事件一直没有触发，不知道是怎么回事
    socket.on('disconnect', function () {
      showError('服务器连接已断开');
    });

  };

  // 更新手柄状态
  WebGamepad.update = function () {
    WebGamepad.gamepad.timestamp = new Date().getTime();
    WebGamepad.socket.emit('gamepad-update', WebGamepad.gamepad);
  }

  return WebGamepad;
});