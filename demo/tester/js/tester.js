/**
 * Created by allenice on 15/3/17.
 */
(function () {

  function numberString(number, length) {
    var str = number + '';

    if(str.length > length) {
      length = length || 0;

      number = str.substr(0, length);
      if(number.length < length) {
        for(var i = number.length; i < length; i++) {
          number += '0';
        }
      }
    }

    return number;
  }

  var app = {

    init: function () {
      this._cacheDom();
      this._bindEvent();

      $('#qrcode').attr('src', WebGamepad.getQrcode());
    },
    
    _cacheDom: function () {
      this.$container = $('#container');
    },

    _bindEvent: function () {
      var _this = this;

      WebGamepad.listen({
        socketServer: 'http://100.84.85.122:3000/'
      });

      WebGamepad.on('gamepad-connected', function (gamepad) {
        _this._createGamepad(gamepad);
      }).on('gamepad-update', function (gamepad) {
        _this._upateGamepad(gamepad);
      }).on('gamepad-disconnected', function (gamepad) {
        _this._removeGamepad(gamepad);
      });
    },

    _createGamepad: function (gamepad) {
      var $gamepadWrap = $('<div>'),
          $info = $('<ul>'),
          $axes = $('<ul class="axes">'),
          $buttons = $('<ul>');

      $gamepadWrap.attr('data-index', gamepad.index);
      $gamepadWrap.append('<h2 class="id"><span>'+ (gamepad.index + 1) +'</span>'+ gamepad.id +'</h2>');
      $gamepadWrap.append($info);
      $gamepadWrap.append($axes);
      $gamepadWrap.append($buttons);

      $info.append('<li>' +
        '<label>TIMESTAMP</label><value data-role="timestamp">'+ gamepad.timestamp +'</value>' +
        '</li>' +
        '<li>' +
        '<label>INDEX</label><value data-role="index">'+ gamepad.index +'</value>' +
        '</li>');

      // axes
      gamepad.axes.forEach(function (axes, index) {
        $axes.append('<li><label>AXES'+ index +'</label><value>'+ numberString(axes.value, 6) +'</value></li>');
      });

      // buttons
      gamepad.buttons.forEach(function (button, index) {
        $buttons.append('<li><label>B'+ index +'</label><value>'+ button.value +'</value></li>');
      });

      this.$container.append($gamepadWrap);
    },

    _removeGamepad: function (gamepad) {
      this.$container.find('[data-index="'+ gamepad.index +'"]').remove();
    },

    _upateGamepad: function (gamepad) {
      var $gamepadWrap = this.$container.find('[data-index="'+ gamepad.index +'"]'),
          $axes = $gamepadWrap.find('ul').eq(1),
          $buttons = $gamepadWrap.find('ul').eq(2);

      if(gamepad.timestamp) {
        $gamepadWrap.find('[data-role="timestamp"]').text(gamepad.timestamp);
      }

      $gamepadWrap.find('[data-role="index"]').text(gamepad.index);

      gamepad.axes.forEach(function (axes, index) {
        var $li = $axes.find('li').eq(index);
        if(Math.round(axes.value * 100) != 0) {
          $li.addClass('active');
        } else {
          $li.removeClass('active');
        }
        $li.find('value').text(numberString(axes.value, 6));
      });

      gamepad.buttons.forEach(function (button, index) {
        var $li = $buttons.find('li').eq(index);
        if(button.value > 0.9) {
          $li.addClass('active');
        } else {
          $li.removeClass('active');
        }
        $li.find('value').text(button.value);
      });
    }
  };

  // amd
  if(typeof define === 'function' && define.amd) {
    define(['webgamepad'], function() {
      return app;
    });

    // cmd
  } else if(typeof define === 'function' && define.cmd){
    define(function (require, exports, module) {
      require('webgamepad');
      app.init();
      module.exports = app;
    });
  } else {
    app.init();
  }

})();