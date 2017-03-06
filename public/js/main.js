(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
var core = require('./hakurei').core;
var util = require('./hakurei').util;

var Game = function(canvas) {
	core.apply(this, arguments);
};
util.inherit(Game, core);

Game.prototype.init = function () {
	core.prototype.init.apply(this, arguments);

};

module.exports = Game;

},{"./hakurei":2}],2:[function(require,module,exports){
'use strict';

module.exports = require("./hakureijs/index");

},{"./hakureijs/index":6}],3:[function(require,module,exports){
'use strict';

var ImageLoader = function(game) {
	this.images = {};

	this.loading_image_num = 0;
	this.loaded_image_num = 0;
};
ImageLoader.prototype.init = function() {
	// cancel already loading images
	for(var name in this.images){
		this.images[name].src = "";
	}

	this.images = {};

	this.loading_image_num = 0;
	this.loaded_image_num = 0;
};

ImageLoader.prototype.loadImage = function(name, path) {
	var self = this;

	self.loading_image_num++;

	// it's done to load image
	var onload_function = function() {
		self.loaded_image_num++;
	};

	var image = new Image();
	image.src = path;
	image.onload = onload_function;
	this.images[name] = image;
};

ImageLoader.prototype.isAllLoaded = function() {
	return this.loaded_image_num > 0 && this.loaded_image_num === this.loading_image_num;
};

ImageLoader.prototype.getImage = function(name) {
	return this.images[name];
};

module.exports = ImageLoader;

},{}],4:[function(require,module,exports){
'use strict';

var Constant = {
	BUTTON_SHIFT: 16,
	BUTTON_SPACE: 32,
	BUTTON_LEFT:  37,
	BUTTON_UP:    38,
	BUTTON_RIGHT: 39,
	BUTTON_DOWN:  40,
	BUTTON_X:     88,
	BUTTON_Z:     90,
};

module.exports = Constant;

},{}],5:[function(require,module,exports){
'use strict';
var CONSTANT = require("./constant");
var ImageLoader = require("./asset_loader/image");

var Core = function(canvas) {
	this.ctx = canvas.getContext('2d');

	this.width = Number(canvas.getAttribute('width'));
	this.height = Number(canvas.getAttribute('height'));

	this.current_scene = null;
	this.scenes = {};

	this.frame_count = 0;

	this.request_id = null;

	this.key_down_map = {};
	this.is_connect_gamepad = false;

	this.image_loader = new ImageLoader();
};
Core.prototype.init = function () {
	this.current_scene = null;
	this.frame_count = 0;

	this.request_id = null;

	this.key_down_map = {};
	this.is_connect_gamepad = false;

	this.image_loader.init();
};
Core.prototype.enableGamePad = function () {
	this.is_connect_gamepad = true;
};

Core.prototype.isRunning = function () {
	return this.request_id ? true : false;
};
Core.prototype.startRun = function () {
	if(this.isRunning()) return;

	this.run();
};
Core.prototype.run = function(){
	// get gamepad input
	this.handleGamePad();

	var current_scene = this.currentScene();
	if(current_scene) {
		current_scene.beforeDraw();

		// clear already rendered canvas
		this.clearCanvas();

		current_scene.draw();
		current_scene.afterDraw();
	}

	/*

	if(Config.DEBUG) {
		this._renderFPS();
	}

	// SEを再生
	this.runPlaySound();

	// 押下されたキーを保存しておく
	this.before_keyflag = this.keyflag;
	*/

	// 経過フレーム数更新
	this.frame_count++;

	// 次の描画タイミングで再呼び出ししてループ
	this.request_id = requestAnimationFrame(this.run.bind(this));
};
Core.prototype.currentScene = function() {
	if(this.current_scene === null) {
		return;
	}

	return this.scenes[this.current_scene];
};

Core.prototype.addScene = function(name, scene) {
	this.scenes[name] = scene;
};
Core.prototype.changeScene = function(name) {
	this.current_scene = name;
	this.currentScene().init();
};
Core.prototype.clearCanvas = function() {
	this.ctx.clearRect(0, 0, this.width, this.height);
};
Core.prototype.handleKeyDown = function(e) {
	var keycode = e.keyCode;

	// initialize
	if(!(keycode in this.key_down_map)) {
		this.key_down_map[keycode] = 0;
	}

	this.key_down_map[keycode]++;
	e.preventDefault();
};
Core.prototype.handleKeyUp = function(e) {
	this.key_down_map[e.keyCode] = 0;
	e.preventDefault();
};
Core.prototype.handleGamePad = function() {
	if(!this.is_connect_gamepad) return;

	var pads = navigator.getGamepads();
	var pad = pads[0]; // 1P gamepad

	if(!pad) return;

	var num_to_keycode = [
		CONSTANT.BUTTON_Z,
		CONSTANT.BUTTON_X,
	];

	for (var i = 0, len = num_to_keycode.length; i < len; i++) {
		if (pad.buttons[i].pressed) {
			// initialize
			if(!(num_to_keycode[i] in this.key_down_map)) {
				this.key_down_map[ num_to_keycode[i] ] = 0;
			}

			this.key_down_map[ num_to_keycode[i] ]++;
		}
		else {
			this.key_down_map[ num_to_keycode[i] ] = 0;
		}
	}

	// up
	if(pad.axes[1] < -0.5) {
		if(!(CONSTANT.BUTTON_UP in this.key_down_map)) {
			this.key_down_map[CONSTANT.BUTTON_UP] = 0;
		}

		this.key_down_map[CONSTANT.BUTTON_UP]++;
	}
	else {
		this.key_down_map[CONSTANT.BUTTON_UP] = 0;
	}

	// down
	if(pad.axes[1] >  0.5) { 
		if(!(CONSTANT.BUTTON_UP in this.key_down_map)) {
			this.key_down_map[CONSTANT.BUTTON_DOWN] = 0;
		}

		this.key_down_map[CONSTANT.BUTTON_DOWN]++;
	}
	else {
		this.key_down_map[CONSTANT.BUTTON_DOWN] = 0;
	}

	// left
	if(pad.axes[0] < -0.5) { 
		if(!(CONSTANT.BUTTON_UP in this.key_down_map)) {
			this.key_down_map[CONSTANT.BUTTON_LEFT] = 0;
		}

		this.key_down_map[CONSTANT.BUTTON_LEFT]++;
	}
	else {
		this.key_down_map[CONSTANT.BUTTON_LEFT] = 0;
	}

	// right
	if(pad.axes[0] >  0.5) {
		if(!(CONSTANT.BUTTON_UP in this.key_down_map)) {
			this.key_down_map[CONSTANT.BUTTON_RIGHT] = 0;
		}

		this.key_down_map[CONSTANT.BUTTON_RIGHT]++;
	}
	else {
		this.key_down_map[CONSTANT.BUTTON_RIGHT] = 0;
	}
};



Core.prototype.isKeyDown = function(keycode) {
	return this.key_down_map[keycode] > 0 ? true : false;
};
Core.prototype.isKeyPush = function(keycode) {
	return this.key_down_map[keycode] === 1 ? true : false;
};

module.exports = Core;

},{"./asset_loader/image":3,"./constant":4}],6:[function(require,module,exports){
'use strict';
module.exports = {
	util: require("./util"),
	core: require("./core"),
	constant: require("./constant"),
	scene: {
		base: require("./scene/base"),
	},
	object: {
		base: require("./object/base"),
		sprite: require("./object/sprite"),
		pool_manager: require("./object/pool_manager"),
	},
	asset_loader: {
		image: require("./asset_loader/image"),
		//sound: require("./asset_loader/sound"),
	},
};

},{"./asset_loader/image":3,"./constant":4,"./core":5,"./object/base":7,"./object/pool_manager":8,"./object/sprite":9,"./scene/base":10,"./util":11}],7:[function(require,module,exports){
'use strict';

var util = require('../util');

var id = 0;

var ObjectBase = function(scene) {
	this.scene = scene;
	this.core = scene.core;
	this.id = ++id;

	this.frame_count = 0;

	this.x = 0; // local center x
	this.y = 0; // local center y

	this.velocity = {magnitude:0, theta:0};
};

ObjectBase.prototype.init = function(){
	this.frame_count = 0;

	this.x = 0;
	this.y = 0;
};

ObjectBase.prototype.beforeDraw = function(){
	this.frame_count++;

	this.move();
};

ObjectBase.prototype.draw = function(){
};

ObjectBase.prototype.afterDraw = function(){
};

ObjectBase.prototype.move = function() {
	var x = util.calcMoveXByVelocity(this.velocity);
	var y = util.calcMoveYByVelocity(this.velocity);

	this.x += x;
	this.y += y;
};
ObjectBase.prototype.onCollision = function(){
};

ObjectBase.prototype.width = function() {
	return 0;
};
ObjectBase.prototype.height = function() {
	return 0;
};
ObjectBase.prototype.globalCenterX = function() {
	return this.scene.x + this.x;
};
ObjectBase.prototype.globalCenterY = function() {
	return this.scene.y + this.y;
};
ObjectBase.prototype.globalLeftX = function() {
	return this.scene.x + this.x - this.width()/2;
};
ObjectBase.prototype.globalRightX = function() {
	return this.scene.x + this.x + this.width()/2;
};
ObjectBase.prototype.globalUpY = function() {
	return this.scene.x + this.y - this.height()/2;
};
ObjectBase.prototype.globalDownY = function() {
	return this.scene.x + this.y + this.height()/2;
};

ObjectBase.prototype.collisionWidth = function() {
	return 0;
};
ObjectBase.prototype.collisionHeight = function() {
	return 0;
};

ObjectBase.prototype.checkCollisionWithObject = function(obj1) {
	var obj2 = this;
	if(obj1.checkCollision(obj2)) {
		obj1.onCollision(obj2);
		obj2.onCollision(obj1);
		return true;
	}

	return false;
};
ObjectBase.prototype.checkCollision = function(obj) {
	if(Math.abs(this.x - obj.x) < this.collisionWidth()/2 + obj.collisionWidth()/2 &&
		Math.abs(this.y - obj.y) < this.collisionHeight()/2 + obj.collisionHeight()/2) {
		return true;
	}

	return false;
};

ObjectBase.prototype.getCollisionLeftX = function() {
	return this.x - this.collisionWidth() / 2;
};

ObjectBase.prototype.getCollisionUpY = function() {
	return this.y - this.collisionHeight() / 2;
};











ObjectBase.prototype.setVelocity = function(velocity) {
	this.velocity = velocity;
};
module.exports = ObjectBase;


},{"../util":11}],8:[function(require,module,exports){
'use strict';

// TODO: add pooling logic
// TODO: split manager class and pool manager class
var base_object = require('./base');
var util = require('../util');

var PoolManager = function(scene, Class) {
	base_object.apply(this, arguments);

	this.Class = Class;
	this.objects = {};
};
util.inherit(PoolManager, base_object);

PoolManager.prototype.init = function() {
	base_object.prototype.init.apply(this, arguments);

	this.objects = {};
};

PoolManager.prototype.beforeDraw = function(){
	base_object.prototype.beforeDraw.apply(this, arguments);

	for(var id in this.objects) {
		this.objects[id].beforeDraw();
	}
};

PoolManager.prototype.draw = function(){
	base_object.prototype.draw.apply(this, arguments);
	for(var id in this.objects) {
		this.objects[id].draw();
	}
};

PoolManager.prototype.afterDraw = function(){
	base_object.prototype.afterDraw.apply(this, arguments);
	for(var id in this.objects) {
		this.objects[id].afterDraw();
	}
};

PoolManager.prototype.create = function() {
	var object = new this.Class(this.scene);
	object.init.apply(object, arguments);

	this.objects[object.id] = object;

	return object;
};
PoolManager.prototype.remove = function(id) {
	delete this.objects[id];
};

PoolManager.prototype.checkCollisionWithObject = function(obj1) {
	for(var id in this.objects) {
		var obj2 = this.objects[id];
		if(obj1.checkCollision(obj2)) {
			obj1.onCollision(obj2);
			obj2.onCollision(obj1);
		}
	}
};

PoolManager.prototype.checkCollisionWithManager = function(manager) {
	for(var obj1_id in this.objects) {
		for(var obj2_id in manager.objects) {
			if(this.objects[obj1_id].checkCollision(manager.objects[obj2_id])) {
				var obj1 = this.objects[obj1_id];
				var obj2 = manager.objects[obj2_id];

				obj1.onCollision(obj2);
				obj2.onCollision(obj1);

				// do not check died object twice
				if (!this.objects[obj1_id]) {
					break;
				}
			}
		}
	}
};

module.exports = PoolManager;

},{"../util":11,"./base":7}],9:[function(require,module,exports){
'use strict';
var base_object = require('./base');
var util = require('../util');

var Sprite = function(scene) {
	base_object.apply(this, arguments);

	this.current_sprite_index = 0;
};
util.inherit(Sprite, base_object);

Sprite.prototype.init = function(){
	base_object.prototype.init.apply(this, arguments);

	this.current_sprite_index = 0;
};

Sprite.prototype.beforeDraw = function(){
	base_object.prototype.beforeDraw.apply(this, arguments);

	// animation sprite
	if(this.frame_count % this.spriteAnimationSpan() === 0) {
		this.current_sprite_index++;
		if(this.current_sprite_index >= this.spriteIndices().length) {
			this.current_sprite_index = 0;
		}
	}
};
Sprite.prototype.draw = function(){
	base_object.prototype.draw.apply(this, arguments);

	var image = this.core.image_loader.getImage(this.spriteName());

	var ctx = this.core.ctx;

	ctx.save();

	// set position
	ctx.translate(this.globalCenterX(), this.globalCenterY());

	// rotate
	var rotate = util.thetaToRadian(this.velocity.theta + this.rotateAdjust());
	ctx.rotate(rotate);

	var sprite_width  = this.spriteWidth();
	var sprite_height = this.spriteHeight();
	if(!sprite_width)  sprite_width = image.width;
	if(!sprite_height) sprite_height = image.height;

	var width  = sprite_width * this.scale();
	var height = sprite_height * this.scale();

	ctx.drawImage(image,
		// sprite position
		sprite_width * this.spriteIndexX(), sprite_height * this.spriteIndexY(),
		// sprite size to get
		sprite_width,                       sprite_height,
		// adjust left x, up y because of x and y indicate sprite center.
		-width/2,                           -height/2,
		// sprite size to show
		width,                              height
	);
	ctx.restore();
};

Sprite.prototype.spriteName = function(){
	throw new Error("spriteName method must be overridden.");
};
Sprite.prototype.spriteIndexX = function(){
	return this.spriteIndices()[this.current_sprite_index].x;
};
Sprite.prototype.spriteIndexY = function(){
	return this.spriteIndices()[this.current_sprite_index].y;
};
Sprite.prototype.spriteAnimationSpan = function(){
	return 0;
};
Sprite.prototype.spriteIndices = function(){
	return [{x: 0, y: 0}];
};
Sprite.prototype.spriteWidth = function(){
	return 0;
};
Sprite.prototype.spriteHeight = function(){
	return 0;
};
Sprite.prototype.rotateAdjust = function(){
	return 0;
};
Sprite.prototype.scale = function(){
	return 1;
};


module.exports = Sprite;

},{"../util":11,"./base":7}],10:[function(require,module,exports){
'use strict';

var SceneBase = function(core) {
	this.core = core;
	this.width = core.width;
	this.height = core.height;

	this.x = 0;
	this.y = 0;

	this.frame_count = 0;

	this.objects = [];
};

SceneBase.prototype.init = function(){
	this.x = 0;
	this.y = 0;

	this.frame_count = 0;

	for(var i = 0, len = this.objects.length; i < len; i++) {
		this.objects[i].init();
	}
};

SceneBase.prototype.beforeDraw = function(){
	this.frame_count++;

	for(var i = 0, len = this.objects.length; i < len; i++) {
		this.objects[i].beforeDraw();
	}
};

SceneBase.prototype.draw = function(){
	for(var i = 0, len = this.objects.length; i < len; i++) {
		this.objects[i].draw();
	}
};

SceneBase.prototype.afterDraw = function(){
	for(var i = 0, len = this.objects.length; i < len; i++) {
		this.objects[i].afterDraw();
	}
};

SceneBase.prototype.addObject = function(object){
	this.objects.push(object);
};


module.exports = SceneBase;


},{}],11:[function(require,module,exports){
'use strict';
var Util = {
	inherit: function( child, parent ) {
		var getPrototype = function(p) {
			if(Object.create) return Object.create(p);

			var F = function() {};
			F.prototype = p;
			return new F();
		};
		child.prototype = getPrototype(parent.prototype);
		child.prototype.constructor = child;
	},
	radianToTheta: function(radian) {
		return (radian * 180 / Math.PI) | 0;
	},
	thetaToRadian: function(theta) {
		return theta * Math.PI / 180;
	},
	calcMoveXByVelocity: function(velocity) {
		return velocity.magnitude * Math.cos(Util.thetaToRadian(velocity.theta));
	},
	calcMoveYByVelocity: function(velocity) {
		return velocity.magnitude * Math.sin(Util.thetaToRadian(velocity.theta));
	},
	hexToRGBString: function(h) {
		var hex16 = (h.charAt(0) === "#") ? h.substring(1, 7) : h;
		var r = parseInt(hex16.substring(0, 2), 16);
		var g = parseInt(hex16.substring(2, 4), 16);
		var b = parseInt(hex16.substring(4, 6), 16);

		return 'rgb(' + r + ', ' + g + ', ' + b + ')';
	},
};

module.exports = Util;

},{}],12:[function(require,module,exports){
'use strict';
var Game = require('./game');

// WebAudio
window.AudioContext = window.AudioContext || window.webkitAudioContext;

var game;

window.onload = function() {
	// Canvas
	var mainCanvas = document.getElementById('mainCanvas');
	// Game オブジェクト
	game = new Game(mainCanvas);
	// 初期化
	game.init();
	// キーバインド
	window.onkeydown = function(e) { game.handleKeyDown(e); };
	window.onkeyup   = function(e) { game.handleKeyUp(e); };

	// ゲームパッド
	if(window.Gamepad && navigator.getGamepads) {
		game.enableGamePad();
	}

	// ゲーム起動
	game.startRun();
};
window.onerror = function (msg, file, line, column, err) {
	/*
	msg: error message
	file: file path
	line: row number
	column: column number
	err: error object
	*/ 
	window.alert(msg + "\n" + line + ":" + column);
};
/*
window.runGame = function () {
	game.startRun();
};
window.stopGame = function () {
	game.stopRun();
};
window.changeFullScreen = function () {
	var mainCanvas = document.getElementById('mainCanvas');
	if (mainCanvas.requestFullscreen) {
		mainCanvas.requestFullscreen();
	}
	else if (mainCanvas.msRequestuestFullscreen) {
		mainCanvas.msRequestuestFullscreen();
	}
	else if (mainCanvas.mozRequestFullScreen) {
		mainCanvas.mozRequestFullScreen();
	}
	else if (mainCanvas.webkitRequestFullscreen) {
		mainCanvas.webkitRequestFullscreen();
	}
};
*/

},{"./game":1}]},{},[12]);
