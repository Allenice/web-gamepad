/*
* 手柄操作节点的位置，颜色，大小, 目的是测试摇杆和按钮事件
* */

 $(function() {

  function random(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  var nodes = [],
      start = false,
      $container = $('#container');

  // 节点类，手柄操作节点的位置，颜色，大小
  function Node (gamepad) {
    this.gamepad = gamepad;

    // 移动速度
    this.speed = 4;

    // 标记水平方向上哪个摇杆在控制
    this.analogueHor = WebGamepad.AXES.LEFT_ANALOGUE_HOR;

    // 标记垂直方向上哪个摇杆在控制
    this.analogueVer = WebGamepad.AXES.LEFT_ANALOGUE_VERT;

    // 初始背景
    this.bg = 'face';

    this.$el = $('<div class="node">');
    this.$el.text(this.gamepad.index).hide();
    this.$el.css({'left': random(200, 500), 'top': random(100, 300)});
    this.$el.addClass(this.bg);
    $container.append(this.$el);

    this._bindEvent();

    // 轮询状态
    this.scheduleUpdate();
  }

  $.extend(Node.prototype, {

    show: function () {
      this.$el.show();
    },

    remove: function () {
      this.$el.remove();
    },

    update: function () {

      this._moveHor(this.gamepad.axes[this.analogueHor]);
      this._moveVer(this.gamepad.axes[this.analogueVer]);

      // 进行下一次更新
      this.scheduleUpdate();
    },

    scheduleUpdate: function () {
      if(!start) {
        $('#stop').show();
        return;
      } else {
        $('#stop').hide();
      }
      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(this.update.bind(this));
      } else if (window.mozRequestAnimationFrame) {
        window.mozRequestAnimationFrame(this.update.bind(this));
      } else if (window.webkitRequestAnimationFrame) {
        window.webkitRequestAnimationFrame(this.update.bind(this));
      }
    },

    // 绑定事件
    _bindEvent: function () {
      var _this = this;

      // 摇杆事件
      this.gamepad.axes[WebGamepad.AXES.LEFT_ANALOGUE_HOR].on('update', function () {
        _this.analogueHor = WebGamepad.AXES.LEFT_ANALOGUE_HOR;
      });
      this.gamepad.axes[WebGamepad.AXES.LEFT_ANALOGUE_VERT].on('update', function () {
        _this.analogueVer = WebGamepad.AXES.LEFT_ANALOGUE_VERT;
      });

      this.gamepad.axes[WebGamepad.AXES.RIGHT_ANALOGUE_HOR].on('update', function () {
        _this.analogueHor = WebGamepad.AXES.RIGHT_ANALOGUE_HOR;
      });

      this.gamepad.axes[WebGamepad.AXES.RIGHT_ANALOGUE_VERT].on('update', function () {
        _this.analogueVer = WebGamepad.AXES.RIGHT_ANALOGUE_VERT;
      });

      // 按钮事件
      this.gamepad.buttons[WebGamepad.BUTTONS.FACE_1].on('pressed', function () {
        _this._setBg('face1');

      }).on('released', function () {
        _this._restoreBg();
      });

      this.gamepad.buttons[WebGamepad.BUTTONS.FACE_2].on('pressed', function () {
        _this._setBg('face2');

      }).on('released', function () {
        _this._restoreBg();
      });

      this.gamepad.buttons[WebGamepad.BUTTONS.FACE_3].on('pressed', function () {
        _this._setBg('face3');

      }).on('released', function () {
        _this._restoreBg();
      });

      this.gamepad.buttons[WebGamepad.BUTTONS.FACE_4].on('pressed', function () {
        _this._setBg('face4');

      }).on('released', function () {
        _this._restoreBg();
      });

      this.gamepad.buttons[WebGamepad.BUTTONS.LEFT_SHOULDER].on('released', function() {
        _this.$el.css('border-radius', 0);
      });

      this.gamepad.buttons[WebGamepad.BUTTONS.LEFT_SHOULDER_BOTTOM].on('released', function() {
        _this.$el.css('border-radius', '50%');
      });

      this.gamepad.buttons[WebGamepad.BUTTONS.RIGHT_SHOULDER].on('released', function () {
        _this.$el.css({'width': 50, 'height': 50, 'line-height': '50px'});
      });

      this.gamepad.buttons[WebGamepad.BUTTONS.RIGHT_SHOULDER_BOTTOM].on('released', function () {
        _this.$el.css({'width': 100, 'height': 100, 'line-height': '100px'});
      });

      this.gamepad.buttons[WebGamepad.BUTTONS.START].on('released', function () {
        start = !start;
        nodes.forEach(function (node) {
          if(node) {
            node.scheduleUpdate();
          }
        });
      });

    },

    _setBg: function (bg) {
      this.$el.removeClass(this.bg);
      this.bg = bg;
      this.$el.addClass(this.bg);
    },

    _restoreBg: function () {
      this.$el.removeClass(this.bg);
      this.bg = 'face';
      this.$el.addClass(this.bg);
    },

    // 水平移动
    _moveHor: function (axes) {
      var left = (this.speed * axes.value) + parseInt(this.$el.css('left'));

      if(left < 0 || left > $container.width() - this.$el.width()) return;

      this.$el.css('left', left);

    },

    // 垂直移动
    _moveVer: function (axes) {
      var top = (this.speed * axes.value) + parseInt(this.$el.css('top'));

      if(top < 0 || top > $container.height() - this.$el.height()) return;

      this.$el.css('top', top);
    }

  });

  WebGamepad.listen({
    socketServer: 'http://100.84.85.122:3000/'
  });

  // 手柄连接后，添加一个节点
  WebGamepad.on('connected', function(gamepad) {
    var node = new Node(gamepad);
    nodes[gamepad.index] = node;
    node.show();
  });

  // 手柄断开连接后，删除一个节点
  WebGamepad.on('disconnected', function (gamepad) {
    var node = nodes[gamepad.index];
    node.remove();
    nodes[gamepad.index] = void 0;
  });

  // 显示二维码
  $('#qrcode').attr('src', WebGamepad.getQrcode());
});