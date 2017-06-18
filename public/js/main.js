(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":3}],3:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],4:[function(require,module,exports){
'use strict';

var AssetsConfig = {};
AssetsConfig.images = {
	// タイトルロゴ
	title:         "./image/title.png",
	// タイトル背景
	title_bg:      "./image/title_bg.png",

	// プロローグ背景
	shrine_noon:   "./image/shrine_noon.jpg",

	// ステージ画面背景
	stage_bg:      "./image/stage_bg.png",
	// ステージ画面ステージ背景
	bg:            "./image/bg.png",
	stage_tile_24: "./image/stage_tile_24.png",
	stage_tile_32: "./image/stage_tile_32.png",
	block:         "./image/block.png",
	hashigo:       "./image/hashigo.png",

	// ノーマルステージクリア後背景
	shrine_night:   "./image/shrine_night.jpg",

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

},{}],5:[function(require,module,exports){
'use strict';
var DEBUG = require("./debug_constant");

var CONSTANT = {
	DEBUG: {},

	EX_STORY_START_STAGE_NO:  31,
	TILE_SIZE:  24,

	BLOCK_GREEN:     1,
	BLOCK_BLUE:      2,
	BLOCK_RED:       3,
	BLOCK_PURPLE:    4,
	BLOCK_BROWN:     5,
	LADDER:          6,
	PLAYER:          7,
	ENEMY:           8,
	ITEM_FOR_REIMU:  9,
	DEATH:           10,
	BLOCK_STONE1:    11,
	BLOCK_STONE2:    12,
	BLOCK_STONE3:    13,
	ITEM_FOR_YUKARI: 14,


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
	CONSTANT.ITEM_FOR_REIMU,
	CONSTANT.ITEM_FOR_YUKARI,
];

if (DEBUG.ON) {
	CONSTANT.DEBUG = DEBUG;
}
module.exports = CONSTANT;

},{"./debug_constant":6}],6:[function(require,module,exports){
'use strict';
var DEBUG = {
	ON: true,
	SOUND_OFF: true,
	START_STAGE_NO: 2,
	START_SCENE: "stage",
};

module.exports = DEBUG;

},{}],7:[function(require,module,exports){
'use strict';
var core = require('./hakurei').core;
var util = require('./hakurei').util;
var CONSTANT = require('./constant');

// ローディング画面
var SceneLoading = require('./scene/loading');
// タイトル画面
var SceneTitle = require('./scene/title');
// 回想シーン画面
var SceneReminiscence = require('./scene/reminiscence');
// プロローグ画面
var ScenePrologue = require('./scene/prologue');
var SceneStage = require('./scene/stage');
// 通常ストーリー クリア後画面
var SceneAfterNormal = require('./scene/after_normal');
// Ex エピグラフ画面
var SceneExEpigraph = require('./scene/ex_epigraph');
// Ex プロローグ画面
var SceneExPrologue = require('./scene/ex_prologue');
// Exストーリー クリア後画面
var SceneAfterEx = require('./scene/after_ex');
// スタッフロール
var SceneStaffroll = require('./scene/staffroll');
// エピローグ
var SceneEpilogue = require('./scene/epilogue');

var Game = function(canvas) {
	core.apply(this, arguments);
};
util.inherit(Game, core);

Game.prototype.init = function () {
	core.prototype.init.apply(this, arguments);

	this.addScene("loading", new SceneLoading(this));
	this.addScene("title", new SceneTitle(this));
	this.addScene("reminiscence", new SceneReminiscence(this));
	this.addScene("prologue", new ScenePrologue(this));
	this.addScene("stage", new SceneStage(this));
	this.addScene("after_normal", new SceneAfterNormal(this));
	this.addScene("ex_epigraph", new SceneExEpigraph(this));
	this.addScene("ex_prologue", new SceneExPrologue(this));
	this.addScene("after_ex", new SceneAfterEx(this));
	this.addScene("staffroll", new SceneStaffroll(this));
	this.addScene("epilogue", new SceneEpilogue(this));

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

},{"./constant":5,"./hakurei":8,"./scene/after_ex":84,"./scene/after_normal":85,"./scene/epilogue":86,"./scene/ex_epigraph":87,"./scene/ex_prologue":88,"./scene/loading":89,"./scene/prologue":95,"./scene/reminiscence":96,"./scene/staffroll":98,"./scene/stage":99,"./scene/title":105}],8:[function(require,module,exports){
'use strict';

module.exports = require("./hakureijs/index");

},{"./hakureijs/index":15}],9:[function(require,module,exports){
'use strict';

var AudioLoader = function() {
	this.sounds = {};
	this.bgms = {};

	this.loading_audio_num = 0;
	this.loaded_audio_num = 0;

	this.id = 0;

	// flag which determine what sound.
	this.soundflag = 0x00;

	this.audio_context = null;
	if (window && window.AudioContext) {
		this.audio_context = new window.AudioContext();

		// for legacy browser
		this.audio_context.createGain = this.audio_context.createGain || this.audio_context.createGainNode;
	}

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
	return this.loaded_audio_num === this.loading_audio_num;
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

},{}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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
	return this.loaded_image_num === this.loading_image_num;
};

ImageLoader.prototype.getImage = function(name) {
	return this.images[name];
};

ImageLoader.prototype.progress = function() {
	return this.loaded_image_num / this.loading_image_num;
};




module.exports = ImageLoader;

},{}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
'use strict';

var CONSTANT = {
	SPRITE3D: {},
};

// vertices
CONSTANT.SPRITE3D.V_ITEM_SIZE = 3;
CONSTANT.SPRITE3D.V_ITEM_NUM = 4;
CONSTANT.SPRITE3D.V_SIZE =
	CONSTANT.SPRITE3D.V_ITEM_SIZE * CONSTANT.SPRITE3D.V_ITEM_NUM;
// texture coordinates
CONSTANT.SPRITE3D.C_ITEM_SIZE = 2;
CONSTANT.SPRITE3D.C_ITEM_NUM = 4;
CONSTANT.SPRITE3D.C_SIZE =
	CONSTANT.SPRITE3D.C_ITEM_SIZE * CONSTANT.SPRITE3D.C_ITEM_NUM;

// indices
CONSTANT.SPRITE3D.I_ITEM_SIZE = 1;
CONSTANT.SPRITE3D.I_ITEM_NUM = 6;
CONSTANT.SPRITE3D.I_SIZE =
	CONSTANT.SPRITE3D.I_ITEM_SIZE * CONSTANT.SPRITE3D.I_ITEM_NUM;

// color
CONSTANT.SPRITE3D.A_ITEM_SIZE = 4;
CONSTANT.SPRITE3D.A_ITEM_NUM = 4;
CONSTANT.SPRITE3D.A_SIZE =
	CONSTANT.SPRITE3D.A_ITEM_SIZE * CONSTANT.SPRITE3D.A_ITEM_NUM;

module.exports = CONSTANT;

},{}],14:[function(require,module,exports){
'use strict';

/* TODO: create input_manager class */

var WebGLDebugUtils = require("webgl-debug");
var CONSTANT = require("./constant");
var ImageLoader = require("./asset_loader/image");
var AudioLoader = require("./asset_loader/audio");
var FontLoader = require("./asset_loader/font");
var SceneLoading = require('./scene/loading');

var ShaderProgram = require('./shader_program');
var VS = require("./shader/main.vs");
var FS = require("./shader/main.fs");

var Core = function(canvas, options) {
	if(!options) {
		options = {};
	}

	this.canvas_dom = canvas;
	this.ctx = null; // 2D context
	this.gl  = null; // 3D context

	if(options.webgl) {
		// WebGL 3D mode
		this.gl = this.createWebGLContext(this.canvas_dom);

		// shader program
		this.sprite_3d_shader = new ShaderProgram(
			this.gl,
			// verticle shader, fragment shader
			VS, FS,
			// attributes
			[
				"aTextureCoordinates",
				"aVertexPosition",
				"aColor"
			],
			// uniforms
			[
				"uMVMatrix",
				"uPMatrix",
				"uSampler", // texture data
			]
		);


	}
	else {
		// Canvas 2D mode
		this.ctx = this.canvas_dom.getContext('2d');
	}

	this.width = Number(canvas.getAttribute('width'));
	this.height = Number(canvas.getAttribute('height'));

	this.current_scene = null;
	this._reserved_next_scene = null; // next scene which changes next frame run
	this.scenes = {};

	this.frame_count = 0;

	this.request_id = null;

	this.current_keyflag = 0x0;
	this.before_keyflag = 0x0;

	this.is_left_clicked  = false;
	this.is_right_clicked = false;
	this.before_is_left_clicked  = false;
	this.before_is_right_clicked = false;
	this.mouse_change_x = 0;
	this.mouse_change_y = 0;
	this.mouse_x = 0;
	this.mouse_y = 0;
	this.mouse_scroll = 0;

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

	this.is_left_clicked  = false;
	this.is_right_clicked = false;
	this.before_is_left_clicked  = false;
	this.before_is_right_clicked = false;
	this.mouse_change_x = 0;
	this.mouse_change_y = 0;
	this.mouse_x = 0;
	this.mouse_y = 0;
	this.mouse_scroll = 0;

	this.image_loader.init();
	this.audio_loader.init();
	this.font_loader.init();

	this.addScene("loading", new SceneLoading(this));
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
	this.before_is_left_clicked = this.is_left_clicked;
	this.before_is_right_clicked = this.is_right_clicked;

	// reset mouse wheel and mouse move
	this.mouse_scroll = 0;
	this.mouse_change_x = 0;
	this.mouse_change_y = 0;


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
Core.prototype.changeSceneWithLoading = function(scene, assets) {
	if(!assets) assets = {};
	this.changeScene("loading", assets, scene);
};

Core.prototype.clearCanvas = function() {
	if (this.is2D()) {
		// 2D
		this.ctx.clearRect(0, 0, this.width, this.height);
	}
	else if (this.is3D()) {
		// 3D
		this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
		this.gl.clearDepth(1.0);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT);
	}
};
Core.prototype.is2D = function() {
	return this.ctx ? true : false;
};
Core.prototype.is3D = function() {
	return this.gl ? true : false;
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
Core.prototype.handleMouseDown = function(event) {
	if ("which" in event) { // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
		this.is_left_clicked  = event.which === 1;
		this.is_right_clicked = event.which === 3;
	}
	else if ("button" in event) {  // IE, Opera
		this.is_left_clicked  = event.button === 1;
		this.is_right_clicked = event.button === 2;
	}
	event.preventDefault();
};
Core.prototype.handleMouseUp = function(event) {
	if ("which" in event) { // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
		this.is_left_clicked  = event.which === 1 ? false : this.is_left_clicked;
		this.is_right_clicked = event.which === 3 ? false : this.is_right_clicked;
	}
	else if ("button" in event) {  // IE, Opera
		this.is_left_clicked  = event.button === 1 ? false : this.is_left_clicked;
		this.is_right_clicked = event.button === 2 ? false : this.is_right_clicked;
	}
	event.preventDefault();
};
Core.prototype.isLeftClickDown = function() {
	return this.is_left_clicked;
};
Core.prototype.isLeftClickPush = function() {
	// not true if is pressed in previous frame
	return this.is_left_clicked && !this.before_is_left_clicked;
};
Core.prototype.isRightClickDown = function() {
	return this.is_right_clicked;
};
Core.prototype.isRightClickPush = function() {
	// not true if is pressed in previous frame
	return this.is_right_clicked && !this.before_is_right_clicked;
};


Core.prototype.handleMouseMove = function (d) {
	d = d ? d : window.event;
	d.preventDefault();
	this.mouse_change_x = this.mouse_x - d.clientX;
	this.mouse_change_y = this.mouse_y - d.clientY;
	this.mouse_x = d.clientX;
	this.mouse_y = d.clientY;
};
Core.prototype.mousePositionX = function () {
	return this.mouse_x;
};
Core.prototype.mousePositionY = function () {
	return this.mouse_y;
};
Core.prototype.mouseMoveX = function () {
	return this.mouse_change_x;
};
Core.prototype.mouseMoveY = function () {
	return this.mouse_change_y;
};
Core.prototype.handleMouseWheel = function (event) {
	this.mouse_scroll = event.detail ? event.detail : -event.wheelDelta/120;
};
Core.prototype.mouseScroll = function () {
	return this.mouse_scroll;
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

Core.prototype.setupEvents = function() {
	if(!window) return;

	var self = this;

	// setup WebAudio
	window.AudioContext = (function(){
		return window.AudioContext || window.webkitAudioContext;
	})();

	// setup requestAnimationFrame
	window.requestAnimationFrame = (function(){
		return window.requestAnimationFrame	||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame	||
			function(callback) { window.setTimeout(callback, 1000 / 60); };
	})();


	// If the browser has `document.fonts`, wait font loading.
	if(window.document && window.document.fonts) {
		window.document.fonts.addEventListener('loadingdone', function() { self.fontLoadingDone(); });
	}
	else {
		self.fontLoadingDone();
	}

	// bind keyboard
	window.onkeydown = function(e) { self.handleKeyDown(e); };
	window.onkeyup   = function(e) { self.handleKeyUp(e); };

	// bind mouse click
	this.canvas_dom.onmousedown = function(e) { self.handleMouseDown(e); };
	this.canvas_dom.onmouseup   = function(e) { self.handleMouseUp(e); };

	// bind mouse move
	this.canvas_dom.onmousemove = function(d) { self.handleMouseMove(d); };

	// bind mouse wheel
	var mousewheelevent=(window.navi && /Firefox/i.test(window.navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
	if (this.canvas_dom.addEventListener) { //WC3 browsers
		this.canvas_dom.addEventListener(mousewheelevent, function(e) {
			var event = window.event || e;
			self.handleMouseWheel(event);
		}, false);
	}

	// unable to use right click menu.
	this.canvas_dom.oncontextmenu = function() { return false; };

	// bind gamepad
	if(window.Gamepad && window.navigator && window.navigator.getGamepads) {
		self.enableGamePad();
	}
};

Core.prototype.createWebGLContext = function(canvas) {
	var gl;
	try {
		gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
		gl = WebGLDebugUtils.makeDebugContext(gl);
	} catch (e) {
		throw e;
	}
	if (!gl) {
		throw new Error ("Could not initialize WebGL");
	}

	return gl;
};




module.exports = Core;

},{"./asset_loader/audio":9,"./asset_loader/font":10,"./asset_loader/image":11,"./constant":12,"./scene/loading":33,"./shader/main.fs":35,"./shader/main.vs":36,"./shader_program":37,"webgl-debug":26}],15:[function(require,module,exports){
'use strict';
module.exports = {
	util: require("./util"),
	core: require("./core"),
	constant: require("./constant"),
	serif_manager: require("./serif_manager"),
	shader_program: require("./shader_program"),
	scene: {
		base: require("./scene/base"),
		loading: require("./scene/loading"),
	},
	object: {
		base: require("./object/base"),
		sprite: require("./object/sprite"),
		sprite3d: require("./object/sprite3d"),
		pool_manager: require("./object/pool_manager"),
		pool_manager3d: require("./object/pool_manager3d"),
	},
	asset_loader: {
		image: require("./asset_loader/image"),
		audio: require("./asset_loader/audio"),
		font:  require("./asset_loader/font"),
	},
	storage: {
		base: require("./storage/base"),
		save: require("./storage/save"),
	},

};

},{"./asset_loader/audio":9,"./asset_loader/font":10,"./asset_loader/image":11,"./constant":12,"./core":14,"./object/base":27,"./object/pool_manager":28,"./object/pool_manager3d":29,"./object/sprite":30,"./object/sprite3d":31,"./scene/base":32,"./scene/loading":33,"./serif_manager":34,"./shader_program":37,"./storage/base":38,"./storage/save":39,"./util":40}],16:[function(require,module,exports){
/**
 * @fileoverview gl-matrix - High performance matrix and vector operations
 * @author Brandon Jones
 * @author Colin MacKenzie IV
 * @version 2.3.2
 */

/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */
// END HEADER

exports.glMatrix = require("./gl-matrix/common.js");
exports.mat2 = require("./gl-matrix/mat2.js");
exports.mat2d = require("./gl-matrix/mat2d.js");
exports.mat3 = require("./gl-matrix/mat3.js");
exports.mat4 = require("./gl-matrix/mat4.js");
exports.quat = require("./gl-matrix/quat.js");
exports.vec2 = require("./gl-matrix/vec2.js");
exports.vec3 = require("./gl-matrix/vec3.js");
exports.vec4 = require("./gl-matrix/vec4.js");
},{"./gl-matrix/common.js":17,"./gl-matrix/mat2.js":18,"./gl-matrix/mat2d.js":19,"./gl-matrix/mat3.js":20,"./gl-matrix/mat4.js":21,"./gl-matrix/quat.js":22,"./gl-matrix/vec2.js":23,"./gl-matrix/vec3.js":24,"./gl-matrix/vec4.js":25}],17:[function(require,module,exports){
/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */

/**
 * @class Common utilities
 * @name glMatrix
 */
var glMatrix = {};

// Configuration Constants
glMatrix.EPSILON = 0.000001;
glMatrix.ARRAY_TYPE = (typeof Float32Array !== 'undefined') ? Float32Array : Array;
glMatrix.RANDOM = Math.random;
glMatrix.ENABLE_SIMD = false;

// Capability detection
glMatrix.SIMD_AVAILABLE = (glMatrix.ARRAY_TYPE === Float32Array) && ('SIMD' in this);
glMatrix.USE_SIMD = glMatrix.ENABLE_SIMD && glMatrix.SIMD_AVAILABLE;

/**
 * Sets the type of array used when creating new vectors and matrices
 *
 * @param {Type} type Array type, such as Float32Array or Array
 */
glMatrix.setMatrixArrayType = function(type) {
    glMatrix.ARRAY_TYPE = type;
}

var degree = Math.PI / 180;

/**
* Convert Degree To Radian
*
* @param {Number} Angle in Degrees
*/
glMatrix.toRadian = function(a){
     return a * degree;
}

/**
 * Tests whether or not the arguments have approximately the same value, within an absolute
 * or relative tolerance of glMatrix.EPSILON (an absolute tolerance is used for values less 
 * than or equal to 1.0, and a relative tolerance is used for larger values)
 * 
 * @param {Number} a The first number to test.
 * @param {Number} b The second number to test.
 * @returns {Boolean} True if the numbers are approximately equal, false otherwise.
 */
glMatrix.equals = function(a, b) {
	return Math.abs(a - b) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a), Math.abs(b));
}

module.exports = glMatrix;

},{}],18:[function(require,module,exports){
/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */

var glMatrix = require("./common.js");

/**
 * @class 2x2 Matrix
 * @name mat2
 */
var mat2 = {};

/**
 * Creates a new identity mat2
 *
 * @returns {mat2} a new 2x2 matrix
 */
mat2.create = function() {
    var out = new glMatrix.ARRAY_TYPE(4);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Creates a new mat2 initialized with values from an existing matrix
 *
 * @param {mat2} a matrix to clone
 * @returns {mat2} a new 2x2 matrix
 */
mat2.clone = function(a) {
    var out = new glMatrix.ARRAY_TYPE(4);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Copy the values from one mat2 to another
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Set a mat2 to the identity matrix
 *
 * @param {mat2} out the receiving matrix
 * @returns {mat2} out
 */
mat2.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Create a new mat2 with the given values
 *
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m10 Component in column 1, row 0 position (index 2)
 * @param {Number} m11 Component in column 1, row 1 position (index 3)
 * @returns {mat2} out A new 2x2 matrix
 */
mat2.fromValues = function(m00, m01, m10, m11) {
    var out = new glMatrix.ARRAY_TYPE(4);
    out[0] = m00;
    out[1] = m01;
    out[2] = m10;
    out[3] = m11;
    return out;
};

/**
 * Set the components of a mat2 to the given values
 *
 * @param {mat2} out the receiving matrix
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m10 Component in column 1, row 0 position (index 2)
 * @param {Number} m11 Component in column 1, row 1 position (index 3)
 * @returns {mat2} out
 */
mat2.set = function(out, m00, m01, m10, m11) {
    out[0] = m00;
    out[1] = m01;
    out[2] = m10;
    out[3] = m11;
    return out;
};


/**
 * Transpose the values of a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.transpose = function(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        var a1 = a[1];
        out[1] = a[2];
        out[2] = a1;
    } else {
        out[0] = a[0];
        out[1] = a[2];
        out[2] = a[1];
        out[3] = a[3];
    }
    
    return out;
};

/**
 * Inverts a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.invert = function(out, a) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],

        // Calculate the determinant
        det = a0 * a3 - a2 * a1;

    if (!det) {
        return null;
    }
    det = 1.0 / det;
    
    out[0] =  a3 * det;
    out[1] = -a1 * det;
    out[2] = -a2 * det;
    out[3] =  a0 * det;

    return out;
};

/**
 * Calculates the adjugate of a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.adjoint = function(out, a) {
    // Caching this value is nessecary if out == a
    var a0 = a[0];
    out[0] =  a[3];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] =  a0;

    return out;
};

/**
 * Calculates the determinant of a mat2
 *
 * @param {mat2} a the source matrix
 * @returns {Number} determinant of a
 */
mat2.determinant = function (a) {
    return a[0] * a[3] - a[2] * a[1];
};

/**
 * Multiplies two mat2's
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the first operand
 * @param {mat2} b the second operand
 * @returns {mat2} out
 */
mat2.multiply = function (out, a, b) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
    var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
    out[0] = a0 * b0 + a2 * b1;
    out[1] = a1 * b0 + a3 * b1;
    out[2] = a0 * b2 + a2 * b3;
    out[3] = a1 * b2 + a3 * b3;
    return out;
};

/**
 * Alias for {@link mat2.multiply}
 * @function
 */
mat2.mul = mat2.multiply;

/**
 * Rotates a mat2 by the given angle
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2} out
 */
mat2.rotate = function (out, a, rad) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
        s = Math.sin(rad),
        c = Math.cos(rad);
    out[0] = a0 *  c + a2 * s;
    out[1] = a1 *  c + a3 * s;
    out[2] = a0 * -s + a2 * c;
    out[3] = a1 * -s + a3 * c;
    return out;
};

/**
 * Scales the mat2 by the dimensions in the given vec2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the matrix to rotate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat2} out
 **/
mat2.scale = function(out, a, v) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
        v0 = v[0], v1 = v[1];
    out[0] = a0 * v0;
    out[1] = a1 * v0;
    out[2] = a2 * v1;
    out[3] = a3 * v1;
    return out;
};

/**
 * Creates a matrix from a given angle
 * This is equivalent to (but much faster than):
 *
 *     mat2.identity(dest);
 *     mat2.rotate(dest, dest, rad);
 *
 * @param {mat2} out mat2 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2} out
 */
mat2.fromRotation = function(out, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad);
    out[0] = c;
    out[1] = s;
    out[2] = -s;
    out[3] = c;
    return out;
}

/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat2.identity(dest);
 *     mat2.scale(dest, dest, vec);
 *
 * @param {mat2} out mat2 receiving operation result
 * @param {vec2} v Scaling vector
 * @returns {mat2} out
 */
mat2.fromScaling = function(out, v) {
    out[0] = v[0];
    out[1] = 0;
    out[2] = 0;
    out[3] = v[1];
    return out;
}

/**
 * Returns a string representation of a mat2
 *
 * @param {mat2} mat matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat2.str = function (a) {
    return 'mat2(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
};

/**
 * Returns Frobenius norm of a mat2
 *
 * @param {mat2} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */
mat2.frob = function (a) {
    return(Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2)))
};

/**
 * Returns L, D and U matrices (Lower triangular, Diagonal and Upper triangular) by factorizing the input matrix
 * @param {mat2} L the lower triangular matrix 
 * @param {mat2} D the diagonal matrix 
 * @param {mat2} U the upper triangular matrix 
 * @param {mat2} a the input matrix to factorize
 */

mat2.LDU = function (L, D, U, a) { 
    L[2] = a[2]/a[0]; 
    U[0] = a[0]; 
    U[1] = a[1]; 
    U[3] = a[3] - L[2] * U[1]; 
    return [L, D, U];       
}; 

/**
 * Adds two mat2's
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the first operand
 * @param {mat2} b the second operand
 * @returns {mat2} out
 */
mat2.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    out[3] = a[3] + b[3];
    return out;
};

/**
 * Subtracts matrix b from matrix a
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the first operand
 * @param {mat2} b the second operand
 * @returns {mat2} out
 */
mat2.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    out[3] = a[3] - b[3];
    return out;
};

/**
 * Alias for {@link mat2.subtract}
 * @function
 */
mat2.sub = mat2.subtract;

/**
 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
 *
 * @param {mat2} a The first matrix.
 * @param {mat2} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
mat2.exactEquals = function (a, b) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
};

/**
 * Returns whether or not the matrices have approximately the same elements in the same position.
 *
 * @param {mat2} a The first matrix.
 * @param {mat2} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
mat2.equals = function (a, b) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
    var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
    return (Math.abs(a0 - b0) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
            Math.abs(a1 - b1) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
            Math.abs(a2 - b2) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
            Math.abs(a3 - b3) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a3), Math.abs(b3)));
};

/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the matrix to scale
 * @param {Number} b amount to scale the matrix's elements by
 * @returns {mat2} out
 */
mat2.multiplyScalar = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    out[3] = a[3] * b;
    return out;
};

/**
 * Adds two mat2's after multiplying each element of the second operand by a scalar value.
 *
 * @param {mat2} out the receiving vector
 * @param {mat2} a the first operand
 * @param {mat2} b the second operand
 * @param {Number} scale the amount to scale b's elements by before adding
 * @returns {mat2} out
 */
mat2.multiplyScalarAndAdd = function(out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale);
    out[1] = a[1] + (b[1] * scale);
    out[2] = a[2] + (b[2] * scale);
    out[3] = a[3] + (b[3] * scale);
    return out;
};

module.exports = mat2;

},{"./common.js":17}],19:[function(require,module,exports){
/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */

var glMatrix = require("./common.js");

/**
 * @class 2x3 Matrix
 * @name mat2d
 * 
 * @description 
 * A mat2d contains six elements defined as:
 * <pre>
 * [a, c, tx,
 *  b, d, ty]
 * </pre>
 * This is a short form for the 3x3 matrix:
 * <pre>
 * [a, c, tx,
 *  b, d, ty,
 *  0, 0, 1]
 * </pre>
 * The last row is ignored so the array is shorter and operations are faster.
 */
var mat2d = {};

/**
 * Creates a new identity mat2d
 *
 * @returns {mat2d} a new 2x3 matrix
 */
mat2d.create = function() {
    var out = new glMatrix.ARRAY_TYPE(6);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    out[4] = 0;
    out[5] = 0;
    return out;
};

/**
 * Creates a new mat2d initialized with values from an existing matrix
 *
 * @param {mat2d} a matrix to clone
 * @returns {mat2d} a new 2x3 matrix
 */
mat2d.clone = function(a) {
    var out = new glMatrix.ARRAY_TYPE(6);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    return out;
};

/**
 * Copy the values from one mat2d to another
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the source matrix
 * @returns {mat2d} out
 */
mat2d.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    return out;
};

/**
 * Set a mat2d to the identity matrix
 *
 * @param {mat2d} out the receiving matrix
 * @returns {mat2d} out
 */
mat2d.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    out[4] = 0;
    out[5] = 0;
    return out;
};

/**
 * Create a new mat2d with the given values
 *
 * @param {Number} a Component A (index 0)
 * @param {Number} b Component B (index 1)
 * @param {Number} c Component C (index 2)
 * @param {Number} d Component D (index 3)
 * @param {Number} tx Component TX (index 4)
 * @param {Number} ty Component TY (index 5)
 * @returns {mat2d} A new mat2d
 */
mat2d.fromValues = function(a, b, c, d, tx, ty) {
    var out = new glMatrix.ARRAY_TYPE(6);
    out[0] = a;
    out[1] = b;
    out[2] = c;
    out[3] = d;
    out[4] = tx;
    out[5] = ty;
    return out;
};

/**
 * Set the components of a mat2d to the given values
 *
 * @param {mat2d} out the receiving matrix
 * @param {Number} a Component A (index 0)
 * @param {Number} b Component B (index 1)
 * @param {Number} c Component C (index 2)
 * @param {Number} d Component D (index 3)
 * @param {Number} tx Component TX (index 4)
 * @param {Number} ty Component TY (index 5)
 * @returns {mat2d} out
 */
mat2d.set = function(out, a, b, c, d, tx, ty) {
    out[0] = a;
    out[1] = b;
    out[2] = c;
    out[3] = d;
    out[4] = tx;
    out[5] = ty;
    return out;
};

/**
 * Inverts a mat2d
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the source matrix
 * @returns {mat2d} out
 */
mat2d.invert = function(out, a) {
    var aa = a[0], ab = a[1], ac = a[2], ad = a[3],
        atx = a[4], aty = a[5];

    var det = aa * ad - ab * ac;
    if(!det){
        return null;
    }
    det = 1.0 / det;

    out[0] = ad * det;
    out[1] = -ab * det;
    out[2] = -ac * det;
    out[3] = aa * det;
    out[4] = (ac * aty - ad * atx) * det;
    out[5] = (ab * atx - aa * aty) * det;
    return out;
};

/**
 * Calculates the determinant of a mat2d
 *
 * @param {mat2d} a the source matrix
 * @returns {Number} determinant of a
 */
mat2d.determinant = function (a) {
    return a[0] * a[3] - a[1] * a[2];
};

/**
 * Multiplies two mat2d's
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the first operand
 * @param {mat2d} b the second operand
 * @returns {mat2d} out
 */
mat2d.multiply = function (out, a, b) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5],
        b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5];
    out[0] = a0 * b0 + a2 * b1;
    out[1] = a1 * b0 + a3 * b1;
    out[2] = a0 * b2 + a2 * b3;
    out[3] = a1 * b2 + a3 * b3;
    out[4] = a0 * b4 + a2 * b5 + a4;
    out[5] = a1 * b4 + a3 * b5 + a5;
    return out;
};

/**
 * Alias for {@link mat2d.multiply}
 * @function
 */
mat2d.mul = mat2d.multiply;

/**
 * Rotates a mat2d by the given angle
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2d} out
 */
mat2d.rotate = function (out, a, rad) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5],
        s = Math.sin(rad),
        c = Math.cos(rad);
    out[0] = a0 *  c + a2 * s;
    out[1] = a1 *  c + a3 * s;
    out[2] = a0 * -s + a2 * c;
    out[3] = a1 * -s + a3 * c;
    out[4] = a4;
    out[5] = a5;
    return out;
};

/**
 * Scales the mat2d by the dimensions in the given vec2
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to translate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat2d} out
 **/
mat2d.scale = function(out, a, v) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5],
        v0 = v[0], v1 = v[1];
    out[0] = a0 * v0;
    out[1] = a1 * v0;
    out[2] = a2 * v1;
    out[3] = a3 * v1;
    out[4] = a4;
    out[5] = a5;
    return out;
};

/**
 * Translates the mat2d by the dimensions in the given vec2
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to translate
 * @param {vec2} v the vec2 to translate the matrix by
 * @returns {mat2d} out
 **/
mat2d.translate = function(out, a, v) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5],
        v0 = v[0], v1 = v[1];
    out[0] = a0;
    out[1] = a1;
    out[2] = a2;
    out[3] = a3;
    out[4] = a0 * v0 + a2 * v1 + a4;
    out[5] = a1 * v0 + a3 * v1 + a5;
    return out;
};

/**
 * Creates a matrix from a given angle
 * This is equivalent to (but much faster than):
 *
 *     mat2d.identity(dest);
 *     mat2d.rotate(dest, dest, rad);
 *
 * @param {mat2d} out mat2d receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2d} out
 */
mat2d.fromRotation = function(out, rad) {
    var s = Math.sin(rad), c = Math.cos(rad);
    out[0] = c;
    out[1] = s;
    out[2] = -s;
    out[3] = c;
    out[4] = 0;
    out[5] = 0;
    return out;
}

/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat2d.identity(dest);
 *     mat2d.scale(dest, dest, vec);
 *
 * @param {mat2d} out mat2d receiving operation result
 * @param {vec2} v Scaling vector
 * @returns {mat2d} out
 */
mat2d.fromScaling = function(out, v) {
    out[0] = v[0];
    out[1] = 0;
    out[2] = 0;
    out[3] = v[1];
    out[4] = 0;
    out[5] = 0;
    return out;
}

/**
 * Creates a matrix from a vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat2d.identity(dest);
 *     mat2d.translate(dest, dest, vec);
 *
 * @param {mat2d} out mat2d receiving operation result
 * @param {vec2} v Translation vector
 * @returns {mat2d} out
 */
mat2d.fromTranslation = function(out, v) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    out[4] = v[0];
    out[5] = v[1];
    return out;
}

/**
 * Returns a string representation of a mat2d
 *
 * @param {mat2d} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat2d.str = function (a) {
    return 'mat2d(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + 
                    a[3] + ', ' + a[4] + ', ' + a[5] + ')';
};

/**
 * Returns Frobenius norm of a mat2d
 *
 * @param {mat2d} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */
mat2d.frob = function (a) { 
    return(Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) + Math.pow(a[4], 2) + Math.pow(a[5], 2) + 1))
}; 

/**
 * Adds two mat2d's
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the first operand
 * @param {mat2d} b the second operand
 * @returns {mat2d} out
 */
mat2d.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    out[3] = a[3] + b[3];
    out[4] = a[4] + b[4];
    out[5] = a[5] + b[5];
    return out;
};

/**
 * Subtracts matrix b from matrix a
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the first operand
 * @param {mat2d} b the second operand
 * @returns {mat2d} out
 */
mat2d.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    out[3] = a[3] - b[3];
    out[4] = a[4] - b[4];
    out[5] = a[5] - b[5];
    return out;
};

/**
 * Alias for {@link mat2d.subtract}
 * @function
 */
mat2d.sub = mat2d.subtract;

/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to scale
 * @param {Number} b amount to scale the matrix's elements by
 * @returns {mat2d} out
 */
mat2d.multiplyScalar = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    out[3] = a[3] * b;
    out[4] = a[4] * b;
    out[5] = a[5] * b;
    return out;
};

/**
 * Adds two mat2d's after multiplying each element of the second operand by a scalar value.
 *
 * @param {mat2d} out the receiving vector
 * @param {mat2d} a the first operand
 * @param {mat2d} b the second operand
 * @param {Number} scale the amount to scale b's elements by before adding
 * @returns {mat2d} out
 */
mat2d.multiplyScalarAndAdd = function(out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale);
    out[1] = a[1] + (b[1] * scale);
    out[2] = a[2] + (b[2] * scale);
    out[3] = a[3] + (b[3] * scale);
    out[4] = a[4] + (b[4] * scale);
    out[5] = a[5] + (b[5] * scale);
    return out;
};

/**
 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
 *
 * @param {mat2d} a The first matrix.
 * @param {mat2d} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
mat2d.exactEquals = function (a, b) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5];
};

/**
 * Returns whether or not the matrices have approximately the same elements in the same position.
 *
 * @param {mat2d} a The first matrix.
 * @param {mat2d} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
mat2d.equals = function (a, b) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5];
    var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5];
    return (Math.abs(a0 - b0) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
            Math.abs(a1 - b1) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
            Math.abs(a2 - b2) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
            Math.abs(a3 - b3) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a3), Math.abs(b3)) &&
            Math.abs(a4 - b4) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a4), Math.abs(b4)) &&
            Math.abs(a5 - b5) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a5), Math.abs(b5)));
};

module.exports = mat2d;

},{"./common.js":17}],20:[function(require,module,exports){
/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */

var glMatrix = require("./common.js");

/**
 * @class 3x3 Matrix
 * @name mat3
 */
var mat3 = {};

/**
 * Creates a new identity mat3
 *
 * @returns {mat3} a new 3x3 matrix
 */
mat3.create = function() {
    var out = new glMatrix.ARRAY_TYPE(9);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 1;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 1;
    return out;
};

/**
 * Copies the upper-left 3x3 values into the given mat3.
 *
 * @param {mat3} out the receiving 3x3 matrix
 * @param {mat4} a   the source 4x4 matrix
 * @returns {mat3} out
 */
mat3.fromMat4 = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[4];
    out[4] = a[5];
    out[5] = a[6];
    out[6] = a[8];
    out[7] = a[9];
    out[8] = a[10];
    return out;
};

/**
 * Creates a new mat3 initialized with values from an existing matrix
 *
 * @param {mat3} a matrix to clone
 * @returns {mat3} a new 3x3 matrix
 */
mat3.clone = function(a) {
    var out = new glMatrix.ARRAY_TYPE(9);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
};

/**
 * Copy the values from one mat3 to another
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
};

/**
 * Create a new mat3 with the given values
 *
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m10 Component in column 1, row 0 position (index 3)
 * @param {Number} m11 Component in column 1, row 1 position (index 4)
 * @param {Number} m12 Component in column 1, row 2 position (index 5)
 * @param {Number} m20 Component in column 2, row 0 position (index 6)
 * @param {Number} m21 Component in column 2, row 1 position (index 7)
 * @param {Number} m22 Component in column 2, row 2 position (index 8)
 * @returns {mat3} A new mat3
 */
mat3.fromValues = function(m00, m01, m02, m10, m11, m12, m20, m21, m22) {
    var out = new glMatrix.ARRAY_TYPE(9);
    out[0] = m00;
    out[1] = m01;
    out[2] = m02;
    out[3] = m10;
    out[4] = m11;
    out[5] = m12;
    out[6] = m20;
    out[7] = m21;
    out[8] = m22;
    return out;
};

/**
 * Set the components of a mat3 to the given values
 *
 * @param {mat3} out the receiving matrix
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m10 Component in column 1, row 0 position (index 3)
 * @param {Number} m11 Component in column 1, row 1 position (index 4)
 * @param {Number} m12 Component in column 1, row 2 position (index 5)
 * @param {Number} m20 Component in column 2, row 0 position (index 6)
 * @param {Number} m21 Component in column 2, row 1 position (index 7)
 * @param {Number} m22 Component in column 2, row 2 position (index 8)
 * @returns {mat3} out
 */
mat3.set = function(out, m00, m01, m02, m10, m11, m12, m20, m21, m22) {
    out[0] = m00;
    out[1] = m01;
    out[2] = m02;
    out[3] = m10;
    out[4] = m11;
    out[5] = m12;
    out[6] = m20;
    out[7] = m21;
    out[8] = m22;
    return out;
};

/**
 * Set a mat3 to the identity matrix
 *
 * @param {mat3} out the receiving matrix
 * @returns {mat3} out
 */
mat3.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 1;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 1;
    return out;
};

/**
 * Transpose the values of a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.transpose = function(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        var a01 = a[1], a02 = a[2], a12 = a[5];
        out[1] = a[3];
        out[2] = a[6];
        out[3] = a01;
        out[5] = a[7];
        out[6] = a02;
        out[7] = a12;
    } else {
        out[0] = a[0];
        out[1] = a[3];
        out[2] = a[6];
        out[3] = a[1];
        out[4] = a[4];
        out[5] = a[7];
        out[6] = a[2];
        out[7] = a[5];
        out[8] = a[8];
    }
    
    return out;
};

/**
 * Inverts a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.invert = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],

        b01 = a22 * a11 - a12 * a21,
        b11 = -a22 * a10 + a12 * a20,
        b21 = a21 * a10 - a11 * a20,

        // Calculate the determinant
        det = a00 * b01 + a01 * b11 + a02 * b21;

    if (!det) { 
        return null; 
    }
    det = 1.0 / det;

    out[0] = b01 * det;
    out[1] = (-a22 * a01 + a02 * a21) * det;
    out[2] = (a12 * a01 - a02 * a11) * det;
    out[3] = b11 * det;
    out[4] = (a22 * a00 - a02 * a20) * det;
    out[5] = (-a12 * a00 + a02 * a10) * det;
    out[6] = b21 * det;
    out[7] = (-a21 * a00 + a01 * a20) * det;
    out[8] = (a11 * a00 - a01 * a10) * det;
    return out;
};

/**
 * Calculates the adjugate of a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.adjoint = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8];

    out[0] = (a11 * a22 - a12 * a21);
    out[1] = (a02 * a21 - a01 * a22);
    out[2] = (a01 * a12 - a02 * a11);
    out[3] = (a12 * a20 - a10 * a22);
    out[4] = (a00 * a22 - a02 * a20);
    out[5] = (a02 * a10 - a00 * a12);
    out[6] = (a10 * a21 - a11 * a20);
    out[7] = (a01 * a20 - a00 * a21);
    out[8] = (a00 * a11 - a01 * a10);
    return out;
};

/**
 * Calculates the determinant of a mat3
 *
 * @param {mat3} a the source matrix
 * @returns {Number} determinant of a
 */
mat3.determinant = function (a) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8];

    return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
};

/**
 * Multiplies two mat3's
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the first operand
 * @param {mat3} b the second operand
 * @returns {mat3} out
 */
mat3.multiply = function (out, a, b) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],

        b00 = b[0], b01 = b[1], b02 = b[2],
        b10 = b[3], b11 = b[4], b12 = b[5],
        b20 = b[6], b21 = b[7], b22 = b[8];

    out[0] = b00 * a00 + b01 * a10 + b02 * a20;
    out[1] = b00 * a01 + b01 * a11 + b02 * a21;
    out[2] = b00 * a02 + b01 * a12 + b02 * a22;

    out[3] = b10 * a00 + b11 * a10 + b12 * a20;
    out[4] = b10 * a01 + b11 * a11 + b12 * a21;
    out[5] = b10 * a02 + b11 * a12 + b12 * a22;

    out[6] = b20 * a00 + b21 * a10 + b22 * a20;
    out[7] = b20 * a01 + b21 * a11 + b22 * a21;
    out[8] = b20 * a02 + b21 * a12 + b22 * a22;
    return out;
};

/**
 * Alias for {@link mat3.multiply}
 * @function
 */
mat3.mul = mat3.multiply;

/**
 * Translate a mat3 by the given vector
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to translate
 * @param {vec2} v vector to translate by
 * @returns {mat3} out
 */
mat3.translate = function(out, a, v) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],
        x = v[0], y = v[1];

    out[0] = a00;
    out[1] = a01;
    out[2] = a02;

    out[3] = a10;
    out[4] = a11;
    out[5] = a12;

    out[6] = x * a00 + y * a10 + a20;
    out[7] = x * a01 + y * a11 + a21;
    out[8] = x * a02 + y * a12 + a22;
    return out;
};

/**
 * Rotates a mat3 by the given angle
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat3} out
 */
mat3.rotate = function (out, a, rad) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],

        s = Math.sin(rad),
        c = Math.cos(rad);

    out[0] = c * a00 + s * a10;
    out[1] = c * a01 + s * a11;
    out[2] = c * a02 + s * a12;

    out[3] = c * a10 - s * a00;
    out[4] = c * a11 - s * a01;
    out[5] = c * a12 - s * a02;

    out[6] = a20;
    out[7] = a21;
    out[8] = a22;
    return out;
};

/**
 * Scales the mat3 by the dimensions in the given vec2
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to rotate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat3} out
 **/
mat3.scale = function(out, a, v) {
    var x = v[0], y = v[1];

    out[0] = x * a[0];
    out[1] = x * a[1];
    out[2] = x * a[2];

    out[3] = y * a[3];
    out[4] = y * a[4];
    out[5] = y * a[5];

    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
};

/**
 * Creates a matrix from a vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat3.identity(dest);
 *     mat3.translate(dest, dest, vec);
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {vec2} v Translation vector
 * @returns {mat3} out
 */
mat3.fromTranslation = function(out, v) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 1;
    out[5] = 0;
    out[6] = v[0];
    out[7] = v[1];
    out[8] = 1;
    return out;
}

/**
 * Creates a matrix from a given angle
 * This is equivalent to (but much faster than):
 *
 *     mat3.identity(dest);
 *     mat3.rotate(dest, dest, rad);
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat3} out
 */
mat3.fromRotation = function(out, rad) {
    var s = Math.sin(rad), c = Math.cos(rad);

    out[0] = c;
    out[1] = s;
    out[2] = 0;

    out[3] = -s;
    out[4] = c;
    out[5] = 0;

    out[6] = 0;
    out[7] = 0;
    out[8] = 1;
    return out;
}

/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat3.identity(dest);
 *     mat3.scale(dest, dest, vec);
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {vec2} v Scaling vector
 * @returns {mat3} out
 */
mat3.fromScaling = function(out, v) {
    out[0] = v[0];
    out[1] = 0;
    out[2] = 0;

    out[3] = 0;
    out[4] = v[1];
    out[5] = 0;

    out[6] = 0;
    out[7] = 0;
    out[8] = 1;
    return out;
}

/**
 * Copies the values from a mat2d into a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat2d} a the matrix to copy
 * @returns {mat3} out
 **/
mat3.fromMat2d = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = 0;

    out[3] = a[2];
    out[4] = a[3];
    out[5] = 0;

    out[6] = a[4];
    out[7] = a[5];
    out[8] = 1;
    return out;
};

/**
* Calculates a 3x3 matrix from the given quaternion
*
* @param {mat3} out mat3 receiving operation result
* @param {quat} q Quaternion to create matrix from
*
* @returns {mat3} out
*/
mat3.fromQuat = function (out, q) {
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        yx = y * x2,
        yy = y * y2,
        zx = z * x2,
        zy = z * y2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - yy - zz;
    out[3] = yx - wz;
    out[6] = zx + wy;

    out[1] = yx + wz;
    out[4] = 1 - xx - zz;
    out[7] = zy - wx;

    out[2] = zx - wy;
    out[5] = zy + wx;
    out[8] = 1 - xx - yy;

    return out;
};

/**
* Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
*
* @param {mat3} out mat3 receiving operation result
* @param {mat4} a Mat4 to derive the normal matrix from
*
* @returns {mat3} out
*/
mat3.normalFromMat4 = function (out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32,

        // Calculate the determinant
        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) { 
        return null; 
    }
    det = 1.0 / det;

    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;

    out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;

    out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;

    return out;
};

/**
 * Returns a string representation of a mat3
 *
 * @param {mat3} mat matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat3.str = function (a) {
    return 'mat3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + 
                    a[3] + ', ' + a[4] + ', ' + a[5] + ', ' + 
                    a[6] + ', ' + a[7] + ', ' + a[8] + ')';
};

/**
 * Returns Frobenius norm of a mat3
 *
 * @param {mat3} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */
mat3.frob = function (a) {
    return(Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) + Math.pow(a[4], 2) + Math.pow(a[5], 2) + Math.pow(a[6], 2) + Math.pow(a[7], 2) + Math.pow(a[8], 2)))
};

/**
 * Adds two mat3's
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the first operand
 * @param {mat3} b the second operand
 * @returns {mat3} out
 */
mat3.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    out[3] = a[3] + b[3];
    out[4] = a[4] + b[4];
    out[5] = a[5] + b[5];
    out[6] = a[6] + b[6];
    out[7] = a[7] + b[7];
    out[8] = a[8] + b[8];
    return out;
};

/**
 * Subtracts matrix b from matrix a
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the first operand
 * @param {mat3} b the second operand
 * @returns {mat3} out
 */
mat3.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    out[3] = a[3] - b[3];
    out[4] = a[4] - b[4];
    out[5] = a[5] - b[5];
    out[6] = a[6] - b[6];
    out[7] = a[7] - b[7];
    out[8] = a[8] - b[8];
    return out;
};

/**
 * Alias for {@link mat3.subtract}
 * @function
 */
mat3.sub = mat3.subtract;

/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to scale
 * @param {Number} b amount to scale the matrix's elements by
 * @returns {mat3} out
 */
mat3.multiplyScalar = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    out[3] = a[3] * b;
    out[4] = a[4] * b;
    out[5] = a[5] * b;
    out[6] = a[6] * b;
    out[7] = a[7] * b;
    out[8] = a[8] * b;
    return out;
};

/**
 * Adds two mat3's after multiplying each element of the second operand by a scalar value.
 *
 * @param {mat3} out the receiving vector
 * @param {mat3} a the first operand
 * @param {mat3} b the second operand
 * @param {Number} scale the amount to scale b's elements by before adding
 * @returns {mat3} out
 */
mat3.multiplyScalarAndAdd = function(out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale);
    out[1] = a[1] + (b[1] * scale);
    out[2] = a[2] + (b[2] * scale);
    out[3] = a[3] + (b[3] * scale);
    out[4] = a[4] + (b[4] * scale);
    out[5] = a[5] + (b[5] * scale);
    out[6] = a[6] + (b[6] * scale);
    out[7] = a[7] + (b[7] * scale);
    out[8] = a[8] + (b[8] * scale);
    return out;
};

/*
 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
 *
 * @param {mat3} a The first matrix.
 * @param {mat3} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
mat3.exactEquals = function (a, b) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && 
           a[3] === b[3] && a[4] === b[4] && a[5] === b[5] &&
           a[6] === b[6] && a[7] === b[7] && a[8] === b[8];
};

/**
 * Returns whether or not the matrices have approximately the same elements in the same position.
 *
 * @param {mat3} a The first matrix.
 * @param {mat3} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
mat3.equals = function (a, b) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5], a6 = a[6], a7 = a[7], a8 = a[8];
    var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5], b6 = a[6], b7 = b[7], b8 = b[8];
    return (Math.abs(a0 - b0) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
            Math.abs(a1 - b1) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
            Math.abs(a2 - b2) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
            Math.abs(a3 - b3) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a3), Math.abs(b3)) &&
            Math.abs(a4 - b4) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a4), Math.abs(b4)) &&
            Math.abs(a5 - b5) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a5), Math.abs(b5)) &&
            Math.abs(a6 - b6) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a6), Math.abs(b6)) &&
            Math.abs(a7 - b7) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a7), Math.abs(b7)) &&
            Math.abs(a8 - b8) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a8), Math.abs(b8)));
};


module.exports = mat3;

},{"./common.js":17}],21:[function(require,module,exports){
/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */

var glMatrix = require("./common.js");

/**
 * @class 4x4 Matrix
 * @name mat4
 */
var mat4 = {
  scalar: {},
  SIMD: {},
};

/**
 * Creates a new identity mat4
 *
 * @returns {mat4} a new 4x4 matrix
 */
mat4.create = function() {
    var out = new glMatrix.ARRAY_TYPE(16);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
};

/**
 * Creates a new mat4 initialized with values from an existing matrix
 *
 * @param {mat4} a matrix to clone
 * @returns {mat4} a new 4x4 matrix
 */
mat4.clone = function(a) {
    var out = new glMatrix.ARRAY_TYPE(16);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};

/**
 * Copy the values from one mat4 to another
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};

/**
 * Create a new mat4 with the given values
 *
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m03 Component in column 0, row 3 position (index 3)
 * @param {Number} m10 Component in column 1, row 0 position (index 4)
 * @param {Number} m11 Component in column 1, row 1 position (index 5)
 * @param {Number} m12 Component in column 1, row 2 position (index 6)
 * @param {Number} m13 Component in column 1, row 3 position (index 7)
 * @param {Number} m20 Component in column 2, row 0 position (index 8)
 * @param {Number} m21 Component in column 2, row 1 position (index 9)
 * @param {Number} m22 Component in column 2, row 2 position (index 10)
 * @param {Number} m23 Component in column 2, row 3 position (index 11)
 * @param {Number} m30 Component in column 3, row 0 position (index 12)
 * @param {Number} m31 Component in column 3, row 1 position (index 13)
 * @param {Number} m32 Component in column 3, row 2 position (index 14)
 * @param {Number} m33 Component in column 3, row 3 position (index 15)
 * @returns {mat4} A new mat4
 */
mat4.fromValues = function(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
    var out = new glMatrix.ARRAY_TYPE(16);
    out[0] = m00;
    out[1] = m01;
    out[2] = m02;
    out[3] = m03;
    out[4] = m10;
    out[5] = m11;
    out[6] = m12;
    out[7] = m13;
    out[8] = m20;
    out[9] = m21;
    out[10] = m22;
    out[11] = m23;
    out[12] = m30;
    out[13] = m31;
    out[14] = m32;
    out[15] = m33;
    return out;
};

/**
 * Set the components of a mat4 to the given values
 *
 * @param {mat4} out the receiving matrix
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m03 Component in column 0, row 3 position (index 3)
 * @param {Number} m10 Component in column 1, row 0 position (index 4)
 * @param {Number} m11 Component in column 1, row 1 position (index 5)
 * @param {Number} m12 Component in column 1, row 2 position (index 6)
 * @param {Number} m13 Component in column 1, row 3 position (index 7)
 * @param {Number} m20 Component in column 2, row 0 position (index 8)
 * @param {Number} m21 Component in column 2, row 1 position (index 9)
 * @param {Number} m22 Component in column 2, row 2 position (index 10)
 * @param {Number} m23 Component in column 2, row 3 position (index 11)
 * @param {Number} m30 Component in column 3, row 0 position (index 12)
 * @param {Number} m31 Component in column 3, row 1 position (index 13)
 * @param {Number} m32 Component in column 3, row 2 position (index 14)
 * @param {Number} m33 Component in column 3, row 3 position (index 15)
 * @returns {mat4} out
 */
mat4.set = function(out, m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
    out[0] = m00;
    out[1] = m01;
    out[2] = m02;
    out[3] = m03;
    out[4] = m10;
    out[5] = m11;
    out[6] = m12;
    out[7] = m13;
    out[8] = m20;
    out[9] = m21;
    out[10] = m22;
    out[11] = m23;
    out[12] = m30;
    out[13] = m31;
    out[14] = m32;
    out[15] = m33;
    return out;
};


/**
 * Set a mat4 to the identity matrix
 *
 * @param {mat4} out the receiving matrix
 * @returns {mat4} out
 */
mat4.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
};

/**
 * Transpose the values of a mat4 not using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.scalar.transpose = function(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        var a01 = a[1], a02 = a[2], a03 = a[3],
            a12 = a[6], a13 = a[7],
            a23 = a[11];

        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a01;
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a02;
        out[9] = a12;
        out[11] = a[14];
        out[12] = a03;
        out[13] = a13;
        out[14] = a23;
    } else {
        out[0] = a[0];
        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a[1];
        out[5] = a[5];
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a[2];
        out[9] = a[6];
        out[10] = a[10];
        out[11] = a[14];
        out[12] = a[3];
        out[13] = a[7];
        out[14] = a[11];
        out[15] = a[15];
    }

    return out;
};

/**
 * Transpose the values of a mat4 using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.SIMD.transpose = function(out, a) {
    var a0, a1, a2, a3,
        tmp01, tmp23,
        out0, out1, out2, out3;

    a0 = SIMD.Float32x4.load(a, 0);
    a1 = SIMD.Float32x4.load(a, 4);
    a2 = SIMD.Float32x4.load(a, 8);
    a3 = SIMD.Float32x4.load(a, 12);

    tmp01 = SIMD.Float32x4.shuffle(a0, a1, 0, 1, 4, 5);
    tmp23 = SIMD.Float32x4.shuffle(a2, a3, 0, 1, 4, 5);
    out0  = SIMD.Float32x4.shuffle(tmp01, tmp23, 0, 2, 4, 6);
    out1  = SIMD.Float32x4.shuffle(tmp01, tmp23, 1, 3, 5, 7);
    SIMD.Float32x4.store(out, 0,  out0);
    SIMD.Float32x4.store(out, 4,  out1);

    tmp01 = SIMD.Float32x4.shuffle(a0, a1, 2, 3, 6, 7);
    tmp23 = SIMD.Float32x4.shuffle(a2, a3, 2, 3, 6, 7);
    out2  = SIMD.Float32x4.shuffle(tmp01, tmp23, 0, 2, 4, 6);
    out3  = SIMD.Float32x4.shuffle(tmp01, tmp23, 1, 3, 5, 7);
    SIMD.Float32x4.store(out, 8,  out2);
    SIMD.Float32x4.store(out, 12, out3);

    return out;
};

/**
 * Transpse a mat4 using SIMD if available and enabled
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.transpose = glMatrix.USE_SIMD ? mat4.SIMD.transpose : mat4.scalar.transpose;

/**
 * Inverts a mat4 not using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.scalar.invert = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32,

        // Calculate the determinant
        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) {
        return null;
    }
    det = 1.0 / det;

    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    return out;
};

/**
 * Inverts a mat4 using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.SIMD.invert = function(out, a) {
  var row0, row1, row2, row3,
      tmp1,
      minor0, minor1, minor2, minor3,
      det,
      a0 = SIMD.Float32x4.load(a, 0),
      a1 = SIMD.Float32x4.load(a, 4),
      a2 = SIMD.Float32x4.load(a, 8),
      a3 = SIMD.Float32x4.load(a, 12);

  // Compute matrix adjugate
  tmp1 = SIMD.Float32x4.shuffle(a0, a1, 0, 1, 4, 5);
  row1 = SIMD.Float32x4.shuffle(a2, a3, 0, 1, 4, 5);
  row0 = SIMD.Float32x4.shuffle(tmp1, row1, 0, 2, 4, 6);
  row1 = SIMD.Float32x4.shuffle(row1, tmp1, 1, 3, 5, 7);
  tmp1 = SIMD.Float32x4.shuffle(a0, a1, 2, 3, 6, 7);
  row3 = SIMD.Float32x4.shuffle(a2, a3, 2, 3, 6, 7);
  row2 = SIMD.Float32x4.shuffle(tmp1, row3, 0, 2, 4, 6);
  row3 = SIMD.Float32x4.shuffle(row3, tmp1, 1, 3, 5, 7);

  tmp1   = SIMD.Float32x4.mul(row2, row3);
  tmp1   = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
  minor0 = SIMD.Float32x4.mul(row1, tmp1);
  minor1 = SIMD.Float32x4.mul(row0, tmp1);
  tmp1   = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
  minor0 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row1, tmp1), minor0);
  minor1 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row0, tmp1), minor1);
  minor1 = SIMD.Float32x4.swizzle(minor1, 2, 3, 0, 1);

  tmp1   = SIMD.Float32x4.mul(row1, row2);
  tmp1   = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
  minor0 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row3, tmp1), minor0);
  minor3 = SIMD.Float32x4.mul(row0, tmp1);
  tmp1   = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
  minor0 = SIMD.Float32x4.sub(minor0, SIMD.Float32x4.mul(row3, tmp1));
  minor3 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row0, tmp1), minor3);
  minor3 = SIMD.Float32x4.swizzle(minor3, 2, 3, 0, 1);

  tmp1   = SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(row1, 2, 3, 0, 1), row3);
  tmp1   = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
  row2   = SIMD.Float32x4.swizzle(row2, 2, 3, 0, 1);
  minor0 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row2, tmp1), minor0);
  minor2 = SIMD.Float32x4.mul(row0, tmp1);
  tmp1   = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
  minor0 = SIMD.Float32x4.sub(minor0, SIMD.Float32x4.mul(row2, tmp1));
  minor2 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row0, tmp1), minor2);
  minor2 = SIMD.Float32x4.swizzle(minor2, 2, 3, 0, 1);

  tmp1   = SIMD.Float32x4.mul(row0, row1);
  tmp1   = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
  minor2 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row3, tmp1), minor2);
  minor3 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row2, tmp1), minor3);
  tmp1   = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
  minor2 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row3, tmp1), minor2);
  minor3 = SIMD.Float32x4.sub(minor3, SIMD.Float32x4.mul(row2, tmp1));

  tmp1   = SIMD.Float32x4.mul(row0, row3);
  tmp1   = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
  minor1 = SIMD.Float32x4.sub(minor1, SIMD.Float32x4.mul(row2, tmp1));
  minor2 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row1, tmp1), minor2);
  tmp1   = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
  minor1 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row2, tmp1), minor1);
  minor2 = SIMD.Float32x4.sub(minor2, SIMD.Float32x4.mul(row1, tmp1));

  tmp1   = SIMD.Float32x4.mul(row0, row2);
  tmp1   = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
  minor1 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row3, tmp1), minor1);
  minor3 = SIMD.Float32x4.sub(minor3, SIMD.Float32x4.mul(row1, tmp1));
  tmp1   = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
  minor1 = SIMD.Float32x4.sub(minor1, SIMD.Float32x4.mul(row3, tmp1));
  minor3 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row1, tmp1), minor3);

  // Compute matrix determinant
  det   = SIMD.Float32x4.mul(row0, minor0);
  det   = SIMD.Float32x4.add(SIMD.Float32x4.swizzle(det, 2, 3, 0, 1), det);
  det   = SIMD.Float32x4.add(SIMD.Float32x4.swizzle(det, 1, 0, 3, 2), det);
  tmp1  = SIMD.Float32x4.reciprocalApproximation(det);
  det   = SIMD.Float32x4.sub(
               SIMD.Float32x4.add(tmp1, tmp1),
               SIMD.Float32x4.mul(det, SIMD.Float32x4.mul(tmp1, tmp1)));
  det   = SIMD.Float32x4.swizzle(det, 0, 0, 0, 0);
  if (!det) {
      return null;
  }

  // Compute matrix inverse
  SIMD.Float32x4.store(out, 0,  SIMD.Float32x4.mul(det, minor0));
  SIMD.Float32x4.store(out, 4,  SIMD.Float32x4.mul(det, minor1));
  SIMD.Float32x4.store(out, 8,  SIMD.Float32x4.mul(det, minor2));
  SIMD.Float32x4.store(out, 12, SIMD.Float32x4.mul(det, minor3));
  return out;
}

/**
 * Inverts a mat4 using SIMD if available and enabled
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.invert = glMatrix.USE_SIMD ? mat4.SIMD.invert : mat4.scalar.invert;

/**
 * Calculates the adjugate of a mat4 not using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.scalar.adjoint = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    out[0]  =  (a11 * (a22 * a33 - a23 * a32) - a21 * (a12 * a33 - a13 * a32) + a31 * (a12 * a23 - a13 * a22));
    out[1]  = -(a01 * (a22 * a33 - a23 * a32) - a21 * (a02 * a33 - a03 * a32) + a31 * (a02 * a23 - a03 * a22));
    out[2]  =  (a01 * (a12 * a33 - a13 * a32) - a11 * (a02 * a33 - a03 * a32) + a31 * (a02 * a13 - a03 * a12));
    out[3]  = -(a01 * (a12 * a23 - a13 * a22) - a11 * (a02 * a23 - a03 * a22) + a21 * (a02 * a13 - a03 * a12));
    out[4]  = -(a10 * (a22 * a33 - a23 * a32) - a20 * (a12 * a33 - a13 * a32) + a30 * (a12 * a23 - a13 * a22));
    out[5]  =  (a00 * (a22 * a33 - a23 * a32) - a20 * (a02 * a33 - a03 * a32) + a30 * (a02 * a23 - a03 * a22));
    out[6]  = -(a00 * (a12 * a33 - a13 * a32) - a10 * (a02 * a33 - a03 * a32) + a30 * (a02 * a13 - a03 * a12));
    out[7]  =  (a00 * (a12 * a23 - a13 * a22) - a10 * (a02 * a23 - a03 * a22) + a20 * (a02 * a13 - a03 * a12));
    out[8]  =  (a10 * (a21 * a33 - a23 * a31) - a20 * (a11 * a33 - a13 * a31) + a30 * (a11 * a23 - a13 * a21));
    out[9]  = -(a00 * (a21 * a33 - a23 * a31) - a20 * (a01 * a33 - a03 * a31) + a30 * (a01 * a23 - a03 * a21));
    out[10] =  (a00 * (a11 * a33 - a13 * a31) - a10 * (a01 * a33 - a03 * a31) + a30 * (a01 * a13 - a03 * a11));
    out[11] = -(a00 * (a11 * a23 - a13 * a21) - a10 * (a01 * a23 - a03 * a21) + a20 * (a01 * a13 - a03 * a11));
    out[12] = -(a10 * (a21 * a32 - a22 * a31) - a20 * (a11 * a32 - a12 * a31) + a30 * (a11 * a22 - a12 * a21));
    out[13] =  (a00 * (a21 * a32 - a22 * a31) - a20 * (a01 * a32 - a02 * a31) + a30 * (a01 * a22 - a02 * a21));
    out[14] = -(a00 * (a11 * a32 - a12 * a31) - a10 * (a01 * a32 - a02 * a31) + a30 * (a01 * a12 - a02 * a11));
    out[15] =  (a00 * (a11 * a22 - a12 * a21) - a10 * (a01 * a22 - a02 * a21) + a20 * (a01 * a12 - a02 * a11));
    return out;
};

/**
 * Calculates the adjugate of a mat4 using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.SIMD.adjoint = function(out, a) {
  var a0, a1, a2, a3;
  var row0, row1, row2, row3;
  var tmp1;
  var minor0, minor1, minor2, minor3;

  var a0 = SIMD.Float32x4.load(a, 0);
  var a1 = SIMD.Float32x4.load(a, 4);
  var a2 = SIMD.Float32x4.load(a, 8);
  var a3 = SIMD.Float32x4.load(a, 12);

  // Transpose the source matrix.  Sort of.  Not a true transpose operation
  tmp1 = SIMD.Float32x4.shuffle(a0, a1, 0, 1, 4, 5);
  row1 = SIMD.Float32x4.shuffle(a2, a3, 0, 1, 4, 5);
  row0 = SIMD.Float32x4.shuffle(tmp1, row1, 0, 2, 4, 6);
  row1 = SIMD.Float32x4.shuffle(row1, tmp1, 1, 3, 5, 7);

  tmp1 = SIMD.Float32x4.shuffle(a0, a1, 2, 3, 6, 7);
  row3 = SIMD.Float32x4.shuffle(a2, a3, 2, 3, 6, 7);
  row2 = SIMD.Float32x4.shuffle(tmp1, row3, 0, 2, 4, 6);
  row3 = SIMD.Float32x4.shuffle(row3, tmp1, 1, 3, 5, 7);

  tmp1   = SIMD.Float32x4.mul(row2, row3);
  tmp1   = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
  minor0 = SIMD.Float32x4.mul(row1, tmp1);
  minor1 = SIMD.Float32x4.mul(row0, tmp1);
  tmp1   = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
  minor0 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row1, tmp1), minor0);
  minor1 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row0, tmp1), minor1);
  minor1 = SIMD.Float32x4.swizzle(minor1, 2, 3, 0, 1);

  tmp1   = SIMD.Float32x4.mul(row1, row2);
  tmp1   = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
  minor0 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row3, tmp1), minor0);
  minor3 = SIMD.Float32x4.mul(row0, tmp1);
  tmp1   = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
  minor0 = SIMD.Float32x4.sub(minor0, SIMD.Float32x4.mul(row3, tmp1));
  minor3 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row0, tmp1), minor3);
  minor3 = SIMD.Float32x4.swizzle(minor3, 2, 3, 0, 1);

  tmp1   = SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(row1, 2, 3, 0, 1), row3);
  tmp1   = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
  row2   = SIMD.Float32x4.swizzle(row2, 2, 3, 0, 1);
  minor0 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row2, tmp1), minor0);
  minor2 = SIMD.Float32x4.mul(row0, tmp1);
  tmp1   = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
  minor0 = SIMD.Float32x4.sub(minor0, SIMD.Float32x4.mul(row2, tmp1));
  minor2 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row0, tmp1), minor2);
  minor2 = SIMD.Float32x4.swizzle(minor2, 2, 3, 0, 1);

  tmp1   = SIMD.Float32x4.mul(row0, row1);
  tmp1   = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
  minor2 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row3, tmp1), minor2);
  minor3 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row2, tmp1), minor3);
  tmp1   = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
  minor2 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row3, tmp1), minor2);
  minor3 = SIMD.Float32x4.sub(minor3, SIMD.Float32x4.mul(row2, tmp1));

  tmp1   = SIMD.Float32x4.mul(row0, row3);
  tmp1   = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
  minor1 = SIMD.Float32x4.sub(minor1, SIMD.Float32x4.mul(row2, tmp1));
  minor2 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row1, tmp1), minor2);
  tmp1   = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
  minor1 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row2, tmp1), minor1);
  minor2 = SIMD.Float32x4.sub(minor2, SIMD.Float32x4.mul(row1, tmp1));

  tmp1   = SIMD.Float32x4.mul(row0, row2);
  tmp1   = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
  minor1 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row3, tmp1), minor1);
  minor3 = SIMD.Float32x4.sub(minor3, SIMD.Float32x4.mul(row1, tmp1));
  tmp1   = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
  minor1 = SIMD.Float32x4.sub(minor1, SIMD.Float32x4.mul(row3, tmp1));
  minor3 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row1, tmp1), minor3);

  SIMD.Float32x4.store(out, 0,  minor0);
  SIMD.Float32x4.store(out, 4,  minor1);
  SIMD.Float32x4.store(out, 8,  minor2);
  SIMD.Float32x4.store(out, 12, minor3);
  return out;
};

/**
 * Calculates the adjugate of a mat4 using SIMD if available and enabled
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
 mat4.adjoint = glMatrix.USE_SIMD ? mat4.SIMD.adjoint : mat4.scalar.adjoint;

/**
 * Calculates the determinant of a mat4
 *
 * @param {mat4} a the source matrix
 * @returns {Number} determinant of a
 */
mat4.determinant = function (a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32;

    // Calculate the determinant
    return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
};

/**
 * Multiplies two mat4's explicitly using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand, must be a Float32Array
 * @param {mat4} b the second operand, must be a Float32Array
 * @returns {mat4} out
 */
mat4.SIMD.multiply = function (out, a, b) {
    var a0 = SIMD.Float32x4.load(a, 0);
    var a1 = SIMD.Float32x4.load(a, 4);
    var a2 = SIMD.Float32x4.load(a, 8);
    var a3 = SIMD.Float32x4.load(a, 12);

    var b0 = SIMD.Float32x4.load(b, 0);
    var out0 = SIMD.Float32x4.add(
                   SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b0, 0, 0, 0, 0), a0),
                   SIMD.Float32x4.add(
                       SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b0, 1, 1, 1, 1), a1),
                       SIMD.Float32x4.add(
                           SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b0, 2, 2, 2, 2), a2),
                           SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b0, 3, 3, 3, 3), a3))));
    SIMD.Float32x4.store(out, 0, out0);

    var b1 = SIMD.Float32x4.load(b, 4);
    var out1 = SIMD.Float32x4.add(
                   SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b1, 0, 0, 0, 0), a0),
                   SIMD.Float32x4.add(
                       SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b1, 1, 1, 1, 1), a1),
                       SIMD.Float32x4.add(
                           SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b1, 2, 2, 2, 2), a2),
                           SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b1, 3, 3, 3, 3), a3))));
    SIMD.Float32x4.store(out, 4, out1);

    var b2 = SIMD.Float32x4.load(b, 8);
    var out2 = SIMD.Float32x4.add(
                   SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b2, 0, 0, 0, 0), a0),
                   SIMD.Float32x4.add(
                       SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b2, 1, 1, 1, 1), a1),
                       SIMD.Float32x4.add(
                               SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b2, 2, 2, 2, 2), a2),
                               SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b2, 3, 3, 3, 3), a3))));
    SIMD.Float32x4.store(out, 8, out2);

    var b3 = SIMD.Float32x4.load(b, 12);
    var out3 = SIMD.Float32x4.add(
                   SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b3, 0, 0, 0, 0), a0),
                   SIMD.Float32x4.add(
                        SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b3, 1, 1, 1, 1), a1),
                        SIMD.Float32x4.add(
                            SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b3, 2, 2, 2, 2), a2),
                            SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b3, 3, 3, 3, 3), a3))));
    SIMD.Float32x4.store(out, 12, out3);

    return out;
};

/**
 * Multiplies two mat4's explicitly not using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */
mat4.scalar.multiply = function (out, a, b) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    // Cache only the current line of the second matrix
    var b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
    out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
    out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
    out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
    out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
    return out;
};

/**
 * Multiplies two mat4's using SIMD if available and enabled
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */
mat4.multiply = glMatrix.USE_SIMD ? mat4.SIMD.multiply : mat4.scalar.multiply;

/**
 * Alias for {@link mat4.multiply}
 * @function
 */
mat4.mul = mat4.multiply;

/**
 * Translate a mat4 by the given vector not using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to translate
 * @param {vec3} v vector to translate by
 * @returns {mat4} out
 */
mat4.scalar.translate = function (out, a, v) {
    var x = v[0], y = v[1], z = v[2],
        a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23;

    if (a === out) {
        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    } else {
        a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
        a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
        a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

        out[0] = a00; out[1] = a01; out[2] = a02; out[3] = a03;
        out[4] = a10; out[5] = a11; out[6] = a12; out[7] = a13;
        out[8] = a20; out[9] = a21; out[10] = a22; out[11] = a23;

        out[12] = a00 * x + a10 * y + a20 * z + a[12];
        out[13] = a01 * x + a11 * y + a21 * z + a[13];
        out[14] = a02 * x + a12 * y + a22 * z + a[14];
        out[15] = a03 * x + a13 * y + a23 * z + a[15];
    }

    return out;
};

/**
 * Translates a mat4 by the given vector using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to translate
 * @param {vec3} v vector to translate by
 * @returns {mat4} out
 */
mat4.SIMD.translate = function (out, a, v) {
    var a0 = SIMD.Float32x4.load(a, 0),
        a1 = SIMD.Float32x4.load(a, 4),
        a2 = SIMD.Float32x4.load(a, 8),
        a3 = SIMD.Float32x4.load(a, 12),
        vec = SIMD.Float32x4(v[0], v[1], v[2] , 0);

    if (a !== out) {
        out[0] = a[0]; out[1] = a[1]; out[2] = a[2]; out[3] = a[3];
        out[4] = a[4]; out[5] = a[5]; out[6] = a[6]; out[7] = a[7];
        out[8] = a[8]; out[9] = a[9]; out[10] = a[10]; out[11] = a[11];
    }

    a0 = SIMD.Float32x4.mul(a0, SIMD.Float32x4.swizzle(vec, 0, 0, 0, 0));
    a1 = SIMD.Float32x4.mul(a1, SIMD.Float32x4.swizzle(vec, 1, 1, 1, 1));
    a2 = SIMD.Float32x4.mul(a2, SIMD.Float32x4.swizzle(vec, 2, 2, 2, 2));

    var t0 = SIMD.Float32x4.add(a0, SIMD.Float32x4.add(a1, SIMD.Float32x4.add(a2, a3)));
    SIMD.Float32x4.store(out, 12, t0);

    return out;
};

/**
 * Translates a mat4 by the given vector using SIMD if available and enabled
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to translate
 * @param {vec3} v vector to translate by
 * @returns {mat4} out
 */
mat4.translate = glMatrix.USE_SIMD ? mat4.SIMD.translate : mat4.scalar.translate;

/**
 * Scales the mat4 by the dimensions in the given vec3 not using vectorization
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to scale
 * @param {vec3} v the vec3 to scale the matrix by
 * @returns {mat4} out
 **/
mat4.scalar.scale = function(out, a, v) {
    var x = v[0], y = v[1], z = v[2];

    out[0] = a[0] * x;
    out[1] = a[1] * x;
    out[2] = a[2] * x;
    out[3] = a[3] * x;
    out[4] = a[4] * y;
    out[5] = a[5] * y;
    out[6] = a[6] * y;
    out[7] = a[7] * y;
    out[8] = a[8] * z;
    out[9] = a[9] * z;
    out[10] = a[10] * z;
    out[11] = a[11] * z;
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};

/**
 * Scales the mat4 by the dimensions in the given vec3 using vectorization
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to scale
 * @param {vec3} v the vec3 to scale the matrix by
 * @returns {mat4} out
 **/
mat4.SIMD.scale = function(out, a, v) {
    var a0, a1, a2;
    var vec = SIMD.Float32x4(v[0], v[1], v[2], 0);

    a0 = SIMD.Float32x4.load(a, 0);
    SIMD.Float32x4.store(
        out, 0, SIMD.Float32x4.mul(a0, SIMD.Float32x4.swizzle(vec, 0, 0, 0, 0)));

    a1 = SIMD.Float32x4.load(a, 4);
    SIMD.Float32x4.store(
        out, 4, SIMD.Float32x4.mul(a1, SIMD.Float32x4.swizzle(vec, 1, 1, 1, 1)));

    a2 = SIMD.Float32x4.load(a, 8);
    SIMD.Float32x4.store(
        out, 8, SIMD.Float32x4.mul(a2, SIMD.Float32x4.swizzle(vec, 2, 2, 2, 2)));

    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};

/**
 * Scales the mat4 by the dimensions in the given vec3 using SIMD if available and enabled
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to scale
 * @param {vec3} v the vec3 to scale the matrix by
 * @returns {mat4} out
 */
mat4.scale = glMatrix.USE_SIMD ? mat4.SIMD.scale : mat4.scalar.scale;

/**
 * Rotates a mat4 by the given angle around the given axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @param {vec3} axis the axis to rotate around
 * @returns {mat4} out
 */
mat4.rotate = function (out, a, rad, axis) {
    var x = axis[0], y = axis[1], z = axis[2],
        len = Math.sqrt(x * x + y * y + z * z),
        s, c, t,
        a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23,
        b00, b01, b02,
        b10, b11, b12,
        b20, b21, b22;

    if (Math.abs(len) < glMatrix.EPSILON) { return null; }

    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;

    s = Math.sin(rad);
    c = Math.cos(rad);
    t = 1 - c;

    a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
    a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
    a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

    // Construct the elements of the rotation matrix
    b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
    b10 = x * y * t - z * s; b11 = y * y * t + c; b12 = z * y * t + x * s;
    b20 = x * z * t + y * s; b21 = y * z * t - x * s; b22 = z * z * t + c;

    // Perform rotation-specific matrix multiplication
    out[0] = a00 * b00 + a10 * b01 + a20 * b02;
    out[1] = a01 * b00 + a11 * b01 + a21 * b02;
    out[2] = a02 * b00 + a12 * b01 + a22 * b02;
    out[3] = a03 * b00 + a13 * b01 + a23 * b02;
    out[4] = a00 * b10 + a10 * b11 + a20 * b12;
    out[5] = a01 * b10 + a11 * b11 + a21 * b12;
    out[6] = a02 * b10 + a12 * b11 + a22 * b12;
    out[7] = a03 * b10 + a13 * b11 + a23 * b12;
    out[8] = a00 * b20 + a10 * b21 + a20 * b22;
    out[9] = a01 * b20 + a11 * b21 + a21 * b22;
    out[10] = a02 * b20 + a12 * b21 + a22 * b22;
    out[11] = a03 * b20 + a13 * b21 + a23 * b22;

    if (a !== out) { // If the source and destination differ, copy the unchanged last row
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }
    return out;
};

/**
 * Rotates a matrix by the given angle around the X axis not using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.scalar.rotateX = function (out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];

    if (a !== out) { // If the source and destination differ, copy the unchanged rows
        out[0]  = a[0];
        out[1]  = a[1];
        out[2]  = a[2];
        out[3]  = a[3];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[4] = a10 * c + a20 * s;
    out[5] = a11 * c + a21 * s;
    out[6] = a12 * c + a22 * s;
    out[7] = a13 * c + a23 * s;
    out[8] = a20 * c - a10 * s;
    out[9] = a21 * c - a11 * s;
    out[10] = a22 * c - a12 * s;
    out[11] = a23 * c - a13 * s;
    return out;
};

/**
 * Rotates a matrix by the given angle around the X axis using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.SIMD.rotateX = function (out, a, rad) {
    var s = SIMD.Float32x4.splat(Math.sin(rad)),
        c = SIMD.Float32x4.splat(Math.cos(rad));

    if (a !== out) { // If the source and destination differ, copy the unchanged rows
      out[0]  = a[0];
      out[1]  = a[1];
      out[2]  = a[2];
      out[3]  = a[3];
      out[12] = a[12];
      out[13] = a[13];
      out[14] = a[14];
      out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    var a_1 = SIMD.Float32x4.load(a, 4);
    var a_2 = SIMD.Float32x4.load(a, 8);
    SIMD.Float32x4.store(out, 4,
                         SIMD.Float32x4.add(SIMD.Float32x4.mul(a_1, c), SIMD.Float32x4.mul(a_2, s)));
    SIMD.Float32x4.store(out, 8,
                         SIMD.Float32x4.sub(SIMD.Float32x4.mul(a_2, c), SIMD.Float32x4.mul(a_1, s)));
    return out;
};

/**
 * Rotates a matrix by the given angle around the X axis using SIMD if availabe and enabled
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.rotateX = glMatrix.USE_SIMD ? mat4.SIMD.rotateX : mat4.scalar.rotateX;

/**
 * Rotates a matrix by the given angle around the Y axis not using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.scalar.rotateY = function (out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];

    if (a !== out) { // If the source and destination differ, copy the unchanged rows
        out[4]  = a[4];
        out[5]  = a[5];
        out[6]  = a[6];
        out[7]  = a[7];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[0] = a00 * c - a20 * s;
    out[1] = a01 * c - a21 * s;
    out[2] = a02 * c - a22 * s;
    out[3] = a03 * c - a23 * s;
    out[8] = a00 * s + a20 * c;
    out[9] = a01 * s + a21 * c;
    out[10] = a02 * s + a22 * c;
    out[11] = a03 * s + a23 * c;
    return out;
};

/**
 * Rotates a matrix by the given angle around the Y axis using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.SIMD.rotateY = function (out, a, rad) {
    var s = SIMD.Float32x4.splat(Math.sin(rad)),
        c = SIMD.Float32x4.splat(Math.cos(rad));

    if (a !== out) { // If the source and destination differ, copy the unchanged rows
        out[4]  = a[4];
        out[5]  = a[5];
        out[6]  = a[6];
        out[7]  = a[7];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    var a_0 = SIMD.Float32x4.load(a, 0);
    var a_2 = SIMD.Float32x4.load(a, 8);
    SIMD.Float32x4.store(out, 0,
                         SIMD.Float32x4.sub(SIMD.Float32x4.mul(a_0, c), SIMD.Float32x4.mul(a_2, s)));
    SIMD.Float32x4.store(out, 8,
                         SIMD.Float32x4.add(SIMD.Float32x4.mul(a_0, s), SIMD.Float32x4.mul(a_2, c)));
    return out;
};

/**
 * Rotates a matrix by the given angle around the Y axis if SIMD available and enabled
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
 mat4.rotateY = glMatrix.USE_SIMD ? mat4.SIMD.rotateY : mat4.scalar.rotateY;

/**
 * Rotates a matrix by the given angle around the Z axis not using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.scalar.rotateZ = function (out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7];

    if (a !== out) { // If the source and destination differ, copy the unchanged last row
        out[8]  = a[8];
        out[9]  = a[9];
        out[10] = a[10];
        out[11] = a[11];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[0] = a00 * c + a10 * s;
    out[1] = a01 * c + a11 * s;
    out[2] = a02 * c + a12 * s;
    out[3] = a03 * c + a13 * s;
    out[4] = a10 * c - a00 * s;
    out[5] = a11 * c - a01 * s;
    out[6] = a12 * c - a02 * s;
    out[7] = a13 * c - a03 * s;
    return out;
};

/**
 * Rotates a matrix by the given angle around the Z axis using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.SIMD.rotateZ = function (out, a, rad) {
    var s = SIMD.Float32x4.splat(Math.sin(rad)),
        c = SIMD.Float32x4.splat(Math.cos(rad));

    if (a !== out) { // If the source and destination differ, copy the unchanged last row
        out[8]  = a[8];
        out[9]  = a[9];
        out[10] = a[10];
        out[11] = a[11];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    var a_0 = SIMD.Float32x4.load(a, 0);
    var a_1 = SIMD.Float32x4.load(a, 4);
    SIMD.Float32x4.store(out, 0,
                         SIMD.Float32x4.add(SIMD.Float32x4.mul(a_0, c), SIMD.Float32x4.mul(a_1, s)));
    SIMD.Float32x4.store(out, 4,
                         SIMD.Float32x4.sub(SIMD.Float32x4.mul(a_1, c), SIMD.Float32x4.mul(a_0, s)));
    return out;
};

/**
 * Rotates a matrix by the given angle around the Z axis if SIMD available and enabled
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
 mat4.rotateZ = glMatrix.USE_SIMD ? mat4.SIMD.rotateZ : mat4.scalar.rotateZ;

/**
 * Creates a matrix from a vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, dest, vec);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {vec3} v Translation vector
 * @returns {mat4} out
 */
mat4.fromTranslation = function(out, v) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = v[0];
    out[13] = v[1];
    out[14] = v[2];
    out[15] = 1;
    return out;
}

/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.scale(dest, dest, vec);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {vec3} v Scaling vector
 * @returns {mat4} out
 */
mat4.fromScaling = function(out, v) {
    out[0] = v[0];
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = v[1];
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = v[2];
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
}

/**
 * Creates a matrix from a given angle around a given axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotate(dest, dest, rad, axis);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @param {vec3} axis the axis to rotate around
 * @returns {mat4} out
 */
mat4.fromRotation = function(out, rad, axis) {
    var x = axis[0], y = axis[1], z = axis[2],
        len = Math.sqrt(x * x + y * y + z * z),
        s, c, t;

    if (Math.abs(len) < glMatrix.EPSILON) { return null; }

    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;

    s = Math.sin(rad);
    c = Math.cos(rad);
    t = 1 - c;

    // Perform rotation-specific matrix multiplication
    out[0] = x * x * t + c;
    out[1] = y * x * t + z * s;
    out[2] = z * x * t - y * s;
    out[3] = 0;
    out[4] = x * y * t - z * s;
    out[5] = y * y * t + c;
    out[6] = z * y * t + x * s;
    out[7] = 0;
    out[8] = x * z * t + y * s;
    out[9] = y * z * t - x * s;
    out[10] = z * z * t + c;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
}

/**
 * Creates a matrix from the given angle around the X axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateX(dest, dest, rad);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.fromXRotation = function(out, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad);

    // Perform axis-specific matrix multiplication
    out[0]  = 1;
    out[1]  = 0;
    out[2]  = 0;
    out[3]  = 0;
    out[4] = 0;
    out[5] = c;
    out[6] = s;
    out[7] = 0;
    out[8] = 0;
    out[9] = -s;
    out[10] = c;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
}

/**
 * Creates a matrix from the given angle around the Y axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateY(dest, dest, rad);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.fromYRotation = function(out, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad);

    // Perform axis-specific matrix multiplication
    out[0]  = c;
    out[1]  = 0;
    out[2]  = -s;
    out[3]  = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = s;
    out[9] = 0;
    out[10] = c;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
}

/**
 * Creates a matrix from the given angle around the Z axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateZ(dest, dest, rad);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.fromZRotation = function(out, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad);

    // Perform axis-specific matrix multiplication
    out[0]  = c;
    out[1]  = s;
    out[2]  = 0;
    out[3]  = 0;
    out[4] = -s;
    out[5] = c;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
}

/**
 * Creates a matrix from a quaternion rotation and vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     var quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {vec3} v Translation vector
 * @returns {mat4} out
 */
mat4.fromRotationTranslation = function (out, q, v) {
    // Quaternion math
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - (yy + zz);
    out[1] = xy + wz;
    out[2] = xz - wy;
    out[3] = 0;
    out[4] = xy - wz;
    out[5] = 1 - (xx + zz);
    out[6] = yz + wx;
    out[7] = 0;
    out[8] = xz + wy;
    out[9] = yz - wx;
    out[10] = 1 - (xx + yy);
    out[11] = 0;
    out[12] = v[0];
    out[13] = v[1];
    out[14] = v[2];
    out[15] = 1;

    return out;
};

/**
 * Returns the translation vector component of a transformation
 *  matrix. If a matrix is built with fromRotationTranslation,
 *  the returned vector will be the same as the translation vector
 *  originally supplied.
 * @param  {vec3} out Vector to receive translation component
 * @param  {mat4} mat Matrix to be decomposed (input)
 * @return {vec3} out
 */
mat4.getTranslation = function (out, mat) {
  out[0] = mat[12];
  out[1] = mat[13];
  out[2] = mat[14];

  return out;
};

/**
 * Returns a quaternion representing the rotational component
 *  of a transformation matrix. If a matrix is built with
 *  fromRotationTranslation, the returned quaternion will be the
 *  same as the quaternion originally supplied.
 * @param {quat} out Quaternion to receive the rotation component
 * @param {mat4} mat Matrix to be decomposed (input)
 * @return {quat} out
 */
mat4.getRotation = function (out, mat) {
  // Algorithm taken from http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm
  var trace = mat[0] + mat[5] + mat[10];
  var S = 0;

  if (trace > 0) { 
    S = Math.sqrt(trace + 1.0) * 2;
    out[3] = 0.25 * S;
    out[0] = (mat[6] - mat[9]) / S;
    out[1] = (mat[8] - mat[2]) / S; 
    out[2] = (mat[1] - mat[4]) / S; 
  } else if ((mat[0] > mat[5])&(mat[0] > mat[10])) { 
    S = Math.sqrt(1.0 + mat[0] - mat[5] - mat[10]) * 2;
    out[3] = (mat[6] - mat[9]) / S;
    out[0] = 0.25 * S;
    out[1] = (mat[1] + mat[4]) / S; 
    out[2] = (mat[8] + mat[2]) / S; 
  } else if (mat[5] > mat[10]) { 
    S = Math.sqrt(1.0 + mat[5] - mat[0] - mat[10]) * 2;
    out[3] = (mat[8] - mat[2]) / S;
    out[0] = (mat[1] + mat[4]) / S; 
    out[1] = 0.25 * S;
    out[2] = (mat[6] + mat[9]) / S; 
  } else { 
    S = Math.sqrt(1.0 + mat[10] - mat[0] - mat[5]) * 2;
    out[3] = (mat[1] - mat[4]) / S;
    out[0] = (mat[8] + mat[2]) / S;
    out[1] = (mat[6] + mat[9]) / S;
    out[2] = 0.25 * S;
  }

  return out;
};

/**
 * Creates a matrix from a quaternion rotation, vector translation and vector scale
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     var quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *     mat4.scale(dest, scale)
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {vec3} v Translation vector
 * @param {vec3} s Scaling vector
 * @returns {mat4} out
 */
mat4.fromRotationTranslationScale = function (out, q, v, s) {
    // Quaternion math
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2,
        sx = s[0],
        sy = s[1],
        sz = s[2];

    out[0] = (1 - (yy + zz)) * sx;
    out[1] = (xy + wz) * sx;
    out[2] = (xz - wy) * sx;
    out[3] = 0;
    out[4] = (xy - wz) * sy;
    out[5] = (1 - (xx + zz)) * sy;
    out[6] = (yz + wx) * sy;
    out[7] = 0;
    out[8] = (xz + wy) * sz;
    out[9] = (yz - wx) * sz;
    out[10] = (1 - (xx + yy)) * sz;
    out[11] = 0;
    out[12] = v[0];
    out[13] = v[1];
    out[14] = v[2];
    out[15] = 1;

    return out;
};

/**
 * Creates a matrix from a quaternion rotation, vector translation and vector scale, rotating and scaling around the given origin
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     mat4.translate(dest, origin);
 *     var quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *     mat4.scale(dest, scale)
 *     mat4.translate(dest, negativeOrigin);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {vec3} v Translation vector
 * @param {vec3} s Scaling vector
 * @param {vec3} o The origin vector around which to scale and rotate
 * @returns {mat4} out
 */
mat4.fromRotationTranslationScaleOrigin = function (out, q, v, s, o) {
  // Quaternion math
  var x = q[0], y = q[1], z = q[2], w = q[3],
      x2 = x + x,
      y2 = y + y,
      z2 = z + z,

      xx = x * x2,
      xy = x * y2,
      xz = x * z2,
      yy = y * y2,
      yz = y * z2,
      zz = z * z2,
      wx = w * x2,
      wy = w * y2,
      wz = w * z2,

      sx = s[0],
      sy = s[1],
      sz = s[2],

      ox = o[0],
      oy = o[1],
      oz = o[2];

  out[0] = (1 - (yy + zz)) * sx;
  out[1] = (xy + wz) * sx;
  out[2] = (xz - wy) * sx;
  out[3] = 0;
  out[4] = (xy - wz) * sy;
  out[5] = (1 - (xx + zz)) * sy;
  out[6] = (yz + wx) * sy;
  out[7] = 0;
  out[8] = (xz + wy) * sz;
  out[9] = (yz - wx) * sz;
  out[10] = (1 - (xx + yy)) * sz;
  out[11] = 0;
  out[12] = v[0] + ox - (out[0] * ox + out[4] * oy + out[8] * oz);
  out[13] = v[1] + oy - (out[1] * ox + out[5] * oy + out[9] * oz);
  out[14] = v[2] + oz - (out[2] * ox + out[6] * oy + out[10] * oz);
  out[15] = 1;

  return out;
};

/**
 * Calculates a 4x4 matrix from the given quaternion
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat} q Quaternion to create matrix from
 *
 * @returns {mat4} out
 */
mat4.fromQuat = function (out, q) {
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        yx = y * x2,
        yy = y * y2,
        zx = z * x2,
        zy = z * y2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - yy - zz;
    out[1] = yx + wz;
    out[2] = zx - wy;
    out[3] = 0;

    out[4] = yx - wz;
    out[5] = 1 - xx - zz;
    out[6] = zy + wx;
    out[7] = 0;

    out[8] = zx + wy;
    out[9] = zy - wx;
    out[10] = 1 - xx - yy;
    out[11] = 0;

    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;

    return out;
};

/**
 * Generates a frustum matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {Number} left Left bound of the frustum
 * @param {Number} right Right bound of the frustum
 * @param {Number} bottom Bottom bound of the frustum
 * @param {Number} top Top bound of the frustum
 * @param {Number} near Near bound of the frustum
 * @param {Number} far Far bound of the frustum
 * @returns {mat4} out
 */
mat4.frustum = function (out, left, right, bottom, top, near, far) {
    var rl = 1 / (right - left),
        tb = 1 / (top - bottom),
        nf = 1 / (near - far);
    out[0] = (near * 2) * rl;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = (near * 2) * tb;
    out[6] = 0;
    out[7] = 0;
    out[8] = (right + left) * rl;
    out[9] = (top + bottom) * tb;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = (far * near * 2) * nf;
    out[15] = 0;
    return out;
};

/**
 * Generates a perspective projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} fovy Vertical field of view in radians
 * @param {number} aspect Aspect ratio. typically viewport width/height
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
mat4.perspective = function (out, fovy, aspect, near, far) {
    var f = 1.0 / Math.tan(fovy / 2),
        nf = 1 / (near - far);
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = (2 * far * near) * nf;
    out[15] = 0;
    return out;
};

/**
 * Generates a perspective projection matrix with the given field of view.
 * This is primarily useful for generating projection matrices to be used
 * with the still experiemental WebVR API.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {Object} fov Object containing the following values: upDegrees, downDegrees, leftDegrees, rightDegrees
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
mat4.perspectiveFromFieldOfView = function (out, fov, near, far) {
    var upTan = Math.tan(fov.upDegrees * Math.PI/180.0),
        downTan = Math.tan(fov.downDegrees * Math.PI/180.0),
        leftTan = Math.tan(fov.leftDegrees * Math.PI/180.0),
        rightTan = Math.tan(fov.rightDegrees * Math.PI/180.0),
        xScale = 2.0 / (leftTan + rightTan),
        yScale = 2.0 / (upTan + downTan);

    out[0] = xScale;
    out[1] = 0.0;
    out[2] = 0.0;
    out[3] = 0.0;
    out[4] = 0.0;
    out[5] = yScale;
    out[6] = 0.0;
    out[7] = 0.0;
    out[8] = -((leftTan - rightTan) * xScale * 0.5);
    out[9] = ((upTan - downTan) * yScale * 0.5);
    out[10] = far / (near - far);
    out[11] = -1.0;
    out[12] = 0.0;
    out[13] = 0.0;
    out[14] = (far * near) / (near - far);
    out[15] = 0.0;
    return out;
}

/**
 * Generates a orthogonal projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} left Left bound of the frustum
 * @param {number} right Right bound of the frustum
 * @param {number} bottom Bottom bound of the frustum
 * @param {number} top Top bound of the frustum
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
mat4.ortho = function (out, left, right, bottom, top, near, far) {
    var lr = 1 / (left - right),
        bt = 1 / (bottom - top),
        nf = 1 / (near - far);
    out[0] = -2 * lr;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = -2 * bt;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 2 * nf;
    out[11] = 0;
    out[12] = (left + right) * lr;
    out[13] = (top + bottom) * bt;
    out[14] = (far + near) * nf;
    out[15] = 1;
    return out;
};

/**
 * Generates a look-at matrix with the given eye position, focal point, and up axis
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {vec3} eye Position of the viewer
 * @param {vec3} center Point the viewer is looking at
 * @param {vec3} up vec3 pointing up
 * @returns {mat4} out
 */
mat4.lookAt = function (out, eye, center, up) {
    var x0, x1, x2, y0, y1, y2, z0, z1, z2, len,
        eyex = eye[0],
        eyey = eye[1],
        eyez = eye[2],
        upx = up[0],
        upy = up[1],
        upz = up[2],
        centerx = center[0],
        centery = center[1],
        centerz = center[2];

    if (Math.abs(eyex - centerx) < glMatrix.EPSILON &&
        Math.abs(eyey - centery) < glMatrix.EPSILON &&
        Math.abs(eyez - centerz) < glMatrix.EPSILON) {
        return mat4.identity(out);
    }

    z0 = eyex - centerx;
    z1 = eyey - centery;
    z2 = eyez - centerz;

    len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= len;
    z1 *= len;
    z2 *= len;

    x0 = upy * z2 - upz * z1;
    x1 = upz * z0 - upx * z2;
    x2 = upx * z1 - upy * z0;
    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if (!len) {
        x0 = 0;
        x1 = 0;
        x2 = 0;
    } else {
        len = 1 / len;
        x0 *= len;
        x1 *= len;
        x2 *= len;
    }

    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;

    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
    if (!len) {
        y0 = 0;
        y1 = 0;
        y2 = 0;
    } else {
        len = 1 / len;
        y0 *= len;
        y1 *= len;
        y2 *= len;
    }

    out[0] = x0;
    out[1] = y0;
    out[2] = z0;
    out[3] = 0;
    out[4] = x1;
    out[5] = y1;
    out[6] = z1;
    out[7] = 0;
    out[8] = x2;
    out[9] = y2;
    out[10] = z2;
    out[11] = 0;
    out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
    out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
    out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
    out[15] = 1;

    return out;
};

/**
 * Returns a string representation of a mat4
 *
 * @param {mat4} mat matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat4.str = function (a) {
    return 'mat4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ', ' +
                    a[4] + ', ' + a[5] + ', ' + a[6] + ', ' + a[7] + ', ' +
                    a[8] + ', ' + a[9] + ', ' + a[10] + ', ' + a[11] + ', ' +
                    a[12] + ', ' + a[13] + ', ' + a[14] + ', ' + a[15] + ')';
};

/**
 * Returns Frobenius norm of a mat4
 *
 * @param {mat4} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */
mat4.frob = function (a) {
    return(Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) + Math.pow(a[4], 2) + Math.pow(a[5], 2) + Math.pow(a[6], 2) + Math.pow(a[7], 2) + Math.pow(a[8], 2) + Math.pow(a[9], 2) + Math.pow(a[10], 2) + Math.pow(a[11], 2) + Math.pow(a[12], 2) + Math.pow(a[13], 2) + Math.pow(a[14], 2) + Math.pow(a[15], 2) ))
};

/**
 * Adds two mat4's
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */
mat4.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    out[3] = a[3] + b[3];
    out[4] = a[4] + b[4];
    out[5] = a[5] + b[5];
    out[6] = a[6] + b[6];
    out[7] = a[7] + b[7];
    out[8] = a[8] + b[8];
    out[9] = a[9] + b[9];
    out[10] = a[10] + b[10];
    out[11] = a[11] + b[11];
    out[12] = a[12] + b[12];
    out[13] = a[13] + b[13];
    out[14] = a[14] + b[14];
    out[15] = a[15] + b[15];
    return out;
};

/**
 * Subtracts matrix b from matrix a
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */
mat4.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    out[3] = a[3] - b[3];
    out[4] = a[4] - b[4];
    out[5] = a[5] - b[5];
    out[6] = a[6] - b[6];
    out[7] = a[7] - b[7];
    out[8] = a[8] - b[8];
    out[9] = a[9] - b[9];
    out[10] = a[10] - b[10];
    out[11] = a[11] - b[11];
    out[12] = a[12] - b[12];
    out[13] = a[13] - b[13];
    out[14] = a[14] - b[14];
    out[15] = a[15] - b[15];
    return out;
};

/**
 * Alias for {@link mat4.subtract}
 * @function
 */
mat4.sub = mat4.subtract;

/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to scale
 * @param {Number} b amount to scale the matrix's elements by
 * @returns {mat4} out
 */
mat4.multiplyScalar = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    out[3] = a[3] * b;
    out[4] = a[4] * b;
    out[5] = a[5] * b;
    out[6] = a[6] * b;
    out[7] = a[7] * b;
    out[8] = a[8] * b;
    out[9] = a[9] * b;
    out[10] = a[10] * b;
    out[11] = a[11] * b;
    out[12] = a[12] * b;
    out[13] = a[13] * b;
    out[14] = a[14] * b;
    out[15] = a[15] * b;
    return out;
};

/**
 * Adds two mat4's after multiplying each element of the second operand by a scalar value.
 *
 * @param {mat4} out the receiving vector
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @param {Number} scale the amount to scale b's elements by before adding
 * @returns {mat4} out
 */
mat4.multiplyScalarAndAdd = function(out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale);
    out[1] = a[1] + (b[1] * scale);
    out[2] = a[2] + (b[2] * scale);
    out[3] = a[3] + (b[3] * scale);
    out[4] = a[4] + (b[4] * scale);
    out[5] = a[5] + (b[5] * scale);
    out[6] = a[6] + (b[6] * scale);
    out[7] = a[7] + (b[7] * scale);
    out[8] = a[8] + (b[8] * scale);
    out[9] = a[9] + (b[9] * scale);
    out[10] = a[10] + (b[10] * scale);
    out[11] = a[11] + (b[11] * scale);
    out[12] = a[12] + (b[12] * scale);
    out[13] = a[13] + (b[13] * scale);
    out[14] = a[14] + (b[14] * scale);
    out[15] = a[15] + (b[15] * scale);
    return out;
};

/**
 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
 *
 * @param {mat4} a The first matrix.
 * @param {mat4} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
mat4.exactEquals = function (a, b) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && 
           a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] && 
           a[8] === b[8] && a[9] === b[9] && a[10] === b[10] && a[11] === b[11] &&
           a[12] === b[12] && a[13] === b[13] && a[14] === b[14] && a[15] === b[15];
};

/**
 * Returns whether or not the matrices have approximately the same elements in the same position.
 *
 * @param {mat4} a The first matrix.
 * @param {mat4} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
mat4.equals = function (a, b) {
    var a0  = a[0],  a1  = a[1],  a2  = a[2],  a3  = a[3],
        a4  = a[4],  a5  = a[5],  a6  = a[6],  a7  = a[7], 
        a8  = a[8],  a9  = a[9],  a10 = a[10], a11 = a[11], 
        a12 = a[12], a13 = a[13], a14 = a[14], a15 = a[15];

    var b0  = b[0],  b1  = b[1],  b2  = b[2],  b3  = b[3],
        b4  = b[4],  b5  = b[5],  b6  = b[6],  b7  = b[7], 
        b8  = b[8],  b9  = b[9],  b10 = b[10], b11 = b[11], 
        b12 = b[12], b13 = b[13], b14 = b[14], b15 = b[15];

    return (Math.abs(a0 - b0) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
            Math.abs(a1 - b1) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
            Math.abs(a2 - b2) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
            Math.abs(a3 - b3) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a3), Math.abs(b3)) &&
            Math.abs(a4 - b4) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a4), Math.abs(b4)) &&
            Math.abs(a5 - b5) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a5), Math.abs(b5)) &&
            Math.abs(a6 - b6) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a6), Math.abs(b6)) &&
            Math.abs(a7 - b7) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a7), Math.abs(b7)) &&
            Math.abs(a8 - b8) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a8), Math.abs(b8)) &&
            Math.abs(a9 - b9) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a9), Math.abs(b9)) &&
            Math.abs(a10 - b10) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a10), Math.abs(b10)) &&
            Math.abs(a11 - b11) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a11), Math.abs(b11)) &&
            Math.abs(a12 - b12) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a12), Math.abs(b12)) &&
            Math.abs(a13 - b13) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a13), Math.abs(b13)) &&
            Math.abs(a14 - b14) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a14), Math.abs(b14)) &&
            Math.abs(a15 - b15) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a15), Math.abs(b15)));
};



module.exports = mat4;

},{"./common.js":17}],22:[function(require,module,exports){
/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */

var glMatrix = require("./common.js");
var mat3 = require("./mat3.js");
var vec3 = require("./vec3.js");
var vec4 = require("./vec4.js");

/**
 * @class Quaternion
 * @name quat
 */
var quat = {};

/**
 * Creates a new identity quat
 *
 * @returns {quat} a new quaternion
 */
quat.create = function() {
    var out = new glMatrix.ARRAY_TYPE(4);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Sets a quaternion to represent the shortest rotation from one
 * vector to another.
 *
 * Both vectors are assumed to be unit length.
 *
 * @param {quat} out the receiving quaternion.
 * @param {vec3} a the initial vector
 * @param {vec3} b the destination vector
 * @returns {quat} out
 */
quat.rotationTo = (function() {
    var tmpvec3 = vec3.create();
    var xUnitVec3 = vec3.fromValues(1,0,0);
    var yUnitVec3 = vec3.fromValues(0,1,0);

    return function(out, a, b) {
        var dot = vec3.dot(a, b);
        if (dot < -0.999999) {
            vec3.cross(tmpvec3, xUnitVec3, a);
            if (vec3.length(tmpvec3) < 0.000001)
                vec3.cross(tmpvec3, yUnitVec3, a);
            vec3.normalize(tmpvec3, tmpvec3);
            quat.setAxisAngle(out, tmpvec3, Math.PI);
            return out;
        } else if (dot > 0.999999) {
            out[0] = 0;
            out[1] = 0;
            out[2] = 0;
            out[3] = 1;
            return out;
        } else {
            vec3.cross(tmpvec3, a, b);
            out[0] = tmpvec3[0];
            out[1] = tmpvec3[1];
            out[2] = tmpvec3[2];
            out[3] = 1 + dot;
            return quat.normalize(out, out);
        }
    };
})();

/**
 * Sets the specified quaternion with values corresponding to the given
 * axes. Each axis is a vec3 and is expected to be unit length and
 * perpendicular to all other specified axes.
 *
 * @param {vec3} view  the vector representing the viewing direction
 * @param {vec3} right the vector representing the local "right" direction
 * @param {vec3} up    the vector representing the local "up" direction
 * @returns {quat} out
 */
quat.setAxes = (function() {
    var matr = mat3.create();

    return function(out, view, right, up) {
        matr[0] = right[0];
        matr[3] = right[1];
        matr[6] = right[2];

        matr[1] = up[0];
        matr[4] = up[1];
        matr[7] = up[2];

        matr[2] = -view[0];
        matr[5] = -view[1];
        matr[8] = -view[2];

        return quat.normalize(out, quat.fromMat3(out, matr));
    };
})();

/**
 * Creates a new quat initialized with values from an existing quaternion
 *
 * @param {quat} a quaternion to clone
 * @returns {quat} a new quaternion
 * @function
 */
quat.clone = vec4.clone;

/**
 * Creates a new quat initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} a new quaternion
 * @function
 */
quat.fromValues = vec4.fromValues;

/**
 * Copy the values from one quat to another
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the source quaternion
 * @returns {quat} out
 * @function
 */
quat.copy = vec4.copy;

/**
 * Set the components of a quat to the given values
 *
 * @param {quat} out the receiving quaternion
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} out
 * @function
 */
quat.set = vec4.set;

/**
 * Set a quat to the identity quaternion
 *
 * @param {quat} out the receiving quaternion
 * @returns {quat} out
 */
quat.identity = function(out) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Sets a quat from the given angle and rotation axis,
 * then returns it.
 *
 * @param {quat} out the receiving quaternion
 * @param {vec3} axis the axis around which to rotate
 * @param {Number} rad the angle in radians
 * @returns {quat} out
 **/
quat.setAxisAngle = function(out, axis, rad) {
    rad = rad * 0.5;
    var s = Math.sin(rad);
    out[0] = s * axis[0];
    out[1] = s * axis[1];
    out[2] = s * axis[2];
    out[3] = Math.cos(rad);
    return out;
};

/**
 * Gets the rotation axis and angle for a given
 *  quaternion. If a quaternion is created with
 *  setAxisAngle, this method will return the same
 *  values as providied in the original parameter list
 *  OR functionally equivalent values.
 * Example: The quaternion formed by axis [0, 0, 1] and
 *  angle -90 is the same as the quaternion formed by
 *  [0, 0, 1] and 270. This method favors the latter.
 * @param  {vec3} out_axis  Vector receiving the axis of rotation
 * @param  {quat} q     Quaternion to be decomposed
 * @return {Number}     Angle, in radians, of the rotation
 */
quat.getAxisAngle = function(out_axis, q) {
    var rad = Math.acos(q[3]) * 2.0;
    var s = Math.sin(rad / 2.0);
    if (s != 0.0) {
        out_axis[0] = q[0] / s;
        out_axis[1] = q[1] / s;
        out_axis[2] = q[2] / s;
    } else {
        // If s is zero, return any axis (no rotation - axis does not matter)
        out_axis[0] = 1;
        out_axis[1] = 0;
        out_axis[2] = 0;
    }
    return rad;
};

/**
 * Adds two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {quat} out
 * @function
 */
quat.add = vec4.add;

/**
 * Multiplies two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {quat} out
 */
quat.multiply = function(out, a, b) {
    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bx = b[0], by = b[1], bz = b[2], bw = b[3];

    out[0] = ax * bw + aw * bx + ay * bz - az * by;
    out[1] = ay * bw + aw * by + az * bx - ax * bz;
    out[2] = az * bw + aw * bz + ax * by - ay * bx;
    out[3] = aw * bw - ax * bx - ay * by - az * bz;
    return out;
};

/**
 * Alias for {@link quat.multiply}
 * @function
 */
quat.mul = quat.multiply;

/**
 * Scales a quat by a scalar number
 *
 * @param {quat} out the receiving vector
 * @param {quat} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {quat} out
 * @function
 */
quat.scale = vec4.scale;

/**
 * Rotates a quaternion by the given angle about the X axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
quat.rotateX = function (out, a, rad) {
    rad *= 0.5; 

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bx = Math.sin(rad), bw = Math.cos(rad);

    out[0] = ax * bw + aw * bx;
    out[1] = ay * bw + az * bx;
    out[2] = az * bw - ay * bx;
    out[3] = aw * bw - ax * bx;
    return out;
};

/**
 * Rotates a quaternion by the given angle about the Y axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
quat.rotateY = function (out, a, rad) {
    rad *= 0.5; 

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        by = Math.sin(rad), bw = Math.cos(rad);

    out[0] = ax * bw - az * by;
    out[1] = ay * bw + aw * by;
    out[2] = az * bw + ax * by;
    out[3] = aw * bw - ay * by;
    return out;
};

/**
 * Rotates a quaternion by the given angle about the Z axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
quat.rotateZ = function (out, a, rad) {
    rad *= 0.5; 

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bz = Math.sin(rad), bw = Math.cos(rad);

    out[0] = ax * bw + ay * bz;
    out[1] = ay * bw - ax * bz;
    out[2] = az * bw + aw * bz;
    out[3] = aw * bw - az * bz;
    return out;
};

/**
 * Calculates the W component of a quat from the X, Y, and Z components.
 * Assumes that quaternion is 1 unit in length.
 * Any existing W component will be ignored.
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate W component of
 * @returns {quat} out
 */
quat.calculateW = function (out, a) {
    var x = a[0], y = a[1], z = a[2];

    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
    return out;
};

/**
 * Calculates the dot product of two quat's
 *
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {Number} dot product of a and b
 * @function
 */
quat.dot = vec4.dot;

/**
 * Performs a linear interpolation between two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {quat} out
 * @function
 */
quat.lerp = vec4.lerp;

/**
 * Performs a spherical linear interpolation between two quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {quat} out
 */
quat.slerp = function (out, a, b, t) {
    // benchmarks:
    //    http://jsperf.com/quaternion-slerp-implementations

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bx = b[0], by = b[1], bz = b[2], bw = b[3];

    var        omega, cosom, sinom, scale0, scale1;

    // calc cosine
    cosom = ax * bx + ay * by + az * bz + aw * bw;
    // adjust signs (if necessary)
    if ( cosom < 0.0 ) {
        cosom = -cosom;
        bx = - bx;
        by = - by;
        bz = - bz;
        bw = - bw;
    }
    // calculate coefficients
    if ( (1.0 - cosom) > 0.000001 ) {
        // standard case (slerp)
        omega  = Math.acos(cosom);
        sinom  = Math.sin(omega);
        scale0 = Math.sin((1.0 - t) * omega) / sinom;
        scale1 = Math.sin(t * omega) / sinom;
    } else {        
        // "from" and "to" quaternions are very close 
        //  ... so we can do a linear interpolation
        scale0 = 1.0 - t;
        scale1 = t;
    }
    // calculate final values
    out[0] = scale0 * ax + scale1 * bx;
    out[1] = scale0 * ay + scale1 * by;
    out[2] = scale0 * az + scale1 * bz;
    out[3] = scale0 * aw + scale1 * bw;
    
    return out;
};

/**
 * Performs a spherical linear interpolation with two control points
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {quat} c the third operand
 * @param {quat} d the fourth operand
 * @param {Number} t interpolation amount
 * @returns {quat} out
 */
quat.sqlerp = (function () {
  var temp1 = quat.create();
  var temp2 = quat.create();
  
  return function (out, a, b, c, d, t) {
    quat.slerp(temp1, a, d, t);
    quat.slerp(temp2, b, c, t);
    quat.slerp(out, temp1, temp2, 2 * t * (1 - t));
    
    return out;
  };
}());

/**
 * Calculates the inverse of a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate inverse of
 * @returns {quat} out
 */
quat.invert = function(out, a) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
        dot = a0*a0 + a1*a1 + a2*a2 + a3*a3,
        invDot = dot ? 1.0/dot : 0;
    
    // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0

    out[0] = -a0*invDot;
    out[1] = -a1*invDot;
    out[2] = -a2*invDot;
    out[3] = a3*invDot;
    return out;
};

/**
 * Calculates the conjugate of a quat
 * If the quaternion is normalized, this function is faster than quat.inverse and produces the same result.
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate conjugate of
 * @returns {quat} out
 */
quat.conjugate = function (out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] = a[3];
    return out;
};

/**
 * Calculates the length of a quat
 *
 * @param {quat} a vector to calculate length of
 * @returns {Number} length of a
 * @function
 */
quat.length = vec4.length;

/**
 * Alias for {@link quat.length}
 * @function
 */
quat.len = quat.length;

/**
 * Calculates the squared length of a quat
 *
 * @param {quat} a vector to calculate squared length of
 * @returns {Number} squared length of a
 * @function
 */
quat.squaredLength = vec4.squaredLength;

/**
 * Alias for {@link quat.squaredLength}
 * @function
 */
quat.sqrLen = quat.squaredLength;

/**
 * Normalize a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quaternion to normalize
 * @returns {quat} out
 * @function
 */
quat.normalize = vec4.normalize;

/**
 * Creates a quaternion from the given 3x3 rotation matrix.
 *
 * NOTE: The resultant quaternion is not normalized, so you should be sure
 * to renormalize the quaternion yourself where necessary.
 *
 * @param {quat} out the receiving quaternion
 * @param {mat3} m rotation matrix
 * @returns {quat} out
 * @function
 */
quat.fromMat3 = function(out, m) {
    // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
    // article "Quaternion Calculus and Fast Animation".
    var fTrace = m[0] + m[4] + m[8];
    var fRoot;

    if ( fTrace > 0.0 ) {
        // |w| > 1/2, may as well choose w > 1/2
        fRoot = Math.sqrt(fTrace + 1.0);  // 2w
        out[3] = 0.5 * fRoot;
        fRoot = 0.5/fRoot;  // 1/(4w)
        out[0] = (m[5]-m[7])*fRoot;
        out[1] = (m[6]-m[2])*fRoot;
        out[2] = (m[1]-m[3])*fRoot;
    } else {
        // |w| <= 1/2
        var i = 0;
        if ( m[4] > m[0] )
          i = 1;
        if ( m[8] > m[i*3+i] )
          i = 2;
        var j = (i+1)%3;
        var k = (i+2)%3;
        
        fRoot = Math.sqrt(m[i*3+i]-m[j*3+j]-m[k*3+k] + 1.0);
        out[i] = 0.5 * fRoot;
        fRoot = 0.5 / fRoot;
        out[3] = (m[j*3+k] - m[k*3+j]) * fRoot;
        out[j] = (m[j*3+i] + m[i*3+j]) * fRoot;
        out[k] = (m[k*3+i] + m[i*3+k]) * fRoot;
    }
    
    return out;
};

/**
 * Returns a string representation of a quatenion
 *
 * @param {quat} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
quat.str = function (a) {
    return 'quat(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
};

/**
 * Returns whether or not the quaternions have exactly the same elements in the same position (when compared with ===)
 *
 * @param {quat} a The first quaternion.
 * @param {quat} b The second quaternion.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
quat.exactEquals = vec4.exactEquals;

/**
 * Returns whether or not the quaternions have approximately the same elements in the same position.
 *
 * @param {quat} a The first vector.
 * @param {quat} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
quat.equals = vec4.equals;

module.exports = quat;

},{"./common.js":17,"./mat3.js":20,"./vec3.js":24,"./vec4.js":25}],23:[function(require,module,exports){
/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */

var glMatrix = require("./common.js");

/**
 * @class 2 Dimensional Vector
 * @name vec2
 */
var vec2 = {};

/**
 * Creates a new, empty vec2
 *
 * @returns {vec2} a new 2D vector
 */
vec2.create = function() {
    var out = new glMatrix.ARRAY_TYPE(2);
    out[0] = 0;
    out[1] = 0;
    return out;
};

/**
 * Creates a new vec2 initialized with values from an existing vector
 *
 * @param {vec2} a vector to clone
 * @returns {vec2} a new 2D vector
 */
vec2.clone = function(a) {
    var out = new glMatrix.ARRAY_TYPE(2);
    out[0] = a[0];
    out[1] = a[1];
    return out;
};

/**
 * Creates a new vec2 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} a new 2D vector
 */
vec2.fromValues = function(x, y) {
    var out = new glMatrix.ARRAY_TYPE(2);
    out[0] = x;
    out[1] = y;
    return out;
};

/**
 * Copy the values from one vec2 to another
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the source vector
 * @returns {vec2} out
 */
vec2.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    return out;
};

/**
 * Set the components of a vec2 to the given values
 *
 * @param {vec2} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} out
 */
vec2.set = function(out, x, y) {
    out[0] = x;
    out[1] = y;
    return out;
};

/**
 * Adds two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    return out;
};

/**
 * Subtracts vector b from vector a
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    return out;
};

/**
 * Alias for {@link vec2.subtract}
 * @function
 */
vec2.sub = vec2.subtract;

/**
 * Multiplies two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.multiply = function(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    return out;
};

/**
 * Alias for {@link vec2.multiply}
 * @function
 */
vec2.mul = vec2.multiply;

/**
 * Divides two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.divide = function(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    return out;
};

/**
 * Alias for {@link vec2.divide}
 * @function
 */
vec2.div = vec2.divide;

/**
 * Math.ceil the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to ceil
 * @returns {vec2} out
 */
vec2.ceil = function (out, a) {
    out[0] = Math.ceil(a[0]);
    out[1] = Math.ceil(a[1]);
    return out;
};

/**
 * Math.floor the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to floor
 * @returns {vec2} out
 */
vec2.floor = function (out, a) {
    out[0] = Math.floor(a[0]);
    out[1] = Math.floor(a[1]);
    return out;
};

/**
 * Returns the minimum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.min = function(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    return out;
};

/**
 * Returns the maximum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.max = function(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    return out;
};

/**
 * Math.round the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to round
 * @returns {vec2} out
 */
vec2.round = function (out, a) {
    out[0] = Math.round(a[0]);
    out[1] = Math.round(a[1]);
    return out;
};

/**
 * Scales a vec2 by a scalar number
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec2} out
 */
vec2.scale = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    return out;
};

/**
 * Adds two vec2's after scaling the second operand by a scalar value
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec2} out
 */
vec2.scaleAndAdd = function(out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale);
    out[1] = a[1] + (b[1] * scale);
    return out;
};

/**
 * Calculates the euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} distance between a and b
 */
vec2.distance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return Math.sqrt(x*x + y*y);
};

/**
 * Alias for {@link vec2.distance}
 * @function
 */
vec2.dist = vec2.distance;

/**
 * Calculates the squared euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} squared distance between a and b
 */
vec2.squaredDistance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return x*x + y*y;
};

/**
 * Alias for {@link vec2.squaredDistance}
 * @function
 */
vec2.sqrDist = vec2.squaredDistance;

/**
 * Calculates the length of a vec2
 *
 * @param {vec2} a vector to calculate length of
 * @returns {Number} length of a
 */
vec2.length = function (a) {
    var x = a[0],
        y = a[1];
    return Math.sqrt(x*x + y*y);
};

/**
 * Alias for {@link vec2.length}
 * @function
 */
vec2.len = vec2.length;

/**
 * Calculates the squared length of a vec2
 *
 * @param {vec2} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
vec2.squaredLength = function (a) {
    var x = a[0],
        y = a[1];
    return x*x + y*y;
};

/**
 * Alias for {@link vec2.squaredLength}
 * @function
 */
vec2.sqrLen = vec2.squaredLength;

/**
 * Negates the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to negate
 * @returns {vec2} out
 */
vec2.negate = function(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    return out;
};

/**
 * Returns the inverse of the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to invert
 * @returns {vec2} out
 */
vec2.inverse = function(out, a) {
  out[0] = 1.0 / a[0];
  out[1] = 1.0 / a[1];
  return out;
};

/**
 * Normalize a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to normalize
 * @returns {vec2} out
 */
vec2.normalize = function(out, a) {
    var x = a[0],
        y = a[1];
    var len = x*x + y*y;
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
    }
    return out;
};

/**
 * Calculates the dot product of two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} dot product of a and b
 */
vec2.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1];
};

/**
 * Computes the cross product of two vec2's
 * Note that the cross product must by definition produce a 3D vector
 *
 * @param {vec3} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec3} out
 */
vec2.cross = function(out, a, b) {
    var z = a[0] * b[1] - a[1] * b[0];
    out[0] = out[1] = 0;
    out[2] = z;
    return out;
};

/**
 * Performs a linear interpolation between two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec2} out
 */
vec2.lerp = function (out, a, b, t) {
    var ax = a[0],
        ay = a[1];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    return out;
};

/**
 * Generates a random vector with the given scale
 *
 * @param {vec2} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec2} out
 */
vec2.random = function (out, scale) {
    scale = scale || 1.0;
    var r = glMatrix.RANDOM() * 2.0 * Math.PI;
    out[0] = Math.cos(r) * scale;
    out[1] = Math.sin(r) * scale;
    return out;
};

/**
 * Transforms the vec2 with a mat2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat2} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat2 = function(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[2] * y;
    out[1] = m[1] * x + m[3] * y;
    return out;
};

/**
 * Transforms the vec2 with a mat2d
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat2d} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat2d = function(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[2] * y + m[4];
    out[1] = m[1] * x + m[3] * y + m[5];
    return out;
};

/**
 * Transforms the vec2 with a mat3
 * 3rd vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat3} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat3 = function(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[3] * y + m[6];
    out[1] = m[1] * x + m[4] * y + m[7];
    return out;
};

/**
 * Transforms the vec2 with a mat4
 * 3rd vector component is implicitly '0'
 * 4th vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat4 = function(out, a, m) {
    var x = a[0], 
        y = a[1];
    out[0] = m[0] * x + m[4] * y + m[12];
    out[1] = m[1] * x + m[5] * y + m[13];
    return out;
};

/**
 * Perform some operation over an array of vec2s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
vec2.forEach = (function() {
    var vec = vec2.create();

    return function(a, stride, offset, count, fn, arg) {
        var i, l;
        if(!stride) {
            stride = 2;
        }

        if(!offset) {
            offset = 0;
        }
        
        if(count) {
            l = Math.min((count * stride) + offset, a.length);
        } else {
            l = a.length;
        }

        for(i = offset; i < l; i += stride) {
            vec[0] = a[i]; vec[1] = a[i+1];
            fn(vec, vec, arg);
            a[i] = vec[0]; a[i+1] = vec[1];
        }
        
        return a;
    };
})();

/**
 * Returns a string representation of a vector
 *
 * @param {vec2} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
vec2.str = function (a) {
    return 'vec2(' + a[0] + ', ' + a[1] + ')';
};

/**
 * Returns whether or not the vectors exactly have the same elements in the same position (when compared with ===)
 *
 * @param {vec2} a The first vector.
 * @param {vec2} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
vec2.exactEquals = function (a, b) {
    return a[0] === b[0] && a[1] === b[1];
};

/**
 * Returns whether or not the vectors have approximately the same elements in the same position.
 *
 * @param {vec2} a The first vector.
 * @param {vec2} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
vec2.equals = function (a, b) {
    var a0 = a[0], a1 = a[1];
    var b0 = b[0], b1 = b[1];
    return (Math.abs(a0 - b0) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
            Math.abs(a1 - b1) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a1), Math.abs(b1)));
};

module.exports = vec2;

},{"./common.js":17}],24:[function(require,module,exports){
/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */

var glMatrix = require("./common.js");

/**
 * @class 3 Dimensional Vector
 * @name vec3
 */
var vec3 = {};

/**
 * Creates a new, empty vec3
 *
 * @returns {vec3} a new 3D vector
 */
vec3.create = function() {
    var out = new glMatrix.ARRAY_TYPE(3);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    return out;
};

/**
 * Creates a new vec3 initialized with values from an existing vector
 *
 * @param {vec3} a vector to clone
 * @returns {vec3} a new 3D vector
 */
vec3.clone = function(a) {
    var out = new glMatrix.ARRAY_TYPE(3);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
};

/**
 * Creates a new vec3 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} a new 3D vector
 */
vec3.fromValues = function(x, y, z) {
    var out = new glMatrix.ARRAY_TYPE(3);
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
};

/**
 * Copy the values from one vec3 to another
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the source vector
 * @returns {vec3} out
 */
vec3.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
};

/**
 * Set the components of a vec3 to the given values
 *
 * @param {vec3} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} out
 */
vec3.set = function(out, x, y, z) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
};

/**
 * Adds two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    return out;
};

/**
 * Subtracts vector b from vector a
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out;
};

/**
 * Alias for {@link vec3.subtract}
 * @function
 */
vec3.sub = vec3.subtract;

/**
 * Multiplies two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.multiply = function(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    return out;
};

/**
 * Alias for {@link vec3.multiply}
 * @function
 */
vec3.mul = vec3.multiply;

/**
 * Divides two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.divide = function(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    out[2] = a[2] / b[2];
    return out;
};

/**
 * Alias for {@link vec3.divide}
 * @function
 */
vec3.div = vec3.divide;

/**
 * Math.ceil the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to ceil
 * @returns {vec3} out
 */
vec3.ceil = function (out, a) {
    out[0] = Math.ceil(a[0]);
    out[1] = Math.ceil(a[1]);
    out[2] = Math.ceil(a[2]);
    return out;
};

/**
 * Math.floor the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to floor
 * @returns {vec3} out
 */
vec3.floor = function (out, a) {
    out[0] = Math.floor(a[0]);
    out[1] = Math.floor(a[1]);
    out[2] = Math.floor(a[2]);
    return out;
};

/**
 * Returns the minimum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.min = function(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    out[2] = Math.min(a[2], b[2]);
    return out;
};

/**
 * Returns the maximum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.max = function(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    out[2] = Math.max(a[2], b[2]);
    return out;
};

/**
 * Math.round the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to round
 * @returns {vec3} out
 */
vec3.round = function (out, a) {
    out[0] = Math.round(a[0]);
    out[1] = Math.round(a[1]);
    out[2] = Math.round(a[2]);
    return out;
};

/**
 * Scales a vec3 by a scalar number
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec3} out
 */
vec3.scale = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    return out;
};

/**
 * Adds two vec3's after scaling the second operand by a scalar value
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec3} out
 */
vec3.scaleAndAdd = function(out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale);
    out[1] = a[1] + (b[1] * scale);
    out[2] = a[2] + (b[2] * scale);
    return out;
};

/**
 * Calculates the euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} distance between a and b
 */
vec3.distance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2];
    return Math.sqrt(x*x + y*y + z*z);
};

/**
 * Alias for {@link vec3.distance}
 * @function
 */
vec3.dist = vec3.distance;

/**
 * Calculates the squared euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} squared distance between a and b
 */
vec3.squaredDistance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2];
    return x*x + y*y + z*z;
};

/**
 * Alias for {@link vec3.squaredDistance}
 * @function
 */
vec3.sqrDist = vec3.squaredDistance;

/**
 * Calculates the length of a vec3
 *
 * @param {vec3} a vector to calculate length of
 * @returns {Number} length of a
 */
vec3.length = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2];
    return Math.sqrt(x*x + y*y + z*z);
};

/**
 * Alias for {@link vec3.length}
 * @function
 */
vec3.len = vec3.length;

/**
 * Calculates the squared length of a vec3
 *
 * @param {vec3} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
vec3.squaredLength = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2];
    return x*x + y*y + z*z;
};

/**
 * Alias for {@link vec3.squaredLength}
 * @function
 */
vec3.sqrLen = vec3.squaredLength;

/**
 * Negates the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to negate
 * @returns {vec3} out
 */
vec3.negate = function(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    return out;
};

/**
 * Returns the inverse of the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to invert
 * @returns {vec3} out
 */
vec3.inverse = function(out, a) {
  out[0] = 1.0 / a[0];
  out[1] = 1.0 / a[1];
  out[2] = 1.0 / a[2];
  return out;
};

/**
 * Normalize a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to normalize
 * @returns {vec3} out
 */
vec3.normalize = function(out, a) {
    var x = a[0],
        y = a[1],
        z = a[2];
    var len = x*x + y*y + z*z;
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
        out[2] = a[2] * len;
    }
    return out;
};

/**
 * Calculates the dot product of two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} dot product of a and b
 */
vec3.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
};

/**
 * Computes the cross product of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.cross = function(out, a, b) {
    var ax = a[0], ay = a[1], az = a[2],
        bx = b[0], by = b[1], bz = b[2];

    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;
    return out;
};

/**
 * Performs a linear interpolation between two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec3} out
 */
vec3.lerp = function (out, a, b, t) {
    var ax = a[0],
        ay = a[1],
        az = a[2];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    out[2] = az + t * (b[2] - az);
    return out;
};

/**
 * Performs a hermite interpolation with two control points
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {vec3} c the third operand
 * @param {vec3} d the fourth operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec3} out
 */
vec3.hermite = function (out, a, b, c, d, t) {
  var factorTimes2 = t * t,
      factor1 = factorTimes2 * (2 * t - 3) + 1,
      factor2 = factorTimes2 * (t - 2) + t,
      factor3 = factorTimes2 * (t - 1),
      factor4 = factorTimes2 * (3 - 2 * t);
  
  out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
  out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
  out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
  
  return out;
};

/**
 * Performs a bezier interpolation with two control points
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {vec3} c the third operand
 * @param {vec3} d the fourth operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec3} out
 */
vec3.bezier = function (out, a, b, c, d, t) {
  var inverseFactor = 1 - t,
      inverseFactorTimesTwo = inverseFactor * inverseFactor,
      factorTimes2 = t * t,
      factor1 = inverseFactorTimesTwo * inverseFactor,
      factor2 = 3 * t * inverseFactorTimesTwo,
      factor3 = 3 * factorTimes2 * inverseFactor,
      factor4 = factorTimes2 * t;
  
  out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
  out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
  out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
  
  return out;
};

/**
 * Generates a random vector with the given scale
 *
 * @param {vec3} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec3} out
 */
vec3.random = function (out, scale) {
    scale = scale || 1.0;

    var r = glMatrix.RANDOM() * 2.0 * Math.PI;
    var z = (glMatrix.RANDOM() * 2.0) - 1.0;
    var zScale = Math.sqrt(1.0-z*z) * scale;

    out[0] = Math.cos(r) * zScale;
    out[1] = Math.sin(r) * zScale;
    out[2] = z * scale;
    return out;
};

/**
 * Transforms the vec3 with a mat4.
 * 4th vector component is implicitly '1'
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec3} out
 */
vec3.transformMat4 = function(out, a, m) {
    var x = a[0], y = a[1], z = a[2],
        w = m[3] * x + m[7] * y + m[11] * z + m[15];
    w = w || 1.0;
    out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
    out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
    out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
    return out;
};

/**
 * Transforms the vec3 with a mat3.
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m the 3x3 matrix to transform with
 * @returns {vec3} out
 */
vec3.transformMat3 = function(out, a, m) {
    var x = a[0], y = a[1], z = a[2];
    out[0] = x * m[0] + y * m[3] + z * m[6];
    out[1] = x * m[1] + y * m[4] + z * m[7];
    out[2] = x * m[2] + y * m[5] + z * m[8];
    return out;
};

/**
 * Transforms the vec3 with a quat
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec3} out
 */
vec3.transformQuat = function(out, a, q) {
    // benchmarks: http://jsperf.com/quaternion-transform-vec3-implementations

    var x = a[0], y = a[1], z = a[2],
        qx = q[0], qy = q[1], qz = q[2], qw = q[3],

        // calculate quat * vec
        ix = qw * x + qy * z - qz * y,
        iy = qw * y + qz * x - qx * z,
        iz = qw * z + qx * y - qy * x,
        iw = -qx * x - qy * y - qz * z;

    // calculate result * inverse quat
    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    return out;
};

/**
 * Rotate a 3D vector around the x-axis
 * @param {vec3} out The receiving vec3
 * @param {vec3} a The vec3 point to rotate
 * @param {vec3} b The origin of the rotation
 * @param {Number} c The angle of rotation
 * @returns {vec3} out
 */
vec3.rotateX = function(out, a, b, c){
   var p = [], r=[];
	  //Translate point to the origin
	  p[0] = a[0] - b[0];
	  p[1] = a[1] - b[1];
  	p[2] = a[2] - b[2];

	  //perform rotation
	  r[0] = p[0];
	  r[1] = p[1]*Math.cos(c) - p[2]*Math.sin(c);
	  r[2] = p[1]*Math.sin(c) + p[2]*Math.cos(c);

	  //translate to correct position
	  out[0] = r[0] + b[0];
	  out[1] = r[1] + b[1];
	  out[2] = r[2] + b[2];

  	return out;
};

/**
 * Rotate a 3D vector around the y-axis
 * @param {vec3} out The receiving vec3
 * @param {vec3} a The vec3 point to rotate
 * @param {vec3} b The origin of the rotation
 * @param {Number} c The angle of rotation
 * @returns {vec3} out
 */
vec3.rotateY = function(out, a, b, c){
  	var p = [], r=[];
  	//Translate point to the origin
  	p[0] = a[0] - b[0];
  	p[1] = a[1] - b[1];
  	p[2] = a[2] - b[2];
  
  	//perform rotation
  	r[0] = p[2]*Math.sin(c) + p[0]*Math.cos(c);
  	r[1] = p[1];
  	r[2] = p[2]*Math.cos(c) - p[0]*Math.sin(c);
  
  	//translate to correct position
  	out[0] = r[0] + b[0];
  	out[1] = r[1] + b[1];
  	out[2] = r[2] + b[2];
  
  	return out;
};

/**
 * Rotate a 3D vector around the z-axis
 * @param {vec3} out The receiving vec3
 * @param {vec3} a The vec3 point to rotate
 * @param {vec3} b The origin of the rotation
 * @param {Number} c The angle of rotation
 * @returns {vec3} out
 */
vec3.rotateZ = function(out, a, b, c){
  	var p = [], r=[];
  	//Translate point to the origin
  	p[0] = a[0] - b[0];
  	p[1] = a[1] - b[1];
  	p[2] = a[2] - b[2];
  
  	//perform rotation
  	r[0] = p[0]*Math.cos(c) - p[1]*Math.sin(c);
  	r[1] = p[0]*Math.sin(c) + p[1]*Math.cos(c);
  	r[2] = p[2];
  
  	//translate to correct position
  	out[0] = r[0] + b[0];
  	out[1] = r[1] + b[1];
  	out[2] = r[2] + b[2];
  
  	return out;
};

/**
 * Perform some operation over an array of vec3s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
vec3.forEach = (function() {
    var vec = vec3.create();

    return function(a, stride, offset, count, fn, arg) {
        var i, l;
        if(!stride) {
            stride = 3;
        }

        if(!offset) {
            offset = 0;
        }
        
        if(count) {
            l = Math.min((count * stride) + offset, a.length);
        } else {
            l = a.length;
        }

        for(i = offset; i < l; i += stride) {
            vec[0] = a[i]; vec[1] = a[i+1]; vec[2] = a[i+2];
            fn(vec, vec, arg);
            a[i] = vec[0]; a[i+1] = vec[1]; a[i+2] = vec[2];
        }
        
        return a;
    };
})();

/**
 * Get the angle between two 3D vectors
 * @param {vec3} a The first operand
 * @param {vec3} b The second operand
 * @returns {Number} The angle in radians
 */
vec3.angle = function(a, b) {
   
    var tempA = vec3.fromValues(a[0], a[1], a[2]);
    var tempB = vec3.fromValues(b[0], b[1], b[2]);
 
    vec3.normalize(tempA, tempA);
    vec3.normalize(tempB, tempB);
 
    var cosine = vec3.dot(tempA, tempB);

    if(cosine > 1.0){
        return 0;
    } else {
        return Math.acos(cosine);
    }     
};

/**
 * Returns a string representation of a vector
 *
 * @param {vec3} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
vec3.str = function (a) {
    return 'vec3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ')';
};

/**
 * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
 *
 * @param {vec3} a The first vector.
 * @param {vec3} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
vec3.exactEquals = function (a, b) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
};

/**
 * Returns whether or not the vectors have approximately the same elements in the same position.
 *
 * @param {vec3} a The first vector.
 * @param {vec3} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
vec3.equals = function (a, b) {
    var a0 = a[0], a1 = a[1], a2 = a[2];
    var b0 = b[0], b1 = b[1], b2 = b[2];
    return (Math.abs(a0 - b0) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
            Math.abs(a1 - b1) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
            Math.abs(a2 - b2) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a2), Math.abs(b2)));
};

module.exports = vec3;

},{"./common.js":17}],25:[function(require,module,exports){
/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */

var glMatrix = require("./common.js");

/**
 * @class 4 Dimensional Vector
 * @name vec4
 */
var vec4 = {};

/**
 * Creates a new, empty vec4
 *
 * @returns {vec4} a new 4D vector
 */
vec4.create = function() {
    var out = new glMatrix.ARRAY_TYPE(4);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    return out;
};

/**
 * Creates a new vec4 initialized with values from an existing vector
 *
 * @param {vec4} a vector to clone
 * @returns {vec4} a new 4D vector
 */
vec4.clone = function(a) {
    var out = new glMatrix.ARRAY_TYPE(4);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Creates a new vec4 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} a new 4D vector
 */
vec4.fromValues = function(x, y, z, w) {
    var out = new glMatrix.ARRAY_TYPE(4);
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
};

/**
 * Copy the values from one vec4 to another
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the source vector
 * @returns {vec4} out
 */
vec4.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Set the components of a vec4 to the given values
 *
 * @param {vec4} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} out
 */
vec4.set = function(out, x, y, z, w) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
};

/**
 * Adds two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    out[3] = a[3] + b[3];
    return out;
};

/**
 * Subtracts vector b from vector a
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    out[3] = a[3] - b[3];
    return out;
};

/**
 * Alias for {@link vec4.subtract}
 * @function
 */
vec4.sub = vec4.subtract;

/**
 * Multiplies two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.multiply = function(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    out[3] = a[3] * b[3];
    return out;
};

/**
 * Alias for {@link vec4.multiply}
 * @function
 */
vec4.mul = vec4.multiply;

/**
 * Divides two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.divide = function(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    out[2] = a[2] / b[2];
    out[3] = a[3] / b[3];
    return out;
};

/**
 * Alias for {@link vec4.divide}
 * @function
 */
vec4.div = vec4.divide;

/**
 * Math.ceil the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to ceil
 * @returns {vec4} out
 */
vec4.ceil = function (out, a) {
    out[0] = Math.ceil(a[0]);
    out[1] = Math.ceil(a[1]);
    out[2] = Math.ceil(a[2]);
    out[3] = Math.ceil(a[3]);
    return out;
};

/**
 * Math.floor the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to floor
 * @returns {vec4} out
 */
vec4.floor = function (out, a) {
    out[0] = Math.floor(a[0]);
    out[1] = Math.floor(a[1]);
    out[2] = Math.floor(a[2]);
    out[3] = Math.floor(a[3]);
    return out;
};

/**
 * Returns the minimum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.min = function(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    out[2] = Math.min(a[2], b[2]);
    out[3] = Math.min(a[3], b[3]);
    return out;
};

/**
 * Returns the maximum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.max = function(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    out[2] = Math.max(a[2], b[2]);
    out[3] = Math.max(a[3], b[3]);
    return out;
};

/**
 * Math.round the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to round
 * @returns {vec4} out
 */
vec4.round = function (out, a) {
    out[0] = Math.round(a[0]);
    out[1] = Math.round(a[1]);
    out[2] = Math.round(a[2]);
    out[3] = Math.round(a[3]);
    return out;
};

/**
 * Scales a vec4 by a scalar number
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec4} out
 */
vec4.scale = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    out[3] = a[3] * b;
    return out;
};

/**
 * Adds two vec4's after scaling the second operand by a scalar value
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec4} out
 */
vec4.scaleAndAdd = function(out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale);
    out[1] = a[1] + (b[1] * scale);
    out[2] = a[2] + (b[2] * scale);
    out[3] = a[3] + (b[3] * scale);
    return out;
};

/**
 * Calculates the euclidian distance between two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} distance between a and b
 */
vec4.distance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2],
        w = b[3] - a[3];
    return Math.sqrt(x*x + y*y + z*z + w*w);
};

/**
 * Alias for {@link vec4.distance}
 * @function
 */
vec4.dist = vec4.distance;

/**
 * Calculates the squared euclidian distance between two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} squared distance between a and b
 */
vec4.squaredDistance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2],
        w = b[3] - a[3];
    return x*x + y*y + z*z + w*w;
};

/**
 * Alias for {@link vec4.squaredDistance}
 * @function
 */
vec4.sqrDist = vec4.squaredDistance;

/**
 * Calculates the length of a vec4
 *
 * @param {vec4} a vector to calculate length of
 * @returns {Number} length of a
 */
vec4.length = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];
    return Math.sqrt(x*x + y*y + z*z + w*w);
};

/**
 * Alias for {@link vec4.length}
 * @function
 */
vec4.len = vec4.length;

/**
 * Calculates the squared length of a vec4
 *
 * @param {vec4} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
vec4.squaredLength = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];
    return x*x + y*y + z*z + w*w;
};

/**
 * Alias for {@link vec4.squaredLength}
 * @function
 */
vec4.sqrLen = vec4.squaredLength;

/**
 * Negates the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to negate
 * @returns {vec4} out
 */
vec4.negate = function(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] = -a[3];
    return out;
};

/**
 * Returns the inverse of the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to invert
 * @returns {vec4} out
 */
vec4.inverse = function(out, a) {
  out[0] = 1.0 / a[0];
  out[1] = 1.0 / a[1];
  out[2] = 1.0 / a[2];
  out[3] = 1.0 / a[3];
  return out;
};

/**
 * Normalize a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to normalize
 * @returns {vec4} out
 */
vec4.normalize = function(out, a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];
    var len = x*x + y*y + z*z + w*w;
    if (len > 0) {
        len = 1 / Math.sqrt(len);
        out[0] = x * len;
        out[1] = y * len;
        out[2] = z * len;
        out[3] = w * len;
    }
    return out;
};

/**
 * Calculates the dot product of two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} dot product of a and b
 */
vec4.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
};

/**
 * Performs a linear interpolation between two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec4} out
 */
vec4.lerp = function (out, a, b, t) {
    var ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    out[2] = az + t * (b[2] - az);
    out[3] = aw + t * (b[3] - aw);
    return out;
};

/**
 * Generates a random vector with the given scale
 *
 * @param {vec4} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec4} out
 */
vec4.random = function (out, scale) {
    scale = scale || 1.0;

    //TODO: This is a pretty awful way of doing this. Find something better.
    out[0] = glMatrix.RANDOM();
    out[1] = glMatrix.RANDOM();
    out[2] = glMatrix.RANDOM();
    out[3] = glMatrix.RANDOM();
    vec4.normalize(out, out);
    vec4.scale(out, out, scale);
    return out;
};

/**
 * Transforms the vec4 with a mat4.
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec4} out
 */
vec4.transformMat4 = function(out, a, m) {
    var x = a[0], y = a[1], z = a[2], w = a[3];
    out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
    out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
    out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
    out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
    return out;
};

/**
 * Transforms the vec4 with a quat
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec4} out
 */
vec4.transformQuat = function(out, a, q) {
    var x = a[0], y = a[1], z = a[2],
        qx = q[0], qy = q[1], qz = q[2], qw = q[3],

        // calculate quat * vec
        ix = qw * x + qy * z - qz * y,
        iy = qw * y + qz * x - qx * z,
        iz = qw * z + qx * y - qy * x,
        iw = -qx * x - qy * y - qz * z;

    // calculate result * inverse quat
    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    out[3] = a[3];
    return out;
};

/**
 * Perform some operation over an array of vec4s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec4s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
vec4.forEach = (function() {
    var vec = vec4.create();

    return function(a, stride, offset, count, fn, arg) {
        var i, l;
        if(!stride) {
            stride = 4;
        }

        if(!offset) {
            offset = 0;
        }
        
        if(count) {
            l = Math.min((count * stride) + offset, a.length);
        } else {
            l = a.length;
        }

        for(i = offset; i < l; i += stride) {
            vec[0] = a[i]; vec[1] = a[i+1]; vec[2] = a[i+2]; vec[3] = a[i+3];
            fn(vec, vec, arg);
            a[i] = vec[0]; a[i+1] = vec[1]; a[i+2] = vec[2]; a[i+3] = vec[3];
        }
        
        return a;
    };
})();

/**
 * Returns a string representation of a vector
 *
 * @param {vec4} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
vec4.str = function (a) {
    return 'vec4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
};

/**
 * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
 *
 * @param {vec4} a The first vector.
 * @param {vec4} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
vec4.exactEquals = function (a, b) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
};

/**
 * Returns whether or not the vectors have approximately the same elements in the same position.
 *
 * @param {vec4} a The first vector.
 * @param {vec4} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
vec4.equals = function (a, b) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
    var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
    return (Math.abs(a0 - b0) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
            Math.abs(a1 - b1) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
            Math.abs(a2 - b2) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
            Math.abs(a3 - b3) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a3), Math.abs(b3)));
};

module.exports = vec4;

},{"./common.js":17}],26:[function(require,module,exports){
(function (global){
/*
** Copyright (c) 2012 The Khronos Group Inc.
**
** Permission is hereby granted, free of charge, to any person obtaining a
** copy of this software and/or associated documentation files (the
** "Materials"), to deal in the Materials without restriction, including
** without limitation the rights to use, copy, modify, merge, publish,
** distribute, sublicense, and/or sell copies of the Materials, and to
** permit persons to whom the Materials are furnished to do so, subject to
** the following conditions:
**
** The above copyright notice and this permission notice shall be included
** in all copies or substantial portions of the Materials.
**
** THE MATERIALS ARE PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
** EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
** MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
** IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
** CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
** TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
** MATERIALS OR THE USE OR OTHER DEALINGS IN THE MATERIALS.
*/

//Ported to node by Marcin Ignac on 2016-05-20

// Various functions for helping debug WebGL apps.

WebGLDebugUtils = function() {

//polyfill window in node
if (typeof(window) == 'undefined') {
    window = global;
}

/**
 * Wrapped logging function.
 * @param {string} msg Message to log.
 */
var log = function(msg) {
  if (window.console && window.console.log) {
    window.console.log(msg);
  }
};

/**
 * Wrapped error logging function.
 * @param {string} msg Message to log.
 */
var error = function(msg) {
  if (window.console && window.console.error) {
    window.console.error(msg);
  } else {
    log(msg);
  }
};


/**
 * Which arguments are enums based on the number of arguments to the function.
 * So
 *    'texImage2D': {
 *       9: { 0:true, 2:true, 6:true, 7:true },
 *       6: { 0:true, 2:true, 3:true, 4:true },
 *    },
 *
 * means if there are 9 arguments then 6 and 7 are enums, if there are 6
 * arguments 3 and 4 are enums
 *
 * @type {!Object.<number, !Object.<number, string>}
 */
var glValidEnumContexts = {
  // Generic setters and getters

  'enable': {1: { 0:true }},
  'disable': {1: { 0:true }},
  'getParameter': {1: { 0:true }},

  // Rendering

  'drawArrays': {3:{ 0:true }},
  'drawElements': {4:{ 0:true, 2:true }},

  // Shaders

  'createShader': {1: { 0:true }},
  'getShaderParameter': {2: { 1:true }},
  'getProgramParameter': {2: { 1:true }},
  'getShaderPrecisionFormat': {2: { 0: true, 1:true }},

  // Vertex attributes

  'getVertexAttrib': {2: { 1:true }},
  'vertexAttribPointer': {6: { 2:true }},

  // Textures

  'bindTexture': {2: { 0:true }},
  'activeTexture': {1: { 0:true }},
  'getTexParameter': {2: { 0:true, 1:true }},
  'texParameterf': {3: { 0:true, 1:true }},
  'texParameteri': {3: { 0:true, 1:true, 2:true }},
  'texImage2D': {
     9: { 0:true, 2:true, 6:true, 7:true },
     6: { 0:true, 2:true, 3:true, 4:true }
  },
  'texSubImage2D': {
    9: { 0:true, 6:true, 7:true },
    7: { 0:true, 4:true, 5:true }
  },
  'copyTexImage2D': {8: { 0:true, 2:true }},
  'copyTexSubImage2D': {8: { 0:true }},
  'generateMipmap': {1: { 0:true }},
  'compressedTexImage2D': {7: { 0: true, 2:true }},
  'compressedTexSubImage2D': {8: { 0: true, 6:true }},

  // Buffer objects

  'bindBuffer': {2: { 0:true }},
  'bufferData': {3: { 0:true, 2:true }},
  'bufferSubData': {3: { 0:true }},
  'getBufferParameter': {2: { 0:true, 1:true }},

  // Renderbuffers and framebuffers

  'pixelStorei': {2: { 0:true, 1:true }},
  'readPixels': {7: { 4:true, 5:true }},
  'bindRenderbuffer': {2: { 0:true }},
  'bindFramebuffer': {2: { 0:true }},
  'checkFramebufferStatus': {1: { 0:true }},
  'framebufferRenderbuffer': {4: { 0:true, 1:true, 2:true }},
  'framebufferTexture2D': {5: { 0:true, 1:true, 2:true }},
  'getFramebufferAttachmentParameter': {3: { 0:true, 1:true, 2:true }},
  'getRenderbufferParameter': {2: { 0:true, 1:true }},
  'renderbufferStorage': {4: { 0:true, 1:true }},

  // Frame buffer operations (clear, blend, depth test, stencil)

  'clear': {1: { 0: { 'enumBitwiseOr': ['COLOR_BUFFER_BIT', 'DEPTH_BUFFER_BIT', 'STENCIL_BUFFER_BIT'] }}},
  'depthFunc': {1: { 0:true }},
  'blendFunc': {2: { 0:true, 1:true }},
  'blendFuncSeparate': {4: { 0:true, 1:true, 2:true, 3:true }},
  'blendEquation': {1: { 0:true }},
  'blendEquationSeparate': {2: { 0:true, 1:true }},
  'stencilFunc': {3: { 0:true }},
  'stencilFuncSeparate': {4: { 0:true, 1:true }},
  'stencilMaskSeparate': {2: { 0:true }},
  'stencilOp': {3: { 0:true, 1:true, 2:true }},
  'stencilOpSeparate': {4: { 0:true, 1:true, 2:true, 3:true }},

  // Culling

  'cullFace': {1: { 0:true }},
  'frontFace': {1: { 0:true }},

  // ANGLE_instanced_arrays extension

  'drawArraysInstancedANGLE': {4: { 0:true }},
  'drawElementsInstancedANGLE': {5: { 0:true, 2:true }},

  // EXT_blend_minmax extension

  'blendEquationEXT': {1: { 0:true }}
};

/**
 * Map of numbers to names.
 * @type {Object}
 */
var glEnums = null;

/**
 * Map of names to numbers.
 * @type {Object}
 */
var enumStringToValue = null;

/**
 * Initializes this module. Safe to call more than once.
 * @param {!WebGLRenderingContext} ctx A WebGL context. If
 *    you have more than one context it doesn't matter which one
 *    you pass in, it is only used to pull out constants.
 */
function init(ctx) {
  if (glEnums == null) {
    glEnums = { };
    enumStringToValue = { };
    for (var propertyName in ctx) {
      if (typeof ctx[propertyName] == 'number') {
        glEnums[ctx[propertyName]] = propertyName;
        enumStringToValue[propertyName] = ctx[propertyName];
      }
    }
  }
}

/**
 * Checks the utils have been initialized.
 */
function checkInit() {
  if (glEnums == null) {
    throw 'WebGLDebugUtils.init(ctx) not called';
  }
}

/**
 * Returns true or false if value matches any WebGL enum
 * @param {*} value Value to check if it might be an enum.
 * @return {boolean} True if value matches one of the WebGL defined enums
 */
function mightBeEnum(value) {
  checkInit();
  return (glEnums[value] !== undefined);
}

/**
 * Gets an string version of an WebGL enum.
 *
 * Example:
 *   var str = WebGLDebugUtil.glEnumToString(ctx.getError());
 *
 * @param {number} value Value to return an enum for
 * @return {string} The string version of the enum.
 */
function glEnumToString(value) {
  checkInit();
  var name = glEnums[value];
  return (name !== undefined) ? ("gl." + name) :
      ("/*UNKNOWN WebGL ENUM*/ 0x" + value.toString(16) + "");
}

/**
 * Returns the string version of a WebGL argument.
 * Attempts to convert enum arguments to strings.
 * @param {string} functionName the name of the WebGL function.
 * @param {number} numArgs the number of arguments passed to the function.
 * @param {number} argumentIndx the index of the argument.
 * @param {*} value The value of the argument.
 * @return {string} The value as a string.
 */
function glFunctionArgToString(functionName, numArgs, argumentIndex, value) {
  var funcInfo = glValidEnumContexts[functionName];
  if (funcInfo !== undefined) {
    var funcInfo = funcInfo[numArgs];
    if (funcInfo !== undefined) {
      if (funcInfo[argumentIndex]) {
        if (typeof funcInfo[argumentIndex] === 'object' &&
            funcInfo[argumentIndex]['enumBitwiseOr'] !== undefined) {
          var enums = funcInfo[argumentIndex]['enumBitwiseOr'];
          var orResult = 0;
          var orEnums = [];
          for (var i = 0; i < enums.length; ++i) {
            var enumValue = enumStringToValue[enums[i]];
            if ((value & enumValue) !== 0) {
              orResult |= enumValue;
              orEnums.push(glEnumToString(enumValue));
            }
          }
          if (orResult === value) {
            return orEnums.join(' | ');
          } else {
            return glEnumToString(value);
          }
        } else {
          return glEnumToString(value);
        }
      }
    }
  }
  if (value === null) {
    return "null";
  } else if (value === undefined) {
    return "undefined";
  } else {
    return value.toString();
  }
}

/**
 * Converts the arguments of a WebGL function to a string.
 * Attempts to convert enum arguments to strings.
 *
 * @param {string} functionName the name of the WebGL function.
 * @param {number} args The arguments.
 * @return {string} The arguments as a string.
 */
function glFunctionArgsToString(functionName, args) {
  // apparently we can't do args.join(",");
  var argStr = "";
  var numArgs = args.length;
  for (var ii = 0; ii < numArgs; ++ii) {
    argStr += ((ii == 0) ? '' : ', ') +
        glFunctionArgToString(functionName, numArgs, ii, args[ii]);
  }
  return argStr;
};


function makePropertyWrapper(wrapper, original, propertyName) {
  //log("wrap prop: " + propertyName);
  wrapper.__defineGetter__(propertyName, function() {
    return original[propertyName];
  });
  // TODO(gmane): this needs to handle properties that take more than
  // one value?
  wrapper.__defineSetter__(propertyName, function(value) {
    //log("set: " + propertyName);
    original[propertyName] = value;
  });
}

// Makes a function that calls a function on another object.
function makeFunctionWrapper(original, functionName) {
  //log("wrap fn: " + functionName);
  var f = original[functionName];
  return function() {
    //log("call: " + functionName);
    var result = f.apply(original, arguments);
    return result;
  };
}

/**
 * Given a WebGL context returns a wrapped context that calls
 * gl.getError after every command and calls a function if the
 * result is not gl.NO_ERROR.
 *
 * @param {!WebGLRenderingContext} ctx The webgl context to
 *        wrap.
 * @param {!function(err, funcName, args): void} opt_onErrorFunc
 *        The function to call when gl.getError returns an
 *        error. If not specified the default function calls
 *        console.log with a message.
 * @param {!function(funcName, args): void} opt_onFunc The
 *        function to call when each webgl function is called.
 *        You can use this to log all calls for example.
 * @param {!WebGLRenderingContext} opt_err_ctx The webgl context
 *        to call getError on if different than ctx.
 */
function makeDebugContext(ctx, opt_onErrorFunc, opt_onFunc, opt_err_ctx) {
  opt_err_ctx = opt_err_ctx || ctx;
  init(ctx);
  opt_onErrorFunc = opt_onErrorFunc || function(err, functionName, args) {
        // apparently we can't do args.join(",");
        var argStr = "";
        var numArgs = args.length;
        for (var ii = 0; ii < numArgs; ++ii) {
          argStr += ((ii == 0) ? '' : ', ') +
              glFunctionArgToString(functionName, numArgs, ii, args[ii]);
        }
        error("WebGL error "+ glEnumToString(err) + " in "+ functionName +
              "(" + argStr + ")");
      };

  // Holds booleans for each GL error so after we get the error ourselves
  // we can still return it to the client app.
  var glErrorShadow = { };

  // Makes a function that calls a WebGL function and then calls getError.
  function makeErrorWrapper(ctx, functionName) {
    return function() {
      if (opt_onFunc) {
        opt_onFunc(functionName, arguments);
      }
      var result = ctx[functionName].apply(ctx, arguments);
      var err = opt_err_ctx.getError();
      if (err != 0) {
        glErrorShadow[err] = true;
        opt_onErrorFunc(err, functionName, arguments);
      }
      return result;
    };
  }

  // Make a an object that has a copy of every property of the WebGL context
  // but wraps all functions.
  var wrapper = {};
  for (var propertyName in ctx) {
    if (typeof ctx[propertyName] == 'function') {
      if (propertyName != 'getExtension') {
        wrapper[propertyName] = makeErrorWrapper(ctx, propertyName);
      } else {
        var wrapped = makeErrorWrapper(ctx, propertyName);
        wrapper[propertyName] = function () {
          var result = wrapped.apply(ctx, arguments);
          return makeDebugContext(result, opt_onErrorFunc, opt_onFunc, opt_err_ctx);
        };
      }
    } else {
      makePropertyWrapper(wrapper, ctx, propertyName);
    }
  }

  // Override the getError function with one that returns our saved results.
  wrapper.getError = function() {
    for (var err in glErrorShadow) {
      if (glErrorShadow.hasOwnProperty(err)) {
        if (glErrorShadow[err]) {
          glErrorShadow[err] = false;
          return err;
        }
      }
    }
    return ctx.NO_ERROR;
  };

  return wrapper;
}

function resetToInitialState(ctx) {
  var numAttribs = ctx.getParameter(ctx.MAX_VERTEX_ATTRIBS);
  var tmp = ctx.createBuffer();
  ctx.bindBuffer(ctx.ARRAY_BUFFER, tmp);
  for (var ii = 0; ii < numAttribs; ++ii) {
    ctx.disableVertexAttribArray(ii);
    ctx.vertexAttribPointer(ii, 4, ctx.FLOAT, false, 0, 0);
    ctx.vertexAttrib1f(ii, 0);
  }
  ctx.deleteBuffer(tmp);

  var numTextureUnits = ctx.getParameter(ctx.MAX_TEXTURE_IMAGE_UNITS);
  for (var ii = 0; ii < numTextureUnits; ++ii) {
    ctx.activeTexture(ctx.TEXTURE0 + ii);
    ctx.bindTexture(ctx.TEXTURE_CUBE_MAP, null);
    ctx.bindTexture(ctx.TEXTURE_2D, null);
  }

  ctx.activeTexture(ctx.TEXTURE0);
  ctx.useProgram(null);
  ctx.bindBuffer(ctx.ARRAY_BUFFER, null);
  ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, null);
  ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);
  ctx.bindRenderbuffer(ctx.RENDERBUFFER, null);
  ctx.disable(ctx.BLEND);
  ctx.disable(ctx.CULL_FACE);
  ctx.disable(ctx.DEPTH_TEST);
  ctx.disable(ctx.DITHER);
  ctx.disable(ctx.SCISSOR_TEST);
  ctx.blendColor(0, 0, 0, 0);
  ctx.blendEquation(ctx.FUNC_ADD);
  ctx.blendFunc(ctx.ONE, ctx.ZERO);
  ctx.clearColor(0, 0, 0, 0);
  ctx.clearDepth(1);
  ctx.clearStencil(-1);
  ctx.colorMask(true, true, true, true);
  ctx.cullFace(ctx.BACK);
  ctx.depthFunc(ctx.LESS);
  ctx.depthMask(true);
  ctx.depthRange(0, 1);
  ctx.frontFace(ctx.CCW);
  ctx.hint(ctx.GENERATE_MIPMAP_HINT, ctx.DONT_CARE);
  ctx.lineWidth(1);
  ctx.pixelStorei(ctx.PACK_ALIGNMENT, 4);
  ctx.pixelStorei(ctx.UNPACK_ALIGNMENT, 4);
  ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, false);
  ctx.pixelStorei(ctx.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  // TODO: Delete this IF.
  if (ctx.UNPACK_COLORSPACE_CONVERSION_WEBGL) {
    ctx.pixelStorei(ctx.UNPACK_COLORSPACE_CONVERSION_WEBGL, ctx.BROWSER_DEFAULT_WEBGL);
  }
  ctx.polygonOffset(0, 0);
  ctx.sampleCoverage(1, false);
  ctx.scissor(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.stencilFunc(ctx.ALWAYS, 0, 0xFFFFFFFF);
  ctx.stencilMask(0xFFFFFFFF);
  ctx.stencilOp(ctx.KEEP, ctx.KEEP, ctx.KEEP);
  ctx.viewport(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT | ctx.STENCIL_BUFFER_BIT);

  // TODO: This should NOT be needed but Firefox fails with 'hint'
  while(ctx.getError());
}

function makeLostContextSimulatingCanvas(canvas) {
  var unwrappedContext_;
  var wrappedContext_;
  var onLost_ = [];
  var onRestored_ = [];
  var wrappedContext_ = {};
  var contextId_ = 1;
  var contextLost_ = false;
  var resourceId_ = 0;
  var resourceDb_ = [];
  var numCallsToLoseContext_ = 0;
  var numCalls_ = 0;
  var canRestore_ = false;
  var restoreTimeout_ = 0;

  // Holds booleans for each GL error so can simulate errors.
  var glErrorShadow_ = { };

  canvas.getContext = function(f) {
    return function() {
      var ctx = f.apply(canvas, arguments);
      // Did we get a context and is it a WebGL context?
      if (ctx instanceof WebGLRenderingContext) {
        if (ctx != unwrappedContext_) {
          if (unwrappedContext_) {
            throw "got different context"
          }
          unwrappedContext_ = ctx;
          wrappedContext_ = makeLostContextSimulatingContext(unwrappedContext_);
        }
        return wrappedContext_;
      }
      return ctx;
    }
  }(canvas.getContext);

  function wrapEvent(listener) {
    if (typeof(listener) == "function") {
      return listener;
    } else {
      return function(info) {
        listener.handleEvent(info);
      }
    }
  }

  var addOnContextLostListener = function(listener) {
    onLost_.push(wrapEvent(listener));
  };

  var addOnContextRestoredListener = function(listener) {
    onRestored_.push(wrapEvent(listener));
  };


  function wrapAddEventListener(canvas) {
    var f = canvas.addEventListener;
    canvas.addEventListener = function(type, listener, bubble) {
      switch (type) {
        case 'webglcontextlost':
          addOnContextLostListener(listener);
          break;
        case 'webglcontextrestored':
          addOnContextRestoredListener(listener);
          break;
        default:
          f.apply(canvas, arguments);
      }
    };
  }

  wrapAddEventListener(canvas);

  canvas.loseContext = function() {
    if (!contextLost_) {
      contextLost_ = true;
      numCallsToLoseContext_ = 0;
      ++contextId_;
      while (unwrappedContext_.getError());
      clearErrors();
      glErrorShadow_[unwrappedContext_.CONTEXT_LOST_WEBGL] = true;
      var event = makeWebGLContextEvent("context lost");
      var callbacks = onLost_.slice();
      setTimeout(function() {
          //log("numCallbacks:" + callbacks.length);
          for (var ii = 0; ii < callbacks.length; ++ii) {
            //log("calling callback:" + ii);
            callbacks[ii](event);
          }
          if (restoreTimeout_ >= 0) {
            setTimeout(function() {
                canvas.restoreContext();
              }, restoreTimeout_);
          }
        }, 0);
    }
  };

  canvas.restoreContext = function() {
    if (contextLost_) {
      if (onRestored_.length) {
        setTimeout(function() {
            if (!canRestore_) {
              throw "can not restore. webglcontestlost listener did not call event.preventDefault";
            }
            freeResources();
            resetToInitialState(unwrappedContext_);
            contextLost_ = false;
            numCalls_ = 0;
            canRestore_ = false;
            var callbacks = onRestored_.slice();
            var event = makeWebGLContextEvent("context restored");
            for (var ii = 0; ii < callbacks.length; ++ii) {
              callbacks[ii](event);
            }
          }, 0);
      }
    }
  };

  canvas.loseContextInNCalls = function(numCalls) {
    if (contextLost_) {
      throw "You can not ask a lost contet to be lost";
    }
    numCallsToLoseContext_ = numCalls_ + numCalls;
  };

  canvas.getNumCalls = function() {
    return numCalls_;
  };

  canvas.setRestoreTimeout = function(timeout) {
    restoreTimeout_ = timeout;
  };

  function isWebGLObject(obj) {
    //return false;
    return (obj instanceof WebGLBuffer ||
            obj instanceof WebGLFramebuffer ||
            obj instanceof WebGLProgram ||
            obj instanceof WebGLRenderbuffer ||
            obj instanceof WebGLShader ||
            obj instanceof WebGLTexture);
  }

  function checkResources(args) {
    for (var ii = 0; ii < args.length; ++ii) {
      var arg = args[ii];
      if (isWebGLObject(arg)) {
        return arg.__webglDebugContextLostId__ == contextId_;
      }
    }
    return true;
  }

  function clearErrors() {
    var k = Object.keys(glErrorShadow_);
    for (var ii = 0; ii < k.length; ++ii) {
      delete glErrorShadow_[k];
    }
  }

  function loseContextIfTime() {
    ++numCalls_;
    if (!contextLost_) {
      if (numCallsToLoseContext_ == numCalls_) {
        canvas.loseContext();
      }
    }
  }

  // Makes a function that simulates WebGL when out of context.
  function makeLostContextFunctionWrapper(ctx, functionName) {
    var f = ctx[functionName];
    return function() {
      // log("calling:" + functionName);
      // Only call the functions if the context is not lost.
      loseContextIfTime();
      if (!contextLost_) {
        //if (!checkResources(arguments)) {
        //  glErrorShadow_[wrappedContext_.INVALID_OPERATION] = true;
        //  return;
        //}
        var result = f.apply(ctx, arguments);
        return result;
      }
    };
  }

  function freeResources() {
    for (var ii = 0; ii < resourceDb_.length; ++ii) {
      var resource = resourceDb_[ii];
      if (resource instanceof WebGLBuffer) {
        unwrappedContext_.deleteBuffer(resource);
      } else if (resource instanceof WebGLFramebuffer) {
        unwrappedContext_.deleteFramebuffer(resource);
      } else if (resource instanceof WebGLProgram) {
        unwrappedContext_.deleteProgram(resource);
      } else if (resource instanceof WebGLRenderbuffer) {
        unwrappedContext_.deleteRenderbuffer(resource);
      } else if (resource instanceof WebGLShader) {
        unwrappedContext_.deleteShader(resource);
      } else if (resource instanceof WebGLTexture) {
        unwrappedContext_.deleteTexture(resource);
      }
    }
  }

  function makeWebGLContextEvent(statusMessage) {
    return {
      statusMessage: statusMessage,
      preventDefault: function() {
          canRestore_ = true;
        }
    };
  }

  return canvas;

  function makeLostContextSimulatingContext(ctx) {
    // copy all functions and properties to wrapper
    for (var propertyName in ctx) {
      if (typeof ctx[propertyName] == 'function') {
         wrappedContext_[propertyName] = makeLostContextFunctionWrapper(
             ctx, propertyName);
       } else {
         makePropertyWrapper(wrappedContext_, ctx, propertyName);
       }
    }

    // Wrap a few functions specially.
    wrappedContext_.getError = function() {
      loseContextIfTime();
      if (!contextLost_) {
        var err;
        while (err = unwrappedContext_.getError()) {
          glErrorShadow_[err] = true;
        }
      }
      for (var err in glErrorShadow_) {
        if (glErrorShadow_[err]) {
          delete glErrorShadow_[err];
          return err;
        }
      }
      return wrappedContext_.NO_ERROR;
    };

    var creationFunctions = [
      "createBuffer",
      "createFramebuffer",
      "createProgram",
      "createRenderbuffer",
      "createShader",
      "createTexture"
    ];
    for (var ii = 0; ii < creationFunctions.length; ++ii) {
      var functionName = creationFunctions[ii];
      wrappedContext_[functionName] = function(f) {
        return function() {
          loseContextIfTime();
          if (contextLost_) {
            return null;
          }
          var obj = f.apply(ctx, arguments);
          obj.__webglDebugContextLostId__ = contextId_;
          resourceDb_.push(obj);
          return obj;
        };
      }(ctx[functionName]);
    }

    var functionsThatShouldReturnNull = [
      "getActiveAttrib",
      "getActiveUniform",
      "getBufferParameter",
      "getContextAttributes",
      "getAttachedShaders",
      "getFramebufferAttachmentParameter",
      "getParameter",
      "getProgramParameter",
      "getProgramInfoLog",
      "getRenderbufferParameter",
      "getShaderParameter",
      "getShaderInfoLog",
      "getShaderSource",
      "getTexParameter",
      "getUniform",
      "getUniformLocation",
      "getVertexAttrib"
    ];
    for (var ii = 0; ii < functionsThatShouldReturnNull.length; ++ii) {
      var functionName = functionsThatShouldReturnNull[ii];
      wrappedContext_[functionName] = function(f) {
        return function() {
          loseContextIfTime();
          if (contextLost_) {
            return null;
          }
          return f.apply(ctx, arguments);
        }
      }(wrappedContext_[functionName]);
    }

    var isFunctions = [
      "isBuffer",
      "isEnabled",
      "isFramebuffer",
      "isProgram",
      "isRenderbuffer",
      "isShader",
      "isTexture"
    ];
    for (var ii = 0; ii < isFunctions.length; ++ii) {
      var functionName = isFunctions[ii];
      wrappedContext_[functionName] = function(f) {
        return function() {
          loseContextIfTime();
          if (contextLost_) {
            return false;
          }
          return f.apply(ctx, arguments);
        }
      }(wrappedContext_[functionName]);
    }

    wrappedContext_.checkFramebufferStatus = function(f) {
      return function() {
        loseContextIfTime();
        if (contextLost_) {
          return wrappedContext_.FRAMEBUFFER_UNSUPPORTED;
        }
        return f.apply(ctx, arguments);
      };
    }(wrappedContext_.checkFramebufferStatus);

    wrappedContext_.getAttribLocation = function(f) {
      return function() {
        loseContextIfTime();
        if (contextLost_) {
          return -1;
        }
        return f.apply(ctx, arguments);
      };
    }(wrappedContext_.getAttribLocation);

    wrappedContext_.getVertexAttribOffset = function(f) {
      return function() {
        loseContextIfTime();
        if (contextLost_) {
          return 0;
        }
        return f.apply(ctx, arguments);
      };
    }(wrappedContext_.getVertexAttribOffset);

    wrappedContext_.isContextLost = function() {
      return contextLost_;
    };

    return wrappedContext_;
  }
}

return {
  /**
   * Initializes this module. Safe to call more than once.
   * @param {!WebGLRenderingContext} ctx A WebGL context. If
   *    you have more than one context it doesn't matter which one
   *    you pass in, it is only used to pull out constants.
   */
  'init': init,

  /**
   * Returns true or false if value matches any WebGL enum
   * @param {*} value Value to check if it might be an enum.
   * @return {boolean} True if value matches one of the WebGL defined enums
   */
  'mightBeEnum': mightBeEnum,

  /**
   * Gets an string version of an WebGL enum.
   *
   * Example:
   *   WebGLDebugUtil.init(ctx);
   *   var str = WebGLDebugUtil.glEnumToString(ctx.getError());
   *
   * @param {number} value Value to return an enum for
   * @return {string} The string version of the enum.
   */
  'glEnumToString': glEnumToString,

  /**
   * Converts the argument of a WebGL function to a string.
   * Attempts to convert enum arguments to strings.
   *
   * Example:
   *   WebGLDebugUtil.init(ctx);
   *   var str = WebGLDebugUtil.glFunctionArgToString('bindTexture', 2, 0, gl.TEXTURE_2D);
   *
   * would return 'TEXTURE_2D'
   *
   * @param {string} functionName the name of the WebGL function.
   * @param {number} numArgs The number of arguments
   * @param {number} argumentIndx the index of the argument.
   * @param {*} value The value of the argument.
   * @return {string} The value as a string.
   */
  'glFunctionArgToString': glFunctionArgToString,

  /**
   * Converts the arguments of a WebGL function to a string.
   * Attempts to convert enum arguments to strings.
   *
   * @param {string} functionName the name of the WebGL function.
   * @param {number} args The arguments.
   * @return {string} The arguments as a string.
   */
  'glFunctionArgsToString': glFunctionArgsToString,

  /**
   * Given a WebGL context returns a wrapped context that calls
   * gl.getError after every command and calls a function if the
   * result is not NO_ERROR.
   *
   * You can supply your own function if you want. For example, if you'd like
   * an exception thrown on any GL error you could do this
   *
   *    function throwOnGLError(err, funcName, args) {
   *      throw WebGLDebugUtils.glEnumToString(err) +
   *            " was caused by call to " + funcName;
   *    };
   *
   *    ctx = WebGLDebugUtils.makeDebugContext(
   *        canvas.getContext("webgl"), throwOnGLError);
   *
   * @param {!WebGLRenderingContext} ctx The webgl context to wrap.
   * @param {!function(err, funcName, args): void} opt_onErrorFunc The function
   *     to call when gl.getError returns an error. If not specified the default
   *     function calls console.log with a message.
   * @param {!function(funcName, args): void} opt_onFunc The
   *     function to call when each webgl function is called. You
   *     can use this to log all calls for example.
   */
  'makeDebugContext': makeDebugContext,

  /**
   * Given a canvas element returns a wrapped canvas element that will
   * simulate lost context. The canvas returned adds the following functions.
   *
   * loseContext:
   *   simulates a lost context event.
   *
   * restoreContext:
   *   simulates the context being restored.
   *
   * lostContextInNCalls:
   *   loses the context after N gl calls.
   *
   * getNumCalls:
   *   tells you how many gl calls there have been so far.
   *
   * setRestoreTimeout:
   *   sets the number of milliseconds until the context is restored
   *   after it has been lost. Defaults to 0. Pass -1 to prevent
   *   automatic restoring.
   *
   * @param {!Canvas} canvas The canvas element to wrap.
   */
  'makeLostContextSimulatingCanvas': makeLostContextSimulatingCanvas,

  /**
   * Resets a context to the initial state.
   * @param {!WebGLRenderingContext} ctx The webgl context to
   *     reset.
   */
  'resetToInitialState': resetToInitialState
};

}();

module.exports = WebGLDebugUtils;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],27:[function(require,module,exports){
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

var EXTRA_OUT_OF_SIZE = 100;
ObjectBase.prototype.isOutOfStage = function( ) {
	if(this.x() + EXTRA_OUT_OF_SIZE < 0 ||
	   this.y() + EXTRA_OUT_OF_SIZE < 0 ||
	   this.x() > this.core.width  + EXTRA_OUT_OF_SIZE ||
	   this.y() > this.core.height + EXTRA_OUT_OF_SIZE
	  ) {
		return true;
	}

	return false;
};





module.exports = ObjectBase;


},{"../util":40}],28:[function(require,module,exports){
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

PoolManager.prototype.removeOutOfStageObjects = function() {
	for(var id in this.objects) {
		if(this.objects[id].isOutOfStage()) {
			this.remove(id);
		}
	}
};




module.exports = PoolManager;

},{"../util":40,"./base":27}],29:[function(require,module,exports){
'use strict';

// TODO: add pooling logic
// TODO: split manager class and pool manager class
var base_object = require('./base');
var util = require('../util');
var glmat = require('gl-matrix');

var CONSTANT_3D = require('../constant_3d').SPRITE3D;

var PoolManager3D = function(scene, Class) {
	base_object.apply(this, arguments);

	this.Class = Class;
	this.objects = {};

	this.vertices = [];
	this.coordinates = [];
	this.indices = [];
	this.colors = [];

	var gl = this.core.gl;
	this.vBuffer = gl.createBuffer();
	this.cBuffer = gl.createBuffer();
	this.iBuffer = gl.createBuffer();
	this.aBuffer = gl.createBuffer();

	this.mvMatrix = glmat.mat4.create();
	this.pMatrix = glmat.mat4.create();
};
util.inherit(PoolManager3D, base_object);

PoolManager3D.prototype.init = function() {
	base_object.prototype.init.apply(this, arguments);

	this.objects = {};

	this._initmvpMatrix();

};
PoolManager3D.prototype._initmvpMatrix = function() {
	// The upper left corner is the canvas origin
	// so reduce canvas width and add canvas height
	glmat.mat4.identity(this.mvMatrix);
	glmat.mat4.translate(this.mvMatrix, this.mvMatrix, [-this.core.width/2, this.core.height/2, 0]);

	this._setOrthographicProjection();
};
PoolManager3D.prototype._setOrthographicProjection = function() {
	glmat.mat4.identity(this.pMatrix);
	var near = 0.1;
	var far  = 10.0;
	glmat.mat4.ortho(this.pMatrix,
		-this.core.width/2,
		this.core.width/2,
		-this.core.height/2,
		this.core.height/2,
		near, far);
};

PoolManager3D.prototype.beforeDraw = function(){
	base_object.prototype.beforeDraw.apply(this, arguments);

	for(var id in this.objects) {
		this.objects[id].beforeDraw();
	}

	// update: vertices, indices, texture coordinates, colors
	this._updateAttributes();
};

// update: vertices, indices, texture coordinates, colors
PoolManager3D.prototype._updateAttributes = function() {
	this._resetAttributes();

	var i = 0;
	for(var id in this.objects) {
		var object = this.objects[id];

		if(!object.isShow()){
			continue;
		}

		var j;
		for(j = 0; j < CONSTANT_3D.V_SIZE; j++) {
			this.vertices[i * CONSTANT_3D.V_SIZE + j] = object.vertices[j];
		}

		for(j = 0; j < CONSTANT_3D.C_SIZE; j++) {
			this.coordinates[i * CONSTANT_3D.C_SIZE + j] = object.coordinates[j];
		}

		for(j = 0; j < CONSTANT_3D.I_SIZE; j++) {
			this.indices[i * CONSTANT_3D.I_SIZE + j] = i * CONSTANT_3D.V_ITEM_NUM + object.indices[j];
		}

		for(j = 0; j < CONSTANT_3D.A_SIZE; j++) {
			this.colors[i * CONSTANT_3D.A_SIZE + j] = object.colors[j];
		}

		i++;
	}
};

PoolManager3D.prototype._resetAttributes = function() {
	this.vertices.length    = 0;
	this.coordinates.length = 0;
	this.indices.length     = 0;
	this.colors.length      = 0;
};




PoolManager3D.prototype.draw = function(){
	base_object.prototype.draw.apply(this, arguments);

	// There is no objects.
	if (this.vertices.length === 0) return;

	var gl = this.core.gl;
	var shader = this.shader();

	gl.useProgram(shader.shader_program);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.enable(gl.BLEND);
	gl.disable(gl.DEPTH_TEST);

	this._setupAttribute("aVertexPosition", this.vBuffer, new Float32Array(this.vertices), CONSTANT_3D.V_ITEM_SIZE);
	this._setupAttribute("aTextureCoordinates", this.cBuffer, new Float32Array(this.coordinates), CONSTANT_3D.C_ITEM_SIZE);
	this._setupAttribute("aColor", this.aBuffer, new Float32Array(this.colors), CONSTANT_3D.A_ITEM_SIZE);

	// TODO: use some types of texture
	for(var id in this.objects) {
		var texture = this.objects[id].texture;
		this._setupTexture("uSampler", 0, texture);
		break;
	}

	gl.uniformMatrix4fv(shader.uniform_locations.uPMatrix,  false, this.pMatrix);
	gl.uniformMatrix4fv(shader.uniform_locations.uMVMatrix, false, this.mvMatrix);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);

	// TODO: how to implement?
	//this.setupAdditionalVariables();

	gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);

	/*
	 * TODO:
	 * reflect
	 * scaling
	*/
};

PoolManager3D.prototype._setupAttribute = function(attr_name, buffer, data, size){
	var gl = this.core.gl;
	var shader = this.shader();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
	gl.enableVertexAttribArray(shader.attribute_locations[attr_name]);
	gl.vertexAttribPointer(shader.attribute_locations[attr_name], size, gl.FLOAT, false, 0, 0);
};
PoolManager3D.prototype._setupTexture = function(uniform_name, unit_no, texture){
	var gl = this.core.gl;
	var shader = this.shader();
	gl.activeTexture(gl["TEXTURE" + unit_no]);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.uniform1i(shader.uniform_locations[uniform_name], unit_no);
};



PoolManager3D.prototype.afterDraw = function(){
	base_object.prototype.afterDraw.apply(this, arguments);
	for(var id in this.objects) {
		this.objects[id].afterDraw();
	}
};

PoolManager3D.prototype.create = function() {
	var object = new this.Class(this.scene);
	object.init.apply(object, arguments);

	this.objects[object.id] = object;

	return object;
};
PoolManager3D.prototype.remove = function(id) {
	delete this.objects[id];
};

PoolManager3D.prototype.checkCollisionWithObject = function(obj1) {
	for(var id in this.objects) {
		var obj2 = this.objects[id];
		if(obj1.checkCollision(obj2)) {
			obj1.onCollision(obj2);
			obj2.onCollision(obj1);
		}
	}
};

PoolManager3D.prototype.checkCollisionWithManager = function(manager) {
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

PoolManager3D.prototype.removeOutOfStageObjects = function() {
	for(var id in this.objects) {
		if(this.objects[id].isOutOfStage()) {
			this.remove(id);
		}
	}
};

PoolManager3D.prototype.shader = function(){
	return this.core.sprite_3d_shader;
};




module.exports = PoolManager3D;

},{"../constant_3d":13,"../util":40,"./base":27,"gl-matrix":16}],30:[function(require,module,exports){
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

},{"../util":40,"./base":27}],31:[function(require,module,exports){
'use strict';
var base_object = require('./base');
var util = require('../util');
var CONSTANT_3D = require('../constant_3d').SPRITE3D;
var glmat = require('gl-matrix');

var Sprite3d = function(scene) {
	base_object.apply(this, arguments);

	this.current_sprite_index = 0;

	this._z = 0;

	this.vertices = [];
	this.coordinates = [];
	this.indices = [];
	this.colors = [];

	this.vertices.length    = CONSTANT_3D.V_SIZE;
	this.coordinates.length = CONSTANT_3D.C_SIZE;
	this.indices.length     = CONSTANT_3D.I_SIZE;
	this.colors.length      = CONSTANT_3D.A_SIZE;

	var gl = this.core.gl;
	this.vBuffer = gl.createBuffer();
	this.cBuffer = gl.createBuffer();
	this.iBuffer = gl.createBuffer();
	this.aBuffer = gl.createBuffer();

	this.texture = null;

	this.mvMatrix = glmat.mat4.create();
	this.pMatrix = glmat.mat4.create();
};
util.inherit(Sprite3d, base_object);

Sprite3d.prototype.init = function(){
	base_object.prototype.init.apply(this, arguments);

	this.current_sprite_index = 0;

	this._initmvpMatrix();
	this._initVertices();
	this._initCoordinates();
	this._initIndices();
	this._initColors();

	this._initTexture();

};

Sprite3d.prototype._initmvpMatrix = function() {
	// The upper left corner is the canvas origin
	// so reduce canvas width and add canvas height
	glmat.mat4.identity(this.mvMatrix);
	glmat.mat4.translate(this.mvMatrix, this.mvMatrix, [-this.core.width/2, this.core.height/2, 0]);

	this._setOrthographicProjection();
};
Sprite3d.prototype._initVertices = function() {
	var w = this.spriteWidth()/2;
	var h = this.spriteHeight()/2;

	this.vertices[0]  = -w;
	this.vertices[1]  = -h;
	this.vertices[2]  = -1.0;

	this.vertices[3]  =  w;
	this.vertices[4]  = -h;
	this.vertices[5]  = -1.0;

	this.vertices[6]  =  w;
	this.vertices[7]  =  h;
	this.vertices[8]  = -1.0;

	this.vertices[9]  = -w;
	this.vertices[10] =  h;
	this.vertices[11] = -1.0;
};

Sprite3d.prototype._initCoordinates = function() {

	var image = this.core.image_loader.getImage(this.spriteName());

	var w = this.spriteWidth() / image.width;
	var h = this.spriteHeight() / image.height;

	var x1 = w * this.spriteIndexX();
	var y1 = h * this.spriteIndexY();
	var x2 = x1 + w;
	var y2 = y1 + h;

	this.coordinates[0] = x1;
	this.coordinates[1] = y2;

	this.coordinates[2] = x2;
	this.coordinates[3] = y2;

	this.coordinates[4] = x2;
	this.coordinates[5] = y1;

	this.coordinates[6] = x1;
	this.coordinates[7] = y1;
};

Sprite3d.prototype._initIndices = function() {
	this.indices[0] = 0;
	this.indices[1] = 1;
	this.indices[2] = 2;

	this.indices[3] = 0;
	this.indices[4] = 2;
	this.indices[5] = 3;
};

Sprite3d.prototype._initColors = function() {
	this.colors[0] = 1.0;
	this.colors[1] = 1.0;
	this.colors[2] = 1.0;
	this.colors[3] = 1.0;

	this.colors[4] = 1.0;
	this.colors[5] = 1.0;
	this.colors[6] = 1.0;
	this.colors[7] = 1.0;

	this.colors[8] = 1.0;
	this.colors[9] = 1.0;
	this.colors[10] = 1.0;
	this.colors[11] = 1.0;

	this.colors[12] = 1.0;
	this.colors[13] = 1.0;
	this.colors[14] = 1.0;
	this.colors[15] = 1.0;
};

Sprite3d.prototype._initTexture = function() {
	var gl = this.core.gl;
	var image = this.core.image_loader.getImage(this.spriteName());

	var texture = gl.createTexture();

	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	gl.bindTexture(gl.TEXTURE_2D, null);

	this.texture = texture;
};
Sprite3d.prototype._setOrthographicProjection = function() {
	glmat.mat4.identity(this.pMatrix);
	var near = 0.1;
	var far  = 10.0;
	glmat.mat4.ortho(this.pMatrix,
		-this.core.width/2,
		this.core.width/2,
		-this.core.height/2,
		this.core.height/2,
		near, far);
};




Sprite3d.prototype.beforeDraw = function(){
	base_object.prototype.beforeDraw.apply(this, arguments);
	// animation sprite
	if(this.frame_count % this.spriteAnimationSpan() === 0) {
		this.current_sprite_index++;
		if(this.current_sprite_index >= this.spriteIndices().length) {
			this.current_sprite_index = 0;
		}
	}

	// update vertices property
	this._initVertices();
	this._initCoordinates();
	this._translate();
	// TODO: rotate
	//this._rotate();
};


Sprite3d.prototype._translate = function() {
	for(var i = 0; i < CONSTANT_3D.V_ITEM_NUM; i++) {
		this.vertices[i * CONSTANT_3D.V_ITEM_SIZE + 0] += this.x();
		this.vertices[i * CONSTANT_3D.V_ITEM_SIZE + 1] -= this.y();
		this.vertices[i * CONSTANT_3D.V_ITEM_SIZE + 2] += this.z();
	}
};

Sprite3d.prototype._rotate = function() {
	var radian = this._getRadian();
	for(var i = 0; i < CONSTANT_3D.V_ITEM_NUM; i++) {
		var x = this.vertices[i * CONSTANT_3D.V_ITEM_SIZE + 0];
		var y = this.vertices[i * CONSTANT_3D.V_ITEM_SIZE + 1];

		this.vertices[i * CONSTANT_3D.V_ITEM_SIZE + 0] = x * Math.cos(radian) - y * Math.sin(radian);
		this.vertices[i * CONSTANT_3D.V_ITEM_SIZE + 1] = x * Math.sin(radian) + y * Math.cos(radian);
	}
};

Sprite3d.prototype._getRadian = function() {
	var theta = this.velocity.theta;
	return util.thetaToRadian(theta);
};

Sprite3d.prototype.draw = function(){
	if(this.isShow()) {
		var gl = this.core.gl;

		var shader = this.shader();

		gl.useProgram(shader.shader_program);

		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.enable(gl.BLEND);
		gl.disable(gl.DEPTH_TEST);

		this._setupAttribute("aVertexPosition", this.vBuffer, new Float32Array(this.vertices), CONSTANT_3D.V_ITEM_SIZE);
		this._setupAttribute("aTextureCoordinates", this.cBuffer, new Float32Array(this.coordinates), CONSTANT_3D.C_ITEM_SIZE);
		this._setupAttribute("aColor", this.aBuffer, new Float32Array(this.colors), CONSTANT_3D.A_ITEM_SIZE);

		this._setupTexture("uSampler", 0, this.texture);

		gl.uniformMatrix4fv(shader.uniform_locations.uPMatrix,  false, this.pMatrix);
		gl.uniformMatrix4fv(shader.uniform_locations.uMVMatrix, false, this.mvMatrix);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);

		// inherit class may implement this.
		this.setupAdditionalVariables();

		gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);

		/*
		 * TODO:
		 * reflect
		 * scaling
		*/
	}

	// draw sub objects(even if this object is not show)
	base_object.prototype.draw.apply(this, arguments);
};

Sprite3d.prototype._setupAttribute = function(attr_name, buffer, data, size){
	var gl = this.core.gl;
	var shader = this.shader();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
	gl.enableVertexAttribArray(shader.attribute_locations[attr_name]);
	gl.vertexAttribPointer(shader.attribute_locations[attr_name], size, gl.FLOAT, false, 0, 0);
};
Sprite3d.prototype._setupTexture = function(uniform_name, unit_no, texture){
	var gl = this.core.gl;
	var shader = this.shader();
	gl.activeTexture(gl["TEXTURE" + unit_no]);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.uniform1i(shader.uniform_locations[uniform_name], unit_no);
};




Sprite3d.prototype.z = function(val) {
	if (typeof val !== 'undefined') { this._z = val; }
	return this._z;
};

Sprite3d.prototype.shader = function(){
	return this.core.sprite_3d_shader;
};

// setup additional variables for shader(attributes, uniforms)
Sprite3d.prototype.setupAdditionalVariables = function(){


};






Sprite3d.prototype.spriteName = function(){
	throw new Error("spriteName method must be overridden.");
};
Sprite3d.prototype.spriteIndexX = function(){
	return this.spriteIndices()[this.current_sprite_index].x;
};
Sprite3d.prototype.spriteIndexY = function(){
	return this.spriteIndices()[this.current_sprite_index].y;
};
Sprite3d.prototype.width = function(){
	return this.spriteWidth() * this.scaleWidth();
};
Sprite3d.prototype.height = function(){
	return this.spriteHeight() * this.scaleHeight();
};




Sprite3d.prototype.isShow = function(){
	return true;
};


Sprite3d.prototype.spriteAnimationSpan = function(){
	return 0;
};
Sprite3d.prototype.spriteIndices = function(){
	return [{x: 0, y: 0}];
};
Sprite3d.prototype.spriteWidth = function(){
	return 0;
};
Sprite3d.prototype.spriteHeight = function(){
	return 0;
};
Sprite3d.prototype.rotateAdjust = function(){
	return 0;
};

Sprite3d.prototype.scaleWidth = function(){
	return 1;
};
Sprite3d.prototype.scaleHeight = function(){
	return 1;
};
Sprite3d.prototype.isReflect = function(){
	return false;
};



module.exports = Sprite3d;

},{"../constant_3d":13,"../util":40,"./base":27,"gl-matrix":16}],32:[function(require,module,exports){
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


},{}],33:[function(require,module,exports){
'use strict';

// loading scene

var base_scene = require('./base');
var util = require('../util');

var SceneLoading = function(core) {
	base_scene.apply(this, arguments);

	// go if the all assets loading is done.
	this.next_scene_name = null;
};
util.inherit(SceneLoading, base_scene);

SceneLoading.prototype.init = function(assets, next_scene_name) {
	base_scene.prototype.init.apply(this, arguments);

	// assets
	var images = assets.images || [];
	var sounds = assets.sounds || [];
	var bgms   = assets.bgms   || [];

	// go if the all assets loading is done.
	this.next_scene_name = next_scene_name;

	for (var key in images) {
		this.core.image_loader.loadImage(key, images[key]);
	}

	for (var key2 in sounds) {
		var conf2 = sounds[key2];
		this.core.audio_loader.loadSound(key2, conf2.path, conf2.volume);
	}

	for (var key3 in bgms) {
		var conf3 = bgms[key3];
		this.core.audio_loader.loadBGM(key3, conf3.path, 1.0, conf3.loopStart, conf3.loopEnd);
	}
};

SceneLoading.prototype.beforeDraw = function() {
	base_scene.prototype.beforeDraw.apply(this, arguments);

	// TODO: not wait font loading if no font is ready to load
	//if (this.core.image_loader.isAllLoaded() && this.core.audio_loader.isAllLoaded() && this.core.font_loader.isAllLoaded()) {
	if (this.core.image_loader.isAllLoaded() && this.core.audio_loader.isAllLoaded()) {
		this.notifyAllLoaded();
	}
};

SceneLoading.prototype.progress = function(){
	var progress = (this.core.audio_loader.progress() + this.core.image_loader.progress() + this.core.font_loader.progress()) / 3;
	return progress;
};

SceneLoading.prototype.draw = function(){
	base_scene.prototype.draw.apply(this, arguments);
};
SceneLoading.prototype.notifyAllLoaded = function(){
	if (this.next_scene_name) {
		this.core.changeScene(this.next_scene_name);
	}
};


module.exports = SceneLoading;

},{"../util":40,"./base":32}],34:[function(require,module,exports){
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

	this._is_background_changed = false;
	this.background = null;

	this.char_list = "";
	this.char_idx = 0;

	this.is_enable_printing_message = true;

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

	this._is_background_changed = false;
	this.background = null;

	this.char_list = "";
	this.char_idx = 0;

	this.is_enable_printing_message = true;

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

	this._showBackground(script);

	if(script.serif) {
		this._printMessage(script.serif);
	}
	else {
		// If serif is empty, show chara without talking and next
		this.next();
	}
};

SerifManager.prototype._showBackground = function(script) {
	this._is_background_changed = false;
	if(script.background) {
		if (this.background !== script.background) {
			this._is_background_changed = true;
		}

		this.background  = script.background;
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
	self._cancelPrintMessage();

	// setup to show message
	self.char_list = message.split("");
	self.char_idx = 0;

	// clear showing message
	self.line_num = 0;
	self.printing_lines = [];

	this._startPrintMessage();
};

SerifManager.prototype._startPrintMessage = function () {
	var self = this;
	var char_length = self.char_list.length;
	if (self.char_idx >= char_length) return;

	// typography speed
	var speed = 10;

	if(this.is_enable_printing_message) {
		var ch = self.char_list[self.char_idx];
		self.char_idx++;

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
	}

	self.timeoutID = setTimeout(self._startPrintMessage.bind(self), speed);
};

SerifManager.prototype._cancelPrintMessage = function () {
	var self = this;
	if(self.timeoutID !== null) {
		clearTimeout(self.timeoutID);
		self.timeoutID = null;
	}
};

SerifManager.prototype.startPrintMessage = function () {
	this.is_enable_printing_message = true;
};
SerifManager.prototype.cancelPrintMessage = function () {
	this.is_enable_printing_message = false;
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
SerifManager.prototype.background_image = function () {
	return this.background;
};
SerifManager.prototype.is_background_changed = function () {
	return this._is_background_changed;
};





SerifManager.prototype.lines = function () {
	return this.printing_lines;
};

module.exports = SerifManager;

},{}],35:[function(require,module,exports){
module.exports = "precision mediump float;\nuniform sampler2D uSampler;\nvarying vec2 vTextureCoordinates;\nvarying vec4 vColor;\n\nvoid main() {\n\tvec4 textureColor = texture2D(uSampler, vTextureCoordinates);\n\tgl_FragColor = textureColor * vColor;\n}\n\n";

},{}],36:[function(require,module,exports){
module.exports = "attribute vec3 aVertexPosition;\nattribute vec2 aTextureCoordinates;\nattribute vec4 aColor;\n\nuniform mat4 uMVMatrix;\nuniform mat4 uPMatrix;\nvarying vec2 vTextureCoordinates;\nvarying vec4 vColor;\n\nvoid main() {\n\tgl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);\n\tvTextureCoordinates = aTextureCoordinates;\n\tvColor = aColor;\n}\n\n";

},{}],37:[function(require,module,exports){
'use strict';
var glmat = require("gl-matrix");

var ShaderProgram = function(
	gl,
	vs_text,
	fs_text,
	attribute_variables,
	uniform_variables
) {
	if (!gl) throw new Error("arguments 1 must be WebGLRenderingContext instance");

	this.gl = gl;

	var vs_shader = this.createShader(gl, gl.VERTEX_SHADER, vs_text);
	var fs_shader = this.createShader(gl, gl.FRAGMENT_SHADER, fs_text);
	var shader_program = this.createShaderProgram(gl, vs_shader, fs_shader);

	var i;
	var attribute_locations = {};
	for (i=0; i < attribute_variables.length; i++) {
		attribute_locations[ attribute_variables[i] ] = gl.getAttribLocation(shader_program, attribute_variables[i]);
	}

	var uniform_locations = {};
	for (i=0; i < uniform_variables.length; i++) {
		uniform_locations[ uniform_variables[i] ] = gl.getUniformLocation(shader_program, uniform_variables[i]);
	}

	this.shader_program = shader_program;
	this.attribute_locations = attribute_locations;
	this.uniform_locations = uniform_locations;
};

ShaderProgram.prototype.createShader = function (gl, type, source_text) {
	if(type !== gl.VERTEX_SHADER && type !== gl.FRAGMENT_SHADER) {
		throw new Error ("type must be vertex or fragment");
	}

	var shader = gl.createShader(type);

	gl.shaderSource(shader, source_text);

	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		throw (
			(type === gl.VERTEX_SHADER ? "Vertex" : "Fragment") + " failed to compile:\n\n" + gl.getShaderInfoLog(shader));
	}

	return shader;
};

ShaderProgram.prototype.createShaderProgram = function(gl, vertex_shader, fragment_shader) {
	var shaderProgram = gl.createProgram();

	gl.attachShader(shaderProgram, vertex_shader);
	gl.attachShader(shaderProgram, fragment_shader);

	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		throw new Error("Could not initialize shaders:\n\n" + gl.getProgramInfoLog(shaderProgram));
	}

	return shaderProgram;
};

module.exports = ShaderProgram;

},{"gl-matrix":16}],38:[function(require,module,exports){
(function (process){
'use strict';

/*
 * TODO: split load and save method by sync and async
 * TODO: compress save data
 * TODO: implement: defineColumnProperty method
 */



var DEFAULT_KEY = "hakurei_engine_game:default";

var StorageBase = function (data) {
	if(!data) data = {};
	this._data = data;
};

// save file unique key
// this constant must be overridden!
StorageBase.KEY = function() {
	return DEFAULT_KEY;
};


// is Electron or NW.js ?
StorageBase.isLocalMode = function() {
	return typeof require === 'function' && typeof process === 'object' && process.title !== 'browser';
};

StorageBase.prototype.save = function() {
	var Klass = this.constructor;
	if (Klass.isLocalMode()) {
		this._saveToLocalFile();
	}
	else {
		this._saveToWebStorage();

	}
};

StorageBase.prototype._saveToLocalFile = function() {
	var Klass = this.constructor;
	var fs = require('fs');

	var data = JSON.stringify(this._data);

	var dir_path = Klass._localFileDirectoryPath();

	var file_path = dir_path + Klass._localFileName(Klass.KEY());

	if (!fs.existsSync(dir_path)) {
		fs.mkdirSync(dir_path);
	}
	fs.writeFileSync(file_path, data);
};

// save file directory
StorageBase._localFileDirectoryPath = function() {
	var path = require('path');

	var base = path.dirname(process.mainModule.filename);
	return path.join(base, 'save/');
};

StorageBase._localFileName = function(key) {
	return key + ".json";
};

StorageBase._localFilePath = function(key) {
	return this._localFileDirectoryPath() + this._localFileName(key);
};

StorageBase.prototype._saveToWebStorage = function() {
	var Klass = this.constructor;

	var key = Klass.KEY();
	var data = JSON.stringify(this._data);
	try {
		window.localStorage.setItem(key, data);
	}
	catch (e) {
	}
};

StorageBase.load = function() {
	if (this.isLocalMode()) {
		return this._loadFromLocalFile();
	}
	else {
		return this._loadFromWebStorage();
	}
};

StorageBase._loadFromLocalFile = function() {
	var fs = require('fs');

	var file_path = this.localFilePath(this.KEY());
	if (!fs.existsSync()) return null;

	var data = fs.readFileSync(file_path, { encoding: 'utf8' });

	var Klass = this;
	if (data) {
		return new Klass(JSON.parse(data));
	}
	else {
		return null;
	}
};

StorageBase._loadFromWebStorage = function() {
	var key = this.KEY();
	var data;
	try {
		data = window.localStorage.getItem(key);
	}
	catch (e) {
	}

	var Klass = this;
	if (data) {
		return new Klass(JSON.parse(data));
	}
	else {
		return null;
	}

};

StorageBase.prototype.del = function() {
	var Klass = this.constructor;
	if (Klass.isLocalMode()) {
		this._removeLocalFile();
	}
	else {
		this._removeWebStorage();
	}
};

StorageBase.prototype._removeLocalFile = function() {
	var Klass = this.constructor;
	var fs = require('fs');
	var file_path = this.localFilePath(Klass.KEY());

	if (fs.existsSync(file_path)) {
		fs.unlinkSync(file_path);
	}
};

StorageBase.prototype._removeWebStorage = function() {
	var Klass = this.constructor;
	var key = Klass.KEY();
	try {
		window.localStorage.removeItem(key);
	}
	catch (e) {
	}
};

module.exports = StorageBase;

}).call(this,require('_process'))
},{"_process":3,"fs":1,"path":2}],39:[function(require,module,exports){
'use strict';
var base_class = require('./base');
var util = require('../util');

var StorageSave = function(scene) {
	base_class.apply(this, arguments);
};
util.inherit(StorageSave, base_class);

StorageSave.KEY = function(){
	var key = "hakurei_engine_game:save";
	if (window && window.location) {
		return(key + ":" + window.location.pathname);
	}
	else {
		return key;
	}
};

module.exports = StorageSave;

},{"../util":40,"./base":38}],40:[function(require,module,exports){
'use strict';
var Util = {
	inherit: function( child, parent ) {
		// inherit instance methods
		var getPrototype = function(p) {
			if(Object.create) return Object.create(p);

			var F = function() {};
			F.prototype = p;
			return new F();
		};
		child.prototype = getPrototype(parent.prototype);
		child.prototype.constructor = child;

		// inherit static methods
		for (var func_name in parent) {
			child[func_name] = parent[func_name];
		}
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
	clamp: function(num, min, max) {
		return (num < min ? min : (num > max ? max : num));
	},
};

module.exports = Util;

},{}],41:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
	{"background":"shrine_noon","pos":null,"exp":null,"chara":null,"serif":"Exストーリー クリア後セリフ1"},
	{"background":"shrine_noon","pos":null,"exp":null,"chara":null,"serif":"Exストーリー クリア後セリフ2"},
	{"background":null,"pos":null,"exp":null,"chara":null,"serif":"Exストーリー クリア後セリフ3"},
	{"background":"shrine_night","pos":null,"exp":null,"chara":null,"serif":"Exストーリー クリア後セリフ4"},
	{"background":"shrine_night","pos":null,"exp":null,"chara":null,"serif":"Exストーリー クリア後セリフ5\nExストーリー クリア後セリフ6"},
];
module.exports = Serif;

},{}],42:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"通常ストーリー クリア後セリフ"},
];
module.exports = Serif;

},{}],43:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"エピローグ"},
];
module.exports = Serif;

},{}],44:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"Ex プロローグ セリフ"},
];
module.exports = Serif;

},{}],45:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"あー、ったく暑い！\nもう晩夏だっていうのに、どうしてこうも暑いのよ！"},
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"せめてあの氷精みたいに、傍にいるだけで\n温度を下げてくれるような冷気を帯びた奴がいれば良いのに……"},
	{"pos":"left","exp":"normal1","chara":"yukari","serif":"あら、呼んだかしら？"},
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"アンタは呼んでない！"},
	{"pos":"left","exp":"normal1","chara":"yukari","serif":"そう？ 私の手にかかれば、例えばこんな感じで\n貴女の背中をつつーっとなぞれば……"},
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"な、何してんのよ！？"},
	{"pos":"left","exp":"normal1","chara":"yukari","serif":"いやー、こうすれば少しは涼しくなるかなーって"},
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"アンタのそれは冷気じゃなくて寒気。気色悪いからやめて！"},
	{"pos":"left","exp":"normal1","chara":"yukari","serif":"相変わらずつれないのね。他にもとっておきの案を持ってきたって言うのに"},
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"……アンタが出してきた案の中で、今までロクな試しなかったじゃない"},
	{"pos":"left","exp":"normal1","chara":"yukari","serif":"まぁまぁそう言わずに。今回は暑がりな霊夢のために、\nとびっきりのスペシャルコースを用意しといたから"},
	{"pos":"left","exp":"normal1","chara":"yukari","serif":"それじゃ、早速行くわよ"},

	{"pos":"right","exp":"normal1","chara":"reimu","serif":"行くって、一体何をしに行く気よ"},
	{"pos":"left","exp":"normal1","chara":"yukari","serif":"決まっているじゃない、霊夢"},
	{"pos":"left","exp":"normal1","chara":"yukari","serif":"納涼の定番、肝試しよ"},
];
module.exports = Serif;

},{}],46:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"回想シーンセリフ"},
];
module.exports = Serif;

},{}],47:[function(require,module,exports){
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

},{}],48:[function(require,module,exports){
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

},{}],49:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
	{"pos":"left","exp":"normal1","chara":"yukari","fukidashi":"normal","serif":null},
	{"pos":"right","exp":"normal2","chara":"reimu","fukidashi":"normal","serif":"茶色のブロックがあるわ"},
	{"pos":"left","exp":"normal1","chara":"yukari","fukidashi":"normal","serif":"一度乗ったら消えちゃうみたいね"},
	{"pos":"right","exp":"normal1","chara":"reimu","fukidashi":"normal","serif":"消えちゃうのね"},
];
module.exports = Serif;

},{}],50:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
];
module.exports = Serif;

},{}],51:[function(require,module,exports){
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

},{}],52:[function(require,module,exports){
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

},{"./game":7}],53:[function(require,module,exports){
'use strict';
var base_object = require('../hakurei').object.sprite;
var util = require('../hakurei').util;
var ExchangeAnim = require('./exchange_anim');
var CONSTANT = require('../constant');

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

	// アイテムとの接触判定
	var item = this.checkCollisionWithItems();
	if(item) {
		item.got(); // 獲得済
		this.scene.addYukariItemNum();
	}
};

AlterEgo.prototype.checkCollisionWithItems = function() {
	var self = this;
	// アイテムと分身の衝突判定
	var collision_item = false;

	self.scene.objects_by_tile_type[CONSTANT.ITEM_FOR_YUKARI].forEach(function(obj) {
		if(obj.isCollision() && self.checkCollision(obj)) {
			collision_item = obj;
			// TODO: break;
		}
	});

	return collision_item;
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

},{"../constant":5,"../hakurei":8,"./exchange_anim":55}],54:[function(require,module,exports){
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

},{"../hakurei":8}],55:[function(require,module,exports){
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

},{"../hakurei":8}],56:[function(require,module,exports){
'use strict';

/* スタッフロール用霊夢 */

var CONSTANT = require('../constant');
var H_CONSTANT = require('../hakurei').constant;
var base_object = require('../hakurei').object.sprite;
var util = require('../hakurei').util;

var Reimu = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(Reimu, base_object);

Reimu.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.x(x);
	this.y(y);
};


Reimu.prototype.spriteName = function(){
	return "stage_tile_32";
};
Reimu.prototype.spriteIndices = function(){
	return [{x: 3, y: 2}, {x: 4, y: 2}];
		//: [{x: 1, y: 2}, {x: 2, y:2}];
};
Reimu.prototype.spriteAnimationSpan = function(){
	return 10;
};

Reimu.prototype.spriteWidth = function(){
	return 32;
};
Reimu.prototype.spriteHeight = function(){
	return 32;
};

Reimu.prototype.scaleWidth = function(){
	return 3;
};
Reimu.prototype.scaleHeight = function(){
	return 3;
};



module.exports = Reimu;

},{"../constant":5,"../hakurei":8}],57:[function(require,module,exports){
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

},{"../hakurei":8}],58:[function(require,module,exports){
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

},{"../hakurei":8}],59:[function(require,module,exports){
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

},{"../../hakurei":8}],60:[function(require,module,exports){
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

},{"../../constant":5,"../../hakurei":8,"./block_base":59}],61:[function(require,module,exports){
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

},{"../../constant":5,"../../hakurei":8,"./block_base":59}],62:[function(require,module,exports){
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

},{"../../constant":5,"../../hakurei":8,"./block_base":59}],63:[function(require,module,exports){
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

},{"../../constant":5,"../../hakurei":8,"./block_base":59}],64:[function(require,module,exports){
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

},{"../../constant":5,"../../hakurei":8,"./block_base":59}],65:[function(require,module,exports){
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

},{"../../constant":5,"../../hakurei":8,"./block_base":59}],66:[function(require,module,exports){
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

},{"../../constant":5,"../../hakurei":8,"./block_base":59}],67:[function(require,module,exports){
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

},{"../../constant":5,"../../hakurei":8,"./block_base":59}],68:[function(require,module,exports){
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

},{"../../constant":5,"../../hakurei":8}],69:[function(require,module,exports){
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

},{"../../constant":5,"../../hakurei":8}],70:[function(require,module,exports){
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

},{"../../constant":5,"../../hakurei":8}],71:[function(require,module,exports){
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
	return [{x: 0, y: 2}];
};
Item.prototype.spriteWidth = function(){
	return 24;
};
Item.prototype.spriteHeight = function(){
	return 24;
};
module.exports = Item;

},{"../../constant":5,"../../hakurei":8}],72:[function(require,module,exports){
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

},{"../../constant":5,"../../hakurei":8}],73:[function(require,module,exports){
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

	self.scene.objects_by_tile_type[CONSTANT.ITEM_FOR_REIMU].forEach(function(obj) {
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

},{"../../constant":5,"../../hakurei":8,"../alterego":53,"../exchange_anim":55,"./block_base":59,"./player/state_climbdown":75,"./player/state_dying":76,"./player/state_exchange":77,"./player/state_falldown":78,"./player/state_moveleft":80,"./player/state_moveright":81,"./player/state_normal":82}],74:[function(require,module,exports){
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

},{"../../../hakurei":8}],75:[function(require,module,exports){
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

},{"../../../constant":5,"../../../hakurei":8,"./state_base":74}],76:[function(require,module,exports){
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

},{"../../../constant":5,"../../../hakurei":8,"./state_base":74}],77:[function(require,module,exports){
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

},{"../../../constant":5,"../../../hakurei":8,"./state_base":74}],78:[function(require,module,exports){
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

},{"../../../constant":5,"../../../hakurei":8,"./state_base":74}],79:[function(require,module,exports){
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

},{"../../../constant":5,"../../../hakurei":8,"./state_base":74}],80:[function(require,module,exports){
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

},{"../../../constant":5,"../../../hakurei":8,"./state_move_base":79}],81:[function(require,module,exports){
arguments[4][80][0].apply(exports,arguments)
},{"../../../constant":5,"../../../hakurei":8,"./state_move_base":79,"dup":80}],82:[function(require,module,exports){
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

},{"../../../constant":5,"../../../hakurei":8,"./state_base":74}],83:[function(require,module,exports){
'use strict';
var base_class = require('./hakurei').storage.save;
var util = require('./hakurei').util;

var StorageSave = function(scene) {
	base_class.apply(this, arguments);
};
util.inherit(StorageSave, base_class);

StorageSave.KEY = function(){
	var key = "hakurei_engine_game:save";
	if (window && window.location) {
		return(key + ":" + window.location.pathname);
	}
	else {
		return key;
	}
};

StorageSave.prototype.setIsNormalStageCleared = function(flag){
	this._data.is_normal_stage_cleared = flag;
};
StorageSave.prototype.getIsNormalStageCleared = function(){
	return this._data.is_normal_stage_cleared;
};


module.exports = StorageSave;

},{"./hakurei":8}],84:[function(require,module,exports){
'use strict';

/* Exストーリー クリア後画面 */

var serif_script = require("../logic/serif/after_ex");

var backgrounds = [
	"shrine_night",
	"shrine_noon",
	"shrine_night",
];

var util = require('../hakurei').util;
var CONSTANT = require('../constant');
var base_scene = require('./serif_base');
var StorageSave = require('../save');

var SceneAfterEx = function(game) {
	base_scene.apply(this, arguments);
};

util.inherit(SceneAfterEx, base_scene);

SceneAfterEx.prototype.init = function() {
	base_scene.prototype.init.apply(this, arguments);

	this.index = 0;
};

SceneAfterEx.prototype.beforeDraw = function() {
	base_scene.prototype.beforeDraw.apply(this, arguments);

	if(this.serif.progress === 1 && this.index === 0) {
		this.index++;
	}
};




// 立ち絵＆セリフ終了後
SceneAfterEx.prototype.notifySerifEnd = function() {
	this.core.changeScene("staffroll");
};

// セリフスクリプト
SceneAfterEx.prototype.serifScript = function() {
	return serif_script;
};

// 背景画像名
SceneAfterEx.prototype.background = function() {
	return backgrounds[this.index];
};
module.exports = SceneAfterEx;

},{"../constant":5,"../hakurei":8,"../logic/serif/after_ex":41,"../save":83,"./serif_base":97}],85:[function(require,module,exports){
'use strict';

/* 通常ストーリー クリア後画面 */

var serif_script = require("../logic/serif/after_normal");


var util = require('../hakurei').util;
var CONSTANT = require('../constant');
var base_scene = require('./serif_base');
var StorageSave = require('../save');

var SceneAfterNormal = function(game) {
	base_scene.apply(this, arguments);
};

util.inherit(SceneAfterNormal, base_scene);

// 立ち絵＆セリフ終了後
SceneAfterNormal.prototype.notifySerifEnd = function() {
	// Exステージ解放 */
	var save_data = StorageSave.load();
	if(!save_data) {
		save_data = new StorageSave();
	}
	save_data.setIsNormalStageCleared(true);
	save_data.save();

	// タイトル画面へ
	this.core.changeScene("title");
};

// セリフスクリプト
SceneAfterNormal.prototype.serifScript = function() {
	return serif_script;
};

// 背景画像名
SceneAfterNormal.prototype.background = function() {
	return "shrine_night";
};
module.exports = SceneAfterNormal;

},{"../constant":5,"../hakurei":8,"../logic/serif/after_normal":42,"../save":83,"./serif_base":97}],86:[function(require,module,exports){
'use strict';

/* エピローグ画面 */

var serif_script = require("../logic/serif/epilogue");


var util = require('../hakurei').util;
var CONSTANT = require('../constant');
var base_scene = require('./serif_base');
var StorageSave = require('../save');

var ScenePrologue = function(game) {
	base_scene.apply(this, arguments);
};

util.inherit(ScenePrologue, base_scene);

// 立ち絵＆セリフ終了後
ScenePrologue.prototype.notifySerifEnd = function() {
	this.core.changeScene("title");
};

// セリフスクリプト
ScenePrologue.prototype.serifScript = function() {
	return serif_script;
};

// 背景画像名
ScenePrologue.prototype.background = function() {
	return "shrine_noon";
};

module.exports = ScenePrologue;

},{"../constant":5,"../hakurei":8,"../logic/serif/epilogue":43,"../save":83,"./serif_base":97}],87:[function(require,module,exports){
'use strict';

/* Ex エピグラフ画面 */

// メッセージ表示の遷移時間
var TRANSITION_COUNT = 240;

var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;

var SceneExEpigraph = function(core) {
	base_scene.apply(this, arguments);
};
util.inherit(SceneExEpigraph, base_scene);

SceneExEpigraph.prototype.init = function() {
	base_scene.prototype.init.apply(this, arguments);
};

SceneExEpigraph.prototype.beforeDraw = function() {
	base_scene.prototype.beforeDraw.apply(this, arguments);

	// メッセージ表示終了
	if(this.isTransitionEnd()) {
		this.core.changeScene("ex_prologue");
	}
};
SceneExEpigraph.prototype.draw = function(){
	var ctx = this.core.ctx;
	// 背景
	ctx.save();
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, this.core.width, this.core.height);
	ctx.restore();

	// 文字の透過度
	var alpha = 0.0;
	if(this.frame_count < TRANSITION_COUNT/3) {
		alpha = this.frame_count / (TRANSITION_COUNT/3);
	}
	else if (TRANSITION_COUNT/3 <= this.frame_count && this.frame_count < TRANSITION_COUNT*2/3) {
		alpha = 1.0;
	}
	else if (TRANSITION_COUNT*2/3 <= this.frame_count && this.frame_count < TRANSITION_COUNT) {
		alpha = (TRANSITION_COUNT - this.frame_count) / (TRANSITION_COUNT/3);
	}

	// 文字
	var message1 = "幻想郷は全てを受け入れるのよ。";
	var message2 = "それはそれは残酷な話ですわ。";

	var x = this.core.width/2 - 250;

	ctx.save();
	ctx.globalAlpha = alpha;
	ctx.fillStyle = 'rgb( 255, 255, 255 )';
	ctx.textAlign = 'left';
	ctx.font = "30px 'Migu'";
	ctx.fillText(message1, x, this.core.height/2);
	ctx.fillText(message2, x, this.core.height/2 + 35);
	ctx.restore();

};

SceneExEpigraph.prototype.isTransitionEnd = function(){
	return TRANSITION_COUNT < this.frame_count;
};

module.exports = SceneExEpigraph;

},{"../hakurei":8}],88:[function(require,module,exports){
'use strict';

/* Ex プロローグ画面 */

var serif_script = require("../logic/serif/ex_prologue");


var util = require('../hakurei').util;
var CONSTANT = require('../constant');
var base_scene = require('./serif_base');

var ScenePrologue = function(game) {
	base_scene.apply(this, arguments);
};

util.inherit(ScenePrologue, base_scene);

// 立ち絵＆セリフ終了後
ScenePrologue.prototype.notifySerifEnd = function() {
	var stage_no = CONSTANT.EX_STORY_START_STAGE_NO;
	this.core.changeScene("stage", stage_no, "talk", true);
};

// セリフスクリプト
ScenePrologue.prototype.serifScript = function() {
	return serif_script;
};

// 背景画像名
ScenePrologue.prototype.background = function() {
	return "shrine_noon";
};

module.exports = ScenePrologue;

},{"../constant":5,"../hakurei":8,"../logic/serif/ex_prologue":44,"./serif_base":97}],89:[function(require,module,exports){
'use strict';

// ローディングシーン

var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;
var AssetsConfig = require('../assets_config');
var CONSTANT = require('../constant');

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

		if (CONSTANT.DEBUG.START_SCENE) {
			// デバッグ
			this.core.changeScene(CONSTANT.DEBUG.START_SCENE);
		}
		else {
			// タイトル画面へ
			this.core.changeScene("title");
		}
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

},{"../assets_config":4,"../constant":5,"../hakurei":8}],90:[function(require,module,exports){
'use strict';
var A = 11;
var B = 12;
var C = 13;
var D = 10;
var E = 8;
var I = 9;
var L = 6;
var N = -1;
var P = 7;
var K = 5;
var Y = 14;

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

},{}],91:[function(require,module,exports){
'use strict';
var A = 11;
var B = 12;
var C = 13;
var D = 10;
var E = 8;
var I = 9;
var L = 6;
var N = -1;
var P = 7;
var K = 5;
var Y = 14;

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
	[0,0,0,Y,Y,0,E,0,0,0,E,0,0,0,I,I,0,0,0,0,0,0,L,0,0,Y,Y,0,0,0],
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

},{}],92:[function(require,module,exports){
'use strict';
var A = 11;
var B = 12;
var C = 13;
var D = 10;
var E = 8;
var I = 9;
var L = 6;
var N = -1;
var P = 7;
var K = 5;
var Y = 14;

var map = [
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,I,0,I,0,I,0,I,0,0,0,0,0,0,0,0,0,E,0,0],
	[0,A,C,L,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,A,B,C,0],
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
	[0,A,B,C,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,A,B,C,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
];

module.exports = {
	map: map, // マップ
	exchange_num: 1, // 位置移動上限回数
	is_vertical: false, // 交代が垂直かどうか
};

},{}],93:[function(require,module,exports){
'use strict';
var A = 11;
var B = 12;
var C = 13;
var D = 10;
var E = 8;
var I = 9;
var L = 6;
var N = -1;
var P = 7;
var K = 5;
var Y = 14;

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

},{}],94:[function(require,module,exports){
'use strict';
var A = 11;
var B = 12;
var C = 13;
var D = 10;
var E = 8;
var I = 9;
var L = 6;
var N = -1;
var P = 7;
var K = 5;
var Y = 14;

var map = [
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,I,I,I,0,0,E,E,0,0,0,0,0,0,0,0,0,0,0,0,0,0,I,I,I,0,0,0],
	[0,A,B,B,B,B,B,B,B,B,K,K,K,K,K,K,K,K,K,K,B,B,B,B,B,B,B,B,C,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,I,I,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,A,B,B,C,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,P,0,0,0,0,0,0,0,0,0,0,0,0,B,B,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,N,0,I,I,I,0,0,0,0,0,0,0,0,B,B,0,0,0,0,0,0,0,0,I,I,I,0,0,0],
	[0,A,B,B,B,B,B,B,B,B,K,K,B,B,B,B,B,B,K,K,B,B,B,B,B,B,B,B,C,0],
	[0,0,A,B,B,B,B,B,B,B,0,0,B,B,B,B,B,B,0,0,B,B,B,B,B,B,B,C,0,0],
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

},{}],95:[function(require,module,exports){
'use strict';

/* プロローグ画面 */

var serif_script = require("../logic/serif/prologue");


var util = require('../hakurei').util;
var CONSTANT = require('../constant');
var base_scene = require('./serif_base');

var ScenePrologue = function(game) {
	base_scene.apply(this, arguments);
};

util.inherit(ScenePrologue, base_scene);

// 立ち絵＆セリフ終了後
ScenePrologue.prototype.notifySerifEnd = function() {
	var stage_no = 1;
	this.core.changeScene("stage", stage_no, "talk", true);
};

// セリフスクリプト
ScenePrologue.prototype.serifScript = function() {
	return serif_script;
};

// 背景画像名
ScenePrologue.prototype.background = function() {
	return "shrine_noon";
};

module.exports = ScenePrologue;

},{"../constant":5,"../hakurei":8,"../logic/serif/prologue":45,"./serif_base":97}],96:[function(require,module,exports){
'use strict';

/* 回想シーン画面 */

var serif_script = require("../logic/serif/reminiscence");


var util = require('../hakurei').util;
var CONSTANT = require('../constant');
var base_scene = require('./serif_base');

var SceneReminiscence = function(game) {
	base_scene.apply(this, arguments);
};

util.inherit(SceneReminiscence, base_scene);

// 立ち絵＆セリフ終了後
SceneReminiscence.prototype.notifySerifEnd = function() {
	this.core.changeScene("prologue");
};

// セリフスクリプト
SceneReminiscence.prototype.serifScript = function() {
	return serif_script;
};

// 背景画像名
SceneReminiscence.prototype.background = function() {
	return "shrine_noon";
};

module.exports = SceneReminiscence;

},{"../constant":5,"../hakurei":8,"../logic/serif/reminiscence":46,"./serif_base":97}],97:[function(require,module,exports){
'use strict';

/* 立ち絵＆セリフ */
var MESSAGE_WINDOW_OUTLINE_MARGIN = 10;
var TALKER_MOVE_PX = 5;
var SCALE = 1;

var TRANSITION_COUNT = 100;

var util = require('../hakurei').util;
var CONSTANT = require('../constant');
var H_CONSTANT = require('../hakurei').constant;
var base_scene = require('../hakurei').scene.base;

var SerifManager = require('../hakurei').serif_manager;

var SceneSerifBase = function(game) {
	base_scene.apply(this, arguments);

	this.serif = new SerifManager();
};

util.inherit(SceneSerifBase, base_scene);

SceneSerifBase.prototype.init = function(serif){
	base_scene.prototype.init.apply(this, arguments);
	this.serif.init(this.serifScript());

	this.transition_count = 0;
};

SceneSerifBase.prototype.beforeDraw = function(){
	base_scene.prototype.beforeDraw.apply(this, arguments);

	if (this.isInTransition()) {
		this.transition_count--;

		// トランジションが終わればセリフ送り再開
		if (this.transition_count === 0) {
			this.serif.startPrintMessage();
		}
	}


	if(this.core.isKeyPush(H_CONSTANT.BUTTON_Z)) {
		if(this.serif.is_end()) {
			this.notifySerifEnd();
		}
		else {
			// トランジション中でなければ
			if (!this.isInTransition()) {
				// セリフを送る
				this.serif.next();

				if (this.serif.is_background_changed()) {
					// トランジション開始
					this.transition_count = TRANSITION_COUNT;

					// トランジション中はセリフ送り中断
					this.serif.cancelPrintMessage();
				}
			}
			else {
				// トランジション終了
				this.transition_count = 0;
				// トランジションが終わればセリフ送り再開
				this.serif.startPrintMessage();
			}
		}
	}
};

// 画面更新
SceneSerifBase.prototype.draw = function(){
	base_scene.prototype.draw.apply(this, arguments);
	var ctx = this.core.ctx;

	if (this.isInTransition()) {
		// 背景表示
		ctx.globalAlpha = (TRANSITION_COUNT - this.transition_count) / TRANSITION_COUNT;
		this._showBackground();
		ctx.globalAlpha = 1.0;
	}
	else {
		// 背景表示
		this._showBackground();

		// キャラ表示
		if(this.serif.right_image()) {
			this._showRightChara();
		}
		if(this.serif.left_image()) {
			this._showLeftChara();
		}

		// メッセージウィンドウ表示
		this._showMessageWindow();

		// メッセージ表示
		this._showMessage();
	}
};

// 背景画像表示
SceneSerifBase.prototype._showBackground = function(){
	var ctx = this.core.ctx;
	var background_name = this.serif.background_image() ? this.serif.background_image() : this.background();
	var background = this.core.image_loader.getImage(background_name);
	ctx.drawImage(background,
					0,
					0,
					background.width,
					background.height,
					0,
					0,
					this.core.width,
					this.core.height);
};

SceneSerifBase.prototype._showRightChara = function(){
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

SceneSerifBase.prototype._showLeftChara = function(){
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

SceneSerifBase.prototype._showMessageWindow = function(){
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
SceneSerifBase.prototype._showMessage = function() {
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



// 立ち絵＆セリフ終了後
SceneSerifBase.prototype.notifySerifEnd = function() {
	throw new Error("notifySerifEnd method must be defined.");
};

// セリフスクリプト
SceneSerifBase.prototype.serifScript = function() {
	throw new Error("serifScript method must be defined.");
};

// 背景画像名
SceneSerifBase.prototype.background = function() {
	throw new Error("background method must be defined.");
};

SceneSerifBase.prototype.isInTransition = function() {
	return this.transition_count ? true : false;
};




module.exports = SceneSerifBase;

},{"../constant":5,"../hakurei":8}],98:[function(require,module,exports){
'use strict';

/* スタッフロール画面 */

var serifs = [
	["プログラマー","テストA"],
	["ドット絵","テストB"],
	["イラスト","テストC"],
	["脚本・シナリオ・セリフ","テストD"],
	["BGM","テストE"],
];
var RESULT_TRANSITION_COUNT = 320;


var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;
var Reimu = require('../object/reimu_for_staffroll');

var SceneStaffroll = function(core) {
	base_scene.apply(this, arguments);
};
util.inherit(SceneStaffroll, base_scene);

SceneStaffroll.prototype.init = function() {
	base_scene.prototype.init.apply(this, arguments);

	this.reimu = new Reimu(this);
	this.reimu.init(this.core.width - 100, this.core.height - 100);
	this.addObject(this.reimu);

	this.serif_index = 0;

	// スタッフロール終了中かどうか
	this.is_ending = false;
};

SceneStaffroll.prototype.beforeDraw = function() {
	base_scene.prototype.beforeDraw.apply(this, arguments);

	if (this.frame_count > RESULT_TRANSITION_COUNT) {
		this.frame_count = 0;

		if (this.is_ending) {
				this.core.changeScene("epilogue");
		}
		else {
			// メッセージを全て表示し終わったなら
			if(this.serif_index+1 === serifs.length){
				this.is_ending = true;
			}
			else {
				// 次のメッセージへ
				this.serif_index++;
			}
		}
	}
};
SceneStaffroll.prototype.draw = function(){
	var ctx = this.core.ctx;
	// 背景
	ctx.save();
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, this.core.width, this.core.height);
	ctx.restore();

	if (this.is_ending) {
		this.reimu.x(this.reimu.x() - this.core.width/RESULT_TRANSITION_COUNT);
	}
	else {
		// 文字の透過度
		var alpha = 0.0;
		if(this.frame_count < RESULT_TRANSITION_COUNT/4) {
			alpha = this.frame_count / (RESULT_TRANSITION_COUNT/4);
		}
		else if (RESULT_TRANSITION_COUNT/4 <= this.frame_count && this.frame_count < RESULT_TRANSITION_COUNT*2/4) {
			alpha = 1.0;
		}
		else if (RESULT_TRANSITION_COUNT*2/4 <= this.frame_count && this.frame_count < RESULT_TRANSITION_COUNT*3/4) {
			alpha = (RESULT_TRANSITION_COUNT*3/4 - this.frame_count) / (RESULT_TRANSITION_COUNT/4);
		}
		else if (RESULT_TRANSITION_COUNT*3/4 <= this.frame_count && this.frame_count < RESULT_TRANSITION_COUNT) {
			alpha = 0.0;
		}

		// 文字
		var message1 = serifs[this.serif_index][0];
		var message2 = serifs[this.serif_index][1];

		var x = this.core.width/2 - 250;

		ctx.save();
		ctx.globalAlpha = alpha;
		ctx.fillStyle = 'rgb( 255, 255, 255 )';
		ctx.textAlign = 'left';
		ctx.font = "30px 'Migu'";
		ctx.fillText(message1, this.core.width/2 - 150, this.core.height/2 - 30);
		ctx.fillText(message2, this.core.width/2 -  50, this.core.height/2 + 20);
		ctx.restore();
	}

	// 霊夢歩く
	base_scene.prototype.draw.apply(this, arguments);
};


module.exports = SceneStaffroll;

},{"../hakurei":8,"../object/reimu_for_staffroll":56}],99:[function(require,module,exports){
'use strict';

	var offset_x = 25;
	var offset_y = 50;


var util = require('../hakurei').util;
var CONSTANT = require('../constant');

var BackGroundEye  = require('../object/background_eye');
var StageFrame1  = require('../object/stage_frame1');
var StageFrame2  = require('../object/stage_frame2');

var BlockGreen    = require('../object/tile/block_green');
var BlockBlue     = require('../object/tile/block_blue');
var BlockRed      = require('../object/tile/block_red');
var BlockPurple   = require('../object/tile/block_purple');
var BlockBrown    = require('../object/tile/block_brown');
var Ladder        = require('../object/tile/ladder');
var Player        = require('../object/tile/player');
var Enemy         = require('../object/tile/enemy');
var ItemForReimu  = require('../object/tile/item_for_reimu');
var ItemForYukari = require('../object/tile/item_for_yukari');
var Death         = require('../object/tile/death');
var BlockStone1   = require('../object/tile/block_stone1');
var BlockStone2   = require('../object/tile/block_stone2');
var BlockStone3   = require('../object/tile/block_stone3');

// tile_type => クラス名
var TILE_TYPE_TO_CLASS = {};
//TILE_TYPE_TO_CLASS[CONSTANT.BACKGROUND]  = BackGround;
TILE_TYPE_TO_CLASS[CONSTANT.BLOCK_GREEN]     = BlockGreen;
TILE_TYPE_TO_CLASS[CONSTANT.BLOCK_BLUE]      = BlockBlue;
TILE_TYPE_TO_CLASS[CONSTANT.BLOCK_RED]       = BlockRed;
TILE_TYPE_TO_CLASS[CONSTANT.BLOCK_PURPLE]    = BlockPurple;
TILE_TYPE_TO_CLASS[CONSTANT.BLOCK_BROWN]     = BlockBrown;
TILE_TYPE_TO_CLASS[CONSTANT.LADDER]          = Ladder;
TILE_TYPE_TO_CLASS[CONSTANT.PLAYER]          = Player;
TILE_TYPE_TO_CLASS[CONSTANT.ENEMY]           = Enemy;
TILE_TYPE_TO_CLASS[CONSTANT.ITEM_FOR_REIMU]  = ItemForReimu;
TILE_TYPE_TO_CLASS[CONSTANT.ITEM_FOR_YUKARI] = ItemForYukari;
TILE_TYPE_TO_CLASS[CONSTANT.DEATH]           = Death;
TILE_TYPE_TO_CLASS[CONSTANT.BLOCK_STONE1]    = BlockStone1;
TILE_TYPE_TO_CLASS[CONSTANT.BLOCK_STONE2]    = BlockStone2;
TILE_TYPE_TO_CLASS[CONSTANT.BLOCK_STONE3]    = BlockStone3;


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

	if (CONSTANT.DEBUG.START_STAGE_NO) {
		stage_no = CONSTANT.DEBUG.START_STAGE_NO;
	}

	// stage no
	this.stage_no = stage_no || 1;

	// デフォルトは talk シーンから開始
	if(!sub_scene) sub_scene = "talk";

	this.is_play_bgm = is_play_bgm ? true : false;
	if(this.is_play_bgm) {
		this.core.stopBGM();
	}

	this.reimu_item_num = 0;
	this.yukari_item_num = 0;

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
	// 通常ストーリークリア後
	if (this.isLastNormalStory()) {
		this.core.changeScene("after_normal");
	}
	// Exステージクリア後
	else if (this.isLastExStory()) {
		this.core.changeScene("after_ex");
	}
	// 次のステージへ
	else {
		this.core.changeScene("stage", this.stage_no + 1);
	}
};
// ゲームオーバー後
SceneStage.prototype.notifyGameOverEnd = function() {
	// 当該ステージの最初から
	this.core.changeScene("stage", this.stage_no, "play");
};
// ノーマルステージの最終ステージかどうか
SceneStage.prototype.isLastNormalStory = function() {
	return this.stage_no === 5 ? true : false;
};
// Exステージの最終ステージかどうか
SceneStage.prototype.isLastExStory = function() {
	return MAPS[this.stage_no + 1] ? false : true;
};

// プレイヤー(1ステージにプレイヤーは1人の想定)
SceneStage.prototype.player = function () {
	return this.objects_by_tile_type[ CONSTANT.PLAYER ][0];
};
// ステージをクリアしたかどうか
SceneStage.prototype.isClear = function () {
	return(this.reimu_item_num + this.yukari_item_num >= this.max_item_num ? true : false);
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
// 紫用アイテム獲得
SceneStage.prototype.addYukariItemNum = function () {
	this.yukari_item_num += 1;
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
	return this.objects_by_tile_type[CONSTANT.ITEM_FOR_REIMU].length + this.objects_by_tile_type[CONSTANT.ITEM_FOR_YUKARI].length;
};





module.exports = SceneStage;

},{"../constant":5,"../hakurei":8,"../logic/serif/stage1/before":47,"../logic/serif/stage2/before":48,"../logic/serif/stage3/before":49,"../logic/serif/stage4/before":50,"../logic/serif/stage5/before":51,"../object/background_eye":54,"../object/stage_frame1":57,"../object/stage_frame2":58,"../object/tile/block_blue":60,"../object/tile/block_brown":61,"../object/tile/block_green":62,"../object/tile/block_purple":63,"../object/tile/block_red":64,"../object/tile/block_stone1":65,"../object/tile/block_stone2":66,"../object/tile/block_stone3":67,"../object/tile/death":68,"../object/tile/enemy":69,"../object/tile/item_for_reimu":70,"../object/tile/item_for_yukari":71,"../object/tile/ladder":72,"../object/tile/player":73,"./map/stage1":90,"./map/stage2":91,"./map/stage3":92,"./map/stage4":93,"./map/stage5":94,"./stage/play":100,"./stage/result_clear":102,"./stage/result_gameover":103,"./stage/talk":104}],100:[function(require,module,exports){
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

	// キー入力
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

	// プレイヤーの更新
	this.parent.player().update();

	// ステージクリア判定
	if (this.parent.isClear()) {
		this.parent.notifyStageClear();
	}
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

},{"../../hakurei":8}],101:[function(require,module,exports){
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


},{"../../hakurei":8}],102:[function(require,module,exports){
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

},{"../../hakurei":8,"./result_base":101}],103:[function(require,module,exports){
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

},{"../../hakurei":8,"./result_base":101}],104:[function(require,module,exports){
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

},{"../../hakurei":8}],105:[function(require,module,exports){
'use strict';

var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;
var StorageSave = require('../save');
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

	// Exステージ解放されているかどうか */
	var save_data = StorageSave.load();
	if(!save_data) {
		save_data = new StorageSave();
	}
	this.is_normal_stage_cleared = save_data.getIsNormalStageCleared();

	this.core.stopBGM();
};


SceneTitle.prototype.beforeDraw = function(){
	base_scene.prototype.beforeDraw.apply(this, arguments);

	if(this.frame_count === 60) {
		this.core.playBGM("title");
	}

	if(this.core.isKeyPush(H_CONSTANT.BUTTON_Z)) {
		this.core.playSound('select');

		if(this.is_normal_stage_cleared) {
			// Exストーリー
			this.core.changeScene("ex_epigraph");
		}
		else {
			// 通常ストーリー
			this.core.changeScene("reminiscence");
		}

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
		var text;
		if(this.is_normal_stage_cleared) {
			text = "Press Z to Start EX"; //Exステージ解放後
		}
		else {
			text = "Press Z to Start"; // Exステージ開放前
		}

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

},{"../constant":5,"../hakurei":8,"../save":83}]},{},[52]);
