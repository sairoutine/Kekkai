(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var CONSTANT = {
	TILE_SIZE:  24,

	BLOCK_GREEN:  1,
	BLOCK_BLUE:   2,
	BLOCK_RED:    3,
	BLOCK_PURPLE: 4,
	BLOCK_BROWN:  5,
	LADDER:       6,
	PLAYER:       7,
	ENEMY:        8,
	ITEM:         9,
	DEATH:       10,
};

module.exports = CONSTANT;

},{}],2:[function(require,module,exports){
'use strict';
var core = require('./hakurei').core;
var util = require('./hakurei').util;

var SceneLoading = require('./scene/loading');
var SceneTitle = require('./scene/title');
var SceneStage = require('./scene/stage');

var Game = function(canvas) {
	core.apply(this, arguments);
};
util.inherit(Game, core);

Game.prototype.init = function () {
	core.prototype.init.apply(this, arguments);

	this.addScene("loading", new SceneLoading(this));
	this.addScene("title", new SceneTitle(this));
	this.addScene("stage", new SceneStage(this));
	this.changeScene("loading");

};

module.exports = Game;

},{"./hakurei":3,"./scene/loading":29,"./scene/stage":31,"./scene/title":34}],3:[function(require,module,exports){
'use strict';

module.exports = require("./hakureijs/index");

},{"./hakureijs/index":7}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
'use strict';

var Constant = {
	BUTTON_LEFT:  0x01,
	BUTTON_UP:    0x02,
	BUTTON_RIGHT: 0x04,
	BUTTON_DOWN:  0x08,
	BUTTON_Z:     0x10,
	BUTTON_X:     0x20,
	BUTTON_SHIFT: 0x40,
	BUTTON_SPACE: 0x80,
};

module.exports = Constant;

},{}],6:[function(require,module,exports){
'use strict';
var CONSTANT = require("./constant");
var ImageLoader = require("./asset_loader/image");

var Core = function(canvas) {
	this.ctx = canvas.getContext('2d');

	this.width = Number(canvas.getAttribute('width'));
	this.height = Number(canvas.getAttribute('height'));

	this.current_scene = null;
	this._reserved_next_scene = null; // next scene which changes next frame run
	this.scenes = {};

	this.frame_count = 0;

	this.request_id = null;

	this.current_keyflag = 0x0;
	this.before_keyflag = 0x0;

	this.is_connect_gamepad = false;

	this.image_loader = new ImageLoader();
};
Core.prototype.init = function () {
	this.current_scene = null;
	this._reserved_next_scene = null; // next scene which changes next frame run

	this.frame_count = 0;

	this.request_id = null;

	this.current_keyflag = 0x0;
	this.before_keyflag = 0x0;


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

	// go to next scene if next scene is set
	this.changeNextSceneIfReserved();

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
	*/

	// 押下されたキーを保存しておく
	this.before_keyflag = this.current_keyflag;

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
	this._reserved_next_scene = name;
};
Core.prototype.changeNextSceneIfReserved = function() {
	if(this._reserved_next_scene) {
		this.current_scene = this._reserved_next_scene;
		this.currentScene().init();

		this._reserved_next_scene = null;
	}
};
Core.prototype.clearCanvas = function() {
	this.ctx.clearRect(0, 0, this.width, this.height);
};
Core.prototype.handleKeyDown = function(e) {
	this.current_keyflag |= this._keyCodeToBitCode(e.keyCode);
	e.preventDefault();
};
Core.prototype.handleKeyUp = function(e) {
	this.current_keyflag &= ~this._keyCodeToBitCode(e.keyCode);
	e.preventDefault();
};
Core.prototype.isKeyDown = function(flag) {
	return((this.current_keyflag & flag) ? true : false);
};
Core.prototype.isKeyPush = function(flag) {
	// not true if key is pressed in previous frame
	return !(this.before_keyflag & flag) && this.current_keyflag & flag;
};
Core.prototype._keyCodeToBitCode = function(keyCode) {
	var flag;
	switch(keyCode) {
		case 16: // shift
			flag = CONSTANT.BUTTON_SHIFT;
			break;
		case 32: // space
			flag = CONSTANT.BUTTON_SPACE;
			break;
		case 37: // left
			flag = CONSTANT.BUTTON_LEFT;
			break;
		case 38: // up
			flag = CONSTANT.BUTTON_UP;
			break;
		case 39: // right
			flag = CONSTANT.BUTTON_RIGHT;
			break;
		case 40: // down
			flag = CONSTANT.BUTTON_DOWN;
			break;
		case 88: // x
			flag = CONSTANT.BUTTON_X;
			break;
		case 90: // z
			flag = CONSTANT.BUTTON_Z;
			break;
	}
	return flag;
};
Core.prototype.handleGamePad = function() {
	if(!this.is_connect_gamepad) return;
	var pads = navigator.getGamepads();
	var pad = pads[0]; // 1Pコン

	if(!pad) return;

	this.current_keyflag = 0x00;
	this.current_keyflag |= pad.buttons[1].pressed ? CONSTANT.BUTTON_Z:      0x00;// A
	this.current_keyflag |= pad.buttons[0].pressed ? CONSTANT.BUTTON_X:      0x00;// B
	this.current_keyflag |= pad.buttons[2].pressed ? CONSTANT.BUTTON_SELECT: 0x00;// SELECT
	this.current_keyflag |= pad.buttons[3].pressed ? CONSTANT.BUTTON_START:  0x00;// START
	this.current_keyflag |= pad.buttons[4].pressed ? CONSTANT.BUTTON_SHIFT:  0x00;// SHIFT
	this.current_keyflag |= pad.buttons[5].pressed ? CONSTANT.BUTTON_SHIFT:  0x00;// SHIFT
	this.current_keyflag |= pad.buttons[6].pressed ? CONSTANT.BUTTON_SPACE:  0x00;// SPACE
	//this.current_keyflag |= pad.buttons[8].pressed ? 0x04 : 0x00;// SELECT
	//this.current_keyflag |= pad.buttons[9].pressed ? 0x08 : 0x00;// START

	this.current_keyflag |= pad.axes[1] < -0.5 ? CONSTANT.BUTTON_UP:         0x00;// UP
	this.current_keyflag |= pad.axes[1] >  0.5 ? CONSTANT.BUTTON_DOWN:       0x00;// DOWN
	this.current_keyflag |= pad.axes[0] < -0.5 ? CONSTANT.BUTTON_LEFT:       0x00;// LEFT
	this.current_keyflag |= pad.axes[0] >  0.5 ? CONSTANT.BUTTON_RIGHT:      0x00;// RIGHT
};



module.exports = Core;

},{"./asset_loader/image":4,"./constant":5}],7:[function(require,module,exports){
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

},{"./asset_loader/image":4,"./constant":5,"./core":6,"./object/base":8,"./object/pool_manager":9,"./object/sprite":10,"./scene/base":11,"./util":12}],8:[function(require,module,exports){
'use strict';

var util = require('../util');

var id = 0;

var ObjectBase = function(scene, object) {
	this.scene = scene;
	this.core = scene.core;
	this.parent = object; // parent object if this is sub object
	this.id = ++id;

	this.frame_count = 0;

	this.x = 0; // local center x
	this.y = 0; // local center y

	// manage flags that disappears in frame elapsed
	this.auto_disable_times_map = {};

	this.velocity = {magnitude:0, theta:0};

	// sub object
	this.objects = [];

};

ObjectBase.prototype.init = function(){
	this.frame_count = 0;

	this.x = 0;
	this.y = 0;

	this.auto_disable_times_map = {};

	for(var i = 0, len = this.objects.length; i < len; i++) {
		this.objects[i].init();
	}
};

ObjectBase.prototype.beforeDraw = function(){
	this.frame_count++;

	this.checkAutoDisableFlags();

	for(var i = 0, len = this.objects.length; i < len; i++) {
		this.objects[i].beforeDraw();
	}

	this.move();
};

ObjectBase.prototype.draw = function() {
	for(var i = 0, len = this.objects.length; i < len; i++) {
		this.objects[i].draw();
	}
};

ObjectBase.prototype.afterDraw = function() {
	for(var i = 0, len = this.objects.length; i < len; i++) {
		this.objects[i].afterDraw();
	}
};

// add sub object
ObjectBase.prototype.addSubObject = function(object){
	this.objects.push(object);
};
ObjectBase.prototype.removeSubObject = function(object){
	// TODO: O(n) -> O(1)
	for(var i = 0, len = this.objects.length; i < len; i++) {
		if(this.objects[i].id === object.id) {
			this.objects.splice(i, 1);
			break;
		}
	}
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
	}
};
ObjectBase.prototype.checkCollisionWithObjects = function(objs) {
	var obj1 = this;
	for(var i = 0; i < objs.length; i++) {
		var obj2 = objs[i];
		if(obj1.checkCollision(obj2)) {
			obj1.onCollision(obj2);
			obj2.onCollision(obj1);
		}
	}
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








// set flags that disappears in frame elapsed
// TODO: enable to set flag which becomes false -> true
ObjectBase.prototype.setAutoDisableFlag = function(flag_name, count) {
	var self = this;

	self[flag_name] = true;

	self.auto_disable_times_map[flag_name] = self.frame_count + count;

};

// check flags that disappears in frame elapsed
ObjectBase.prototype.checkAutoDisableFlags = function() {
	var self = this;
	for (var flag_name in self.auto_disable_times_map) {
		if(this.auto_disable_times_map[flag_name] < self.frame_count) {
			self[flag_name] = false;
			delete self.auto_disable_times_map[flag_name];
		}
	}
};




ObjectBase.prototype.setVelocity = function(velocity) {
	this.velocity = velocity;
};
module.exports = ObjectBase;


},{"../util":12}],9:[function(require,module,exports){
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

},{"../util":12,"./base":8}],10:[function(require,module,exports){
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
	if(!this.isShow()) return;

	var image = this.core.image_loader.getImage(this.spriteName());

	if(this.scale()) console.error("scale method is deprecated. you should use scaleWidth and scaleHeight.");

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

	var width  = this.width();
	var height = this.height();

	// reflect left or right
	if(this.isReflect()) {
		ctx.transform(-1, 0, 0, 1, 0, 0);
	}

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

	// draw sub objects
	base_object.prototype.draw.apply(this, arguments);
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
Sprite.prototype.width = function(){
	return this.spriteWidth() * this.scaleWidth();
};
Sprite.prototype.height = function(){
	return this.spriteHeight() * this.scaleHeight();
};




Sprite.prototype.isShow = function(){
	return 1;
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

// scale method is deprecated. you should use scaleWidth and scaleHeight
Sprite.prototype.scale = function(){
	return 0;
};


Sprite.prototype.scaleWidth = function(){
	return 1;
};
Sprite.prototype.scaleHeight = function(){
	return 1;
};
Sprite.prototype.isReflect = function(){
	return false;
};




module.exports = Sprite;

},{"../util":12,"./base":8}],11:[function(require,module,exports){
'use strict';

var SceneBase = function(core, scene) {
	this.core = core;
	this.parent = scene; // parent scene if this is sub scene
	this.width = this.core.width; // default
	this.height = this.core.height; // default

	this.x = 0;
	this.y = 0;

	this.frame_count = 0;

	this.objects = [];

	// sub scenes
	this.current_scene = null;
	this._reserved_next_scene = null; // next scene which changes next frame run
	this.scenes = {};
};

SceneBase.prototype.init = function(){
	// sub scenes
	this.current_scene = null;
	this._reserved_next_scene = null; // next scene which changes next frame run

	this.x = 0;
	this.y = 0;

	this.frame_count = 0;

	for(var i = 0, len = this.objects.length; i < len; i++) {
		this.objects[i].init();
	}
};

SceneBase.prototype.beforeDraw = function(){
	this.frame_count++;

	// go to next sub scene if next scene is set
	this.changeNextSubSceneIfReserved();

	for(var i = 0, len = this.objects.length; i < len; i++) {
		this.objects[i].beforeDraw();
	}

	if(this.currentSubScene()) this.currentSubScene().beforeDraw();
};

SceneBase.prototype.draw = function(){
	for(var i = 0, len = this.objects.length; i < len; i++) {
		this.objects[i].draw();
	}
	if(this.currentSubScene()) this.currentSubScene().draw();
};

SceneBase.prototype.afterDraw = function(){
	for(var i = 0, len = this.objects.length; i < len; i++) {
		this.objects[i].afterDraw();
	}

	if(this.currentSubScene()) this.currentSubScene().afterDraw();
};

SceneBase.prototype.addObject = function(object){
	this.objects.push(object);
};
SceneBase.prototype.currentSubScene = function() {
	if(this.current_scene === null) {
		return;
	}

	return this.scenes[this.current_scene];
};
SceneBase.prototype.addSubScene = function(name, scene) {
	this.scenes[name] = scene;
};
SceneBase.prototype.changeSubScene = function(name) {
	this._reserved_next_scene = name;
};
SceneBase.prototype.changeNextSubSceneIfReserved = function() {
	if(this._reserved_next_scene) {
		this.current_scene = this._reserved_next_scene;
		this.currentSubScene().init();

		this._reserved_next_scene = null;
	}
};



module.exports = SceneBase;


},{}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
	{"pos":"left","exp":"normal","chara":"reimu","fukidashi":"normal","serif":"いたた..."},
	{"pos":"right","exp":"laugh","chara":"yukari","fukidashi":"normal","serif":"あらあら"},
	{"pos":"left","exp":"normal","chara":"reimu","fukidashi":"normal","serif":"あ、ゆかり"},
	{"pos":"left","exp":"angry","chara":"reimu","fukidashi":"normal","serif":"またアンタのしわざね"},
	{"pos":"right","exp":"laugh","chara":"yukari","fukidashi":"normal","serif":"暇そうにしてたから♪"},
	{"pos":"right","exp":"laugh","chara":"yukari","fukidashi":"normal","serif":"それよりほら、見て"},
	{"pos":"left","exp":"angry","chara":"reimu","fukidashi":"normal","serif":"なによ"},
	{"pos":"left","exp":"laugh2","chara":"reimu","fukidashi":"normal","serif":"あ、お金！"},
	{"pos":"right","exp":"laugh","chara":"yukari","fukidashi":"normal","serif":"せっかくだから、拾って帰りましょう"},
	{"pos":"left","exp":"normal","chara":"reimu","fukidashi":"normal","serif":"取れない場所にもあるわ"},
	{"pos":"right","exp":"laugh","chara":"yukari","fukidashi":"normal","serif":"わたしも手伝ってあげるわよ"},
	{"pos":"right","exp":"laugh","chara":"yukari","fukidashi":"normal","serif":"Zボタンで私と霊夢の位置を入れかえることができるわ"},
	{"pos":"right","exp":"laugh","chara":"yukari","fukidashi":"normal","serif":"私は霊夢と反対の位置にいるから"},
	{"pos":"left","exp":"normal","chara":"reimu","fukidashi":"normal","serif":"Xボタンね"},
	{"pos":"right","exp":"laugh","chara":"yukari","fukidashi":"normal","serif":"ステージにあるお金を全部取れたら、帰れるわよ"},
];
module.exports = Serif;

},{}],14:[function(require,module,exports){
'use strict';

var SerifManager = function (script) {
	this.timeoutID = null;

	// serif scenario
	this.script = script;

	// where serif has progressed
	this.progress = null;

	this.left_chara_id  = null;
	this.left_exp       = null;
	this.right_chara_id = null;
	this.right_exp      = null;

	// which chara is talking, left or right
	this.pos = null;

	// now printing message
	this.line_num = 0;
	this.printing_lines = [];
};

SerifManager.prototype.init = function () {
	this.progress = -1;
	this.timeoutID = null;
	this.left_chara_id = null;
	this.left_exp = null;
	this.right_chara_id = null;
	this.right_exp = null;
	this.pos  = null;

	this.line_num = 0;
	this.printing_lines = [];

	if(!this.is_end()) {
		this.next(); // start
	}
};


SerifManager.prototype.is_end = function () {
	return this.progress + 1 === this.script.length;
};

SerifManager.prototype.next = function () {
	this.progress++;

	var script = this.script[this.progress];

	this._showChara(script);

	if(script.serif) {
		this._printMessage(script.serif);
	}
	else {
		// If serif is empty, show chara without talking and next
		this.next();
	}
};

SerifManager.prototype._showChara = function(script) {
	if(script.pos) {
		this.pos  = script.pos;

		if(script.pos === "left") {
			this.left_chara_id = script.chara;
			this.left_exp = script.exp;
		}
		else if(script.pos === "right") {
			this.right_chara_id = script.chara;
			this.right_exp = script.exp;
		}
	}
};

SerifManager.prototype._printMessage = function (message) {
	var self = this;

	// cancel already started message
	if(self.timeoutID !== null) {
		clearTimeout(self.timeoutID);
		self.timeoutID = null;
	}

	var char_list = message.split("");
	var char_length = char_list.length;

	var idx = 0;

	// clear showing message
	self.line_num = 0;
	self.printing_lines = [];

	var output = function() {
		if (idx >= char_length) return;

		// typography speed
		var speed = 10;

		var ch = char_list[idx];
		idx++;

		if (ch === "\n") {
			self.line_num++;
		}
		else {
			// initialize
			if(!self.printing_lines[self.line_num]) {
				self.printing_lines[self.line_num] = "";
			}

			// show A word
			self.printing_lines[self.line_num] = self.printing_lines[self.line_num] + ch;
		}

		self.timeoutID = setTimeout(output, speed);
	};
	output();
};

SerifManager.prototype.right_image = function () {
	return(this.right_chara_id ? this.right_chara_id + "_" + this.right_exp : null);
};
SerifManager.prototype.left_image = function () {
	return(this.left_chara_id ? this.left_chara_id + "_" + this.left_exp : null);
};

SerifManager.prototype.right_name = function () {
	return this.right_chara_id ? "name_" + this.right_chara_id : null;
};
SerifManager.prototype.left_name = function () {
	return this.left_chara_id ? "name_" + this.left_chara_id : null;
};
SerifManager.prototype.is_left_talking = function () {
	return this.pos === "left" ? true : false;
};
SerifManager.prototype.is_right_talking = function () {
	return this.pos === "right" ? true : false;
};

SerifManager.prototype.lines = function () {
	return this.printing_lines;
};

module.exports = SerifManager;

},{}],15:[function(require,module,exports){
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
	//window.alert(msg + "\n" + line + ":" + column);
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

},{"./game":2}],16:[function(require,module,exports){
'use strict';
var base_object = require('../hakurei').object.sprite;
var util = require('../hakurei').util;
var ExchangeAnim = require('./exchange_anim');

var AlterEgo = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(AlterEgo, base_object);

AlterEgo.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.x = x;
	this.y = y;

	this.span = 0;
	this.exchange_animation_start_count = 0;
	this.exchange_anim = new ExchangeAnim(this.scene);
};

AlterEgo.prototype.beforeDraw = function(){
	base_object.prototype.beforeDraw.apply(this, arguments);

	// 交代アニメーション再生
	if(this.exchange_animation_start_count) {
		// 交代アニメーション終了
		if(this.frame_count - this.exchange_animation_start_count > this.span) {
			// リセット
			this.exchange_animation_start_count = 0;
			this.removeSubObject(this.exchange_anim);
		}
	}

};

AlterEgo.prototype.spriteName = function(){
	return "alterego";
};
AlterEgo.prototype.spriteIndices = function(){
	return [{x: 0, y: 0}];
};
AlterEgo.prototype.spriteWidth = function(){
	return 200;
};
AlterEgo.prototype.spriteHeight = function(){
	return 200;
};
AlterEgo.prototype.scaleWidth = function(){
	return 0.2;
};
AlterEgo.prototype.scaleHeight = function(){
	return 0.2;
};

AlterEgo.prototype.scaleWidth = function(){
	if(this.exchange_animation_start_count && (this.span/2) < this.frame_count - this.exchange_animation_start_count) {
		return 0.2 * (this.span/2 - (this.frame_count - this.exchange_animation_start_count -  this.span/2)) / (this.span/2);
	}
	else {
		return 0.2;
	}

};
AlterEgo.prototype.scaleHeight = function(){
	if(this.exchange_animation_start_count && (this.span/2) < this.frame_count - this.exchange_animation_start_count) {
		return 0.2 * (this.span/2 - (this.frame_count - this.exchange_animation_start_count -  this.span/2)) / (this.span/2);
	}
	else {
		return 0.2;
	}
};






// 位置移動
AlterEgo.prototype.startExchange = function(span) {
	this.exchange_animation_start_count = this.frame_count;
	this.span = span;

	this.exchange_anim.init(this.x, this.y, span);
	this.addSubObject(this.exchange_anim);
};







module.exports = AlterEgo;

},{"../hakurei":3,"./exchange_anim":17}],17:[function(require,module,exports){
'use strict';
var base_object = require('../hakurei').object.sprite;
var util = require('../hakurei').util;

var AlterEgo = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(AlterEgo, base_object);

AlterEgo.prototype.init = function(x, y, anim_span) {
	base_object.prototype.init.apply(this, arguments);
	this.x = x;
	this.y = y;

	this.anim_span = anim_span;
};

AlterEgo.prototype.beforeDraw = function(){
	base_object.prototype.beforeDraw.apply(this, arguments);
};

AlterEgo.prototype.spriteName = function(){
	return "exchange";
};
AlterEgo.prototype.spriteIndices = function(){
	return [{x: 0, y: 0}];
};
AlterEgo.prototype.spriteWidth = function(){
	return 200;
};
AlterEgo.prototype.spriteHeight = function(){
	return 200;
};
AlterEgo.prototype.scaleWidth = function(){
	if(this.frame_count < this.anim_span/2) {
		return 0.25 * this.frame_count / (this.anim_span/2);
	}
	else {
		return 0.25;
	}
};
AlterEgo.prototype.scaleHeight = function(){
	if(this.frame_count < this.anim_span/2) {
		return 0.25 * this.frame_count / (this.anim_span/2);
	}
	else {
		return 0.25;
	}

};

module.exports = AlterEgo;

},{"../hakurei":3}],18:[function(require,module,exports){
'use strict';
var base_object = require('../../hakurei').object.sprite;
var util = require('../../hakurei').util;

var BlockBase = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(BlockBase, base_object);

BlockBase.prototype.collisionWidth = function() {
	return 24;
};
BlockBase.prototype.collisionHeight = function() {
	return 24;
};

// sprite configuration

BlockBase.prototype.spriteName = function(){
	return "block";
};
BlockBase.prototype.spriteIndices = function(){
	console.error("spriteIndices must be overwritten");
};
BlockBase.prototype.spriteWidth = function(){
	return 16;
};
BlockBase.prototype.spriteHeight = function(){
	return 16;
};
BlockBase.prototype.scaleWidth = function(){
	return 1.5;
};
BlockBase.prototype.scaleHeight = function(){
	return 1.5;
};





module.exports = BlockBase;

},{"../../hakurei":3}],19:[function(require,module,exports){
'use strict';
var CONSTANT = require('../../constant');
var base_object = require('./block_base');
var util = require('../../hakurei').util;

var BlockGreen = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(BlockGreen, base_object);

BlockGreen.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.x = x;
	this.y = y;
};

BlockGreen.prototype.spriteIndices = function(){
	return [{x: 5, y: 0}];
};


module.exports = BlockGreen;

},{"../../constant":1,"../../hakurei":3,"./block_base":18}],20:[function(require,module,exports){
'use strict';
var CONSTANT = require('../../constant');
var base_object = require('./block_base');
var util = require('../../hakurei').util;

var BlockGreen = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(BlockGreen, base_object);

BlockGreen.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.x = x;
	this.y = y;
};

BlockGreen.prototype.spriteIndices = function(){
	return [{x: 3, y: 0}];
};


module.exports = BlockGreen;

},{"../../constant":1,"../../hakurei":3,"./block_base":18}],21:[function(require,module,exports){
'use strict';
var CONSTANT = require('../../constant');
var base_object = require('./block_base');
var util = require('../../hakurei').util;

var BlockGreen = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(BlockGreen, base_object);

BlockGreen.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.x = x;
	this.y = y;
};

BlockGreen.prototype.spriteIndices = function(){
	return [{x: 4, y: 0}];
};

module.exports = BlockGreen;

},{"../../constant":1,"../../hakurei":3,"./block_base":18}],22:[function(require,module,exports){
'use strict';
var CONSTANT = require('../../constant');
var base_object = require('./block_base');
var util = require('../../hakurei').util;

var BlockGreen = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(BlockGreen, base_object);

BlockGreen.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.x = x;
	this.y = y;
};

BlockGreen.prototype.spriteIndices = function(){
	return [{x: 7, y: 0}];
};

module.exports = BlockGreen;

},{"../../constant":1,"../../hakurei":3,"./block_base":18}],23:[function(require,module,exports){
'use strict';
var CONSTANT = require('../../constant');
var base_object = require('./block_base');
var util = require('../../hakurei').util;

var BlockGreen = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(BlockGreen, base_object);

BlockGreen.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.x = x;
	this.y = y;
};


BlockGreen.prototype.spriteIndices = function(){
	return [{x: 6, y: 0}];
};


module.exports = BlockGreen;

},{"../../constant":1,"../../hakurei":3,"./block_base":18}],24:[function(require,module,exports){
'use strict';
var CONSTANT = require('../../constant');
var base_object = require('../../hakurei').object.sprite;
var util = require('../../hakurei').util;

var Death = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(Death, base_object);

Death.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.x = x;
	this.y = y;
	this.is_show = true;
};

// sprite configuration

Death.prototype.spriteName = function(){
	return "water";
};
Death.prototype.spriteIndices = function(){
	return [{x: 0, y: 0}];
};
Death.prototype.spriteWidth = function(){
	return 16;
};
Death.prototype.spriteHeight = function(){
	return 16;
};
Death.prototype.scaleWidth = function(){
	return 1.5;
};
Death.prototype.scaleHeight = function(){
	return 1.5;
};
module.exports = Death;

},{"../../constant":1,"../../hakurei":3}],25:[function(require,module,exports){
'use strict';
var CONSTANT = require('../../constant');
var base_object = require('../../hakurei').object.base;
var util = require('../../hakurei').util;

var BlockGreen = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(BlockGreen, base_object);

BlockGreen.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.x = x;
	this.y = y;
};

BlockGreen.prototype.draw = function() {
	base_object.prototype.draw.apply(this, arguments);

	var ctx = this.core.ctx;
	var item = this.core.image_loader.getImage("item");
	ctx.drawImage(item,
		// sprite position
		32 * 0, 32 * 3,
		// sprite size to get
		32, 32,
		this.x, this.y,
		// sprite size to show
		CONSTANT.TILE_SIZE, CONSTANT.TILE_SIZE
	);
};

module.exports = BlockGreen;

},{"../../constant":1,"../../hakurei":3}],26:[function(require,module,exports){
'use strict';
var CONSTANT = require('../../constant');
var base_object = require('../../hakurei').object.sprite;
var util = require('../../hakurei').util;

var Item = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(Item, base_object);

Item.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.x = x;
	this.y = y;
	this.is_show = true;
};

Item.prototype.got = function() {
	this.is_show = false;
};

Item.prototype.isShow = function() {
	return this.is_show;
};










// sprite configuration

Item.prototype.spriteName = function(){
	return "item";
};
Item.prototype.spriteIndices = function(){
	return [{x: 3, y: 2}];
};
Item.prototype.spriteWidth = function(){
	return 32;
};
Item.prototype.spriteHeight = function(){
	return 32;
};
Item.prototype.scaleWidth = function(){
	return 1;
};
Item.prototype.scaleHeight = function(){
	return 1;
};

module.exports = Item;

},{"../../constant":1,"../../hakurei":3}],27:[function(require,module,exports){
'use strict';
var CONSTANT = require('../../constant');
var base_object = require('../../hakurei').object.sprite;
var util = require('../../hakurei').util;

var Ladder = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(Ladder, base_object);

Ladder.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.x = x;
	this.y = y;
};
/*
Ladder.prototype.draw = function() {
	base_object.prototype.draw.apply(this, arguments);

	var ctx = this.core.ctx;
	var hashigo = this.core.image_loader.getImage("hashigo");

	ctx.drawImage(hashigo,
		// sprite position
		0, 0,
		// sprite size to get
		32, 16,
		this.x, this.y,
		// sprite size to show
		CONSTANT.TILE_SIZE, CONSTANT.TILE_SIZE
	);

};
*/
// sprite configuration

Ladder.prototype.spriteName = function(){
	return "hashigo";
};
Ladder.prototype.spriteIndices = function(){
	return [{x: 0, y: 0}];
};
Ladder.prototype.spriteWidth = function(){
	return 32;
};
Ladder.prototype.spriteHeight = function(){
	return 16;
};
Ladder.prototype.scaleWidth = function(){
	return 0.75;
};
Ladder.prototype.scaleHeight = function(){
	return 1.5;
};

// collision configuration

Ladder.prototype.collisionWidth = function() {
	return 32;
};
Ladder.prototype.collisionHeight = function() {
	return 32;
};









module.exports = Ladder;

},{"../../constant":1,"../../hakurei":3}],28:[function(require,module,exports){
'use strict';

var CONSTANT = require('../../constant');
var H_CONSTANT = require('../../hakurei').constant;

// 移動速度
var MOVE_SPEED = 4;
// 落下速度
var FALL_SPEED = 4;

// 交代アニメーション時間
var EXCHANGE_ANIM_SPAN = 60;
// 死亡アニメーション時間
var DIE_ANIM_SPAN = 180;

// 地面ブロック一覧
var BLOCK_TILE_TYPES = [
	CONSTANT.BLOCK_GREEN,
	CONSTANT.BLOCK_BLUE,
	CONSTANT.BLOCK_RED,
	CONSTANT.BLOCK_PURPLE,
	CONSTANT.BLOCK_BROWN,
	CONSTANT.LADDER, // はしごも
];

// 壁ブロック一覧
var BLOCK_TILE_TYPES2 = [
	CONSTANT.BLOCK_GREEN,
	CONSTANT.BLOCK_BLUE,
	CONSTANT.BLOCK_RED,
	CONSTANT.BLOCK_PURPLE,
	CONSTANT.BLOCK_BROWN,
];



var base_object = require('../../hakurei').object.sprite;
var BlockBase = require('./block_base');
var AlterEgo = require('../alterego');
var ExchangeAnim = require('../exchange_anim');
var util = require('../../hakurei').util;

var Player = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(Player, base_object);

Player.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.x = x;
	this.y = y;

	this.is_reflect = false; // 左を向いているか
	this.is_down = false; // 落下中かどうか
	this.is_down_ladder = false; // はしごを降りている最中かどうか

	this.exchange_animation_start_count = 0; // 交代アニメーション開始時刻

	this.die_animation_start_count = 0; // 死亡アニメーション開始時刻

	this.alterego = new AlterEgo(this.scene);
	this.alterego.init(this.scene.width - this.x, this.y); // TODO: not only verticies
	this.addSubObject(this.alterego);

	this.exchange_anim = new ExchangeAnim(this.scene);
};

Player.prototype.beforeDraw = function(){
	base_object.prototype.beforeDraw.apply(this, arguments);


	// 落下していく
	if(!this.isDying()) {
		if(!this.checkCollisionWithBlocks()) {
			this.moveY(FALL_SPEED);
			this.is_down = true;
		}
		else {
			this.is_down = false;
		}
	}

	// はしごを降りている
	var collision_ladder = this.checkCollisionWithLadder();
	if(collision_ladder) {
		if(this.core.isKeyDown(H_CONSTANT.BUTTON_DOWN)) {
			this.x = collision_ladder.x;
			this.moveY(FALL_SPEED);
			this.is_down_ladder = true;
		}
		else if(this.core.isKeyDown(H_CONSTANT.BUTTON_UP)) {
			this.x = collision_ladder.x;
			this.moveY(-FALL_SPEED);
			this.is_down_ladder = true;
		}
	}
	else {
		this.is_down_ladder = false;
	}


	// 交代アニメーション再生
	if(this.exchange_animation_start_count) {
		// 交代アニメーション終了
		if(this.frame_count - this.exchange_animation_start_count > EXCHANGE_ANIM_SPAN) {
			// 位置移動
			this.exchange_position();

			// リセット
			this.exchange_animation_start_count = 0;
			this.removeSubObject(this.exchange_anim);
		}
	}

	// 死亡アニメーションが終了するかどうか
	if(this.isDying()) {
		// 交代アニメーション終了
		if(this.frame_count - this.die_animation_start_count > DIE_ANIM_SPAN) {
			this.scene.restart();
		}
	}

	// 壁との接触判定
	var repulse_x = this.checkCollisionWithLeftRightBlocks();
	if(repulse_x) {
		this.moveX(repulse_x);
	}

	// アイテムとの接触判定
	var item = this.checkCollisionWithItems();
	if(item) {
		item.got(); // 獲得済
		this.scene.addReimuItemNum();
		if (this.scene.isClear()) {
			// TODO: ステージクリア
			console.log("stage clear!");
		}
	}

	// 死亡判定
	var is_collision_to_death = this.checkCollisionWithDeathOrEnemy();
	if(!this.isDying() && is_collision_to_death) {
		this.startDie();
	}

};

// 落下判定
Player.prototype.checkCollisionWithBlocks = function() {
	var self = this;
	// 壁と自機の衝突判定
	var is_collision = false;
	for (var i = 0; i < BLOCK_TILE_TYPES.length; i++) {
		var tile_type = BLOCK_TILE_TYPES[i];
		var tile_objects = self.scene.objects_by_tile_type[tile_type];

		for (var j = 0; j < tile_objects.length; j++) {
			var obj = tile_objects[j];

			// 落下判定なので、自機より上のブロックは無視する
			if(self.y-self.collisionHeight()/2 > obj.y-obj.collisionHeight()/2) continue;
			if(self.checkCollision(obj)) {
				is_collision = true;
				break;
			}
		}
	}

	return is_collision;
};

// 壁との衝突判定
Player.prototype.checkCollisionWithLeftRightBlocks = function() {
	var self = this;
	// 壁と自機の衝突判定
	var repulse_x = 0;
	for (var i = 0; i < BLOCK_TILE_TYPES2.length; i++) {
		var tile_type = BLOCK_TILE_TYPES2[i];
		var tile_objects = self.scene.objects_by_tile_type[tile_type];

		for (var j = 0; j < tile_objects.length; j++) {
			var obj = tile_objects[j];

			// 壁の衝突判定なので自機より上あるいは下のブロックは無視する
			if(self.y-self.collisionHeight()/2 > obj.y-obj.collisionHeight()/2) continue; // 自機より下
			if(self.y+self.collisionHeight()/2 < obj.y+obj.collisionHeight()/2) continue; // 自機より上
			if(self.checkCollision(obj)) {
				repulse_x = self.x - obj.x;
				break;
			}
		}
	}

	return repulse_x;
};

Player.prototype.checkCollisionWithLadder = function() {
	var self = this;
	// はしごと自機の衝突判定
	var collision_ladder = false;

	self.scene.objects_by_tile_type[CONSTANT.LADDER].forEach(function(obj) {
		if(self.checkCollision(obj)) {
			collision_ladder = obj;
			// TODO: break;
		}
	});

	return collision_ladder;
};

Player.prototype.checkCollisionWithItems = function() {
	var self = this;
	// アイテムと自機の衝突判定
	var collision_item = false;

	self.scene.objects_by_tile_type[CONSTANT.ITEM].forEach(function(obj) {
		if(obj.isShow() && self.checkCollision(obj)) {
			collision_item = obj;
			// TODO: break;
		}
	});

	return collision_item;
};

Player.prototype.checkCollisionWithDeathOrEnemy = function() {
	var self = this;
	// 死亡ゾーン or 敵と自機の衝突判定
	var is_collision = false;

	self.scene.objects_by_tile_type[CONSTANT.DEATH]
		.concat(self.scene.objects_by_tile_type[CONSTANT.ENEMY])
		.forEach(function(obj) {
		if(self.checkCollision(obj)) {
			is_collision = obj;
			// TODO: break;
		}
	});

	return is_collision;
};






Player.prototype.moveLeft = function() {
	if(!this.isEnableMove()) return;
	if(this.is_down) return;

	this.x -= MOVE_SPEED;
	this.is_reflect = true;

	this.alterego.x += MOVE_SPEED;
};
Player.prototype.moveRight = function() {
	if(!this.isEnableMove()) return;
	if(this.is_down) return;

	this.x += MOVE_SPEED;
	this.is_reflect = false;

	this.alterego.x -= MOVE_SPEED;
};

Player.prototype.moveX = function(x) {
	if(!this.isEnableMove()) return;
	this.x += x;
	this.alterego.x -= x;
};
Player.prototype.moveY = function(y) {
	if(!this.isEnableMove()) return;
	this.y += y;
	this.alterego.y += y;
};

Player.prototype.isEnableMove = function() {
	if(this.exchange_animation_start_count) return false; // 位置移動中は実行できない

	return true;
};




// 位置移動
Player.prototype.startExchange = function() {
	if(!this.isEnableMove()) return;
	this.exchange_animation_start_count = this.frame_count;

	this.exchange_anim.init(this.x, this.y, EXCHANGE_ANIM_SPAN);
	this.addSubObject(this.exchange_anim);

	// 紫もアニメーション
	this.alterego.startExchange(EXCHANGE_ANIM_SPAN);
};

Player.prototype.exchange_position = function() {
	var player_x = this.x;
	var player_y = this.y;
	var alterego_x = this.alterego.x;
	var alterego_y = this.alterego.y;

	this.x = alterego_x;
	this.y = alterego_y;

	this.alterego.x = player_x;
	this.alterego.y = player_y;
};

// 死亡開始
Player.prototype.startDie = function() {
	this.die_animation_start_count = this.frame_count;
};
// 死亡中かどうか
Player.prototype.isDying = function() {
	return this.die_animation_start_count ? true : false;
};






/*
Player.prototype.draw = function() {
	base_object.prototype.draw.apply(this, arguments);

	var ctx = this.core.ctx;
	var player = this.core.image_loader.getImage("player");

	var player_width=32;

	ctx.save();
	if (this.is_left_to) {
		ctx.transform(-1, 0, 0, 1, player_width,  0); // 左右反転
		ctx.drawImage(player,
			// sprite position
			32 * 1, 48 * 2,
			// sprite size to get
			32, 48,
			-this.x, this.y,
			// sprite size to show
			32, 48
		);
	}
	else {
		ctx.drawImage(player,
			// sprite position
			32 * 1, 48 * 2,
			// sprite size to get
			32, 48,
			this.x, this.y,
			// sprite size to show
			32, 48
		);
	}
	ctx.restore();
};
*/

Player.prototype.isShow = function() {
	if(this.isDying()) { // 死亡中は点滅する
		return this.frame_count % 40 > 20;
	}
	else {
		return true;
	}
};



Player.prototype.spriteName = function(){
	return "player";
};
Player.prototype.spriteIndices = function(){
	return this.is_down_ladder ? [{x: 1, y: 3}] : [{x: 1, y: 2}];
};
Player.prototype.spriteWidth = function(){
	return 32;
};
Player.prototype.spriteHeight = function(){
	return 48;
};
Player.prototype.scaleWidth = function(){
	if(this.exchange_animation_start_count && (EXCHANGE_ANIM_SPAN/2) < this.frame_count - this.exchange_animation_start_count) {
		return (EXCHANGE_ANIM_SPAN/2 - (this.frame_count - this.exchange_animation_start_count -  EXCHANGE_ANIM_SPAN/2)) / (EXCHANGE_ANIM_SPAN/2);
	}
	else {
		return 1;
	}

};
Player.prototype.scaleHeight = function(){
	if(this.exchange_animation_start_count && (EXCHANGE_ANIM_SPAN/2) < this.frame_count - this.exchange_animation_start_count) {
		return (EXCHANGE_ANIM_SPAN/2 - (this.frame_count - this.exchange_animation_start_count -  EXCHANGE_ANIM_SPAN/2)) / (EXCHANGE_ANIM_SPAN/2);
	}
	else {
		return 1;
	}
};
Player.prototype.isReflect = function(){
	return this.is_reflect;
};











/*
Player.prototype.onCollision = function(obj) {
	if (obj instanceof BlockBase) {
		var player_down_y = this.globalDownY();
		var block_up_y = obj.globalUpY();

		if(player_down_y < block_up_y) { // 落下させない
			this.y = block_up_y - 48;
		}
	}
};
*/
Player.prototype.collisionWidth = function() {
	return 24;
};
Player.prototype.collisionHeight = function() {
	return 48;
};





module.exports = Player;

},{"../../constant":1,"../../hakurei":3,"../alterego":16,"../exchange_anim":17,"./block_base":18}],29:[function(require,module,exports){
'use strict';

// scene to load image and sound

var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;

var SceneLoading = function(core) {
	base_scene.apply(this, arguments);
};
util.inherit(SceneLoading, base_scene);

SceneLoading.prototype.init = function() {
	base_scene.prototype.init.apply(this, arguments);
	this.core.image_loader.loadImage("title_bg", "./image/title_bg.jpg");
	this.core.image_loader.loadImage("block", "./image/block.png");
	this.core.image_loader.loadImage("water", "./image/water.png");
	this.core.image_loader.loadImage("player", "./image/player.png");
	this.core.image_loader.loadImage("alterego", "./image/alterego.png");
	this.core.image_loader.loadImage("exchange", "./image/exchange.png");
	this.core.image_loader.loadImage("hashigo", "./image/hashigo.png");
	this.core.image_loader.loadImage("item", "./image/item.png");
	this.core.image_loader.loadImage("reimu_angry", "./image/reimu_angry.png");
	this.core.image_loader.loadImage("reimu_laugh", "./image/reimu_laugh.png");
	this.core.image_loader.loadImage("reimu_laugh2", "./image/reimu_laugh2.png");
	this.core.image_loader.loadImage("reimu_normal", "./image/reimu_normal.png");
	this.core.image_loader.loadImage("reimu_yoyu", "./image/reimu_yoyu.png");
	this.core.image_loader.loadImage("yukari_angry", "./image/yukari_angry.png");
	this.core.image_loader.loadImage("yukari_angry", "./image/yukari_angry.png");
	this.core.image_loader.loadImage("yukari_laugh", "./image/yukari_laugh.png");
	this.core.image_loader.loadImage("yukari_normal", "./image/yukari_normal.png");

};

SceneLoading.prototype.beforeDraw = function() {
	base_scene.prototype.beforeDraw.apply(this, arguments);

	if (this.core.image_loader.isAllLoaded()) {
		this.core.changeScene("title");
	}
};
SceneLoading.prototype.draw = function(){
	base_scene.prototype.draw.apply(this, arguments);

	// TODO: update loading message
	var ctx = this.core.ctx;
	ctx.save();
	ctx.fillStyle = 'rgb( 0, 0, 0 )';
	ctx.textAlign = 'right';
	ctx.font = "30px 'ＭＳ ゴシック'";
	ctx.fillText('Now Loading...', 400, 225);
	ctx.restore();
};

module.exports = SceneLoading;

},{"../hakurei":3}],30:[function(require,module,exports){
'use strict';
var N = -1;
var D = 10;
	// 横:30, 縦20
	// N: 何もなし
	// 0: 背景
	// 1: 緑ブロック
	// 2: 青ブロック
	// 3: 赤ブロック
	// 4: 紫ブロック
	// 5: 茶ブロック
	// 6: はしご
	// 7: プレイヤー
	// 8: 敵
	// 9: アイテム
	// D: 死亡ゾーン
var stage = [
	[0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,7,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,N,0,0,0,0,0,0],
	[0,2,2,2,2,2,2,2,6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
	[0,0,0,0,2,2,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0],
	[0,0,0,0,2,2,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0],
	[0,0,0,0,2,2,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,1,1,1,0,0],
	[0,0,0,0,2,2,0,3,3,3,0,0,0,0,0,0,0,0,0,0,3,3,3,0,0,1,1,1,0,0],
	[0,0,0,0,2,2,0,3,3,3,0,0,0,0,0,0,0,0,0,0,3,3,3,0,0,1,1,1,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,9,0,0,8,0,0,0,0,0,0,0],
	[0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0],
	[0,0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
];

module.exports = stage;

},{}],31:[function(require,module,exports){
'use strict';

	var offset_x = 25;
	var offset_y = 50;

var MAX_REIMU_ITEM_NUM = 3;

var util = require('../hakurei').util;
var CONSTANT = require('../constant');

var BlockGreen  = require('../object/tile/block_green');
var BlockBlue   = require('../object/tile/block_blue');
var BlockRed    = require('../object/tile/block_red');
var BlockPurple = require('../object/tile/block_purple');
var BlockBrown  = require('../object/tile/block_brown');
var Ladder      = require('../object/tile/ladder');
var Player      = require('../object/tile/player');
var Enemy       = require('../object/tile/enemy');
var Item        = require('../object/tile/item');
var Death       = require('../object/tile/death');

// tile_type => クラス名
var TILE_TYPE_TO_CLASS = {};
//TILE_TYPE_TO_CLASS[CONSTANT.BACKGROUND]  = BackGround;
TILE_TYPE_TO_CLASS[CONSTANT.BLOCK_GREEN]  = BlockGreen;
TILE_TYPE_TO_CLASS[CONSTANT.BLOCK_BLUE]   = BlockBlue;
TILE_TYPE_TO_CLASS[CONSTANT.BLOCK_RED]    = BlockRed;
TILE_TYPE_TO_CLASS[CONSTANT.BLOCK_PURPLE] = BlockPurple;
TILE_TYPE_TO_CLASS[CONSTANT.BLOCK_BROWN]  = BlockBrown;
TILE_TYPE_TO_CLASS[CONSTANT.LADDER]       = Ladder;
TILE_TYPE_TO_CLASS[CONSTANT.PLAYER]       = Player;
TILE_TYPE_TO_CLASS[CONSTANT.ENEMY]        = Enemy;
TILE_TYPE_TO_CLASS[CONSTANT.ITEM]         = Item;
TILE_TYPE_TO_CLASS[CONSTANT.DEATH]        = Death;


var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;
var SceneStageTalk = require("./stage/talk");
var SceneStagePlay = require("./stage/play");
var stage1_map = require("./map/stage1");

var SceneStage = function(core) {
	base_scene.apply(this, arguments);

	this.addSubScene("talk", new SceneStageTalk(core, this));
	this.addSubScene("play", new SceneStagePlay(core, this));
};
util.inherit(SceneStage, base_scene);

SceneStage.prototype.init = function(){
	base_scene.prototype.init.apply(this, arguments);

	this.reimu_item_num = 0;

	// タイルの種類毎のオブジェクトの配列
	this.objects_by_tile_type = this.initializeObjectsByTileType();

	// マップデータからオブジェクト生成
	this.parseAndCreateMap(stage1_map);

	// 会話シーン
	this.changeSubScene("talk");
};
SceneStage.prototype.beforeDraw = function(){
	base_scene.prototype.beforeDraw.apply(this, arguments);

	var self = this;

	var player = self.player();

};

SceneStage.prototype.restart = function(){
	this.core.changeScene("stage");
};



// プレイヤー(1ステージにプレイヤーは1人の想定)
SceneStage.prototype.player = function () {
	return this.objects_by_tile_type[ CONSTANT.PLAYER ][0];
};
// ステージをクリアしたかどうか
SceneStage.prototype.isClear = function () {
	return this.reimu_item_num >= MAX_REIMU_ITEM_NUM ? true : false;
};




SceneStage.prototype.draw = function() {
	var ctx = this.core.ctx;

	ctx.save();

	// background
	ctx.fillStyle = util.hexToRGBString("EEEEEE");
	ctx.fillRect(0, 0, this.core.width, this.core.height);

	ctx.restore();

	ctx.save();

	ctx.fillStyle = util.hexToRGBString("DDDDDD");
	ctx.fillRect(
		offset_x, offset_y,
		CONSTANT.TILE_SIZE * 30, CONSTANT.TILE_SIZE * 20
	);
	ctx.restore();

	ctx.save();

	base_scene.prototype.draw.apply(this, arguments);
};

SceneStage.prototype.initializeObjectsByTileType = function () {
	var data = {};

	for (var tile_type in TILE_TYPE_TO_CLASS) {
		data[ tile_type ] = [];
	}

	return data;
};

// 霊夢用アイテム獲得
SceneStage.prototype.addReimuItemNum = function () {
	this.reimu_item_num += 1;
};





SceneStage.prototype.parseAndCreateMap = function(map) {
	var stage = stage1_map;


	for (var pos_y = 0; pos_y < map.length; pos_y++) {
		var line = stage[pos_y];
		for (var pos_x = 0; pos_x < line.length; pos_x++) {
			var tile = line[pos_x];
			var x = pos_x * CONSTANT.TILE_SIZE + offset_x + 12; // 12 = TILE TIP SIZE * 1.5 / 2
			var y = pos_y * CONSTANT.TILE_SIZE + offset_y + 12;

			var Class = TILE_TYPE_TO_CLASS[ tile ];

			if(!Class) continue; // 何もタイルがなければ何も表示しない

			// シーンにオブジェクト追加
			var instance = new Class(this);
			instance.init(x, y);
			this.addObject(instance);

			// タイルの種類毎にオブジェクトを管理
			if(!this.objects_by_tile_type[ tile ]) this.objects_by_tile_type[ tile ] = []; //初期化
			this.objects_by_tile_type[ tile ].push(instance);
		}
	}
};

module.exports = SceneStage;

},{"../constant":1,"../hakurei":3,"../object/tile/block_blue":19,"../object/tile/block_brown":20,"../object/tile/block_green":21,"../object/tile/block_purple":22,"../object/tile/block_red":23,"../object/tile/death":24,"../object/tile/enemy":25,"../object/tile/item":26,"../object/tile/ladder":27,"../object/tile/player":28,"./map/stage1":30,"./stage/play":32,"./stage/talk":33}],32:[function(require,module,exports){
'use strict';

var base_scene = require('../../hakurei').scene.base;
var CONSTANT = require('../../hakurei').constant;
var util = require('../../hakurei').util;

var SceneStagePlay = function(core, parent) {
	base_scene.apply(this, arguments);
};

util.inherit(SceneStagePlay, base_scene);

SceneStagePlay.prototype.init = function(){
	base_scene.prototype.init.apply(this, arguments);
};

SceneStagePlay.prototype.beforeDraw = function(){
	base_scene.prototype.beforeDraw.apply(this, arguments);

	if(this.core.isKeyDown(CONSTANT.BUTTON_LEFT)) {
		this.parent.player().moveLeft();
	}

	if(this.core.isKeyDown(CONSTANT.BUTTON_RIGHT)) {
		this.parent.player().moveRight();
	}

	if(this.core.isKeyPush(CONSTANT.BUTTON_X)) {
		this.parent.player().startExchange();
	}
};

module.exports = SceneStagePlay;

},{"../../hakurei":3}],33:[function(require,module,exports){
'use strict';

var MESSAGE_WINDOW_OUTLINE_MARGIN = 20;
var TALKER_MOVE_PX = 5;
var SCALE = 0.5;

var base_scene = require('../../hakurei').scene.base;
var CONSTANT = require('../../hakurei').constant;
var util = require('../../hakurei').util;

var SerifManager = require("../../logic/serif_manager");
var serif_before = require("../../logic/serif/stage1/before");

var SceneStageTalk = function(core) {
	base_scene.apply(this, arguments);
	this.serif = new SerifManager(serif_before);
};

util.inherit(SceneStageTalk, base_scene);

SceneStageTalk.prototype.init = function(){
	base_scene.prototype.init.apply(this, arguments);
	this.serif.init();
};

SceneStageTalk.prototype.beforeDraw = function(){
	base_scene.prototype.beforeDraw.apply(this, arguments);
	if(this.core.isKeyPush(CONSTANT.BUTTON_Z)) {
		if(this.serif.is_end()) {
			this.parent.changeSubScene("play");
		}
		else {
			// セリフを送る
			this.serif.next();
		}
	}
};

SceneStageTalk.prototype.draw = function(){
	base_scene.prototype.draw.apply(this, arguments);
	var ctx = this.core.ctx;

	if(this.serif.right_image()) {
		this._showRightChara();
	}
	if(this.serif.left_image()) {
		this._showLeftChara();
	}

	this._showMessageWindow();

	this._showMessage();
};

SceneStageTalk.prototype._showRightChara = function(){
	var ctx = this.core.ctx;
	ctx.save();

	var x = 400;
	var y = 50;

	if(!this.serif.is_right_talking()) {
		ctx.globalAlpha = 0.5;
	}
	else {
		x -= TALKER_MOVE_PX;
		y -= TALKER_MOVE_PX;
	}

	var right_image = this.core.image_loader.getImage(this.serif.right_image());

	ctx.drawImage(right_image,
		x,
		y,
		right_image.width  * SCALE,
		right_image.height * SCALE
	);

	ctx.restore();
};

SceneStageTalk.prototype._showLeftChara = function () {
	var ctx = this.core.ctx;
	ctx.save();

	var x = -100;
	var y = 100;

	if(!this.serif.is_left_talking()) {
		ctx.globalAlpha = 0.5;
	}
	else {
		x -= -TALKER_MOVE_PX; // 左右反転
		y -= TALKER_MOVE_PX;
	}

	var left_image = this.core.image_loader.getImage(this.serif.left_image());
	ctx.transform(-1, 0, 0, 1, left_image.width * SCALE, 0); // 左右反転
	ctx.drawImage(left_image,
		-x, // 左右反転
		y,
		left_image.width * SCALE,
		left_image.height * SCALE
	);

	ctx.restore();
};

SceneStageTalk.prototype._showMessageWindow = function(){
	var ctx = this.core.ctx;
	// show message window
	ctx.save();

	var message_height = 100;

	ctx.globalAlpha = 0.5;
	ctx.fillStyle = 'rgb( 0, 0, 0 )';
	ctx.fillRect(
		MESSAGE_WINDOW_OUTLINE_MARGIN,
		this.core.height - message_height - MESSAGE_WINDOW_OUTLINE_MARGIN,
		this.core.width - MESSAGE_WINDOW_OUTLINE_MARGIN * 2,
		message_height
	);

	ctx.restore();
};

// セリフ表示
SceneStageTalk.prototype._showMessage = function() {
	var ctx = this.core.ctx;
	ctx.save();

	ctx.font = "18px 'Migu'";
	ctx.textAlign = 'left';
	ctx.textBaseAlign = 'middle';
	ctx.fillStyle = 'rgb( 255, 255, 255 )';

	var x, y;
	// セリフ表示
	var lines = this.serif.lines();
	if (lines.length) {
		// セリフテキストの y 座標初期位置
		var message_height = 100;
		y = this.core.height - message_height + MESSAGE_WINDOW_OUTLINE_MARGIN;

		for(var i = 0, len = lines.length; i < len; i++) {
			ctx.fillText(lines[i], MESSAGE_WINDOW_OUTLINE_MARGIN * 2, y); // 1行表示

			y+= 30;
		}
	}

	ctx.restore();
};




module.exports = SceneStageTalk;

},{"../../hakurei":3,"../../logic/serif/stage1/before":13,"../../logic/serif_manager":14}],34:[function(require,module,exports){
'use strict';

var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;
var CONSTANT = require('../hakurei').constant;

// transition time ready to show canvas
var SHOW_TRANSITION_COUNT = 100;

// blink interval time
var SHOW_START_MESSAGE_INTERVAL = 50;




var SceneTitle = function(core) {
	base_scene.apply(this, arguments);
};
util.inherit(SceneTitle, base_scene);

SceneTitle.prototype.beforeDraw = function(){
	base_scene.prototype.beforeDraw.apply(this, arguments);

	// TODO: to play bgm

	if(this.core.isKeyPush(CONSTANT.BUTTON_Z)) {
			//TODO: this.core.playSound('select');
			this.core.changeScene("stage");
	}
};

// 画面更新
SceneTitle.prototype.draw = function(){
	this.core.clearCanvas();
	var ctx = this.core.ctx;

	ctx.save();

	// 切り替え効果
	if( this.frame_count < SHOW_TRANSITION_COUNT ) {
		ctx.globalAlpha = this.frame_count / SHOW_TRANSITION_COUNT;
	}
	else {
		ctx.globalAlpha = 1.0;
	}


	var title_bg = this.core.image_loader.getImage('title_bg');
	// 背景画像表示
	ctx.drawImage(title_bg,
					0,
					0,
					title_bg.width,
					title_bg.height,
					0,
					0,
					this.core.width,
					this.core.height);

	// show game title text
	ctx.fillStyle = 'rgb( 0, 0, 0 )';
	ctx.fillStyle = 'rgb( 255, 255, 255 )';
	ctx.textAlign = 'center';
	ctx.font = "60px 'ＭＳ ゴシック'";
	ctx.fillText('タイトルロゴ(仮)', this.core.width/2, 100);

	// show press z
	ctx.fillStyle = 'rgb( 255, 255, 255 )';
	ctx.font = "35px 'ＭＳ ゴシック'";
	ctx.textAlign = 'left';
	ctx.fillText('→ Story Start', 280, 400);
	ctx.fillText('　 Stage Select', 280, 450);
	ctx.restore();
};

module.exports = SceneTitle;

},{"../hakurei":3}]},{},[15]);
