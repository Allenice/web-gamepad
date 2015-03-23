# web-gamepad
web-gamepad 是一个运行在手机浏览器的游戏手柄。游戏引用 client 里面的 web-gamepad.js,  玩家通过扫描二维码连接手柄。web-gamepad.js 还支持真实手柄。建议使用 web-gamepad 之前，请先阅读 [Web gamepad api](https://dvcs.w3.org/hg/gamepad/raw-file/default/gamepad.html)

## 安装
```bash
# 克隆代码到本地
git clone git@github.com:Allenice/web-gamepad.git

# 安装依赖包
npm install

# 启动 socket 服务器, 建议使用 pm2,supervisor 等工具运行
node server/index.js
```

### 运行 demo
demo 不需要与 socket 服务器 同域或同端口，启动 socket 服务器后，运行 demo 只需将 client 和 demo 两个文件夹复制到你其他的 http 服务器里面运行。

## 游戏接入
游戏需要支持手柄功能，只需要简单配置即可使用。
```javascript
// 引用 client 文件夹里面的 web-gamepad.js 后, 配置
WebGamepad.listen({
	socketServer: 'http://yourdomain.com:3000'
});

// 显示二维码, 配置了 socketServer 之后才能获得二维码
$('#qrcode').attr('src', WebGamepad.getQrcode());

```
如果不配置 socket 服务器的话，只支持真实手柄接入。如果使用 requirejs 或 seajs 的话，请查考 [tester demo](https://github.com/Allenice/web-gamepad/tree/master/demo/tester);

## client api

### WebGamepad
```javascript
// 版本
WebGamepad.VERSION	= '0.1.1';

// 	已连接的手柄, 前四个是真实手柄，后面是 web 手柄
WebGamepad.gamepads = [];

// 获取已连接的手柄，过滤掉 undefined
WebGamepad.getGamepads = function(){};

// 获取连接二维码
WebGamepad.getQrcode = function(){};

// 事件
WebGamepad.on('connected', function(gamepad) {
  console.log('手柄已连接', gamepad);
}).on('update', function(gamepad) {
	console.log('手柄状态更新', gamepad);
}).on('disconnected', function(gamepad) {
	console.log('手柄断开连接', gamepad);
});
```

### 手柄按钮和摇杆常量
```javascript
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
```
可以看下图对照一下
![手柄按钮对照](http://www.html5rocks.com/en/tutorials/doodles/gamepad/gamepad_diagram.png)

### WebGamepad.Event
简单的事件支持，提供 on, off, trigger 三个方法。
```javascript
var obj = {};
WebGamepad.utils.extend(obj, WebGamepad.Event);

// 绑定事件
obj.on('eventName', function() {
	console.log('event trigger');
});

// 触发事件
obj.trigger('eventName');

// 解除绑定
obj.off('eventName');
```

### WebGamepad.GamepadButton, WebGamepad.GamepadAxes
GamepadButton 和 GamepadAxes 的 api 是一样的，只是两个代表的意思不一样，Axes 是摇杆的轴。一个手柄有两个杆，每个杆有 X,Y 两个轴。手柄连接后，可以对按钮和轴进行监听。
```
// 手柄连接
WebGamepad.on('connected', function(gamepad) {
	// 按钮1按下
	gamepad.buttons[WebGamepad.BUTTONS.FACE_1].on('pressed', function() {
		console.log('face1 button pressed');
	
		// gamepad: 按钮所属的手柄，value: 新值，oldValue: 旧值
		console.log(this.gamepad, this.value, this.oldValue);
		
	}).on('released', function() {
	
		console.log('face1 button released');
	});
	
	// 左摇杆的 x 轴值改变
	gamepad.axes[WebGamepad.AXES.LEFT_ANALOGUE_HOR].on('update', function(){
		console.log('update');
	})
});
```

### WebGamepad.Gamepad
手柄类
```javascript
{
	// 手柄 id，用于区分手柄
	id: '';
	
	// 手柄数组索引, 0-3 只给真实手柄
	index: 0,

	// 状态更新的时间戳
	timestamp: new Date(),
	
	// 手柄按钮
	buttons: [],

	// 轴
	axes: []
}

// 事件
WebGamepad.on('connected', function(gamepad) {
	gamepad.on('update', function() {
		console.log('gamepad update');
	});
});
```

在线 demo:  

 -  [tester](http://demo.allenice233.com/web-gamepad/demo/tester/);  
 -  [events](http://demo.allenice233.com/web-gamepad/demo/events/)