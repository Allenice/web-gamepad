/*
* web-gamepad.js 0.0.1
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
* https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=http://www.allenice233.com
* */

// WebGamepad, WebGamepad.Gamepad, WebGamepad.GamepadButton, WebGamepad.GamepadAxes, WebGamepad.GamepadEvent

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
  /*
  * init
  * -------
  * */
  var utils = WebGamepad.utils = {

    slice: Array.prototype.slice,

    isArray: function (arr) {
      return Object.prototype.toString.call(arr) === '[object Array]';
    },

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

  // 版本
  WebGamepad.VERSION = '0.0.1';

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
    var args = arguments;
    if(this._callbacks) {
      for(var key in this._callbacks) {
        if(key === name && utils.isArray(this._callbacks[key])) {
          this._callbacks[key].forEach(function(callback) {
            callback.apply(this, utils.slice.call(args, 1));
          });
        }
      }
    }
    return this;
  };

  utils.extend(WebGamepad, Events);

  /*
  * WebGamepad.GamepadButton
  * 手柄按钮
  * -------
  * */

  var GamepadButon = WebGamepad.GamepadButton = function () {};

  utils.extend(GamepadButon.prototype, Events, {
    value: 0
  });

  /*
  * WebGamepad.GamepadAxes
  * 手柄的轴（一个摇杆有两个轴，x 轴和 y 轴）
  * */

  var GamepadAxes = WebGamepad.GamepadAxes = function(){};

  utils.extend(GamepadAxes.prototype, Events, {
    value: 0
  });

  /*
  * WebGamepad.Gamepad
  * 手柄
  * */

  var Gamepad = WebGamepad.Gamepad = function(){
    // 初始化按钮和轴
    for(var i = 0; i < WebGamepad.TYPICAL_BUTTON_COUNT; i ++) {
      this.buttons.push(new GamepadButon());
    }

    for(var i = 0; i < WebGamepad.TYPICAL_AXES_COUNT; i ++) {
      this.axes.push(new GamepadAxes());
    }
  };

  utils.extend(Gamepad.prototype, Events, {
    id: '',

    // 用于区分手柄
    index: 0,

    // 上一次状态更新的时间
    timestamp: new Date().getTime(),

    // 摇杆
    axes: [],

    // 按钮
    buttons: [],

    // 更新状态
    update: function (gamepadData) {
//      this.id = gamepadData.id;
//      this.index = gamepadData.index;
//      this.timestamp = gamepadData.timestamp;
//      this.axes = gamepadData.axes.map(function(axes) {
//        return
//      });
    }
  });

   // export to global
  return WebGamepad;

});