(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var AssetsConfig = {};
AssetsConfig.images = {
	// タイトルロゴ
	title:         "./image/title.png",
	// タイトル背景
	title_bg:      "./image/title_bg.png",
	// ステージ画面背景
	stage_bg:      "./image/stage_bg.png",
	// ステージ画面ステージ背景
	bg:            "./image/bg.png",
	stage_tile_24: "./image/stage_tile_24.png",
	stage_tile_32: "./image/stage_tile_32.png",
	block:         "./image/block.png",
	hashigo:       "./image/hashigo.png",

	reimu_angry1:   "./image/reimu/angry1.png",
	reimu_angry2:   "./image/reimu/angry2.png",
	reimu_confused: "./image/reimu/confused.png",
	reimu_cry:      "./image/reimu/cry.png",
	reimu_laugh:    "./image/reimu/laugh1.png",
	reimu_laugh2:   "./image/reimu/laugh2.png",
	reimu_normal1:  "./image/reimu/normal1.png",
	reimu_normal2:  "./image/reimu/normal2.png",
	reimu_smile:    "./image/reimu/smile.png",
	reimu_yarare:   "./image/reimu/yarare.png",

	yukari_angry:        "./image/yukari/angry.png",
	yukari_confused:     "./image/yukari/confused.png",
	yukari_disappointed: "./image/yukari/disappointed.png",
	yukari_ecstasy1:     "./image/yukari/ecstasy1.png",
	yukari_ecstasy2:     "./image/yukari/ecstasy2.png",
	yukari_laugh:        "./image/yukari/laugh.png",
	yukari_normal1:      "./image/yukari/normal1.png",
	yukari_normal2:      "./image/yukari/normal2.png",
	yukari_normal3:      "./image/yukari/normal3.png",
	yukari_normal4:      "./image/yukari/normal4.png",
	yukari_smile:        "./image/yukari/smile.png",
	yukari_yarare:       "./image/yukari/yarare.png",
};

AssetsConfig.sounds = {
	forbidden:    {
		path: "./sound/forbidden.wav",
		volume: 0.8,
	},
	select:    {
		path: "./sound/select.wav",
		volume: 0.8,
	},
	boss_powerup:    {
		path: "./sound/boss_powerup.wav",
		volume: 0.5,
	},
	dead:    {
		path: "./sound/dead.wav",
		volume: 0.5,
	},
	powerup:    {
		path: "./sound/powerup.wav",
		volume: 0.8,
	},
};

AssetsConfig.bgms = {
	stage_a: {
		path: "./bgm/stage_a.ogg",
		loopStart: 0*60 + 29 + 0.143,
		loopEnd: 1*60 + 51 + 0.429,
	},
	title: {
		path: "./bgm/title.ogg",
		loopStart: 0*60 + 10 + 0.312,
		loopEnd: 0*60 + 51 + 0.562,
	},
};


module.exports = AssetsConfig;

},{}],2:[function(require,module,exports){
'use strict';
var DEBUG = require("./debug_constant");

var CONSTANT = {
	DEBUG: {},

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
	BLOCK_STONE1:11,
	BLOCK_STONE2:12,
	BLOCK_STONE3:13,


	STATE_NORMAL:    1,
	STATE_CLIMBDOWN: 2,
	STATE_DYING:     3,
	STATE_EXCHANGE:  4,
	STATE_FALLDOWN:  5,
	STATE_MOVELEFT:  6,
	STATE_MOVERIGHT: 7,
};

// レンダリングの順番
// 上にあるものほど奥に描画／下にあるものほど手前に描画
CONSTANT.RENDER_SORT = [
	CONSTANT.BLOCK_GREEN,
	CONSTANT.BLOCK_BLUE,
	CONSTANT.BLOCK_RED,
	CONSTANT.BLOCK_PURPLE,
	CONSTANT.BLOCK_BROWN,
	CONSTANT.BLOCK_STONE1,
	CONSTANT.BLOCK_STONE2,
	CONSTANT.BLOCK_STONE3,
	CONSTANT.DEATH,
	CONSTANT.LADDER,
	CONSTANT.ENEMY,
	CONSTANT.PLAYER,
	CONSTANT.ITEM,
];

if (DEBUG.ON) {
	CONSTANT.DEBUG = DEBUG;
}
module.exports = CONSTANT;

},{"./debug_constant":3}],3:[function(require,module,exports){
'use strict';
var DEBUG = {
	ON: false,
	SOUND_OFF: true,
	START_STAGE_NO: 1,
};

module.exports = DEBUG;

},{}],4:[function(require,module,exports){
'use strict';
var core = require('./hakurei').core;
var util = require('./hakurei').util;
var CONSTANT = require('./constant');

var SceneLoading = require('./scene/loading');
var SceneTitle = require('./scene/title');
var SceneStage = require('./scene/stage');
var PreReleaseEnd = require('./scene/prerelease_end');

var Game = function(canvas) {
	core.apply(this, arguments);
};
util.inherit(Game, core);

Game.prototype.init = function () {
	core.prototype.init.apply(this, arguments);

	this.addScene("loading", new SceneLoading(this));
	this.addScene("prerelease_end", new PreReleaseEnd(this));
	this.addScene("title", new SceneTitle(this));
	this.addScene("stage", new SceneStage(this));

	this.changeScene("loading");

};
Game.prototype.playSound = function () {
	if (CONSTANT.DEBUG.SOUND_OFF) return;
	return this.audio_loader.playSound.apply(this.audio_loader, arguments);
};
Game.prototype.playBGM = function () {
	if (CONSTANT.DEBUG.SOUND_OFF) return;
	return this.audio_loader.playBGM.apply(this.audio_loader, arguments);
};
Game.prototype.stopBGM = function () {
	if (CONSTANT.DEBUG.SOUND_OFF) return;
	return this.audio_loader.stopBGM.apply(this.audio_loader, arguments);
};





module.exports = Game;

},{"./constant":2,"./hakurei":5,"./scene/loading":52,"./scene/prerelease_end":58,"./scene/stage":59,"./scene/title":65}],5:[function(require,module,exports){
'use strict';

module.exports = require("./hakureijs/index");

},{"./hakureijs/index":11}],6:[function(require,module,exports){
'use strict';

var AudioLoader = function() {
	this.sounds = {};
	this.bgms = {};

	this.loading_audio_num = 0;
	this.loaded_audio_num = 0;

	this.id = 0;

	// flag which determine what sound.
	this.soundflag = 0x00;

	this.audio_context = new window.AudioContext();

	// for legacy browser
	this.audio_context.createGain = this.audio_context.createGain || this.audio_context.createGainNode;
	// playing AudioBufferSourceNode instance
	this.audio_source = null;


};
AudioLoader.prototype.init = function() {
	// TODO: cancel already loading bgms and sounds

	this.sounds = {};
	this.bgms = {};

	this.loading_audio_num = 0;
	this.loaded_audio_num = 0;

	this.id = 0;

	this.soundflag = 0x00;
};

AudioLoader.prototype.loadSound = function(name, path, volume) {
	var self = this;
	self.loading_audio_num++;

	if(!volume) volume = 1.0;


	// it's done to load sound
	var onload_function = function() {
		self.loaded_audio_num++;
	};

	var audio = new Audio(path);
	audio.volume = volume;
	audio.addEventListener('canplay', onload_function);
	audio.load();
	self.sounds[name] = {
		id: 1 << self.id++,
		audio: audio,
	};
};

AudioLoader.prototype.loadBGM = function(name, path, volume, loopStart, loopEnd) {
	var self = this;
	self.loading_audio_num++;

	// it's done to load audio
	var successCallback = function(audioBuffer) {
		self.loaded_audio_num++;
		self.bgms[name] = {
			audio:     audioBuffer,
			volume:    volume,
			loopStart: loopStart,
			loopEnd:   loopEnd,
		};
	};

	var errorCallback = function(error) {
		if (error instanceof Error) {
			throw new Error(error.message);
		} else {
			throw error;
		}
	};

	var xhr = new XMLHttpRequest();
	xhr.onload = function() {
		if(xhr.status !== 200) {
			return;
		}

		var arrayBuffer = xhr.response;

		// decode
		self.audio_context.decodeAudioData(arrayBuffer, successCallback, errorCallback);
	};

	xhr.open('GET', path, true);
	xhr.responseType = 'arraybuffer';
	xhr.send(null);
};

AudioLoader.prototype.isAllLoaded = function() {
	return this.loaded_audio_num > 0 && this.loaded_audio_num === this.loading_audio_num;
};

AudioLoader.prototype.playSound = function(name) {
	this.soundflag |= this.sounds[name].id;
};

AudioLoader.prototype.executePlaySound = function() {

	for(var name in this.sounds) {
		if(this.soundflag & this.sounds[name].id) {
			// play
			this.sounds[name].audio.pause();
			this.sounds[name].audio.currentTime = 0;
			this.sounds[name].audio.play();

			// delete flag
			this.soundflag &= ~this.sounds[name].id;

		}
	}
};
AudioLoader.prototype.playBGM = function(name) {
	var self = this;

	// stop playing bgm
	self.stopBGM();

	self.audio_source = self._createSourceNode(name);
	self.audio_source.start(0);
};
AudioLoader.prototype.stopBGM = function() {
	var self = this;
	if(self.isPlayingBGM()) {
		self.audio_source.stop(0);
		self.audio_source = null;
	}
};
AudioLoader.prototype.isPlayingBGM = function() {
	return this.audio_source ? true : false;
};

// create AudioBufferSourceNode instance
AudioLoader.prototype._createSourceNode = function(name) {
	var self = this;
	var data = self.bgms[name];

	var source = self.audio_context.createBufferSource();
	source.buffer = data.audio;

	if(data.loopStart || data.loopEnd) { source.loop = true; }
	if(data.loopStart) { source.loopStart = data.loopStart; }
	if(data.loopEnd)   { source.loopEnd = data.loopEnd; }

	var audio_gain = this.audio_context.createGain();
	audio_gain.gain.value = data.volume || 1.0;

	source.connect(audio_gain);

	audio_gain.connect(self.audio_context.destination);
	source.start = source.start || source.noteOn;
	source.stop  = source.stop  || source.noteOff;

	return source;
};

AudioLoader.prototype.progress = function() {
	return this.loaded_audio_num / this.loading_audio_num;
};


module.exports = AudioLoader;

},{}],7:[function(require,module,exports){
'use strict';

var FontLoader = function() {
	this.is_done = false;
};
FontLoader.prototype.init = function() {
	this.is_done = false;
};
FontLoader.prototype.isAllLoaded = function() {
	return this.is_done;
};

FontLoader.prototype.notifyLoadingDone = function() {
	this.is_done = true;
};

FontLoader.prototype.progress = function() {
	return this.is_done ? 1 : 0;
};




module.exports = FontLoader;

},{}],8:[function(require,module,exports){
'use strict';

var ImageLoader = function() {
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

ImageLoader.prototype.progress = function() {
	return this.loaded_image_num / this.loading_image_num;
};




module.exports = ImageLoader;

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
'use strict';
var CONSTANT = require("./constant");
var ImageLoader = require("./asset_loader/image");
var AudioLoader = require("./asset_loader/audio");
var FontLoader = require("./asset_loader/font");

var Core = function(canvas) {
	this.canvas_dom = canvas;
	this.ctx = this.canvas_dom.getContext('2d');

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
	this.audio_loader = new AudioLoader();
	this.font_loader = new FontLoader();
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

	// play sound which already set to play
	this.audio_loader.executePlaySound();

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

	// play sound effects
	this.runPlaySound();
	*/

	// save key current pressed keys
	this.before_keyflag = this.current_keyflag;

	this.frame_count++;

	// tick
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
Core.prototype.changeScene = function() {
	var args = Array.prototype.slice.call(arguments); // to convert array object
	this._reserved_next_scene = args;
};
Core.prototype.changeNextSceneIfReserved = function() {
	if(this._reserved_next_scene) {
		this.current_scene = this._reserved_next_scene.shift();

		var current_scene = this.currentScene();
		current_scene.init.apply(current_scene, this._reserved_next_scene);

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

Core.prototype.fullscreen = function() {
	var mainCanvas = this.canvas_dom;
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

// it is done to load fonts
Core.prototype.fontLoadingDone = function() {
	this.font_loader.notifyLoadingDone();
};
module.exports = Core;

},{"./asset_loader/audio":6,"./asset_loader/font":7,"./asset_loader/image":8,"./constant":9}],11:[function(require,module,exports){
'use strict';
module.exports = {
	util: require("./util"),
	core: require("./core"),
	constant: require("./constant"),
	serif_manager: require("./serif_manager"),
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

},{"./asset_loader/image":8,"./constant":9,"./core":10,"./object/base":12,"./object/pool_manager":13,"./object/sprite":14,"./scene/base":15,"./serif_manager":16,"./util":17}],12:[function(require,module,exports){
'use strict';

var util = require('../util');

var id = 0;

// is draw collision size
var IS_SHOW_COLLISION = false;

var ObjectBase = function(scene, object) {
	this.scene = scene;
	this.core = scene.core;
	this.parent = object; // parent object if this is sub object
	this.id = ++id;

	this.frame_count = 0;

	this._x = 0; // local center x
	this._y = 0; // local center y

	// manage flags that disappears in frame elapsed
	this.auto_disable_times_map = {};

	this.velocity = {magnitude:0, theta:0};

	// sub object
	this.objects = [];

};

ObjectBase.prototype.init = function(){
	this.frame_count = 0;

	this._x = 0;
	this._y = 0;

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
	var ctx = this.core.ctx;
	// TODO: DEBUG
	if(IS_SHOW_COLLISION) {
		ctx.save();
		ctx.fillStyle = 'rgb( 255, 255, 255 )' ;
		ctx.globalAlpha = 0.4;
		ctx.fillRect(this.getCollisionLeftX(), this.getCollisionUpY(), this.collisionWidth(), this.collisionHeight());
		ctx.restore();
	}


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

	this._x += x;
	this._y += y;
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
	return this.scene.x() + this.x();
};
ObjectBase.prototype.globalCenterY = function() {
	return this.scene.y() + this.y();
};
ObjectBase.prototype.globalLeftX = function() {
	return this.scene.x() + this.x() - this.width()/2;
};
ObjectBase.prototype.globalRightX = function() {
	return this.scene.x() + this.x() + this.width()/2;
};
ObjectBase.prototype.globalUpY = function() {
	return this.scene.x() + this.y() - this.height()/2;
};
ObjectBase.prototype.globalDownY = function() {
	return this.scene.x() + this.y() + this.height()/2;
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
	if(Math.abs(this.x() - obj.x()) < this.collisionWidth()/2 + obj.collisionWidth()/2 &&
		Math.abs(this.y() - obj.y()) < this.collisionHeight()/2 + obj.collisionHeight()/2) {
		return true;
	}

	return false;
};

ObjectBase.prototype.getCollisionLeftX = function() {
	return this.x() - this.collisionWidth() / 2;
};
ObjectBase.prototype.getCollisionRightX = function() {
	return this.x() + this.collisionWidth() / 2;
};
ObjectBase.prototype.getCollisionUpY = function() {
	return this.y() - this.collisionHeight() / 2;
};
ObjectBase.prototype.getCollisionDownY = function() {
	return this.y() + this.collisionHeight() / 2;
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

ObjectBase.prototype.x = function(val) {
	if (typeof val !== 'undefined') { this._x = val; }
	return this._x;
};
ObjectBase.prototype.y = function(val) {
	if (typeof val !== 'undefined') { this._y = val; }
	return this._y;
};

ObjectBase.prototype.setVelocity = function(velocity) {
	this.velocity = velocity;
};
module.exports = ObjectBase;


},{"../util":17}],13:[function(require,module,exports){
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

},{"../util":17,"./base":12}],14:[function(require,module,exports){
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
	if(this.isShow()) {

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
	}

	// draw sub objects(even if this object is not show)
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
	return true;
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

},{"../util":17,"./base":12}],15:[function(require,module,exports){
'use strict';

var SceneBase = function(core, scene) {
	this.core = core;
	this.parent = scene; // parent scene if this is sub scene
	this.width = this.core.width; // default
	this.height = this.core.height; // default

	this._x = 0;
	this._y = 0;

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

	this._x = 0;
	this._y = 0;

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
SceneBase.prototype.changeSubScene = function() {
	var args = Array.prototype.slice.call(arguments); // to convert array object
	this._reserved_next_scene = args;

};
SceneBase.prototype.changeNextSubSceneIfReserved = function() {
	if(this._reserved_next_scene) {
		this.current_scene = this._reserved_next_scene.shift();

		var current_sub_scene = this.currentSubScene();
		current_sub_scene.init.apply(current_sub_scene, this._reserved_next_scene);

		this._reserved_next_scene = null;
	}

};

SceneBase.prototype.x = function(val) {
	if (typeof val !== 'undefined') { this._x = val; }
	return this._x;
};
SceneBase.prototype.y = function(val) {
	if (typeof val !== 'undefined') { this._y = val; }
	return this._y;
};

module.exports = SceneBase;


},{}],16:[function(require,module,exports){
'use strict';

var SerifManager = function () {
	this.timeoutID = null;

	// serif scenario
	this.script = null;

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

SerifManager.prototype.init = function (script) {
	if(!script) console.error("set script arguments to use serif_manager class");

	// serif scenario
	this.script = script;

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

},{}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
	{"pos":"right","exp":"confused","chara":"reimu","fukidashi":"normal","serif":"いたた..."},
	{"pos":"left","exp":"normal3","chara":"yukari","fukidashi":"normal","serif":"あらあら"},
	{"pos":"right","exp":"normal1","chara":"reimu","fukidashi":"normal","serif":"あ、ゆかり"},
	{"pos":"right","exp":"angry2","chara":"reimu","fukidashi":"normal","serif":"またアンタのしわざね"},
	{"pos":"left","exp":"smile","chara":"yukari","fukidashi":"normal","serif":"暇そうにしてたから♪"},
	{"pos":"left","exp":"normal3","chara":"yukari","fukidashi":"normal","serif":"ほら、見て"},
	{"pos":"right","exp":"angry2","chara":"reimu","fukidashi":"normal","serif":"なによ"},
	{"pos":"right","exp":"normal2","chara":"reimu","fukidashi":"normal","serif":"御札が落ちてるわ"},
	{"pos":"left","exp":"normal1","chara":"yukari","fukidashi":"normal","serif":"御札を全部拾うと帰れるわよ"},
	{"pos":"right","exp":"normal2","chara":"reimu","fukidashi":"normal","serif":"どういう理屈よ"},
	{"pos":"right","exp":"normal1","chara":"reimu","fukidashi":"normal","serif":"わたしじゃ取れない場所にあるじゃない"},
	{"pos":"left","exp":"normal2","chara":"yukari","fukidashi":"normal","serif":"手伝ってあげるわよ"},
	{"pos":"left","exp":"normal2","chara":"yukari","fukidashi":"normal","serif":"X キーで私と霊夢の位置を入れかえることができるわ"},
	{"pos":"left","exp":"smile","chara":"yukari","fukidashi":"normal","serif":"私は霊夢といつも反対の位置にいるから"},
	{"pos":"right","exp":"normal1","chara":"reimu","fukidashi":"normal","serif":"X キーね"},
	{"pos":"left","exp":"normal1","chara":"yukari","fukidashi":"normal","serif":"入れ替えられる回数には上限があるから"},
	{"pos":"left","exp":"normal3","chara":"yukari","fukidashi":"normal","serif":"私の上にある数字はよく見ていてね"},
];
module.exports = Serif;

},{}],19:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
	{"pos":"left","exp":"ecstasy2","chara":"yukari","fukidashi":"normal","serif": "きゃー、れいむー！"},
	{"pos":"left","exp":"ecstasy2","chara":"yukari","fukidashi":"normal","serif": "オバケ、こわーい！"},
	{"pos":"right","exp":"normal2","chara":"reimu","fukidashi":"normal","serif":"(ベシッ)"},
	{"pos":"left","exp":"yarare","chara":"yukari","fukidashi":"normal","serif": "いたいっ！"},
	{"pos":"right","exp":"normal1","chara":"reimu","fukidashi":"normal","serif":"あれ、なによ"},
	{"pos":"left","exp":"normal4","chara":"yukari","fukidashi":"normal","serif":"オバケみたいね"},
	{"pos":"left","exp":"normal3","chara":"yukari","fukidashi":"normal","serif":"触れちゃダメよ"},
	{"pos":"right","exp":"normal2","chara":"reimu","fukidashi":"normal","serif":"はいはい"},
	{"pos":"left","exp":"smile","chara":"yukari","fukidashi":"normal","serif":"わたしはオバケに触れても大丈夫だから"},
	{"pos":"right","exp":"angry1","chara":"reimu","fukidashi":"normal","serif":"アンタだけずるくない！？"},
];
module.exports = Serif;

},{}],20:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
	{"pos":"left","exp":"normal1","chara":"yukari","fukidashi":"normal","serif":null},
	{"pos":"right","exp":"normal2","chara":"reimu","fukidashi":"normal","serif":"茶色のブロックがあるわ"},
	{"pos":"left","exp":"normal1","chara":"yukari","fukidashi":"normal","serif":"一度乗ったら消えちゃうみたいね"},
	{"pos":"right","exp":"normal1","chara":"reimu","fukidashi":"normal","serif":"消えちゃうのね"},
];
module.exports = Serif;

},{}],21:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
];
module.exports = Serif;

},{}],22:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
	{"pos":"right","exp":"normal1","chara":"reimu","fukidashi":"normal","serif":"あれ、ゆかりー？どこー？"},
	{"pos":"left","exp":"normal3","chara":"yukari","fukidashi":"normal","serif":"なーに、れいむ？"},
	{"pos":"right","exp":"normal2","chara":"reimu","fukidashi":"normal","serif":"アンタさっきと違う位置にいない？"},
	{"pos":"left","exp":"normal4","chara":"yukari","fukidashi":"normal","serif":"このステージでは上下の反対側にいるみたいね"},
	{"pos":"right","exp":"normal1","chara":"reimu","fukidashi":"normal","serif":"ふぅん"},
];
module.exports = Serif;

},{}],23:[function(require,module,exports){
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

	// フォントの読み込みが完了
	if(document.fonts) {
		document.fonts.addEventListener('loadingdone', function() { game.fontLoadingDone(); });
	}
	else {
		// フォントロードに対応してなければ無視
		game.fontLoadingDone();
	}

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
*/
window.changeFullScreen = function () {
	game.fullscreen();
};

},{"./game":4}],24:[function(require,module,exports){
'use strict';
var base_object = require('../hakurei').object.sprite;
var util = require('../hakurei').util;
var ExchangeAnim = require('./exchange_anim');

var AlterEgo = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(AlterEgo, base_object);

AlterEgo.prototype.init = function() {
	base_object.prototype.init.apply(this, arguments);

	this.span = 0;
	this.exchange_animation_start_count = 0;
	this.exchange_anim = new ExchangeAnim(this.scene);
};

AlterEgo.prototype.x = function(){
	if (this.scene.isVertical()) {
		return this.parent.x();
	}
	else {
		return this.scene.width - this.parent.x();
	}
};

AlterEgo.prototype.y = function(){
	if (this.scene.isVertical()) {
		return this.scene.height - this.parent.y(); // 垂直
	}
	else {
		return this.parent.y();
	}
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

AlterEgo.prototype.draw = function(){
	base_object.prototype.draw.apply(this, arguments);

	var ctx = this.core.ctx;
	// 交換可能回数
	ctx.save();
	var num = this.scene.player().remainExchangeNum();
	ctx.fillStyle = 'rgb( 255, 255, 255 )';
	ctx.textAlign = 'center';
	ctx.font = "12px 'PixelMplus'";
	ctx.fillText(num, this.x(), this.y() - this.height()/2 - 10);
	ctx.restore();
};


AlterEgo.prototype.collisionWidth = function(){
	return 24;
};
AlterEgo.prototype.collisionHeight = function(){
	return 24;
};

AlterEgo.prototype.isShow = function(){
	return this.exchange_animation_start_count ? false : true; // 交換中は表示しない
};



AlterEgo.prototype.spriteName = function(){
	return "stage_tile_32";
};
AlterEgo.prototype.spriteAnimationSpan = function(){
	return 30;
};
AlterEgo.prototype.spriteIndices = function(){
	return [{x: 5, y: 0}, {x: 6, y: 0}];
};
AlterEgo.prototype.spriteWidth = function(){
	return 32;
};
AlterEgo.prototype.spriteHeight = function(){
	return 32;
};
// 位置移動
AlterEgo.prototype.startExchange = function(span) {
	this.exchange_animation_start_count = this.frame_count;
	this.span = span;

	var is_yukari = true;
	this.exchange_anim.init(this.x(), this.y(), span, is_yukari);
	this.addSubObject(this.exchange_anim);
};
module.exports = AlterEgo;

},{"../hakurei":5,"./exchange_anim":26}],25:[function(require,module,exports){
'use strict';
var base_object = require('../hakurei').object.sprite;
var util = require('../hakurei').util;

var BackGroundEye = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(BackGroundEye, base_object);

BackGroundEye.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.x(x);
	this.y(y);
};

BackGroundEye.prototype.spriteName = function(){
	return "stage_tile_24";
};
BackGroundEye.prototype.spriteIndices = function(){
	return [{x: 0, y: 1}];
};
BackGroundEye.prototype.spriteWidth = function(){
	return 24;
};
BackGroundEye.prototype.spriteHeight = function(){
	return 24;
};
module.exports = BackGroundEye;

},{"../hakurei":5}],26:[function(require,module,exports){
'use strict';
var base_object = require('../hakurei').object.sprite;
var util = require('../hakurei').util;

var AlterEgo = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(AlterEgo, base_object);

AlterEgo.prototype.init = function(x, y, anim_span, is_yukari) {
	base_object.prototype.init.apply(this, arguments);
	this.x(x);
	this.y(y);
	this.is_yukari = is_yukari ? true : false;

	this.anim_span = anim_span;
};

AlterEgo.prototype.beforeDraw = function(){
	base_object.prototype.beforeDraw.apply(this, arguments);
};

AlterEgo.prototype.spriteName = function(){
	return "stage_tile_32";
};
AlterEgo.prototype.spriteIndices = function(){
	if (this.is_yukari) {
		return [
			{x: 0, y: 1}, {x: 1, y: 1},{x: 2, y: 1}, {x:3, y: 1}, {x:3, y: 1}, {x:4, y: 1}, {x:5, y: 1}, {x: 6, y:1},
			{x: 6, y: 3}, {x: 5, y: 3},{x: 4, y:3}, {x:3, y:3}, {x:3, y:3}, {x:2, y: 3}, {x:1, y: 3}, {x: 0, y:3},
		];
	}
	else {
		return [
			{x: 0, y: 3}, {x: 1, y: 3},{x: 2, y:3}, {x:3, y:3}, {x:3, y:3}, {x:4, y: 3}, {x:5, y: 3}, {x: 6, y:3},
			{x: 6, y: 1}, {x: 5, y: 1},{x: 4, y: 1}, {x:3, y: 1}, {x:3, y: 1}, {x:2, y: 1}, {x:1, y: 1}, {x: 0, y:1},
		];
	}
};
AlterEgo.prototype.spriteWidth = function(){
	return 32;
};
AlterEgo.prototype.spriteHeight = function(){
	return 32;
};
AlterEgo.prototype.spriteAnimationSpan = function(){
	return 3;
};


module.exports = AlterEgo;

},{"../hakurei":5}],27:[function(require,module,exports){
'use strict';
/* ステージ枠(縦横) */

var base_object = require('../hakurei').object.sprite;
var util = require('../hakurei').util;

var BackGroundEye = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(BackGroundEye, base_object);

BackGroundEye.prototype.init = function(x, y, is_vertical) {
	base_object.prototype.init.apply(this, arguments);
	this.x(x);
	this.y(y);
	this.is_vertical = is_vertical;
};

BackGroundEye.prototype.draw = function(x, y, is_vertical) {
	this.init(x, y, is_vertical);
	base_object.prototype.draw.apply(this, arguments);
};

BackGroundEye.prototype.spriteName = function(){
	return "stage_tile_24";
};
BackGroundEye.prototype.spriteIndices = function(){
	return [{x: 0, y: 0}];
};
BackGroundEye.prototype.spriteWidth = function(){
	return 24;
};
BackGroundEye.prototype.spriteHeight = function(){
	return 24;
};
BackGroundEye.prototype.rotateAdjust = function(){
	return this.is_vertical ? 90 : 0;
};



module.exports = BackGroundEye;

},{"../hakurei":5}],28:[function(require,module,exports){
'use strict';
/* ステージ枠(角) */

var base_object = require('../hakurei').object.sprite;
var util = require('../hakurei').util;

var BackGroundEye = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(BackGroundEye, base_object);

BackGroundEye.prototype.init = function(x, y, rotate) {
	base_object.prototype.init.apply(this, arguments);
	this.x(x);
	this.y(y);
	this.rotate = rotate || 0;
};

BackGroundEye.prototype.draw = function(x, y, rotate) {
	this.init(x, y, rotate);
	base_object.prototype.draw.apply(this, arguments);
};

BackGroundEye.prototype.spriteName = function(){
	return "stage_tile_24";
};
BackGroundEye.prototype.spriteIndices = function(){
	return [{x: 1, y: 0}];
};
BackGroundEye.prototype.spriteWidth = function(){
	return 24;
};
BackGroundEye.prototype.spriteHeight = function(){
	return 24;
};
BackGroundEye.prototype.rotateAdjust = function(){
	return this.rotate;
};



module.exports = BackGroundEye;

},{"../hakurei":5}],29:[function(require,module,exports){
'use strict';
var base_object = require('../../hakurei').object.sprite;
var util = require('../../hakurei').util;

var BlockBase = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(BlockBase, base_object);

BlockBase.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.x(x);
	this.y(y);

	this.is_collision = true;
};

BlockBase.prototype.isCollision = function() {
	return this.is_collision;
};

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

},{"../../hakurei":5}],30:[function(require,module,exports){
'use strict';
var CONSTANT = require('../../constant');
var base_object = require('./block_base');
var util = require('../../hakurei').util;

var BlockGreen = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(BlockGreen, base_object);

BlockGreen.prototype.spriteIndices = function(){
	return [{x: 5, y: 0}];
};


module.exports = BlockGreen;

},{"../../constant":2,"../../hakurei":5,"./block_base":29}],31:[function(require,module,exports){
'use strict';

/* 乗ると消えるブロック */


// 消えるまでの時間
var FALL_SPAN = 20;


var CONSTANT = require('../../constant');
var base_object = require('./block_base');
var util = require('../../hakurei').util;

var BlockGreen = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(BlockGreen, base_object);

BlockGreen.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.start_fall_frame = 0;
	this.is_show = true;
	this.is_collision = true;
};

BlockGreen.prototype.spriteIndices = function(){
	return [{x: 3, y: 0}];
};

BlockGreen.prototype.beforeDraw = function() {
	base_object.prototype.beforeDraw.apply(this, arguments);
	if(this.start_fall_frame && (FALL_SPAN - this.frame_count + this.start_fall_frame <= 0) ) {
		this.is_show = false;

		// reset
		this.start_fall_frame = 0;
	}
};




BlockGreen.prototype.fall = function(){
	this.start_fall_frame = this.frame_count;
	this.is_collision = false;
};

BlockGreen.prototype.isShow = function() {
	return this.is_show;
};
BlockGreen.prototype.isCollision = function() {
	return this.is_collision;
};

BlockGreen.prototype.scaleWidth = function(){
	var base_scale = base_object.prototype.scaleWidth.apply(this, arguments);
	if (this.start_fall_frame) {
		return(base_scale *  (FALL_SPAN - (this.frame_count - this.start_fall_frame)) / FALL_SPAN );
	}
	else {
		return base_scale;
	}
};
BlockGreen.prototype.scaleHeight = function(){
	var base_scale = base_object.prototype.scaleHeight.apply(this, arguments);

	if (this.start_fall_frame) {
		return(base_scale *  (FALL_SPAN - (this.frame_count - this.start_fall_frame)) / FALL_SPAN );
	}
	else {
		return base_scale;
	}
};




module.exports = BlockGreen;

},{"../../constant":2,"../../hakurei":5,"./block_base":29}],32:[function(require,module,exports){
'use strict';
var CONSTANT = require('../../constant');
var base_object = require('./block_base');
var util = require('../../hakurei').util;

var BlockGreen = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(BlockGreen, base_object);

BlockGreen.prototype.spriteIndices = function(){
	return [{x: 4, y: 0}];
};

module.exports = BlockGreen;

},{"../../constant":2,"../../hakurei":5,"./block_base":29}],33:[function(require,module,exports){
'use strict';
var CONSTANT = require('../../constant');
var base_object = require('./block_base');
var util = require('../../hakurei').util;

var BlockGreen = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(BlockGreen, base_object);

BlockGreen.prototype.spriteIndices = function(){
	return [{x: 7, y: 0}];
};

module.exports = BlockGreen;

},{"../../constant":2,"../../hakurei":5,"./block_base":29}],34:[function(require,module,exports){
'use strict';
var CONSTANT = require('../../constant');
var base_object = require('./block_base');
var util = require('../../hakurei').util;

var BlockGreen = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(BlockGreen, base_object);

BlockGreen.prototype.spriteIndices = function(){
	return [{x: 6, y: 0}];
};


module.exports = BlockGreen;

},{"../../constant":2,"../../hakurei":5,"./block_base":29}],35:[function(require,module,exports){
'use strict';
var CONSTANT = require('../../constant');
var base_object = require('./block_base');
var util = require('../../hakurei').util;

var BlockStone1 = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(BlockStone1, base_object);

BlockStone1.prototype.spriteIndices = function(){
	return [{x: 0, y: 0}];
};

module.exports = BlockStone1;

},{"../../constant":2,"../../hakurei":5,"./block_base":29}],36:[function(require,module,exports){
'use strict';
var CONSTANT = require('../../constant');
var base_object = require('./block_base');
var util = require('../../hakurei').util;

var BlockStone2 = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(BlockStone2, base_object);

BlockStone2.prototype.spriteIndices = function(){
	return [{x: 1, y: 0}];
};

module.exports = BlockStone2;

},{"../../constant":2,"../../hakurei":5,"./block_base":29}],37:[function(require,module,exports){
'use strict';
var CONSTANT = require('../../constant');
var base_object = require('./block_base');
var util = require('../../hakurei').util;

var BlockStone3 = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(BlockStone3, base_object);

BlockStone3.prototype.spriteIndices = function(){
	return [{x: 2, y: 0}];
};

module.exports = BlockStone3;

},{"../../constant":2,"../../hakurei":5,"./block_base":29}],38:[function(require,module,exports){
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
	this.x(x);
	this.y(y);
	this.is_show = true;
};

Death.prototype.isCollision = function() {
	return true;
};

// sprite configuration

Death.prototype.spriteName = function(){
	return "stage_tile_24";
};
Death.prototype.spriteIndices = function(){
	return [{x: 2, y: 0}];
};
Death.prototype.spriteWidth = function(){
	return 24;
};
Death.prototype.spriteHeight = function(){
	return 24;
};
module.exports = Death;

},{"../../constant":2,"../../hakurei":5}],39:[function(require,module,exports){
'use strict';

var SPEED = 2;

var CONSTANT = require('../../constant');
var base_object = require('../../hakurei').object.sprite;
var util = require('../../hakurei').util;

var Enemy = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(Enemy, base_object);

Enemy.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.x(x);
	this.y(y);

	this.is_left = false;
};

Enemy.prototype.beforeDraw = function() {
	base_object.prototype.beforeDraw.apply(this, arguments);

	var before_x = this.x();
	if (this.is_left) {
		this._x -= SPEED;
	}
	else {
		this._x += SPEED;
	}

	if(!this.checkCollisionWithBlocks()) {
		// ステージから落ちるなら戻って反転
		this._x = before_x;
		this.is_left = !this.is_left;
	}
};

Enemy.prototype.isCollision = function() {
	return true;
};




// 地面ブロック一覧
var BLOCK_TILE_TYPES = [
	CONSTANT.BLOCK_GREEN,
	CONSTANT.BLOCK_BLUE,
	CONSTANT.BLOCK_RED,
	CONSTANT.BLOCK_PURPLE,
	CONSTANT.BLOCK_BROWN,
	CONSTANT.BLOCK_STONE1,
	CONSTANT.BLOCK_STONE2,
	CONSTANT.BLOCK_STONE3,
	CONSTANT.LADDER, // はしごも
];

// 落下判定
Enemy.prototype.checkCollisionWithBlocks = function() {
	var self = this;
	// 壁と自機の衝突判定
	var is_collision = false;
	for (var i = 0; i < BLOCK_TILE_TYPES.length; i++) {
		var tile_type = BLOCK_TILE_TYPES[i];
		var tile_objects = self.scene.objects_by_tile_type[tile_type];

		for (var j = 0; j < tile_objects.length; j++) {
			var obj = tile_objects[j];

			// 落下判定なので、自機より上のブロックは無視する
			if(self.y()-self.collisionHeight()/2 > obj.y()-obj.collisionHeight()/2) continue;
			if(obj.isCollision() && self.checkCollision(obj)) {
				is_collision = true;
				break;
			}
		}
	}

	return is_collision;
};





Enemy.prototype.collisionWidth = function(){
	return 24;
};
Enemy.prototype.collisionHeight = function(){
	return 24 + 1; // 地面との接触のため、+1
};

Enemy.prototype.isReflect = function(){
	return !this.is_left;
};



// sprite configuration

Enemy.prototype.spriteName = function(){
	return "stage_tile_32";
};
Enemy.prototype.spriteIndices = function(){
	return [{x: 0, y: 4}, {x: 1, y: 4}];
};

Enemy.prototype.spriteAnimationSpan = function(){
	return 10;
};

Enemy.prototype.spriteWidth = function(){
	return 32;
};
Enemy.prototype.spriteHeight = function(){
	return 32;
};
Enemy.prototype.scaleWidth = function(){
	return 1;
};
Enemy.prototype.scaleHeight = function(){
	return 1;
};

module.exports = Enemy;

},{"../../constant":2,"../../hakurei":5}],40:[function(require,module,exports){
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
	this.x(x);
	this.y(y);
	this.is_show = true;
	this.is_collision = true;

	this.start_got_animation_frame_count = 0;
};

Item.prototype.got = function() {
	this.is_collision = false;

	this.core.playSound("powerup");

	// start animation
	this.start_got_animation_frame_count = this.frame_count;
};

Item.prototype.isShow = function() {
	return this.is_show;
};

Item.prototype.isCollision = function() {
	return this.is_collision;
};

Item.prototype.beforeDraw = function(){
	base_object.prototype.beforeDraw.apply(this, arguments);

	if (this.start_got_animation_frame_count) {
		var count = this.frame_count - this.start_got_animation_frame_count;
		if (10 > count && count >= 0) {
			this._y -= 5;
		}
		else if (15 > count && count >= 10) {

		}
		else {
			this.is_show = false;
			this.start_got_animation_frame_count = 0; //reset
		}
	}
};









// sprite configuration

Item.prototype.spriteName = function(){
	return "stage_tile_24";
};
Item.prototype.spriteIndices = function(){
	return [{x: 1, y: 2}];
};
Item.prototype.spriteWidth = function(){
	return 24;
};
Item.prototype.spriteHeight = function(){
	return 24;
};
module.exports = Item;

},{"../../constant":2,"../../hakurei":5}],41:[function(require,module,exports){
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
	this.x(x);
	this.y(y);
};

Ladder.prototype.isCollision = function() {
	return true;
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
		this.x(), this.y(),
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
	return 24;
};
Ladder.prototype.collisionHeight = function() {
	return 24;
};









module.exports = Ladder;

},{"../../constant":2,"../../hakurei":5}],42:[function(require,module,exports){
'use strict';

var CONSTANT = require('../../constant');
var H_CONSTANT = require('../../hakurei').constant;

// 移動速度
var MOVE_SPEED = 2;
// 落下速度
var FALL_SPEED = 2; // TODO: なぜか3にすると、ハシゴを登りきった後に左右に移動できない
// はしごを上るスピード
var LADDER_SPEED = 2;

// 交代アニメーション時間
var EXCHANGE_ANIM_SPAN = 3 * 15.9; //anim span * 7
// 死亡アニメーション時間
var DIE_ANIM_SPAN = 90;

// 地面ブロック一覧
var BLOCK_TILE_TYPES = [
	CONSTANT.BLOCK_GREEN,
	CONSTANT.BLOCK_BLUE,
	CONSTANT.BLOCK_RED,
	CONSTANT.BLOCK_PURPLE,
	CONSTANT.BLOCK_BROWN,
	CONSTANT.BLOCK_STONE1,
	CONSTANT.BLOCK_STONE2,
	CONSTANT.BLOCK_STONE3,
	CONSTANT.LADDER, // はしごも
];

// 壁ブロック一覧
var BLOCK_TILE_TYPES2 = [
	CONSTANT.BLOCK_GREEN,
	CONSTANT.BLOCK_BLUE,
	CONSTANT.BLOCK_RED,
	CONSTANT.BLOCK_PURPLE,
	CONSTANT.BLOCK_BROWN,
	CONSTANT.BLOCK_STONE1,
	CONSTANT.BLOCK_STONE2,
	CONSTANT.BLOCK_STONE3,
];



var base_object = require('../../hakurei').object.sprite;
var BlockBase = require('./block_base');
var AlterEgo = require('../alterego');
var ExchangeAnim = require('../exchange_anim');
var util = require('../../hakurei').util;

// プレイヤーの状態一覧
var StateNormal    = require('./player/state_normal');
var StateMoveLeft  = require('./player/state_moveleft');
var StateMoveRight = require('./player/state_moveright');
var StateClimbDown = require('./player/state_climbdown');
var StateDying     = require('./player/state_dying');
var StateExchange  = require('./player/state_exchange');
var StateFallDown  = require('./player/state_falldown');

var Player = function (scene) {
	base_object.apply(this, arguments);

	// プレイヤーの状態一覧
	this.state = null;
	this.states = {};
	this.states[ CONSTANT.STATE_NORMAL ]    = new StateNormal(scene, this);
	this.states[ CONSTANT.STATE_MOVELEFT ]  = new StateMoveLeft(scene, this);
	this.states[ CONSTANT.STATE_MOVERIGHT ] = new StateMoveRight(scene, this);
	this.states[ CONSTANT.STATE_CLIMBDOWN ] = new StateClimbDown(scene, this);
	this.states[ CONSTANT.STATE_DYING ]     = new StateDying(scene, this);
	this.states[ CONSTANT.STATE_EXCHANGE ]  = new StateExchange(scene, this);
	this.states[ CONSTANT.STATE_FALLDOWN ]  = new StateFallDown(scene, this);
};
util.inherit(Player, base_object);

Player.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.x(x);
	this.y(y);

	this.exchange_num = 0; //位置移動した回数

	// 右を向いているか左を向いているか
	if (this.scene.width/2 < this.x()) {
		this.is_reflect = true;
	}
	else {
		this.is_reflect = false;
	}

	this.fall_blocks = {}; //着地している落下ブロック

	// 分身
	this.alterego = new AlterEgo(this.scene, this);
	this.alterego.init();
	this.addSubObject(this.alterego);

	// 位置交換アニメーション
	this.exchange_anim = new ExchangeAnim(this.scene);

	// 初期状態
	this.changeState(CONSTANT.STATE_NORMAL);
};

Player.prototype.beforeDraw = function(){
	base_object.prototype.beforeDraw.apply(this, arguments);

	this.currentState().beforeDraw();

};

Player.prototype.update = function(){
	// 移動
	if (this.currentState() instanceof StateMoveLeft) {
		this.moveLeft();
	}
	else if(this.currentState() instanceof StateMoveRight) {
		this.moveRight();
	}

	// 移動によって左右の壁にめり込んだら押し返す
	var repulse_x = this.checkCollisionWithLeftRightBlocks();
	if(repulse_x) {
		repulse_x = repulse_x > 0 ? MOVE_SPEED : -MOVE_SPEED;
		// 自機の調整
		this._x += repulse_x;
	}

	// 落下判定をしてもいい状態ならば
	if(this.currentState().isEnableToFallDown()) {
		// 落下判定
		if(!this.checkCollisionWithBlocks()) {
			this.changeState(CONSTANT.STATE_FALLDOWN);
		}
		else {
			// 落下中状態だったならば、普通の状態に戻す
			if (this.isFallingDown()) {
				this.changeState(CONSTANT.STATE_NORMAL);
			}
		}
	}

	// はしごに触れていて、かつ移動可能で、かつまだハシゴ移動状態でなくて、かつ上下キーを押していたら、はしご移動状態に移行
	var collision_ladder = this.checkCollisionWithLadder();
	if(collision_ladder && this.currentState().isEnableToPlayMove() && !this.isClimbDown()) {
			if(this.core.isKeyDown(H_CONSTANT.BUTTON_DOWN) || this.core.isKeyDown(H_CONSTANT.BUTTON_UP)) {
				this.changeState(CONSTANT.STATE_CLIMBDOWN);
			}
	}

	if (this.isClimbDown()) {
		// はしごを降りるのが終了したかどうか判定
		if(!collision_ladder) {
			this.changeState(CONSTANT.STATE_NORMAL);
		}

		// 上下キーが入力されていれば上下移動
		if(this.core.isKeyDown(H_CONSTANT.BUTTON_DOWN)) {
			this._x = collision_ladder.x();
			this.climbDown();
		}
		else if(this.core.isKeyDown(H_CONSTANT.BUTTON_UP)) {
			this.changeState(CONSTANT.STATE_CLIMBDOWN);
			this._x = collision_ladder.x();
			this.climbUp();
		}
		// 上あるいは下のブロックにめり込んだら、めり込み解除
		var repulse_y = this.checkCollisionWithBlocks2();
		if(repulse_y) {
			repulse_y = repulse_y > 0 ? LADDER_SPEED : -LADDER_SPEED;
			// 自機の調整
			this._y += repulse_y;
		}
	}

	// 死亡判定
	if (this.currentState().isEnableToDie()) {
		var is_collision_to_death = this.checkCollisionWithDeathOrEnemy();
		if(is_collision_to_death) {
			this.startDie();
		}
	}

	// 死亡アニメーションが終了判定
	if(this.isDying()) {
		if(this.currentState().frame_count > DIE_ANIM_SPAN) {
			this.scene.notifyPlayerDie();
			this.quitDie();
		}
	}

	// 交代アニメーション終了判定
	if(this.isExchanging() && this.currentState().frame_count > EXCHANGE_ANIM_SPAN) {
		// 位置移動
		this.exchangePosition();

		// リセット
		this.quitExchange();
		this.removeSubObject(this.exchange_anim);
	}


	// 落下
	if (this.isFallingDown()) {
		this.fallDown();
	}

	// アイテムとの接触判定
	var item = this.checkCollisionWithItems();
	if(item) {
		item.got(); // 獲得済
		this.scene.addReimuItemNum();
		// ステージクリア
		if (this.scene.isClear()) {
			this.scene.notifyStageClear();
		}
	}

	// もう既に設地していない落下ブロックは削除
	for (var key in this.fall_blocks) {
		var obj = this.fall_blocks[key];
		if(!this.checkCollision(obj)) {
			obj.fall();
			delete this.fall_blocks[obj.id];
		}
	}

	// 設地している落下ブロックを保存しておく
	var brown_block = this.checkCollisionWithFallBlock();
	if(brown_block) {
		this.fall_blocks[brown_block.id] = brown_block;
	}


	// 踏んでいるブロックにめり込んでいるなら修正
	var collision_block = this.checkCollisionWithBlocks3();
	if(this.isNormal() && collision_block) {
		this._y = collision_block.getCollisionUpY() - this.collisionHeight()/2 + 1;
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
			if(self.y()-self.collisionHeight()/2 > obj.y()-obj.collisionHeight()/2) continue;
			if(obj.isCollision() && self.checkCollision(obj)) {
				is_collision = obj;
				break;
			}
		}
	}

	return is_collision;
};

Player.prototype.checkCollisionWithBlocks2 = function() {
	var self = this;
	// 壁と自機の衝突判定
	var is_collision = false;
	for (var i = 0; i < BLOCK_TILE_TYPES2.length; i++) {
		var tile_type = BLOCK_TILE_TYPES2[i];
		var tile_objects = self.scene.objects_by_tile_type[tile_type];

		for (var j = 0; j < tile_objects.length; j++) {
			var obj = tile_objects[j];

			// 落下判定なので、自機より上のブロックは無視する
			//if(self.y()-self.collisionHeight()/2 > obj.y()-obj.collisionHeight()/2) continue;
			if(obj.isCollision() && self.checkCollision(obj)) {
				is_collision = self.y() - obj.y();
				break;
			}
		}
	}

	return is_collision;
};

Player.prototype.checkCollisionWithBlocks3 = function() {
	var self = this;
	// 壁と自機の衝突判定
	var is_collision = false;
	for (var i = 0; i < BLOCK_TILE_TYPES2.length; i++) {
		var tile_type = BLOCK_TILE_TYPES2[i];
		var tile_objects = self.scene.objects_by_tile_type[tile_type];

		for (var j = 0; j < tile_objects.length; j++) {
			var obj = tile_objects[j];

			// 落下判定なので、自機より上のブロックは無視する
			if(self.y()-self.collisionHeight()/2 > obj.y()-obj.collisionHeight()/2) continue;
			if(obj.isCollision() && self.checkCollision(obj)) {
				is_collision = obj;
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
			if(self.getCollisionDownY() -1 <= obj.getCollisionUpY()) continue; // 自機より下(-1 は地面とのめり込み分)
			if(self.getCollisionUpY() > obj.getCollisionDownY()) continue; // 自機より上
			if(obj.isCollision() && self.checkCollision(obj)) {
				repulse_x = self.x() - obj.x();
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
		if(obj.isCollision() && self.checkCollision(obj)) {
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

// 自分の下に落下ブロックがあるか
Player.prototype.checkCollisionWithFallBlock = function() {
	var self = this;
	var is_collision = null;

	var tile_objects = self.scene.objects_by_tile_type[CONSTANT.BLOCK_BROWN];

	for (var j = 0; j < tile_objects.length; j++) {
		var obj = tile_objects[j];

		// 落下判定なので、自機より上のブロックは無視する
		if(self.y()-self.collisionHeight()/2 > obj.y()-obj.collisionHeight()/2) continue;
		if(obj.isCollision() && self.checkCollision(obj)) {
			is_collision = obj;
			break;
		}
	}

	return is_collision;
};

Player.prototype.changeState = function(state) {
	this.state = state;
	this.currentState().init();

	if (CONSTANT.DEBUG.ON) {
		console.log(this.state);
	}
};
Player.prototype.currentState = function() {
	return this.states[this.state];
};

// 左右移動
Player.prototype.moveLeft = function() {
	// 自機の移動
	this._x -= MOVE_SPEED;
	this.is_reflect = true;
};
Player.prototype.moveRight = function() {
	// 自機の移動
	this._x += MOVE_SPEED;
	this.is_reflect = false;

};
// はしご上移動
Player.prototype.climbUp = function() {
	if(!this.currentState().isEnableToPlayMove()) return;

	// 自機の移動
	this._y -= LADDER_SPEED;
};
// はしご下移動
Player.prototype.climbDown = function() {
	if(!this.currentState().isEnableToPlayMove()) return;

	// 自機の移動
	this._y += LADDER_SPEED;
};







Player.prototype.notifyMoveRight = function() {
	if(!this.currentState().isEnableToPlayMove()) return;

	this.changeState(CONSTANT.STATE_MOVERIGHT);
};
Player.prototype.notifyMoveLeft = function() {
	if(!this.currentState().isEnableToPlayMove()) return;

	this.changeState(CONSTANT.STATE_MOVELEFT);
};
Player.prototype.notifyMoveUp = function() {
	if(!this.currentState().isEnableToPlayMove()) return;

	this.changeState(CONSTANT.STATE_MOVEUP);
};
Player.prototype.notifyMoveDown = function() {
	if(!this.currentState().isEnableToPlayMove()) return;

	this.changeState(CONSTANT.STATE_MOVEDOWN);
};

Player.prototype.notifyNotMove = function() {
	if(!this.currentState().isEnableToPlayMove()) return;

	this.changeState(CONSTANT.STATE_NORMAL);
};




// はしご移動中かどうか
Player.prototype.isClimbDown = function() {
	return this.currentState() instanceof StateClimbDown;
};
// 落下
Player.prototype.fallDown = function() {
	// 自機の移動
	this._y += FALL_SPEED;
};
Player.prototype.isFallingDown = function() {
	return this.currentState() instanceof StateFallDown;
};
// 位置移動
Player.prototype.startExchange = function() {
	if(!this.currentState().isEnableToPlayExchange()) return false;

	// 分身が壁とぶつかってるなら、位置移動できない
	if(this.checkCollisionBetweenAlterEgoAndBlocks()) return false;

	// 交換可能回数上限に達したら
	if(this.remainExchangeNum() <= 0) return false;

	// 状態を位置移動状態に変更
	this.changeState(CONSTANT.STATE_EXCHANGE);

	// 位置移動アニメーション
	this.exchange_anim.init(this.x(), this.y(), EXCHANGE_ANIM_SPAN);
	this.addSubObject(this.exchange_anim);

	// 分身もアニメーション
	this.alterego.startExchange(EXCHANGE_ANIM_SPAN);

	this.exchange_num++;

	return true;
};
Player.prototype.isExchanging = function() {
	return this.currentState() instanceof StateExchange;
};
Player.prototype.quitExchange = function() {
	this.changeState(CONSTANT.STATE_NORMAL);
};


Player.prototype.isNormal = function() {
	return this.currentState() instanceof StateNormal;
};


// 分身が壁とぶつかっているかどうか
Player.prototype.checkCollisionBetweenAlterEgoAndBlocks = function() {
	var is_collision = false;
	for (var i = 0; i < BLOCK_TILE_TYPES2.length; i++) {
		var tile_type = BLOCK_TILE_TYPES2[i];
		var tile_objects = this.scene.objects_by_tile_type[tile_type];

		for (var j = 0; j < tile_objects.length; j++) {
			var obj = tile_objects[j];
			if(this.alterego.checkCollision(obj)) {
				is_collision = true;
				break;
			}
		}
	}

	return is_collision;
};

// 自機と分身の位置入れ替え
Player.prototype.exchangePosition = function() {
	var alterego_x = this.alterego.x();
	var alterego_y = this.alterego.y();

	this.x(alterego_x);
	this.y(alterego_y);

};

// 死亡開始
Player.prototype.startDie = function() {
	this.core.playSound("dead");
	this.changeState(CONSTANT.STATE_DYING);
};
// 死亡中かどうか
Player.prototype.isDying = function() {
	return this.currentState() instanceof StateDying;
};
Player.prototype.quitDie = function() {
	this.changeState(CONSTANT.STATE_NORMAL);
};

Player.prototype.remainExchangeNum = function() {
	return this.scene.max_exchange_num - this.exchange_num;
};





Player.prototype.spriteName = function(){
	return "stage_tile_32";
};
Player.prototype.spriteIndices = function(){
	if(this.isClimbDown()) {
		return [{x: 5, y: 2}, {x: 6, y: 2}];
	}
	else {
		return this.is_reflect ? [{x: 3, y: 2}, {x: 4, y: 2}] : [{x: 1, y: 2}, {x: 2, y:2}];
	}
};
Player.prototype.spriteAnimationSpan = function(){
	return 10;
};

Player.prototype.spriteWidth = function(){
	return 32;
};
Player.prototype.spriteHeight = function(){
	return 32;
};
Player.prototype.isShow = function(){
	if(this.isDying()) { // 死亡中は点滅する
		return this.frame_count % 40 > 20;
	}
	else {
		return this.isExchanging() ? false : true; // 交代中は表示しない
	}
};
Player.prototype.collisionWidth = function() {
	return 24;
};
Player.prototype.collisionHeight = function() {
	return 32;
};

module.exports = Player;

},{"../../constant":2,"../../hakurei":5,"../alterego":24,"../exchange_anim":26,"./block_base":29,"./player/state_climbdown":44,"./player/state_dying":45,"./player/state_exchange":46,"./player/state_falldown":47,"./player/state_moveleft":49,"./player/state_moveright":50,"./player/state_normal":51}],43:[function(require,module,exports){
'use strict';
var base_object = require('../../../hakurei').object.base;
var util = require('../../../hakurei').util;

var StateBase = function (scene, parent) {
	base_object.apply(this, arguments);
};
util.inherit(StateBase, base_object);

// 移動操作ができるか
StateBase.prototype.isEnableToPlayMove = function () {
	return true;
};
// 交代操作ができるか
StateBase.prototype.isEnableToPlayExchange = function () {
	return true;
};

// 落下するかどうか
StateBase.prototype.isEnableToFallDown = function () {
	return true;
};

// 敵と接触するなどして死ねるかどうか
StateBase.prototype.isEnableToDie = function () {
	return true;
};




module.exports = StateBase;

},{"../../../hakurei":5}],44:[function(require,module,exports){
'use strict';

// はしごを降りている状態

var CONSTANT = require('../../../constant');
var base_object = require('./state_base');
var util = require('../../../hakurei').util;

var StateNormal = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(StateNormal, base_object);

// 落下するかどうか
StateNormal.prototype.isEnableToFallDown = function () {
	return false;
};



module.exports = StateNormal;

},{"../../../constant":2,"../../../hakurei":5,"./state_base":43}],45:[function(require,module,exports){
'use strict';

// 死亡中の状態

var CONSTANT = require('../../../constant');
var base_object = require('./state_base');
var util = require('../../../hakurei').util;

var StateNormal = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(StateNormal, base_object);

// 移動操作ができるか
StateNormal.prototype.isEnableToPlayMove = function () {
	return false;
};
// 交代操作ができるか
StateNormal.prototype.isEnableToPlayExchange = function () {
	return false;
};
// 落下するかどうか
StateNormal.prototype.isEnableToFallDown = function () {
	return false;
};

// 敵と接触するなどして死ねるかどうか
StateNormal.prototype.isEnableToDie = function () {
	return false;
};






module.exports = StateNormal;

},{"../../../constant":2,"../../../hakurei":5,"./state_base":43}],46:[function(require,module,exports){
'use strict';

// 場所交代中の状態

var CONSTANT = require('../../../constant');
var base_object = require('./state_base');
var util = require('../../../hakurei').util;

var StateNormal = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(StateNormal, base_object);

// 移動操作ができるか
StateNormal.prototype.isEnableToPlayMove = function () {
	return false;
};
// 交代操作ができるか
StateNormal.prototype.isEnableToPlayExchange = function () {
	return false;
};
// 落下するかどうか
StateNormal.prototype.isEnableToFallDown = function () {
	return false;
};
// 敵と接触するなどして死ねるかどうか
StateNormal.prototype.isEnableToDie = function () {
	return false;
};






module.exports = StateNormal;

},{"../../../constant":2,"../../../hakurei":5,"./state_base":43}],47:[function(require,module,exports){
'use strict';

// 落下中の状態

var CONSTANT = require('../../../constant');
var base_object = require('./state_base');
var util = require('../../../hakurei').util;

var StateNormal = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(StateNormal, base_object);

// 移動操作ができるか
StateNormal.prototype.isEnableToPlayMove = function () {
	return false;
};
module.exports = StateNormal;

},{"../../../constant":2,"../../../hakurei":5,"./state_base":43}],48:[function(require,module,exports){
'use strict';

// 移動状態の基底クラス

var CONSTANT = require('../../../constant');
var base_object = require('./state_base');
var util = require('../../../hakurei').util;

var StateMoveBase = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(StateMoveBase, base_object);

module.exports = StateMoveBase;

},{"../../../constant":2,"../../../hakurei":5,"./state_base":43}],49:[function(require,module,exports){
'use strict';

// 左への移動状態

var CONSTANT = require('../../../constant');
var base_object = require('./state_move_base');
var util = require('../../../hakurei').util;

var StateMoveLeft = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(StateMoveLeft, base_object);

module.exports = StateMoveLeft;

},{"../../../constant":2,"../../../hakurei":5,"./state_move_base":48}],50:[function(require,module,exports){
arguments[4][49][0].apply(exports,arguments)
},{"../../../constant":2,"../../../hakurei":5,"./state_move_base":48,"dup":49}],51:[function(require,module,exports){
'use strict';

// 通常の状態

var CONSTANT = require('../../../constant');
var base_object = require('./state_base');
var util = require('../../../hakurei').util;

var StateNormal = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(StateNormal, base_object);

module.exports = StateNormal;

},{"../../../constant":2,"../../../hakurei":5,"./state_base":43}],52:[function(require,module,exports){
'use strict';

// ローディングシーン

var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;
var AssetsConfig = require('../assets_config');

var SceneLoading = function(core) {
	base_scene.apply(this, arguments);
};
util.inherit(SceneLoading, base_scene);

SceneLoading.prototype.init = function() {
	base_scene.prototype.init.apply(this, arguments);

	// ゲームで使用する画像一覧
	for (var key in AssetsConfig.images) {
		this.core.image_loader.loadImage(key, AssetsConfig.images[key]);
	}

	// ゲームで使用するSE一覧
	for (var key2 in AssetsConfig.sounds) {
		var conf2 = AssetsConfig.sounds[key2];
		this.core.audio_loader.loadSound(key2, conf2.path, conf2.volume);
	}

	// ゲームで使用するBGM一覧
	for (var key3 in AssetsConfig.bgms) {
		var conf3 = AssetsConfig.bgms[key3];
		this.core.audio_loader.loadBGM(key3, conf3.path, 1.0, conf3.loopStart, conf3.loopEnd);
	}
};

SceneLoading.prototype.beforeDraw = function() {
	base_scene.prototype.beforeDraw.apply(this, arguments);

	if (this.core.image_loader.isAllLoaded() && this.core.audio_loader.isAllLoaded() && this.core.font_loader.isAllLoaded()) {
		this.core.changeScene("title");
	}
};
SceneLoading.prototype.draw = function(){
	base_scene.prototype.draw.apply(this, arguments);
	var ctx = this.core.ctx;

	// 背景
	ctx.save();
	ctx.fillStyle = 'white';
	ctx.fillRect(0, 0, this.core.width, this.core.height);
	ctx.restore();

	// メッセージ
	var per_frame = this.frame_count % 60;
	var DOT_SPAN = 15;

	var dot = "";
	if (DOT_SPAN > per_frame && per_frame >= 0) {
		dot = "";
	}
	else if (DOT_SPAN*2 > per_frame && per_frame >= DOT_SPAN*1) {
		dot = ".";
	}
	else if (DOT_SPAN*3 > per_frame && per_frame >= DOT_SPAN*2) {
		dot = "..";
	}
	else {
		dot = "...";
	}

	ctx.save();
	ctx.fillStyle = 'rgb( 0, 0, 0 )';
	ctx.textAlign = 'left';
	ctx.font = "30px 'Migu'";
	ctx.fillText('Now Loading' + dot, this.core.width - 250, this.core.height - 50);
	ctx.restore();


	// プログレスバー
	ctx.save();
	ctx.fillStyle = 'rgb(119, 66, 244)';
	ctx.fillRect(0, this.core.height - 20, this.core.width * this.progress(), 50);
	ctx.restore();
};


SceneLoading.prototype.progress = function(){
	var progress = (this.core.audio_loader.progress() + this.core.image_loader.progress() + this.core.font_loader.progress()) / 3;
	return progress;
};

module.exports = SceneLoading;

},{"../assets_config":1,"../hakurei":5}],53:[function(require,module,exports){
'use strict';
var N = -1;
var D = 10;
var A = 11;
var B = 12;
var C = 13;
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
	// A: 石ブロック
	// B: 石ブロック
	// C: 石ブロック
var map = [
	[0,0,0,0,0,0,0,0,0,0,0,A,B,B,B,B,B,B,C,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,A,B,B,B,B,C,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,A,B,B,C,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,A,B,B,C,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,A,B,B,C,0,0,0,0,0,0,7,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,A,B,B,C,0,0,0,0,0,0,N,0,0,0,0,0,0],
	[0,A,B,B,B,B,B,C,6,A,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,C,0],
	[0,0,0,0,A,C,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,A,B,C,0,0],
	[0,0,0,0,A,C,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,A,B,C,0,0],
	[0,0,0,0,A,C,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,A,B,C,0,0],
	[0,0,0,0,A,C,0,A,B,C,0,0,0,0,0,0,0,0,0,0,A,B,C,0,0,A,B,C,0,0],
	[0,0,0,0,A,C,0,A,B,C,0,0,0,0,0,0,0,0,0,0,A,B,C,0,0,A,B,C,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0],
	[0,A,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,C,0],
	[0,0,A,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,C,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
];

module.exports = {
	map: map, // マップ
	exchange_num: 2, // 位置移動上限回数
	is_vertical: false, // 交代が垂直かどうか
};

},{}],54:[function(require,module,exports){
'use strict';
var N = -1;
var D = 10;
var A = 11;
var B = 12;
var C = 13;
var I = 9;
var E = 8;
var P = 7;
var L = 6;
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
	// A: 石ブロック
	// B: 石ブロック
	// C: 石ブロック
var map = [
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,I,0,0,0,0,0,0,0,0,P,0,0,0,0,0,0,0,0,0,I,0,0,0,0,0],
	[0,0,0,0,0,A,C,L,A,C,0,0,0,0,0,0,0,0,0,0,A,B,B,B,C,0,0,0,0,0],
	[0,0,0,0,0,0,0,L,0,0,0,0,A,B,B,B,B,C,0,0,0,0,L,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0],
	[0,0,0,I,I,0,E,0,0,0,E,0,0,0,I,I,0,0,0,0,0,0,L,0,0,I,I,0,0,0],
	[0,A,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,C,0],
	[0,0,A,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,C,0,0],
	[0,0,0,A,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,C,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
];

module.exports = {
	map: map, // マップ
	exchange_num: 3, // 位置移動上限回数
	is_vertical: false, // 交代が垂直かどうか
};

},{}],55:[function(require,module,exports){
'use strict';
var N = -1;
var D = 10;
var A = 11;
var B = 12;
var C = 13;
var E = 8;
var L = 6;
var P = 7;
var I = 9;
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
	// A: 石ブロック
	// B: 石ブロック
	// C: 石ブロック
var map = [
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,I,0,I,0,I,0,I,0,0,0,0,0,0,0,0,0,E,0,0],
	[0,A,C,L,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,A,B,C,0],
	[0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,L,0,0,0,0,0,P,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,A,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,L,B,B,C,0,0],
	[0,0,0,A,B,B,B,B,B,C,0,0,0,0,0,0,0,0,0,0,0,0,A,B,L,B,C,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0],
	[0,0,E,0,0,0,0,0,0,0,0,I,0,I,0,I,0,I,0,0,0,0,0,0,L,0,0,0,0,0],
	[0,A,B,C,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,A,B,C,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
];

module.exports = {
	map: map, // マップ
	exchange_num: 1, // 位置移動上限回数
	is_vertical: false, // 交代が垂直かどうか
};

},{}],56:[function(require,module,exports){
'use strict';
var N = -1;
var D = 10;
var A = 11;
var B = 12;
var C = 13;
var I = 9;
var E = 8;
var P = 7;
var L = 6;
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
	// A: 石ブロック
	// B: 石ブロック
	// C: 石ブロック
var map = [
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,P,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,I,0,0,I,0,0,0],
	[0,0,A,C,L,A,B,B,C,0,0,0,0,0,0,0,0,0,0,0,0,0,A,B,B,B,B,C,0,0],
	[0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,L,0,0,0,0,I,0,E,0,0,0,0,0,0,0,0,0,0,I,0,0,0,0,0,0,0],
	[0,0,0,0,L,0,0,0,A,B,B,B,B,B,B,B,B,B,B,B,B,B,B,C,0,0,0,0,0,0],
	[0,0,0,0,L,0,0,0,0,A,B,B,B,B,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,I,0,0,0,0,0,0,I,0,0,0],
	[0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,A,B,B,B,B,B,B,B,B,C,0,0],
	[0,0,0,E,L,0,0,0,I,0,0,0,0,0,I,0,0,0,0,0,0,0,0,A,B,B,C,0,0,0],
	[0,0,0,A,B,B,B,B,B,B,B,B,B,B,B,B,B,C,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D],	
];

module.exports = {
	map: map, // マップ
	exchange_num: 2, // 位置移動上限回数
	is_vertical: false, // 交代が垂直かどうか
};

},{}],57:[function(require,module,exports){
'use strict';
var N = -1;
var D = 10;
var A = 11;
var B = 12;
var C = 13;
var I = 9;
var E = 8;
var P = 7;
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
	// A: 石ブロック
	// B: 石ブロック
	// C: 石ブロック
var map = [
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,I,I,I,0,0,E,E,0,0,0,0,0,0,0,0,0,0,0,0,0,0,I,I,I,0,0,0],
	[0,A,B,B,B,B,B,B,B,B,5,5,5,5,5,5,5,5,5,5,B,B,B,B,B,B,B,B,C,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,I,I,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,P,0,0,0,0,0,0,0,0,0,0,0,A,B,B,C,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,N,0,I,I,I,0,0,0,0,0,0,0,0,B,B,0,0,0,0,0,0,0,0,I,I,I,0,0,0],
	[0,A,B,B,B,B,B,B,B,B,5,5,B,B,B,B,B,B,5,5,B,B,B,B,B,B,B,B,C,0],
	[0,0,A,B,B,B,B,B,B,B,0,0,B,B,B,B,B,B,0,0,B,B,B,B,B,B,B,C,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
];

module.exports = {
	map: map, // マップ
	exchange_num: 4, // 位置移動上限回数
	is_vertical: true, // 交代が垂直かどうか
};

},{}],58:[function(require,module,exports){
'use strict';

var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;
var CONSTANT = require('../hakurei').constant;

var SceneTitle = function(core) {
	base_scene.apply(this, arguments);
};
util.inherit(SceneTitle, base_scene);

SceneTitle.prototype.beforeDraw = function(){
	base_scene.prototype.beforeDraw.apply(this, arguments);

	if(this.core.isKeyPush(CONSTANT.BUTTON_Z)) {
			this.core.playSound("select");
			this.core.changeScene("title");
	}
};

// 画面更新
SceneTitle.prototype.draw = function(){
	this.core.clearCanvas();
	var ctx = this.core.ctx;

	ctx.save();


	// background
	ctx.fillStyle = util.hexToRGBString("000000");
	ctx.fillRect(
		0, 0,
		this.core.width, this.core.height
	);
	ctx.restore();

	// タイトル
	var text = '体験版 終了';
	ctx.textAlign = 'center';
	ctx.fillStyle = 'rgb( 255, 255, 255 )';
	ctx.font = "60px 'Migu'";
	ctx.fillText(text, this.core.width/2, 100);

	// メッセージ
	var texts = [
		'ここまでプレイくださり',
		'ありがとうございました。',
		'',
		'完成版は2017年夏コミで頒布予定です。',
		'恐らく以下が豪華になります。',
		'',
		'1. ステージ数が 5 -> 40に増えます。',
		'2. ゆかれいむ成分が増えます。',
		'3. その他もろもろ増えます。',
		'',
		'完成版もよろしくお願いします..！',
	];

	for (var i = 0; i < texts.length; i++) {
		ctx.font = "24px 'Migu'";
		ctx.textAlign = 'left';
		ctx.fillStyle = 'rgb( 255, 255, 255 )';
		ctx.fillText(texts[i], 100, 180 + i*30);
	}



	// show press z
	ctx.font = "38px 'Migu'";
	ctx.textAlign = 'center';

	if(this.frame_count % 80 > 40) {
		text = "Press Z to Return";
		ctx.fillStyle = 'rgb( 0, 0, 0 )';
		ctx.lineWidth = 4.0;
		ctx.strokeText(text, this.core.width/2, 550);

		ctx.fillStyle = 'rgb( 255, 255, 255 )';
		ctx.fillText(text, this.core.width/2, 550);
	}


	//ctx.fillText('→ Story Start', 280, 400);
	//ctx.fillText('　 Stage Select', 280, 450);
	ctx.restore();
};

module.exports = SceneTitle;

},{"../hakurei":5}],59:[function(require,module,exports){
'use strict';

	var offset_x = 25;
	var offset_y = 50;


var util = require('../hakurei').util;
var CONSTANT = require('../constant');

var BackGroundEye  = require('../object/background_eye');
var StageFrame1  = require('../object/stage_frame1');
var StageFrame2  = require('../object/stage_frame2');

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
var BlockStone1 = require('../object/tile/block_stone1');
var BlockStone2 = require('../object/tile/block_stone2');
var BlockStone3 = require('../object/tile/block_stone3');

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
TILE_TYPE_TO_CLASS[CONSTANT.BLOCK_STONE1]       = BlockStone1;
TILE_TYPE_TO_CLASS[CONSTANT.BLOCK_STONE2]       = BlockStone2;
TILE_TYPE_TO_CLASS[CONSTANT.BLOCK_STONE3]       = BlockStone3;


var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;
var SceneStageTalk           = require("./stage/talk");
var SceneStagePlay           = require("./stage/play");
var SceneStageResultClear    = require("./stage/result_clear");
var SceneStageResultGameOver = require("./stage/result_gameover");


var MAPS = [
	null,
	require("./map/stage1"),
	require("./map/stage2"),
	require("./map/stage3"),
	require("./map/stage4"),
	require("./map/stage5"),
];
var SERIF_BEFORES = [
	null,
	require("../logic/serif/stage1/before"),
	require("../logic/serif/stage2/before"),
	require("../logic/serif/stage3/before"),
	require("../logic/serif/stage4/before"),
	require("../logic/serif/stage5/before"),
];

var EYES_NUM = [
	null,
	0,
	1,
	3,
	4,
	6,
];







var SceneStage = function(core) {
	base_scene.apply(this, arguments);

	this.addSubScene("talk",            new SceneStageTalk(core, this));
	this.addSubScene("play",            new SceneStagePlay(core, this));
	this.addSubScene("result_clear",    new SceneStageResultClear(core, this));
	this.addSubScene("result_gameover", new SceneStageResultGameOver(core, this));
};
util.inherit(SceneStage, base_scene);

SceneStage.prototype.init = function(stage_no, sub_scene, is_play_bgm){
	base_scene.prototype.init.apply(this, arguments);

	// stage no
	this.stage_no = stage_no || 1;

	// デフォルトは talk シーンから開始
	if(!sub_scene) sub_scene = "talk";

	this.is_play_bgm = is_play_bgm ? true : false;
	if(this.is_play_bgm) {
		this.core.stopBGM();
	}

	this.reimu_item_num = 0;

	// 背景の眼
	this.eyes = [];

	// このマップでの位置交代可能回数
	this.max_exchange_num = MAPS[this.stage_no].exchange_num;

	// 位置交代が垂直か水平か(true: 垂直, false: 水平)
	this._is_vertical = MAPS[this.stage_no].is_vertical;

	// タイルの種類毎のオブジェクトの配列
	this.objects_by_tile_type = this.initializeObjectsByTileType();

	// 背景の目玉を作成
	//this.createBackGroundEyes();

	// マップデータが正しいかチェック
	if (CONSTANT.DEBUG.ON) {
		this.checkValidMap(MAPS[this.stage_no].map);
	}
	// マップデータからオブジェクト生成
	this.parseAndCreateMap(MAPS[this.stage_no].map);

	// ステージ内で集めないといけないアイテム数
	this.max_item_num = this.calcItemNum();

	// 会話シーン
	if(sub_scene === "talk") {
		this.changeSubScene("talk", SERIF_BEFORES[this.stage_no]);
	}
	else {
		this.changeSubScene(sub_scene);
	}
};
SceneStage.prototype.beforeDraw = function(){
	base_scene.prototype.beforeDraw.apply(this, arguments);

	if(this.is_play_bgm && this.frame_count === 60) {
		this.core.playBGM('stage_a');
	}
};

SceneStage.prototype.notifyPlayerDie = function(){
	this.changeSubScene("result_gameover");
};
SceneStage.prototype.notifyStageClear = function(){
	this.changeSubScene("result_clear");
};


// ステージクリア
SceneStage.prototype.notifyClearEnd = function() {
	if (this.hasNextStage()) {
		this.core.changeScene("stage", this.stage_no + 1);
	}
	else {
		// ステージを全てクリア後
		this.core.changeScene("prerelease_end"); // 体験版終了
	}
};
// ゲームオーバー後
SceneStage.prototype.notifyGameOverEnd = function() {
	// 当該ステージの最初から
	this.core.changeScene("stage", this.stage_no, "play");
};

SceneStage.prototype.hasNextStage = function() {
	return MAPS[this.stage_no + 1] ? true : false;
};

// プレイヤー(1ステージにプレイヤーは1人の想定)
SceneStage.prototype.player = function () {
	return this.objects_by_tile_type[ CONSTANT.PLAYER ][0];
};
// ステージをクリアしたかどうか
SceneStage.prototype.isClear = function () {
	return this.reimu_item_num >= this.max_item_num ? true : false;
};

// 位置移動が垂直かどうか
SceneStage.prototype.isVertical = function () {
	return this._is_vertical;
};





SceneStage.prototype.draw = function() {
	var ctx = this.core.ctx;

	// background
	ctx.save();

	var bg = this.core.image_loader.getImage("stage_bg");
	var cpt = ctx.createPattern(bg, "repeat");

	ctx.fillStyle = cpt;
	ctx.translate(-this.frame_count%103,-103 + this.frame_count%103);
	ctx.fillRect(0, 0, 1648, 1648);
	ctx.restore();

	// stage background
	ctx.save();

	var bg2 = this.core.image_loader.getImage("bg");
	var cpt2 = ctx.createPattern(bg2, "repeat");

	ctx.fillStyle = cpt2;
	ctx.fillRect(
		offset_x, offset_y,
		CONSTANT.TILE_SIZE * 30, CONSTANT.TILE_SIZE * 20
	);
	ctx.restore();

	// ステージNo.
	ctx.save();
	ctx.fillStyle = 'rgb( 255, 255, 255 )';
	ctx.font = "24px 'PixelMplus'";
	ctx.textAlign = 'right';
	ctx.fillText("ステージ: " + this.stage_no, this.core.width - 30, 30);
	ctx.restore();

	ctx.save();

	// 眼を描画
	for(var h = 0, len1 = this.eyes.length; h < len1; h++) {
		this.eyes[h].draw();
	}

	// タイル毎に順番にレンダリング
	for (var i = 0; i < CONSTANT.RENDER_SORT.length; i++) {
		var tile = CONSTANT.RENDER_SORT[i];
		for(var j = 0, len = this.objects_by_tile_type[tile].length; j < len; j++) {
			this.objects_by_tile_type[tile][j].draw();
		}
	}

	// ステージ枠を描画
	this.drawFrames();

	// draw sub scene
	if(this.currentSubScene()) this.currentSubScene().draw();
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


// マップデータが正しいか確認する
SceneStage.prototype.checkValidMap = function(map) {
	if (map.length !== 20) {
		window.alert("マップの縦が20行である必要があります。");
	}

	var is_exists_player = false;
	for (var pos_y = 0; pos_y < map.length; pos_y++) {
		var line = map[pos_y];
		for (var pos_x = 0; pos_x < line.length; pos_x++) {
			var tile = line[pos_x];
			if (tile === CONSTANT.PLAYER) is_exists_player = true;
		}
	}

	if(!is_exists_player) {
		window.alert("このマップではプレイヤーの位置が定義されていません。");
	}
};

SceneStage.prototype.parseAndCreateMap = function(map) {
	var stage = map;


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

SceneStage.prototype.drawFrames = function() {
	var x,y, is_vertical;

	var stage_frame1 = new StageFrame1(this);
	var stage_frame2 = new StageFrame2(this);

	for (var pos_y = 0; pos_y < 20-1; pos_y++) { //縦
		// 左
		x = offset_x;
		y = pos_y * CONSTANT.TILE_SIZE + (offset_y) + 24;

		is_vertical = true;
		stage_frame1.draw(x, y, is_vertical);

		// 右
		x = offset_x + CONSTANT.TILE_SIZE * 30;

		is_vertical = true;
		stage_frame1.draw(x, y, is_vertical);

	}
	for (var pos_x = 0; pos_x < 30-1; pos_x++) { // 横
		// 上
		x = pos_x * CONSTANT.TILE_SIZE + (offset_x) + 24;
		y = offset_y;

		is_vertical = false;
		stage_frame1.draw(x, y, is_vertical);

		// 下
		y = offset_y + CONSTANT.TILE_SIZE * 20;

		is_vertical = false;
		stage_frame1.draw(x, y, is_vertical);
	}

	// 角
	stage_frame2.draw(offset_x, offset_y, 270);
	stage_frame2.draw(offset_x+CONSTANT.TILE_SIZE*30, offset_y, 0);
	stage_frame2.draw(offset_x, offset_y+CONSTANT.TILE_SIZE*20, 180);
	stage_frame2.draw(offset_x+CONSTANT.TILE_SIZE*30, offset_y+CONSTANT.TILE_SIZE*20, 90);
};









SceneStage.prototype.createBackGroundEyes = function() {
	var width = CONSTANT.TILE_SIZE * 30;
	var height = CONSTANT.TILE_SIZE * 20;

	for (var i = 0; i < EYES_NUM[this.stage_no]; i++) {
		var x = offset_x + Math.floor(Math.random() * width);
		var y = offset_y + Math.floor(Math.random() * height);

		var instance = new BackGroundEye(this);
		instance.init(x, y);
		this.eyes.push(instance);
	}
};


SceneStage.prototype.calcItemNum = function() {
	return this.objects_by_tile_type[CONSTANT.ITEM].length;
};





module.exports = SceneStage;

},{"../constant":2,"../hakurei":5,"../logic/serif/stage1/before":18,"../logic/serif/stage2/before":19,"../logic/serif/stage3/before":20,"../logic/serif/stage4/before":21,"../logic/serif/stage5/before":22,"../object/background_eye":25,"../object/stage_frame1":27,"../object/stage_frame2":28,"../object/tile/block_blue":30,"../object/tile/block_brown":31,"../object/tile/block_green":32,"../object/tile/block_purple":33,"../object/tile/block_red":34,"../object/tile/block_stone1":35,"../object/tile/block_stone2":36,"../object/tile/block_stone3":37,"../object/tile/death":38,"../object/tile/enemy":39,"../object/tile/item":40,"../object/tile/ladder":41,"../object/tile/player":42,"./map/stage1":53,"./map/stage2":54,"./map/stage3":55,"./map/stage4":56,"./map/stage5":57,"./stage/play":60,"./stage/result_clear":62,"./stage/result_gameover":63,"./stage/talk":64}],60:[function(require,module,exports){
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
		this.parent.player().notifyMoveLeft();
	}
	else if(this.core.isKeyDown(CONSTANT.BUTTON_RIGHT)) {
		this.parent.player().notifyMoveRight();
	}
	else {
		this.parent.player().notifyNotMove();
	}

	if(this.core.isKeyPush(CONSTANT.BUTTON_X)) {
		if(this.parent.player().startExchange()) {
			// 位置交換成功
			this.core.playSound("boss_powerup");
		}
		else {
			// 位置交換失敗
			this.core.playSound("forbidden");
		}
	}

	this.parent.player().update();
};

SceneStagePlay.prototype.draw = function() {
	var ctx = this.core.ctx;

	// 操作説明
	ctx.save();
	ctx.fillStyle = 'rgb( 255, 255, 255 )';
	ctx.font = "18px 'PixelMplus'";
	ctx.textAlign = 'left';
	ctx.fillText("矢印キー: 移動, Xキー: スキマ移動", 30, this.core.height - 15);
	ctx.restore();
};



module.exports = SceneStagePlay;

},{"../../hakurei":5}],61:[function(require,module,exports){
'use strict';

// メッセージを表示する間隔
var SHOW_MESSAGE_INTERVAL = 50;

// メッセージの黒帯の表示
var RESULT_TRANSITION_COUNT = 100;

var base_scene = require('../../hakurei').scene.base;
var CONSTANT = require('../../hakurei').constant;
var util = require('../../hakurei').util;

var SceneStageResultBase = function(core, parent) {
	base_scene.apply(this, arguments);
};

util.inherit(SceneStageResultBase, base_scene);

SceneStageResultBase.prototype.init = function(){
	base_scene.prototype.init.apply(this, arguments);

	this.transitionStartFrame = 0;
};

SceneStageResultBase.prototype.beforeDraw = function(){
	base_scene.prototype.beforeDraw.apply(this, arguments);

	if(this.isTransitionEnd()) {
		//this.core.stopBGM();
		this.notifyResultEnd();
	}
	else {
		if(this.core.isKeyPush(CONSTANT.BUTTON_Z) && !this.isInTransition()) {
				this.core.playSound('select');
				this.setTransition();
		}
	}

};

SceneStageResultBase.prototype.isInTransition = function(){
	return this.transitionStartFrame ? true : false;
};
SceneStageResultBase.prototype.isTransitionEnd = function(){
	return this.isInTransition() && (this.transitionStartFrame + RESULT_TRANSITION_COUNT < this.frame_count);
};
SceneStageResultBase.prototype.setTransition = function(){
	this.transitionStartFrame = this.frame_count;
};

// 画面更新
SceneStageResultBase.prototype.draw = function(){
	var ctx = this.core.ctx;

	// スコア表示
	this._showScoreWindow();

	// トランジション表示
	if(this.isInTransition()) {
		ctx.save();
		var alpha = 1.0;
		if(this.transitionStartFrame + RESULT_TRANSITION_COUNT >= this.frame_count) {
			alpha = (this.frame_count - this.transitionStartFrame) / RESULT_TRANSITION_COUNT;
		}
		else {
			alpha = 1.0;
		}
		ctx.fillStyle = 'rgb( 0, 0, 0 )' ;
		ctx.globalAlpha = alpha;
		ctx.fillRect(0, 0, this.parent.width, this.parent.height);

		ctx.restore();
	}

};
SceneStageResultBase.prototype._showScoreWindow = function(){
	var ctx = this.core.ctx;

	ctx.save();

	var alpha = 1.0;
	if(this.frame_count < RESULT_TRANSITION_COUNT) {
		alpha = this.frame_count / RESULT_TRANSITION_COUNT;
	}
	else {
		alpha = 1.0;
	}

	ctx.fillStyle = 'rgb(0, 0, 0)' ;
	ctx.globalAlpha = alpha * 0.5; // タイトル背景黒は半透明
	ctx.fillRect( this.parent.width/2 - 100, this.parent.height/2 - 140, 100*2, 140);

	ctx.globalAlpha = alpha; // 文字を表示するので戻す

	ctx.fillStyle = 'white';
	ctx.textAlign = 'center';
	ctx.font = "18px 'Migu'" ;
	ctx.fillText(this.resultName(), this.parent.width/2, 180);


	ctx.fillStyle = 'white';
	ctx.textAlign = 'left';
	ctx.font = "16px 'Migu'" ;
	// N秒ごとにメッセージを点滅
	if (Math.floor(this.frame_count / SHOW_MESSAGE_INTERVAL) % 2 === 0) {
		ctx.textAlign = 'center';
		ctx.fillText(this.resultMessage(), this.parent.width/2, 255);
	}

	ctx.restore();
};

// リザルト画面のタイトル名
SceneStageResultBase.prototype.resultName = function(){
	return "";
};

// リザルト画面のメッセージ
SceneStageResultBase.prototype.resultMessage = function(){
	return "";
};

// リザルト画面が終了したら
SceneStageResultBase.prototype.notifyResultEnd = function(){
	console.error("notifyResultEnd method must be overridden");
};

module.exports = SceneStageResultBase;


},{"../../hakurei":5}],62:[function(require,module,exports){
'use strict';
// クリア リザルト

var base_scene = require('./result_base');
var util = require('../../hakurei').util;

var SceneStageResultClear = function(core, parent) {
	base_scene.apply(this, arguments);
};
util.inherit(SceneStageResultClear, base_scene);

// リザルト画面が終了した
SceneStageResultClear.prototype.notifyResultEnd = function () {
	this.parent.notifyClearEnd();
};

SceneStageResultClear.prototype.resultName = function(){
	return "STAGE CLEAR !";
};
SceneStageResultClear.prototype.resultMessage = function(){
	return "Press Z to Next";
};


module.exports = SceneStageResultClear;

},{"../../hakurei":5,"./result_base":61}],63:[function(require,module,exports){
'use strict';
// クリア リザルト

var base_scene = require('./result_base');
var util = require('../../hakurei').util;

var SceneStageResultClear = function(core, parent) {
	base_scene.apply(this, arguments);
};
util.inherit(SceneStageResultClear, base_scene);

// リザルト画面が終了した
SceneStageResultClear.prototype.notifyResultEnd = function () {
	this.parent.notifyGameOverEnd();
};

SceneStageResultClear.prototype.resultName = function(){
	return "GAME OVER...";
};
SceneStageResultClear.prototype.resultMessage = function(){
	return "Press Z to Retry";
};


module.exports = SceneStageResultClear;

},{"../../hakurei":5,"./result_base":61}],64:[function(require,module,exports){
'use strict';

var MESSAGE_WINDOW_OUTLINE_MARGIN = 10;
var TALKER_MOVE_PX = 5;
var SCALE = 1;

var base_scene = require('../../hakurei').scene.base;
var CONSTANT = require('../../hakurei').constant;
var util = require('../../hakurei').util;

var SerifManager = require('../../hakurei').serif_manager;

var SceneStageTalk = function(core) {
	base_scene.apply(this, arguments);
	this.serif = new SerifManager();
};

util.inherit(SceneStageTalk, base_scene);

SceneStageTalk.prototype.init = function(serif_before){
	base_scene.prototype.init.apply(this, arguments);
	this.serif.init(serif_before);
};

SceneStageTalk.prototype.beforeDraw = function(){
	base_scene.prototype.beforeDraw.apply(this, arguments);

	this.parent.player().update();

	// セリフのないステージならば、そのままプレイに移行
	if(this.frame_count === 1 && this.serif.is_end()) {
		this.parent.changeSubScene("play");
		return;
	}

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
	var y = 65;

	if(!this.serif.is_right_talking()) {
		ctx.globalAlpha = 0.75;
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

SceneStageTalk.prototype._showLeftChara = function(){
	var ctx = this.core.ctx;
	ctx.save();

	var x = -50;
	var y = 25;

	if(!this.serif.is_left_talking()) {
		ctx.globalAlpha = 0.75;
	}
	else {
		x += TALKER_MOVE_PX;
		y -= TALKER_MOVE_PX;
	}

	var left_image = this.core.image_loader.getImage(this.serif.left_image());

	ctx.drawImage(left_image,
		x,
		y,
		left_image.width  * SCALE,
		left_image.height * SCALE
	);

	ctx.restore();
};





/*
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
*/

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

	var x, y;
	// セリフ表示
	var lines = this.serif.lines();
	if (lines.length) {
		// セリフテキストの y 座標初期位置
		var message_height = 80;
		y = this.core.height - message_height + MESSAGE_WINDOW_OUTLINE_MARGIN;

		for(var i = 0, len = lines.length; i < len; i++) {
			ctx.fillStyle = 'rgb( 0, 0, 0 )';
			ctx.lineWidth = 4.0;
			ctx.strokeText(lines[i], MESSAGE_WINDOW_OUTLINE_MARGIN * 2 + 20, y); // 1行表示

			ctx.fillStyle = 'white';
			ctx.fillText(lines[i], MESSAGE_WINDOW_OUTLINE_MARGIN * 2 + 20, y); // 1行表示

			y+= 30;
		}
	}

	ctx.restore();
};




module.exports = SceneStageTalk;

},{"../../hakurei":5}],65:[function(require,module,exports){
'use strict';

var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;
var H_CONSTANT = require('../hakurei').constant;
var CONSTANT = require('../constant');

// transition time ready to show canvas
var SHOW_TRANSITION_COUNT = 100;

// blink interval time
var SHOW_START_MESSAGE_INTERVAL = 50;




var SceneTitle = function(core) {
	base_scene.apply(this, arguments);
};
util.inherit(SceneTitle, base_scene);

SceneTitle.prototype.init = function(){
	base_scene.prototype.init.apply(this, arguments);

	this.core.stopBGM();
};


SceneTitle.prototype.beforeDraw = function(){
	base_scene.prototype.beforeDraw.apply(this, arguments);

	if(this.frame_count === 60) {
		this.core.playBGM("title");
	}

	if(this.core.isKeyPush(H_CONSTANT.BUTTON_Z)) {
		var stage_no;
		if (CONSTANT.DEBUG.START_STAGE_NO) {
			stage_no = CONSTANT.DEBUG.START_STAGE_NO;
		}
		else {
			stage_no = 1;
		}
		this.core.playSound('select');
		this.core.changeScene("stage", stage_no, "talk", true);
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
	var title = this.core.image_loader.getImage('title');
	ctx.drawImage(title,
					20,
					-20,
					title.width,
					title.height);


	// show press z
	ctx.font = "38px 'Migu'";
	ctx.textAlign = 'center';

	if(this.frame_count % 80 > 40) {
		var text = "Press Z to Start";
		ctx.fillStyle = 'rgb( 0, 0, 0 )';
		ctx.lineWidth = 4.0;
		ctx.strokeText(text, this.core.width/2, 420);

		ctx.fillStyle = 'rgb( 255, 255, 255 )';
		ctx.fillText(text, this.core.width/2, 420);
	}


	//ctx.fillText('→ Story Start', 280, 400);
	//ctx.fillText('　 Stage Select', 280, 450);
	ctx.restore();
};

module.exports = SceneTitle;

},{"../constant":2,"../hakurei":5}]},{},[23]);
