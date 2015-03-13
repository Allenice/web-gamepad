/*
 *
 * */
define([
  'app/WebGamepad',
  'app/utils'
], function (WebGamepad, utils) {

  // 设计分辨率和比例
  var designResolution = {width: 1280, height: 720},
      designRatio = designResolution.width / designResolution.height;

  var app = {

    // 摇杆移动的最大距离
    stickOffset: 50,

    // 缓存摇杆上一次的移动的坐标
    pointCache: [],

    init: function () {
      var _this = this;


      this._cacheDom();
      this._bindEvent();

      $('#tips').hide();
      $('#gamepad').show();
      this._layout();

      this.gamepad = WebGamepad.gamepad;
      WebGamepad.connect();

    },

    _cacheDom: function () {
      this.$container = $('#container');
      this.$gamepad = $('#gamepad');
      this.$leftStick = $('#left-stick');
      this.$rightStick = $('#right-stick');
    },

    _bindEvent: function () {
      var _this = this;

      // 防止 IOS 拉动整个界面
      document.ontouchmove = function (event) {
        event.preventDefault();
      }

      // 解决 UC 浏览器 "user-select: none" 不起效的 bug
      document.ontouchstart = function (e) {
        e.preventDefault();
      }

      // 浏览器大小改变的时候，重新计算布局
      $(window).on('resize', function () {
        _this._layout();
      });

      // 绑定手柄的触摸事件
      this._bindTouchEvent();

    },

    _bindTouchEvent: function () {
      var _this = this;

      // 按钮按下和释放
      $('[data-role="button"]').on('touchstart', function (e) {
        _this.gamepad.buttons[$(this).data('index')] = 1;
        WebGamepad.update();
      }).on('touchend', function (e) {
        _this.gamepad.buttons[$(this).data('index')] = 0;
        WebGamepad.update();
      });

      // 移动摇杆
      $('#left-stick, #right-stick').on('touchstart', function (e) {
        // 记录开始按下的点
        _this.pointCache[$(this).data('index')] = utils.getPoint(e.targetTouches[0]);

      }).on('touchmove', function (e) {

        var $this = $(this),
            index = $this.data('index'),
            prevPoint = _this.pointCache[index],
            curPoint = utils.getPoint(e.targetTouches[0]),
            delta = utils.getDelta(prevPoint, curPoint),
            prePos = {x: parseInt($this.css('left')), y: parseInt($this.css('top'))},
            curPos = {x: prePos.x + delta.x, y: prePos.y + delta.y},
            curLeft,
            curTop;

        _this.pointCache[index] = curPoint;

        // 计算摇杆新的位置
        curLeft = Math.abs(curPos.x) > _this.stickOffset ? _this.stickOffset * curPos.x / Math.abs(curPos.x) : curPos.x;
        curTop = Math.abs(curPos.y) > _this.stickOffset ? _this.stickOffset * curPos.y / Math.abs(curPos.y) : curPos.y;

        $(this).css({'left': curLeft, 'top': curTop});

        // 计算摇杆的值
        if(index === WebGamepad.BUTTONS.LEFT_ANALOGUE_STICK) {
          // 左摇杆只有整数值
          var axes0 = Math.round(curLeft/_this.stickOffset),
              axes1 = Math.round(curTop/_this.stickOffset);

          // 如果上下，左右的值不变，不更新值
          if(_this.gamepad.axes[0] === axes0 && _this.gamepad.axes[1] === axes1) return;

          _this.gamepad.axes[0] = axes0;
          _this.gamepad.axes[1] = axes1;

          // 方向键
          _this.gamepad.buttons[WebGamepad.BUTTONS.PAD_LEFT] = axes0 < 0 ? 1 : 0;
          _this.gamepad.buttons[WebGamepad.BUTTONS.PAD_RIGHT] = axes0 > 0 ? 1 : 0;
          _this.gamepad.buttons[WebGamepad.BUTTONS.PAD_TOP] = axes1 < 0 ? 1 : 0;
          _this.gamepad.buttons[WebGamepad.BUTTONS.PAD_BOTTOM] = axes1 > 0 ? 1 : 0;

        } else {
          _this.gamepad.axes[3] = curLeft/_this.stickOffset;
          _this.gamepad.axes[4] = curTop/_this.stickOffset;
        }

        WebGamepad.update();


      }).on('touchend', function (e) {
        $(this).css({'left': 0, 'top': 0});

        // 摇杆释放，值重置为 0;
        if($(this).data('index') === WebGamepad.BUTTONS.LEFT_ANALOGUE_STICK) {
          _this.gamepad.axes[0] = 0;
          _this.gamepad.axes[1] = 0;
        } else {
          _this.gamepad.axes[3] = 0;
          _this.gamepad.axes[4] = 0;
        }

        WebGamepad.update();

      });
    },

    _layout: function () {
      var winSize = {width: this.$container.width(), height: this.$container.height()},
        winRatio = winSize.width / winSize.height,
        gamepadWidth,
        gamepadHeight;

      // 计算手柄的大小
      gamepadWidth = winRatio > designRatio ? winSize.height * designRatio : winSize.width;
      gamepadHeight = winRatio > designRatio ? winSize.height : winSize.width / designRatio;

      this.$gamepad.width(gamepadWidth);
      this.$gamepad.height(gamepadHeight);

      // 调整手柄的位置，使其垂直居中
      if (Math.abs(designRatio - winRatio) * 100 > 1 && winRatio < designRatio) {
        this.$gamepad.css('margin-top', (winSize.height - gamepadHeight) / 2);
      } else {
        this.$gamepad.css('margin-top', 0);
      }

      // 更新摇杆能移动的最大距离
      this.stickOffset = this.$rightStick.width() * 0.4 || 50;

      // 设置根元素的字体大小 (height:360px = 100%)
      $('html,body').css('font-size', (gamepadHeight / 360 * 100) + '%');
    }
  };

  return app;
});