/*
* web-gamepad.js 0.1.1
 The MIT License (MIT)

 Copyright (c) 2015 Allenice

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
* */

(function (root, factory) {

  // amd 支持
  if(typeof define === 'function' && define.amd) {
    define(['socketio'], function(io) {
      root.WebGamepad = factory(root, {}, io);
      return root.WebGamepad;
    });

    // cmd 支持
  } else if(typeof define === 'function' && define.cmd){
    define(function (require, exports, module) {
      var io = require('socketio');
      root.WebGamepad = factory(root, exports, io);
    });
  } else {
    root.WebGamepad = factory(root, {}, root.io);
  }
})(this, function (root, WebGamepad, io) {
  io = io || window.io;
  /*
  * init
  * -------
  * */
  var utils = WebGamepad.utils = {

    slice: Array.prototype.slice,

    isArray: function (arr) {
      return Object.prototype.toString.call(arr) === '[object Array]';
    },

    uuid: (function() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      return function() {
        return s4() + s4() + '' + s4() + '' + s4() + '' +
          s4() + '' + s4() + s4() + s4();
      };
    })(),

    extend: function (target/*,source...*/) {
      var length = arguments.length;

      if(length > 1) {
        for(var i = 1; i < length; i++) {
          var source = arguments[i];
          for(var key in source) {
            target[key] = source[key];
          }
        }
      }
      return target;
    }
  }

  var uid = 'u' + utils.uuid(),
    qrcodeSrc = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=',
    socketServer;

  // 版本
  WebGamepad.VERSION = '0.1.1';

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

  // 轴数量，一个摇杆有两个轴，x 轴和 y 轴，目前支持两个摇杆
  WebGamepad.TYPICAL_AXES_COUNT = 4;


  // 存储已连接的手柄
  WebGamepad.gamepads = [];

  // 浏览器是否支持实体手柄
  WebGamepad.gamepadSupport = navigator.getGamepads ||
    !!navigator.webkitGetGamepads ||
    !!navigator.webkitGamepads;

  // 获取连接二维码
  WebGamepad.getQrcode = function () {
    return qrcodeSrc;
  };

  // 获取已经连接的手柄
  WebGamepad.getGamepads = function () {
    return WebGamepad.gamepads.filter(function (gamepad) {
      return typeof gamepad != 'undefined';
    });
  };

  /*
  * WebGamepad.GamepadEvent
  * 简单的事件支持
  * ---------
  * */

  var Events = WebGamepad.GamepadEvents = {};

  // 绑定事件
  Events.on = function (name, callback) {

    this._callbacks = (function(callbacks){
      callbacks[name] = callbacks[name] || [];
      callbacks[name].push(callback);
      return callbacks;
    })(this._callbacks || {});

    return this;
  };

  // 解除事件
  Events.off = function (name) {
    if(this._callbacks) {
      for(var key in this._callbacks) {
        if(key === name) delete this._callbacks[key];
      }
    }
    return this;
  };

  // 触发事件
  Events.trigger = function (name) {
    var _this = this,
        args = arguments;
    if(this._callbacks) {
      for(var key in this._callbacks) {
        if(key === name && utils.isArray(this._callbacks[key])) {
          this._callbacks[key].forEach(function(callback) {
            callback.apply(_this, utils.slice.call(args, 1));
          });
        }
      }
    }
    return this;
  };

  // 使用 WebGamepad 对象具有事件功能
  utils.extend(WebGamepad, Events);

  /*
  * WebGamepad.GamepadButton
  * 手柄按钮
  * -------
  * */

  var GamepadButon = WebGamepad.GamepadButton = function () {};

  utils.extend(GamepadButon.prototype, Events, {
    value: 0,
    oldValue: 0,
    gamepad: null, // 所属手柄

    setValue: function (value) {
      this.oldValue = this.value;
      this.value = value;

      if(this.value > 0.9 && this.oldValue <= 0.1) {
        this.trigger('pressed');
        this.gamepad.trigger('update');
        WebGamepad.trigger('update', this.gamepad);
      }

      if(this.value <= 0.1 && this.oldValue > 0.9) {
        this.trigger('released');
        this.gamepad.trigger('update');
        WebGamepad.trigger('update', this.gamepad);
      }
    }
  });

  /*
  * WebGamepad.GamepadAxes
  * 手柄的轴（一个摇杆有两个轴，x 轴和 y 轴）
  * */

  var GamepadAxes = WebGamepad.GamepadAxes = function(){};

  utils.extend(GamepadAxes.prototype, Events, {
    value: 0,
    oldValue: 0,

    setValue: function (value) {
      this.oldValue = this.value;
      this.value = parseFloat(value.toFixed(2));

      if(this.value != this.oldValue) {
        this.trigger('update');
        this.gamepad.trigger('update');
        WebGamepad.trigger('update', this.gamepad);
      }
    }
  });

  /*
  * WebGamepad.Gamepad
  * 手柄
  * */

  var Gamepad = WebGamepad.Gamepad = function(){

    this.id = '';

    // 用于区分手柄
    this.index = 0;

    // 按钮
    this.buttons = [];

    // 上一次状态更新的时间
    this.timestamp =  new Date().getTime(),

    // 轴
    this.axes = [];

    // 初始化按钮和轴
    for(var i = 0; i < WebGamepad.TYPICAL_BUTTON_COUNT; i ++) {
      var button = new GamepadButon();
      button.gamepad = this;
      this.buttons.push(button);
    }

    for(var i = 0; i < WebGamepad.TYPICAL_AXES_COUNT; i ++) {
      var axes = new GamepadAxes();
      axes.gamepad = this;
      this.axes.push(axes);
    }
  };

  utils.extend(Gamepad.prototype, Events, {

    // 更新状态
    update: function (gamepadData) {
      this.id = gamepadData.id;
      this.index = gamepadData.index;
      this.timestamp = gamepadData.timestamp;

      this.buttons.forEach(function (button, index) {
        var btn = gamepadData.buttons[index];

        // 兼容某些实体手柄，button 的值是：{value: 0|false, pressed: true|false}
        var value = typeof btn === 'object' ? btn.value : btn;

        if(typeof value != 'undefined') {
          button.setValue(value);
        }
      });

      this.axes.forEach(function (axes, index) {
        var value = gamepadData.axes[index];

        if(typeof value != 'undefined') {
          axes.setValue(value);
        }
      });

    }
  });

  /*
  * 连接事件相关回调
  * ----
  * */

  // 有手柄连接
  function onGamepadConnected(data) {
    var gamepad = new WebGamepad.Gamepad();
    gamepad.update(data);
    WebGamepad.gamepads[gamepad.index] = gamepad;
    WebGamepad.trigger('connected', gamepad);
  }

  // 手柄断开连接
  function onGamepadDisconnected(data) {
    var gamepad = WebGamepad.gamepads[data.index];
    WebGamepad.gamepads[data.index] = void 0;
    WebGamepad.trigger('disconnected', gamepad);
  }

  // 手柄状态更新
  function onGamepadUpdate(data) {
    var gamepad = WebGamepad.gamepads[data.index];
    gamepad.update(data);
  }


  /*
  * 连接真实手柄
  * ------------
  * */

  var gamepadSupport = {
    ticking: false,

    init: function () {
      if (WebGamepad.gamepadSupport) {
        // 判断是否支持 gamepadconnected/gamepaddisconnected 事件
        if ('ongamepadconnected' in window) {
          window.addEventListener('gamepadconnected',
            gamepadSupport.onGamepadConnect, false);
          window.addEventListener('gamepaddisconnected',
            gamepadSupport.onGamepadDisconnect, false);
        } else {
          // 如果不支持这两个事件就一直轮询查看手柄连接状态
          gamepadSupport.startPolling();
        }
      }
    },

    // 手柄连接
    onGamepadConnect: function (event) {
      onGamepadConnected(event.gamepad);
      gamepadSupport.startPolling();
    },

    // 手柄断开连接，如果没有真实手柄连接，停止轮询
    onGamepadDisconnect: function (event) {
      var gamepads = WebGamepad.gamepads.slice(0,4),
          flag = true;

      onGamepadDisconnected(event.gamepad);

      // 检查还有没有实体手柄连接，没有的话就停止轮询
      for(var i = 0; i < gamepads.length; i++) {
        if(gamepads[i]) {
          flag = false;
          break;
        }
      }

      if(flag) gamepadSupport.stopPolling();
    },

    startPolling: function () {
      if (!gamepadSupport.ticking) {
        gamepadSupport.ticking = true;
        gamepadSupport.tick();
      }
    },

    stopPolling: function() {
      gamepadSupport.ticking = false;
    },

    tick: function () {
      gamepadSupport.pollStatus();
      gamepadSupport.scheduleNextTick();
    },

    scheduleNextTick: function () {
      if (gamepadSupport.ticking) {
        if (window.requestAnimationFrame) {
          window.requestAnimationFrame(gamepadSupport.tick);
        } else if (window.mozRequestAnimationFrame) {
          window.mozRequestAnimationFrame(gamepadSupport.tick);
        } else if (window.webkitRequestAnimationFrame) {
          window.webkitRequestAnimationFrame(gamepadSupport.tick);
        }
      }
    },

    // 轮询手柄连接状态
    pollStatus: function () {
      var rawGamepads =
        (navigator.getGamepads && navigator.getGamepads()) ||
        (navigator.webkitGetGamepads && navigator.webkitGetGamepads());

      for(var i = 0; i < rawGamepads.length; i++) {
        var data = rawGamepads[i];

        if(!data) {

          // 如果是 undefined, 而且 WebGamepad.gamepads 存在这个手柄，表示现在已经断开连接
          if(WebGamepad.gamepads[i]) {
            onGamepadDisconnected(WebGamepad.gamepads[i]);

          }
          // 继续检查下一个
          continue;
        };

        // 如果手柄已经添加到 WebGamepad.gamepads 的话，更新数据，否则是新连接的手柄
        if(WebGamepad.gamepads[data.index]) {
          WebGamepad.gamepads[data.index].update(data);
        } else {
          onGamepadConnected(data);
        }
      }
    }

  };

  /*
  * 手柄连接相关
  * -----------
  * */

  // 监听 gamepad 连接
  WebGamepad.listen = function (options) {
    options = options || {};
    socketServer = options.socketServer;
    qrcodeSrc = qrcodeSrc + (socketServer + '?uid=' + uid);

    // 如果配置了 socket 服务器就连接
    if(socketServer) {
      var socket = io.connect(socketServer);

      // 连接到 socket 服务器
      socket.on('server-connected', function (data) {
        socket.emit('connected', {uid: uid});
      });

      // 有手柄连接到游戏
      socket.on('gamepad-connected', function (data) {
        onGamepadConnected(data);
      });

      // 手柄状态更新
      socket.on('gamepad-update', function (data) {
        onGamepadUpdate(data);
      });

      // 手柄断开连接
      socket.on('gamepad-disconnected', function (data) {
        onGamepadDisconnected(data);
      });

      // 如果与服务器断开连接，则触发 web 手柄的 disconnected 事件
      socket.on('disconnect', function () {
        for(var i = 4; i < WebGamepad.gamepads.length; i++) {
          var gamepad = WebGamepad.gamepads[i];
          if(gamepad) WebGamepad.trigger('disconnected', gamepad);
        }
      });

    }

    // 实体手柄支持
    gamepadSupport.init();
  };

   // export to global
  return WebGamepad;

});