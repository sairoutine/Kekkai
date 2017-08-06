(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
(function (__dirname){
var fs = require('fs')
var path = require('path')

var pathFile = path.join(__dirname, 'path.txt')

if (fs.existsSync(pathFile)) {
  module.exports = path.join(__dirname, fs.readFileSync(pathFile, 'utf-8'))
} else {
  throw new Error('Electron failed to install correctly, please delete node_modules/' + path.basename(__dirname) + ' and try installing again')
}

}).call(this,"/node_modules/electron")
},{"fs":1,"path":3}],3:[function(require,module,exports){
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
},{"_process":4}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
'use strict';

var AssetsConfig = {};
AssetsConfig.images = {
	// タイトルロゴ
	title:         "./image/title.png",
	// タイトル背景
	title_bg:      "./image/title_bg.png",
	title_bg_without_yukari:      "./image/title_bg_without_yukari.png",

	// メニュー
	menu_story_start_off:    "./image/menu/menu_story_start_off.png",
	menu_story_start_on:     "./image/menu/menu_story_start_on.png",
	menu_ex_story_start_off: "./image/menu/menu_ex_story_start_off.png",
	menu_ex_story_start_on:  "./image/menu/menu_ex_story_start_on.png",
	menu_select_stage_off:   "./image/menu/menu_select_stage_off.png",
	menu_select_stage_on:    "./image/menu/menu_select_stage_on.png",
	menu_music_room_off:     "./image/menu/menu_music_room_off.png",
	menu_music_room_on:      "./image/menu/menu_music_room_on.png",
	menu_how_to_off:         "./image/menu/menu_how_to_off.png",
	menu_how_to_on:          "./image/menu/menu_how_to_on.png",
	menu_config_off:         "./image/menu/menu_config_off.png",
	menu_config_on:          "./image/menu/menu_config_on.png",


	// 回想シーン背景
	reminiscence1:   "./image/reminiscence1.png",
	reminiscence2:   "./image/reminiscence2.jpg",

	// プロローグ背景
	shrine_noon:   "./image/shrine_noon.png",

	// ステージ画面背景
	stage_bg01:      "./image/stage_bg01.png",
	stage_bg02:      "./image/stage_bg02.png",
	stage_bg03:      "./image/stage_bg03.png",
	stage_bg04:      "./image/stage_bg04.png",

	// ステージ画面ステージ背景
	bg:            "./image/bg.png",
	stage_tile_24: "./image/stage_tile_24.png",
	stage_tile_32: "./image/stage_tile_32.png",
	block:         "./image/block.png",
	hashigo:       "./image/hashigo.png",

	mari_bg:       "./image/mari_bg.png",
	// ノーマルステージクリア後背景
	shrine_night:   "./image/shrine_night.png",

	after_ex1:   "./image/after_ex1.png",
	after_ex2:   "./image/after_ex2.png",
	after_ex3:   "./image/after_ex3.jpg",
	after_ex4:   "./image/after_ex4.png",

	epilogue1:   "./image/epilogue1.png",
	epilogue2:   "./image/epilogue2.png",
	epilogue3:   "./image/epilogue3.jpg",

	// スコアの★
	star_on:       "./image/star_on.png",
	star_off:      "./image/star_off.png",

	// カーソル
	cursor:      "./image/right_arrow.png",

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
	reimu_strength1:   "./image/reimu/strength1.png",
	reimu_strength2:   "./image/reimu/strength2.png",

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

// sound ファイルはogg と m4a の二種類を用意してください
AssetsConfig.sounds = {
	forbidden:    {
		path: "./sound/forbidden",
		volume: 0.8,
	},
	select:    {
		path: "./sound/select",
		volume: 0.8,
	},
	boss_powerup:    {
		path: "./sound/boss_powerup",
		volume: 0.5,
	},
	dead:    {
		path: "./sound/dead",
		volume: 0.5,
	},
	got_item_ohuda: {
		path: "./sound/got_item_ohuda",
		volume: 0.8,
	},
	got_item_ribon: {
		path: "./sound/got_item_ribon",
		volume: 0.8,
	},
	stage_result1: {
		path: "./sound/stage_result1",
		volume: 1.0,
	},
	drop: {
		path: "./sound/drop",
		volume: 0.5,
	},
	stage_result2: {
		path: "./sound/stage_result2",
		volume: 1.0,
	},
};
// bgm ファイルはogg と m4a の二種類を用意してください
AssetsConfig.bgms = {
	title: {
		path: "./bgm/title",
		loopStart: 0*60 + 10 + 0.312,
		loopEnd: 0*60 + 51 + 0.562,
		title: "永夜抄 ～ Eastern Night.",
		message: "チップチューンだけど、チップチューンっぽくない感じのアレンジね。\n曲制作者もうまく出来たって言ってるわ。",
		is_normal: false,
		is_ex:     false,
	},
	reminiscence: {
		path: "./bgm/reminiscence",
		loopStart: 0*60 + 13 + 0.220,
		loopEnd: 1*60 + 22 + 0.373,
		title: "無何有の郷",
		message: "ほのぼのとした思い出のイメージの曲ね。\nのんびりとしていて、それでいてちょっと哀愁も含んだアレンジよね。",
		is_normal: false,
		is_ex:     false,
	},
	prologue: {
		path: "./bgm/prologue",
		loopStart: 0*60 + 0 + 0.000,
		loopEnd: 0*60 + 52 + 0.881,
		title: "おてんば恋娘",
		message: "おてんば恋娘のちょっとアホっぽくて、何か抜けてる感じのあるアレンジね。",
		is_normal: false,
		is_ex:     false,
	},

	stage_a: {
		path: "./bgm/stage_a",
		loopStart: 0*60 + 29 + 0.143,
		loopEnd: 1*60 + 51 + 0.429,
		title: "春色小径",
		message: "ステージ曲その1よ。勢いがそこそこあって、\n異変解決するぞ！的な感じが垣間見える曲ね。",
		is_normal: false,
		is_ex:     false,
	},
	stage_b: {
		path: "./bgm/stage_b",
		loopStart: 0*60 + 0 + 0.000,
		loopEnd: 1*60 + 22 + 0.500,
		title: "少女綺想曲",
		message: "ステージ曲その2よ。ゆったりとして、徐々に不穏な感じが少しづつ出てきているわ。",
		is_normal: false,
		is_ex:     false,
	},
	stage_c: {
		path: "./bgm/stage_c",
		loopStart: 0*60 + 14 + 0.746,
		loopEnd: 1*60 + 53 + 0.898,
		title: "夜が降りてくる",
		message: "ステージ曲その3よ。かなりゆったりとして、不穏な感じがとても強い曲ね。",
		is_normal: false,
		is_ex:     false,
	},
	stage_d: {
		path: "./bgm/stage_d",
		loopStart: 0*60 + 29 + 0.189,
		loopEnd: 1*60 + 47 + 0.027,
		title: "二色蓮花蝶",
		message: "ラストバトルにふさわしい、かなり勢いのあるアレンジね。\nパズルゲームっぽくないけれど、緊迫した感じがあるわ。",
		is_normal: true,
		is_ex:     false,
	},
	stage_e: {
		path: "./bgm/stage_e",
		loopStart: 0*60 + 0 + 0.000,
		loopEnd: 2*60 + 37 + 0.297,
		title: "ネクロファンタジア",
		message: "こっちも、ネクロファンタジア同様、ラストバトルにふさわしい感じのアレンジね。\n紫を救いたい気持ちが曲に現れていると思うわ。",
		is_normal: true,
		is_ex:     false,
	},
	title_without_yukari: {
		path: "./bgm/title_without_yukari",
		loopStart: 0*60 + 0 + 0.000,
		loopEnd: 0*60 + 51 + 0.562,
		title: "永夜抄 ～ Eastern Night.",
		message: "退廃的な感じの曲ね。",
		is_normal: true,
		is_ex:     false,
	},
	after_ex: {
		path: "./bgm/after_ex",
		loopStart: 0*60 + 0 + 0.000,
		loopEnd: 1*60 + 9 + 0.153,
		title: "Eternal Dream",
		message: "別れの悲しい感じが出てるアレンジね。\nとにかく悲しくなるように、かなり音数を絞ったんですって。",
		is_normal: false,
		is_ex:     true,
	},
	staffroll: {
		path: "./bgm/staffroll",
		loopStart: 0*60 + 8 + 0.727,
		loopEnd: 1*60 + 4 + 0.364,
		title: "月見草",
		message: "めでたしめでたしじゃないエンディング曲ね。後味が悪い暗い感じにしようと思ったら\n思ったより暗くならなかったらしいわ。",
		is_normal: false,
		is_ex:     true,
	},
	epilogue: {
		path: "./bgm/epilogue",
		loopStart: 0*60 + 19 + 0.831,
		loopEnd: 1*60 + 8 + 0.664,
		title: "紅より儚い永遠",
		message: "すごくハッピーエンドな曲ね。落ち着いためでたしめでたしな感じだわ。\n曲制作者曰く「やっぱり、ゆかれいむはハッピーエンドが似合いますね」ですって。",
		is_normal: false,
		is_ex:     true,
	},
};


module.exports = AssetsConfig;

},{}],6:[function(require,module,exports){
'use strict';
var DEBUG = require("./debug_constant");

var CONSTANT = {
	DEBUG: {},

	// スコアの最高数
	MAX_SCORE:  3,

	// Ex Story の開始 stage no
	EX_STORY_START_STAGE_NO:  31,

	// ステージ上のタイルのサイズ
	TILE_SIZE:  24,

	// ステージの、画面上の表示開始位置
	STAGE_OFFSET_X: 25,
	STAGE_OFFSET_Y: 50,

	// ステージの縦 横のタイル数
	STAGE_TILE_X_NUM: 30,
	STAGE_TILE_Y_NUM: 20,

	// ステージ上のタイルの種類
	BLOCK_GREEN:     1,
	BLOCK_BLUE:      2,
	BLOCK_RED:       3,
	BLOCK_PURPLE:    4,
	BLOCK_DISAPPEAR: 5,
	LADDER:          6,
	PLAYER:          7,
	ENEMY:           8,
	ITEM_FOR_REIMU:  9,
	DEATH:           10,
	BLOCK_STONE1:    11,
	BLOCK_STONE2:    12,
	BLOCK_STONE3:    13,
	ITEM_FOR_YUKARI: 14,
	ITEM_OF_EXCHANGE:15,
	ENEMY_VERTICAL:  16,
	ALTEREGO:        17, //NOTE: マップデータ上には配置できない


	// プレイヤーの状態
	STATE_NORMAL:    1,
	STATE_CLIMBDOWN: 2,
	STATE_DYING:     3,
	STATE_EXCHANGE:  4,
	STATE_FALLDOWN:  5,
	STATE_MOVELEFT:  6,
	STATE_MOVERIGHT: 7,


	// キャラ ドット絵一覧
	REIMU_NO:    1, // 霊夢(実体)
	YUKARI_NO:   2, // 紫
	EX_REIMU_NO: 3, // 霊夢(精神)
};

// レンダリングの順番
// 上にあるものほど奥に描画／下にあるものほど手前に描画
CONSTANT.RENDER_SORT = [
	CONSTANT.BLOCK_GREEN,
	CONSTANT.BLOCK_BLUE,
	CONSTANT.BLOCK_RED,
	CONSTANT.BLOCK_PURPLE,
	CONSTANT.BLOCK_DISAPPEAR,
	CONSTANT.BLOCK_STONE1,
	CONSTANT.BLOCK_STONE2,
	CONSTANT.BLOCK_STONE3,
	CONSTANT.DEATH,
	CONSTANT.LADDER,
	CONSTANT.ENEMY,
	CONSTANT.ENEMY_VERTICAL,
	CONSTANT.PLAYER,
	CONSTANT.ITEM_FOR_REIMU,
	CONSTANT.ITEM_FOR_YUKARI,
	CONSTANT.ITEM_OF_EXCHANGE,
];

if (DEBUG.ON) {
	CONSTANT.DEBUG = DEBUG;
}
module.exports = CONSTANT;

},{"./debug_constant":7}],7:[function(require,module,exports){
'use strict';
var DEBUG = {
	ON: true,
	SOUND_OFF: false,
	START_SCENE: "title",
};

module.exports = DEBUG;

},{}],8:[function(require,module,exports){
'use strict';
var core = require('./hakurei').core;
var util = require('./hakurei').util;
var CONSTANT = require('./constant');

var StorageStory = require('./storage/story');

// ローディング画面
var SceneLoading      = require('./scene/00_loading');
// タイトル画面
var SceneTitle        = require('./scene/01_title');
// 回想シーン画面
var SceneReminiscence = require('./scene/02_reminiscence');
// 題字画面
var SceneLogo         = require('./scene/03_logo');
// プロローグ画面
var ScenePrologue     = require('./scene/04_prologue');
// ステージ画面
var SceneStage        = require('./scene/05_stage');
// 通常ストーリー クリア後画面
var SceneAfterNormal  = require('./scene/06_after_normal');
// Ex エピグラフ画面
var SceneExEpigraph   = require('./scene/07_ex_epigraph');
// Ex プロローグ画面
var SceneExPrologue   = require('./scene/08_ex_prologue');
// Exストーリー クリア後画面
var SceneAfterEx      = require('./scene/09_after_ex');
// スタッフロール
var SceneStaffroll    = require('./scene/10_staffroll');
// エピローグ
var SceneEpilogue     = require('./scene/11_epilogue');
// Music Room
var SceneMusic        = require('./scene/music');
// 遊び方
var SceneHowTo        = require('./scene/howto');
// ステージセレクト画面
var SceneSelect       = require('./scene/select');

var Game = function(canvas) {
	core.apply(this, arguments);
};
util.inherit(Game, core);

Game.prototype.init = function () {
	core.prototype.init.apply(this, arguments);

	// セーブデータ
	this.storage_story = StorageStory.load(); // ストーリー進捗

	this.addScene("loading", new SceneLoading(this));
	this.addScene("title", new SceneTitle(this));
	this.addScene("select", new SceneSelect(this));
	this.addScene("reminiscence", new SceneReminiscence(this));
	this.addScene("logo", new SceneLogo(this));
	this.addScene("prologue", new ScenePrologue(this));
	this.addScene("stage", new SceneStage(this));
	this.addScene("after_normal", new SceneAfterNormal(this));
	this.addScene("ex_epigraph", new SceneExEpigraph(this));
	this.addScene("ex_prologue", new SceneExPrologue(this));
	this.addScene("after_ex", new SceneAfterEx(this));
	this.addScene("staffroll", new SceneStaffroll(this));
	this.addScene("epilogue", new SceneEpilogue(this));
	this.addScene("music", new SceneMusic(this));
	this.addScene("howto", new SceneHowTo(this));

	this.changeScene("loading");

};

Game.prototype.isKeyLongDown = function (key) {
	var time = this.getKeyDownTime(key);
	return time > 30 && time % 5 === 0 ? true : false;
};
Game.prototype.isKeyPushOrLongDown = function (key) {
	return this.isKeyPush(key) || this.isKeyLongDown(key);
};

Game.prototype.playSound = function () {
	if (CONSTANT.DEBUG.SOUND_OFF) return;
	return this.audio_loader.playSound.apply(this.audio_loader, arguments);
};
Game.prototype.playBGM = function () {
	if (CONSTANT.DEBUG.SOUND_OFF) return;
	return this.audio_loader.playBGM.apply(this.audio_loader, arguments);
};
Game.prototype.changeBGM = function () {
	if (CONSTANT.DEBUG.SOUND_OFF) return;
	return this.audio_loader.changeBGM.apply(this.audio_loader, arguments);
};
Game.prototype.stopBGM = function () {
	if (CONSTANT.DEBUG.SOUND_OFF) return;
	return this.audio_loader.stopBGM.apply(this.audio_loader, arguments);
};
Game.prototype.clearStageForDebug = function () {
	// 現在のシーンがステージシーンならば
	if (this.currentScene() instanceof SceneStage) {
		this.currentScene().clearStageForDebug();
	}
};

Game.prototype.setupDebug = function (dom) {
	if (!CONSTANT.DEBUG.ON) return;

	this.debug_manager.setOn(dom);

	// テキスト追加
	this.debug_manager.addMenuText("Zキーで決定。Xキーで位置入れ替え。矢印キーで移動。\nステージ上のアイテムを全て獲得するとクリア");

	// ゲームスタート ボタン
	this.debug_manager.addMenuButton("Run", function (game) {
		game.startRun();
	});

	// ゲームストップ ボタン
	this.debug_manager.addMenuButton("Stop", function (game) {
		game.stopRun();
	});

	// フルスクリーン ボタン
	this.debug_manager.addMenuButton("最大化", function (game) {
		game.fullscreen();
	});

	// Ex ストーリー クリア ボタン
	this.debug_manager.addMenuButton("現在のステージをクリア", function (game) {
		game.clearStageForDebug();
	});

	// ゲームデータ消去ボタン
	this.debug_manager.addMenuButton("セーブクリア", function (game) {
		game.storage_story.del();
	});

	// 通常ストーリー クリア ボタン
	this.debug_manager.addMenuButton("通常ストーリークリア", function (game) {
		game.storage_story.clearNormalStageForDebug();
	});

	// Ex ストーリー クリア ボタン
	this.debug_manager.addMenuButton("Ex ストーリークリア", function (game) {
		game.storage_story.clearExStageForDebug();
	});
};





module.exports = Game;

},{"./constant":6,"./hakurei":9,"./scene/00_loading":169,"./scene/01_title":170,"./scene/02_reminiscence":171,"./scene/03_logo":172,"./scene/04_prologue":173,"./scene/05_stage":174,"./scene/06_after_normal":175,"./scene/07_ex_epigraph":176,"./scene/08_ex_prologue":177,"./scene/09_after_ex":178,"./scene/10_staffroll":179,"./scene/11_epilogue":180,"./scene/howto":181,"./scene/music":222,"./scene/select":223,"./storage/story":233}],9:[function(require,module,exports){
'use strict';

module.exports = require("./hakureijs/index");

},{"./hakureijs/index":17}],10:[function(require,module,exports){
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

	// playing bgm name
	this._playing_bgm_name = null;

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

	this._playing_bgm_name = null;

	this.audio_source = null;
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

	self._playing_bgm_name = name;
	self.audio_source = self._createSourceNode(name);
	self.audio_source.start(0);
};

// play if the bgm is not playing now
AudioLoader.prototype.changeBGM = function(name) {
	if (this._playing_bgm_name !== name) {
		this.playBGM(name);
	}
};
AudioLoader.prototype.stopBGM = function() {
	var self = this;
	if(self.isPlayingBGM()) {
		self.audio_source.stop(0);
		self.audio_source = null;
		self._playing_bgm_name = null;
	}
};
AudioLoader.prototype.isPlayingBGM = function() {
	return this.audio_source ? true : false;
};
AudioLoader.prototype.currentPlayingBGM = function() {
	return this._playing_bgm_name;
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

},{}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
'use strict';

// only keyboard (because core class uses key board map)
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

},{}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
'use strict';

/* TODO: create input_manager class */

var WebGLDebugUtils = require("webgl-debug");
var CONSTANT = require("./constant");
var DebugManager = require("./debug_manager");
var InputManager = require("./input_manager");
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

	// WebGL 3D mode
	if(options.webgl) {
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
	// Canvas 2D mode
	else {
		this.ctx = this.canvas_dom.getContext('2d');
	}

	this.debug_manager = new DebugManager(this);

	this.input_manager = new InputManager();

	this.width = Number(canvas.getAttribute('width'));
	this.height = Number(canvas.getAttribute('height'));

	this.current_scene = null;
	this._reserved_next_scene = null; // next scene which changes next frame run
	this.scenes = {};

	this.frame_count = 0;

	this.request_id = null;

	this.image_loader = new ImageLoader();
	this.audio_loader = new AudioLoader();
	this.font_loader = new FontLoader();
};
Core.prototype.init = function () {
	this.current_scene = null;
	this._reserved_next_scene = null; // next scene which changes next frame run

	this.frame_count = 0;

	this.request_id = null;

	// TODO:
	//this.debug_manager.init();
	this.input_manager.init();

	this.image_loader.init();
	this.audio_loader.init();
	this.font_loader.init();

	this.addScene("loading", new SceneLoading(this));
};
Core.prototype.isRunning = function () {
	return this.request_id ? true : false;
};
Core.prototype.startRun = function () {
	if(this.isRunning()) return;

	this.run();
};
Core.prototype.stopRun = function () {
	if(!this.isRunning()) return;

	cancelAnimationFrame(this.request_id);

	this.request_id = null;
};
Core.prototype.run = function(){
	// get gamepad input
	// get pressed key time
	this.input_manager.beforeRun();

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

	this.frame_count++;

	this.input_manager.afterRun();

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
		if (this.currentScene() && this.currentScene().isSetFadeOut() && !this.currentScene().isInFadeOut()) {
			this.currentScene().startFadeOut();
		}
		else if (this.currentScene() && this.currentScene().isSetFadeOut() && this.currentScene().isInFadeOut()) {
			// waiting for quiting fade out
		}
		else {
			// change next scene
			this.current_scene = this._reserved_next_scene.shift();
			var current_scene = this.currentScene();
			current_scene.init.apply(current_scene, this._reserved_next_scene);

			this._reserved_next_scene = null;
		}
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
// this method is depricated.
Core.prototype.isKeyDown = function(flag) {
	return this.input_manager.isKeyDown(flag);
};
// this method is depricated.
Core.prototype.isKeyPush = function(flag) {
	return this.input_manager.isKeyPush(flag);
};
// this method is depricated.
Core.prototype.getKeyDownTime = function(bit_code) {
	return this.input_manager.getKeyDownTime(bit_code);
};
// this method is depricated.
Core.prototype.isLeftClickDown = function() {
	return this.input_manager.isLeftClickDown();
};
// this method is depricated.
Core.prototype.isLeftClickPush = function() {
	return this.input_manager.isLeftClickPush();
};
// this method is depricated.
Core.prototype.isRightClickDown = function() {
	return this.input_manager.isRightClickDown();
};
// this method is depricated.
Core.prototype.isRightClickPush = function() {
	return this.input_manager.isRightClickPush();
};

// this method is depricated.
Core.prototype.mousePositionX = function () {
	return this.input_manager.mousePositionX();
};
// this method is depricated.
Core.prototype.mousePositionY = function () {
	return this.input_manager.mousePositionX();
};
// this method is depricated.
Core.prototype.mouseMoveX = function () {
	return this.input_manager.mouseMoveX();
};
// this method is depricated.
Core.prototype.mouseMoveY = function () {
	return this.input_manager.mouseMoveY();
};
// this method is depricated.
Core.prototype.mouseScroll = function () {
	return this.input_manager.mouseScroll();
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
	// Note: safari 10.0 has document.fonts but not occur loadingdone event
	if(window.document && window.document.fonts && !navigator.userAgent.toLowerCase().indexOf("safari")) {
		window.document.fonts.addEventListener('loadingdone', function() { self.fontLoadingDone(); });
	}
	else {
		self.fontLoadingDone();
	}

	this.input_manager.setupEvents(this.canvas_dom);
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

},{"./asset_loader/audio":10,"./asset_loader/font":11,"./asset_loader/image":12,"./constant":13,"./debug_manager":16,"./input_manager":18,"./scene/loading":36,"./shader/main.fs":38,"./shader/main.vs":39,"./shader_program":40,"webgl-debug":29}],16:[function(require,module,exports){
'use strict';

var DebugManager = function (core) {
	this.core = core;
	this.dom = null; // debug menu area

	this.is_debug_mode = false; // default: false
};

DebugManager.prototype.setOn = function (dom) {
	this.is_debug_mode = true;
	this.dom = dom;
};
DebugManager.prototype.setOff = function () {
	this.is_debug_mode = false;
	this.dom = null;
};

// add text menu
DebugManager.prototype.addMenuText = function (text) {
	if(!this.is_debug_mode) return;

	// create element
	var dom = window.document.createElement('pre');
	dom.textContent = text;

	// add element
	this.dom.appendChild(dom);
};

// add button menu
DebugManager.prototype.addMenuButton = function (button_value, func) {
	if(!this.is_debug_mode) return;

	var core = this.core;

	// create element
	var input = window.document.createElement('input');

	// set attributes
	input.setAttribute('type', 'button');
	input.setAttribute('value', button_value);
	input.onclick = function () {
		func(core);
	};

	// add element
	this.dom.appendChild(input);
};

module.exports = DebugManager;

},{}],17:[function(require,module,exports){
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

},{"./asset_loader/audio":10,"./asset_loader/font":11,"./asset_loader/image":12,"./constant":13,"./core":15,"./object/base":30,"./object/pool_manager":31,"./object/pool_manager3d":32,"./object/sprite":33,"./object/sprite3d":34,"./scene/base":35,"./scene/loading":36,"./serif_manager":37,"./shader_program":40,"./storage/base":41,"./storage/save":42,"./util":43}],18:[function(require,module,exports){
'use strict';

var CONSTANT = require("./constant");
var Util = require("./util");

// const
var DEFAULT_BUTTON_ID_TO_BIT_CODE = {
	0: CONSTANT.BUTTON_Z,
	1: CONSTANT.BUTTON_X,
	2: CONSTANT.BUTTON_SPACE,
	3: CONSTANT.BUTTON_SHIFT,
};

var InputManager = function () {
	this.current_keyflag = 0x0;
	this.before_keyflag = 0x0;
	this._key_bit_code_to_down_time = {};

	// gamepad button_id to bit code of key input
	this._button_id_to_key_bit_code = Util.shallowCopyHash(DEFAULT_BUTTON_ID_TO_BIT_CODE);

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
};

InputManager.prototype.init = function () {
	this.current_keyflag = 0x0;
	this.before_keyflag = 0x0;
	this.initPressedKeyTime();

	// gamepad button_id to bit code of key input
	this._button_id_to_key_bit_code = Util.shallowCopyHash(DEFAULT_BUTTON_ID_TO_BIT_CODE);

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
};
InputManager.prototype.enableGamePad = function () {
	this.is_connect_gamepad = true;
};
InputManager.prototype.beforeRun = function(){
	// get gamepad input
	this.handleGamePad();

	// get pressed key time
	this.handlePressedKeyTime();
};

InputManager.prototype.afterRun = function(){
	// save key current pressed keys
	this.before_keyflag = this.current_keyflag;
	this.before_is_left_clicked = this.is_left_clicked;
	this.before_is_right_clicked = this.is_right_clicked;

	// reset mouse wheel and mouse move
	this.mouse_scroll = 0;
	this.mouse_change_x = 0;
	this.mouse_change_y = 0;
};


InputManager.prototype.handleKeyDown = function(e) {
	this.current_keyflag |= this._keyCodeToBitCode(e.keyCode);
	e.preventDefault();
};
InputManager.prototype.handleKeyUp = function(e) {
	this.current_keyflag &= ~this._keyCodeToBitCode(e.keyCode);
	e.preventDefault();
};
InputManager.prototype.isKeyDown = function(flag) {
	return((this.current_keyflag & flag) ? true : false);
};
InputManager.prototype.isKeyPush = function(flag) {
	return !(this.before_keyflag & flag) && this.current_keyflag & flag;
};


InputManager.prototype.getKeyDownTime = function(bit_code) {
	return this._key_bit_code_to_down_time[bit_code];
};

InputManager.prototype.handleMouseDown = function(event) {
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
InputManager.prototype.handleMouseUp = function(event) {
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
InputManager.prototype.isLeftClickDown = function() {
	return this.is_left_clicked;
};
InputManager.prototype.isLeftClickPush = function() {
	// not true if is pressed in previous frame
	return this.is_left_clicked && !this.before_is_left_clicked;
};
InputManager.prototype.isRightClickDown = function() {
	return this.is_right_clicked;
};
InputManager.prototype.isRightClickPush = function() {
	// not true if is pressed in previous frame
	return this.is_right_clicked && !this.before_is_right_clicked;
};
InputManager.prototype.handleMouseMove = function (d) {
	d = d ? d : window.event;
	d.preventDefault();
	this.mouse_change_x = this.mouse_x - d.clientX;
	this.mouse_change_y = this.mouse_y - d.clientY;
	this.mouse_x = d.clientX;
	this.mouse_y = d.clientY;
};
InputManager.prototype.mousePositionX = function () {
	return this.mouse_x;
};
InputManager.prototype.mousePositionY = function () {
	return this.mouse_y;
};
InputManager.prototype.mouseMoveX = function () {
	return this.mouse_change_x;
};
InputManager.prototype.mouseMoveY = function () {
	return this.mouse_change_y;
};
InputManager.prototype.handleMouseWheel = function (event) {
	this.mouse_scroll = event.detail ? event.detail : -event.wheelDelta/120;
};
InputManager.prototype.mouseScroll = function () {
	return this.mouse_scroll;
};
InputManager.prototype._keyCodeToBitCode = function(keyCode) {
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
InputManager.prototype.handleGamePad = function() {
	if(!this.is_connect_gamepad) return;
	var pads = window.navigator.getGamepads();
	var pad = pads[0]; // 1Pコン

	if(!pad) return;

	// button
	for (var i = 0, len = pad.buttons.length; i < len; i++) {
		if(!(i in this._button_id_to_key_bit_code)) continue; // ignore if I don't know its button
		if(pad.buttons[i].pressed) { // pressed
			this.current_keyflag |= this.getKeyByButtonId(i);
		}
		else { // not pressed
			this.current_keyflag &= ~this.getKeyByButtonId(i);
		}
	}

	// arrow keys
	if (pad.axes[1] < -0.5) {
			this.current_keyflag |= CONSTANT.BUTTON_UP;
	}
	else {
			this.current_keyflag &= ~CONSTANT.BUTTON_UP;
	}
	if (pad.axes[1] > 0.5) {
			this.current_keyflag |= CONSTANT.BUTTON_DOWN;
	}
	else {
			this.current_keyflag &= ~CONSTANT.BUTTON_DOWN;
	}
	if (pad.axes[0] < -0.5) {
			this.current_keyflag |= CONSTANT.BUTTON_LEFT;
	}
	else {
			this.current_keyflag &= ~CONSTANT.BUTTON_LEFT;
	}
	if (pad.axes[0] > 0.5) {
			this.current_keyflag |= CONSTANT.BUTTON_RIGHT;
	}
	else {
			this.current_keyflag &= ~CONSTANT.BUTTON_RIGHT;
	}
};
InputManager.prototype.initPressedKeyTime = function() {
	this._key_bit_code_to_down_time = {};

	for (var button_id in CONSTANT) {
		var bit_code = CONSTANT[button_id];
		this._key_bit_code_to_down_time[bit_code] = 0;
	}
};

InputManager.prototype.handlePressedKeyTime = function() {
	for (var button_id in CONSTANT) {
		var bit_code = CONSTANT[button_id];
		if (this.isKeyDown(bit_code)) {
			this._key_bit_code_to_down_time[bit_code]++;
		}
		else {
			this._key_bit_code_to_down_time[bit_code] = 0;
		}
	}
};
InputManager.prototype.setupEvents = function(canvas_dom) {
	var self = this;

	// bind keyboard
	window.onkeydown = function(e) { self.handleKeyDown(e); };
	window.onkeyup   = function(e) { self.handleKeyUp(e); };

	// bind mouse click
	canvas_dom.onmousedown = function(e) { self.handleMouseDown(e); };
	canvas_dom.onmouseup   = function(e) { self.handleMouseUp(e); };

	// bind mouse move
	canvas_dom.onmousemove = function(d) { self.handleMouseMove(d); };

	// bind mouse wheel
	var mousewheelevent = (window.navi && /Firefox/i.test(window.navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
	if (canvas_dom.addEventListener) { //WC3 browsers
		canvas_dom.addEventListener(mousewheelevent, function(e) {
			var event = window.event || e;
			self.handleMouseWheel(event);
		}, false);
	}

	// unable to use right click menu.
	// NOTE: not used
	// this.canvas_dom.oncontextmenu = function() { return false; };

	// bind gamepad
	if(window.Gamepad && window.navigator && window.navigator.getGamepads) {
		self.enableGamePad();
	}
};

InputManager.prototype.getKeyByButtonId = function(button_id) {
	var keys = this._button_id_to_key_bit_code[button_id];
	if(!keys) keys = 0x00;

	return keys;
};

// get one of the pressed button id
InputManager.prototype.getAnyButtonId = function(){
	if(!this.is_connect_gamepad) return;

	var pads = window.navigator.getGamepads();
	var pad = pads[0]; // 1Pコン

	if(!pad) return;

	for (var i = 0; i < pad.buttons.length; i++) {
		if(pad.buttons[i].pressed) {
			return i;
		}
	}
};
/*
InputManager.prototype.setButtonIdMapping = function(button_id, key) {
	var defined_key = this._button_id_to_key_bit_code[button_id];

	for (var target_button_id in this._button_id_to_key_bit_code) {
		var target_key = this._button_id_to_key_bit_code[target_button_id];
		// If there are already set keys in other keys, replace it.
		if (target_key === key) {
			if (defined_key) {
				// replace other key's button_id mapping to current button_id's key.
				this._button_id_to_key_bit_code[target_button_id] = defined_key;
			}
			else {
				// the player presses target_button_id, no event has occured.
				delete this._button_id_to_key_bit_code[target_button_id];
			}
		}
	}

	// set
	this._button_id_to_key_bit_code[button_id] = key;
};

InputManager.prototype.setAllButtonIdMapping = function(map) {
	this._button_id_to_key_bit_code = Util.shallowCopyHash(map);
};

InputManager.prototype.getButtonIdToKeyMap = function() {
	return Util.shallowCopyHash(this._button_id_to_key_bit_code);
};
// convert { value => key } hash
InputManager.prototype.getKeyToButtonIdMap = function() {
	var map = {};
	for (var button_id in this._button_id_to_key_bit_code) {
		var key = this._button_id_to_key_bit_code[button_id];
		map[key] = button_id; // NOTE: cannot duplicate, if it, overwrite it
	}

	return map;
};


InputManager.prototype.dumpGamePadKey = function() {
	var dump = {};

	for (var button_id in this._button_id_to_key_bit_code) {
		var key = this._button_id_to_key_bit_code[ button_id ];
		switch(key) {
			case CONSTANT.BUTTON_LEFT:
				dump[button_id] = "LEFT";
				break;
			case CONSTANT.BUTTON_UP:
				dump[button_id] = "UP";
				break;
			case CONSTANT.BUTTON_RIGHT:
				dump[button_id] = "RIGHT";
				break;
			case CONSTANT.BUTTON_DOWN:
				dump[button_id] = "DOWN";
				break;
			case CONSTANT.BUTTON_Z:
				dump[button_id] = "Z";
				break;
			case CONSTANT.BUTTON_X:
				dump[button_id] = "X";
				break;
			case CONSTANT.BUTTON_SHIFT:
				dump[button_id] = "SHIFT";
				break;
			case CONSTANT.BUTTON_SPACE:
				dump[button_id] = "SPACE";
				break;
			default:
				dump[button_id] = "UNKNOWN";
		}
	}

	console.log(dump);
};
*/





module.exports = InputManager;

},{"./constant":13,"./util":43}],19:[function(require,module,exports){
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
},{"./gl-matrix/common.js":20,"./gl-matrix/mat2.js":21,"./gl-matrix/mat2d.js":22,"./gl-matrix/mat3.js":23,"./gl-matrix/mat4.js":24,"./gl-matrix/quat.js":25,"./gl-matrix/vec2.js":26,"./gl-matrix/vec3.js":27,"./gl-matrix/vec4.js":28}],20:[function(require,module,exports){
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

},{}],21:[function(require,module,exports){
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

},{"./common.js":20}],22:[function(require,module,exports){
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

},{"./common.js":20}],23:[function(require,module,exports){
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

},{"./common.js":20}],24:[function(require,module,exports){
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

},{"./common.js":20}],25:[function(require,module,exports){
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

},{"./common.js":20,"./mat3.js":23,"./vec3.js":27,"./vec4.js":28}],26:[function(require,module,exports){
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

},{"./common.js":20}],27:[function(require,module,exports){
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

},{"./common.js":20}],28:[function(require,module,exports){
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

},{"./common.js":20}],29:[function(require,module,exports){
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
},{}],30:[function(require,module,exports){
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
ObjectBase.prototype.onCollision = function(obj){
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

ObjectBase.prototype.collisionWidth = function(obj) {
	return 0;
};
ObjectBase.prototype.collisionHeight = function(obj) {
	return 0;
};
ObjectBase.prototype.isCollision = function(obj) {
	return true;
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
	if (!this.isCollision(obj) || !obj.isCollision(this)) return false;

	if(Math.abs(this.x() - obj.x()) < this.collisionWidth(obj)/2 + obj.collisionWidth(this)/2 &&
		Math.abs(this.y() - obj.y()) < this.collisionHeight(obj)/2 + obj.collisionHeight(this)/2) {
		return true;
	}

	return false;
};

ObjectBase.prototype.getCollisionLeftX = function(obj) {
	return this.x() - this.collisionWidth(obj) / 2;
};
ObjectBase.prototype.getCollisionRightX = function(obj) {
	return this.x() + this.collisionWidth(obj) / 2;
};
ObjectBase.prototype.getCollisionUpY = function(obj) {
	return this.y() - this.collisionHeight(obj) / 2;
};
ObjectBase.prototype.getCollisionDownY = function(obj) {
	return this.y() + this.collisionHeight(obj) / 2;
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


},{"../util":43}],31:[function(require,module,exports){
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

},{"../util":43,"./base":30}],32:[function(require,module,exports){
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

},{"../constant_3d":14,"../util":43,"./base":30,"gl-matrix":19}],33:[function(require,module,exports){
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

		ctx.globalAlpha = this.alpha();
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
Sprite.prototype.alpha = function() {
	return 1.0;
};





module.exports = Sprite;

},{"../util":43,"./base":30}],34:[function(require,module,exports){
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

},{"../constant_3d":14,"../util":43,"./base":30,"gl-matrix":19}],35:[function(require,module,exports){
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

	// property for fade in
	this._fade_in_duration = null;
	this._fade_in_color = null;
	this._fade_in_start_frame_count = null;

	// property for fade out
	this._fade_out_duration = null;
	this._fade_out_color = null;
	this._fade_out_start_frame_count = null;
};

SceneBase.prototype.init = function(){
	// sub scenes
	this.current_scene = null;
	this._reserved_next_scene = null; // next scene which changes next frame run

	this._x = 0;
	this._y = 0;

	this.frame_count = 0;

	// property for fade in
	this._fade_in_duration = null;
	this._fade_in_color = null;
	this._fade_in_start_frame_count = null;

	// property for fade out
	this._fade_out_duration = null;
	this._fade_out_color = null;
	this._fade_out_start_frame_count = null;

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
	var ctx = this.core.ctx;

	var alpha;
	// fade in
	if (this.isInFadeIn()) {
		ctx.save();

		// tranparent settings
		if(this.frame_count - this._fade_in_start_frame_count < this._fade_in_duration) {
			alpha = 1.0 - (this.frame_count - this._fade_in_start_frame_count) / this._fade_in_duration;
		}
		else {
			alpha = 0.0;
		}

		ctx.globalAlpha = alpha;

		// transition color
		ctx.fillStyle = this._fade_in_color;
		ctx.fillRect(0, 0, this.width, this.height);

		ctx.restore();

		// alpha === 0.0 by transparent settings so quit fade in
		// why there? because alpha === 0, _fade_in_color === null by quitFadeIn method
		if(alpha === 1) this._quitFadeIn();

	}
	// fade out
	else if (this.isInFadeOut()) {
		ctx.save();

		// tranparent settings
		if(this.frame_count - this._fade_out_start_frame_count < this._fade_out_duration) {
			alpha = (this.frame_count - this._fade_out_start_frame_count) / this._fade_out_duration;
		}
		else {
			alpha = 1.0;
		}

		ctx.globalAlpha = alpha;

		// transition color
		ctx.fillStyle = this._fade_out_color;
		ctx.fillRect(0, 0, this.width, this.height);

		ctx.restore();

		// alpha === 1.0 by transparent settings so quit fade out
		// why there? because alpha === 1, _fade_out_color === null by quitFadeOut method
		if(alpha === 1) this._quitFadeOut();
	}

	for(var i = 0, len = this.objects.length; i < len; i++) {
		this.objects[i].afterDraw();
	}

	if(this.currentSubScene()) this.currentSubScene().afterDraw();
};

SceneBase.prototype.addObject = function(object){
	this.objects.push(object);
};
SceneBase.prototype.addObjects = function(object_list){
	this.objects = this.objects.concat(object_list);
};

SceneBase.prototype.currentSubScene = function() {
	if(this.current_scene === null) {
		return;
	}

	return this.scenes[this.current_scene];
};
SceneBase.prototype.getSubScene = function(name) {
	return this.scenes[name];
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

SceneBase.prototype.setFadeIn = function(duration, color) {
	this._fade_in_duration = duration || 30;
	this._fade_in_color = color || 'white';

	// start fade in immediately
	this._startFadeIn();
};
SceneBase.prototype._startFadeIn = function() {
	this._quitFadeOut();
	this._fade_in_start_frame_count = this.frame_count;
};

SceneBase.prototype._quitFadeIn = function() {
	this._fade_in_duration = null;
	this._fade_in_color = null;
	this._fade_in_start_frame_count = null;
};
SceneBase.prototype.isInFadeIn = function() {
	return this._fade_in_start_frame_count !== null ? true : false;
};


SceneBase.prototype.setFadeOut = function(duration, color) {
	this._fade_out_duration = duration || 30;
	this._fade_out_color = color || 'black';
};
SceneBase.prototype.startFadeOut = function() {
	if(!this.isSetFadeOut()) return;

	this._quitFadeIn();
	this._fade_out_start_frame_count = this.frame_count;
};

SceneBase.prototype._quitFadeOut = function() {
	this._fade_out_duration = null;
	this._fade_out_color = null;
	this._fade_out_start_frame_count = null;
};
SceneBase.prototype.isInFadeOut = function() {
	return this._fade_out_start_frame_count !== null ? true : false;
};
SceneBase.prototype.isSetFadeOut = function() {
	return this._fade_out_duration && this._fade_out_color ? true : false;
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


},{}],36:[function(require,module,exports){
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

},{"../util":43,"./base":35}],37:[function(require,module,exports){
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

	this._font_color = null;

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

	this._font_color = null;

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

	this._setFont(script);

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

SerifManager.prototype._setFont = function(script) {
	this._font_color  = script.font_color;
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
SerifManager.prototype.font_color = function () {
	return this._font_color;
};
SerifManager.prototype.is_background_changed = function () {
	return this._is_background_changed;
};





SerifManager.prototype.lines = function () {
	return this.printing_lines;
};

module.exports = SerifManager;

},{}],38:[function(require,module,exports){
module.exports = "precision mediump float;\nuniform sampler2D uSampler;\nvarying vec2 vTextureCoordinates;\nvarying vec4 vColor;\n\nvoid main() {\n\tvec4 textureColor = texture2D(uSampler, vTextureCoordinates);\n\tgl_FragColor = textureColor * vColor;\n}\n\n";

},{}],39:[function(require,module,exports){
module.exports = "attribute vec3 aVertexPosition;\nattribute vec2 aTextureCoordinates;\nattribute vec4 aColor;\n\nuniform mat4 uMVMatrix;\nuniform mat4 uPMatrix;\nvarying vec2 vTextureCoordinates;\nvarying vec4 vColor;\n\nvoid main() {\n\tgl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);\n\tvTextureCoordinates = aTextureCoordinates;\n\tvColor = aColor;\n}\n\n";

},{}],40:[function(require,module,exports){
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

},{"gl-matrix":19}],41:[function(require,module,exports){
'use strict';

/*
 * TODO: split load and save method by sync and async
 * TODO: compress save data
 * TODO: implement: defineColumnProperty method
 */

var Util = require("../util");

var DEFAULT_KEY = "hakurei_engine:default";

var StorageBase = function (data) {
	if(!data) data = {};
	this._data = data;
};

// save file unique key
// this constant must be overridden!
StorageBase.KEY = function() {
	return DEFAULT_KEY;
};

StorageBase.prototype.set = function(key, value) {
	this._data[key] = value;
};
StorageBase.prototype.get = function(key) {
	return this._data[key];
};
StorageBase.prototype.remove = function(key) {
	return delete this._data[key];
};
StorageBase.prototype.isEmpty = function(key) {
	return Object.keys(this._data).length === 0;
};
StorageBase.prototype.toHash = function() {
	return Util.shallowCopyHash(this._data);
};


// is Electron or NW.js ?
StorageBase.isLocalMode = function() {
	// this is Electron
	if (Util.isElectron()) {
		return true;
	}

	// TODO: NW.js
	return false;
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
	var fs = window.require('fs');

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
	var path = window.require('path');

	var base = path.dirname(window.process.mainModule.filename);
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
	var data;
	if (this.isLocalMode()) {
		data = this._loadFromLocalFile();
	}
	else {
		data = this._loadFromWebStorage();
	}

	var Klass = this;
	if (data) {
		// there is a storage data
		return new Klass(data);
	}
	else {
		// there is NOT a storage data
		return new Klass();
	}

};

StorageBase._loadFromLocalFile = function() {
	var fs = window.require('fs');

	var file_path = this._localFilePath(this.KEY());
	if (!fs.existsSync(file_path)) return null;

	var data = fs.readFileSync(file_path, { encoding: 'utf8' });

	var Klass = this;
	if (data) {
		return JSON.parse(data);
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
		return JSON.parse(data);
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

	// reset this object properties
	this._data = {};
};

StorageBase.prototype._removeLocalFile = function() {
	var Klass = this.constructor;
	var fs = window.require('fs');
	var file_path = this._localFilePath(Klass.KEY());

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

},{"../util":43}],42:[function(require,module,exports){
'use strict';
var base_class = require('./base');
var util = require('../util');

var StorageSave = function(scene) {
	base_class.apply(this, arguments);
};
util.inherit(StorageSave, base_class);

StorageSave.KEY = function(){
	var key = "hakurei_engine:save";
	if (!this.isLocalMode() && window && window.location) {
		return(key + ":" + window.location.pathname);
	}
	else {
		return "save";
	}
};

module.exports = StorageSave;

},{"../util":43,"./base":41}],43:[function(require,module,exports){
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
	isElectron: function() {
		if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
			return true;
		}
		return false;
	},
	canPlayOgg: function () {
		var audio = document.createElement('audio');
		if (audio.canPlayType) {
			return audio.canPlayType('audio/ogg');
		}

		return false;
	},
	shallowCopyHash: function (src_hash) {
		var dst_hash = {};
		for(var k in src_hash){
			dst_hash[k] = src_hash[k];
		}
		return dst_hash;
	}
};

module.exports = Util;

},{}],44:[function(require,module,exports){
'use strict';

/* 画像を暗くするロジック */

// 静的クラス
var CreateDarkerImage = function() {};

CreateDarkerImage.exec = function (image) {
	var canvas = document.createElement("canvas");
	canvas.width = image.width;
	canvas.height = image.height;
	var ctx2 = canvas.getContext("2d");

	ctx2.globalAlpha = 0.5;
	ctx2.fillStyle = 'rgb( 0, 0, 0 )';
	ctx2.fillRect(
		0,
		0,
		image.width,
		image.height
	);

	ctx2.globalCompositeOperation = "destination-atop";
	ctx2.globalAlpha = 1.0;

	ctx2.drawImage(image,
		0,
		0,
		image.width,
		image.height
	);

	return canvas;
};

module.exports = CreateDarkerImage;

},{}],45:[function(require,module,exports){
'use strict';

/* マップ内の各種オブジェクトを生成 */
var CONSTANT = require('../constant');

var BlockGreen    = require('../object/tile/block_green');
var BlockBlue     = require('../object/tile/block_blue');
var BlockRed      = require('../object/tile/block_red');
var BlockPurple   = require('../object/tile/block_purple');
var BlockDisappear= require('../object/tile/block_disappear');
var Ladder        = require('../object/tile/ladder');
var Player        = require('../object/tile/player');
var Enemy         = require('../object/tile/enemy');
var EnemyVertical = require('../object/tile/enemy_vertical');
var ItemForReimu  = require('../object/tile/item_for_reimu');
var ItemForYukari = require('../object/tile/item_for_yukari');
var ItemOfExchange= require('../object/tile/item_of_exchange');
var Death         = require('../object/tile/death');
var BlockStone1   = require('../object/tile/block_stone1');
var BlockStone2   = require('../object/tile/block_stone2');
var BlockStone3   = require('../object/tile/block_stone3');

var StageFrame1  = require('../object/stage_frame1');
var StageFrame2  = require('../object/stage_frame2');

var LogicScore = require('../logic/score');

// tile_type => クラス名
var TILE_TYPE_TO_CLASS = {};
//TILE_TYPE_TO_CLASS[CONSTANT.BACKGROUND]  = BackGround;
TILE_TYPE_TO_CLASS[CONSTANT.BLOCK_GREEN]     = BlockGreen;
TILE_TYPE_TO_CLASS[CONSTANT.BLOCK_BLUE]      = BlockBlue;
TILE_TYPE_TO_CLASS[CONSTANT.BLOCK_RED]       = BlockRed;
TILE_TYPE_TO_CLASS[CONSTANT.BLOCK_PURPLE]    = BlockPurple;
TILE_TYPE_TO_CLASS[CONSTANT.BLOCK_DISAPPEAR] = BlockDisappear;
TILE_TYPE_TO_CLASS[CONSTANT.LADDER]          = Ladder;
TILE_TYPE_TO_CLASS[CONSTANT.PLAYER]          = Player;
TILE_TYPE_TO_CLASS[CONSTANT.ENEMY]           = Enemy;
TILE_TYPE_TO_CLASS[CONSTANT.ENEMY_VERTICAL]  = EnemyVertical;
TILE_TYPE_TO_CLASS[CONSTANT.ITEM_FOR_REIMU]  = ItemForReimu;
TILE_TYPE_TO_CLASS[CONSTANT.ITEM_FOR_YUKARI] = ItemForYukari;
TILE_TYPE_TO_CLASS[CONSTANT.ITEM_OF_EXCHANGE]= ItemOfExchange;
TILE_TYPE_TO_CLASS[CONSTANT.DEATH]           = Death;
TILE_TYPE_TO_CLASS[CONSTANT.BLOCK_STONE1]    = BlockStone1;
TILE_TYPE_TO_CLASS[CONSTANT.BLOCK_STONE2]    = BlockStone2;
TILE_TYPE_TO_CLASS[CONSTANT.BLOCK_STONE3]    = BlockStone3;

// 静的クラス
var CreateMap = function() {};

// 初期化
CreateMap._initializeObjectsByTileType = function () {
	var data = {};

	for (var tile_type in TILE_TYPE_TO_CLASS) {
		data[ tile_type ] = [];
	}

	return data;
};

// 実行
CreateMap.exec = function (scene, map, offset_x, offset_y, scale) {
	scale = scale || 1;

	var tile_size = CONSTANT.TILE_SIZE * scale;

	// 初期化
	var objects_by_tile_type = this._initializeObjectsByTileType();

	for (var pos_y = 0; pos_y < map.length; pos_y++) {
		var line = map[pos_y];
		for (var pos_x = 0; pos_x < line.length; pos_x++) {
			var tile = line[pos_x];
			var x = pos_x * tile_size + offset_x + tile_size/2;
			var y = pos_y * tile_size + offset_y + tile_size/2;

			var Class = TILE_TYPE_TO_CLASS[ tile ];

			if(!Class) continue; // 何もタイルがなければ何も表示しない

			// シーンにオブジェクト追加
			var instance = new Class(scene);
			instance.init(x, y, scale);

			// タイルの種類毎にオブジェクトを管理
			if(!objects_by_tile_type[ tile ]) objects_by_tile_type[ tile ] = []; //初期化
			objects_by_tile_type[ tile ].push(instance);
		}
	}

	return objects_by_tile_type;
};

CreateMap.drawBackground = function (ctx, bg_image, offset_x, offset_y, scale) {
	scale = scale || 1;
	var tile_size = CONSTANT.TILE_SIZE * scale;
	ctx.save();

	var cpt2 = ctx.createPattern(bg_image, "repeat");

	ctx.fillStyle = cpt2;
	ctx.fillRect(
		offset_x, offset_y,
		tile_size * CONSTANT.STAGE_TILE_X_NUM, tile_size * CONSTANT.STAGE_TILE_Y_NUM
	);
	ctx.restore();
};

CreateMap.drawFrames = function(scene, offset_x, offset_y, scale) {
	scale = scale || 1;
	var tile_size = CONSTANT.TILE_SIZE * scale;

	var x,y, is_vertical;

	var stage_frame1 = new StageFrame1(scene);
	var stage_frame2 = new StageFrame2(scene);

	for (var pos_y = 0; pos_y < CONSTANT.STAGE_TILE_Y_NUM-1; pos_y++) { //縦
		// 左
		x = offset_x;
		y = pos_y * tile_size + (offset_y) + 24;

		is_vertical = true;
		stage_frame1.draw(x, y, is_vertical);

		// 右
		x = offset_x + tile_size * CONSTANT.STAGE_TILE_X_NUM;

		is_vertical = true;
		stage_frame1.draw(x, y, is_vertical);

	}
	for (var pos_x = 0; pos_x < CONSTANT.STAGE_TILE_X_NUM-1; pos_x++) { // 横
		// 上
		x = pos_x * tile_size + (offset_x) + 24;
		y = offset_y;

		is_vertical = false;
		stage_frame1.draw(x, y, is_vertical);

		// 下
		y = offset_y + tile_size * CONSTANT.STAGE_TILE_Y_NUM;

		is_vertical = false;
		stage_frame1.draw(x, y, is_vertical);
	}

	// 角
	stage_frame2.draw(offset_x, offset_y, 270);
	stage_frame2.draw(offset_x+tile_size*CONSTANT.STAGE_TILE_X_NUM, offset_y, 0);
	stage_frame2.draw(offset_x, offset_y+tile_size*CONSTANT.STAGE_TILE_Y_NUM, 180);
	stage_frame2.draw(offset_x+tile_size*CONSTANT.STAGE_TILE_X_NUM, offset_y+tile_size*CONSTANT.STAGE_TILE_Y_NUM, 90);
};



module.exports = CreateMap;

},{"../constant":6,"../logic/score":48,"../object/stage_frame1":140,"../object/stage_frame2":141,"../object/tile/block_blue":143,"../object/tile/block_disappear":144,"../object/tile/block_green":145,"../object/tile/block_purple":146,"../object/tile/block_red":147,"../object/tile/block_stone1":148,"../object/tile/block_stone2":149,"../object/tile/block_stone3":150,"../object/tile/death":151,"../object/tile/enemy":152,"../object/tile/enemy_vertical":153,"../object/tile/item_for_reimu":154,"../object/tile/item_for_yukari":155,"../object/tile/item_of_exchange":156,"../object/tile/ladder":157,"../object/tile/player":158}],46:[function(require,module,exports){
'use strict';

// 星3つ
var messageS = [
	["reimu", "smile", "やるじゃない！"],
	["yukari", "smile", "あら、すてきね！"],
	//["reimu", "smile", ""],
];

// 星2つ
var messageA = [
	["reimu", "normal2", "まぁ、こんなところね"],
	["yukari", "normal3", "上出来ね"],
	//["reimu", "smile", "星2つ メッセージC"],
];

// 星1つ
var messageB = [
	["reimu", "yarare", "ちょっと調子が悪かっただけよ"],
	["yukari", "normal2", "あら、残念"],
	["yukari", "normal1", "雨垂れでも石を穿つものよ。次がんばりましょう"],

];

module.exports = {
	1: messageB,
	2: messageA,
	3: messageS,
};

},{}],47:[function(require,module,exports){
'use strict';

//ステージ1~15のリザルト画面のメッセージ
var messageA = [
	// デート気分
	//["reimu", "confused", ""],
	["yukari", "disappointed", "霊夢ったら、せっかくの肝試しなのに全然怖がってくれないわ"],
	["yukari", "ecstasy1", "霊夢ー！おばけー！"],
];

//ステージ16~30のリザルト画面のメッセージ
var messageB = [
	["reimu", "normal1", "そもそも、このオバケたち、どこから持ってきたのよ"],
	["reimu", "normal1", "紫、アイツ何か隠しているんじゃないかしら"],
	["yukari", "ecstasy1", "霊夢ったら、いつの間にか一人前になっちゃって"],
	["yukari", "normal1", "博麗大結界は代々、博麗の巫女が管理してきたのよ"],
	["reimu", "normal1", "アイツとこうしてるのも、月の異変以来ね"],
];

//ステージ31~40のリザルト画面のメッセージ
var messageC = [
	["reimu", "strength2", "アイツ、ガラにもないこと言い出して...\n絶対連れ戻すんだから！"],
	["reimu", "confused", "紫..."],
	//["reimu", "smile", "31-40 メッセージC"],
];

var i;
var messages = [];

for (i = 0; i < 15; i++) {
	messages.push(messageA);
}
for (i = 15; i < 30; i++) {
	messages.push(messageB);
}
for (i = 30; i < 40; i++) {
	messages.push(messageC);
}

module.exports = messages;

},{}],48:[function(require,module,exports){
'use strict';


var MAPS = require('../stage_config').MAPS;

/* スコア計算ロジック */

// 静的クラス
var Score = function() {};


// 称号がどれか計算
// S -> 3
// A -> 2
// B -> 1
Score.calcHonor = function(stage_no, time, exchange_num){
	var stage_data = this.getStageData(stage_no);

	var score          = this.calcScore(time, exchange_num);
	var criteria_score = this.calcScore(stage_data.criteria_time, stage_data.criteria_exchange_num);

	if (score > criteria_score) {
		return 3;
	}
	else if (criteria_score >= score && score > criteria_score - 10000) {
		return 2;
	}
	else if (criteria_score - 10000 >= score) {
		return 1;
	}
};


// スコア(数字)
// time -> 600 くらい
// exchange_num  -> 1 くらい
Score.calcScore = function(time, exchange_num){
	var t = 10000 - time;
	var e = 10 - exchange_num;

	if(t < 0) t = 0;
	if(e < 0) e = 0;

	return t*e;
};

Score.getStageData = function(stage_no){
	return MAPS[stage_no];
};
module.exports = Score;

},{"../stage_config":232}],49:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
	//（1. 霊夢と紫が別れるときのセリフを言ってるシーン）
	{"font_color": "#e6373c", "background":"after_ex1","pos":null,"exp":null,"chara":null,"serif":"やっぱり……無理なの？"},
	{"font_color": "#8b5fbf", "background":"after_ex1","pos":null,"exp":null,"chara":null,"serif":"ええ、ごめんなさいね"},
	{"font_color": "#8b5fbf", "background":"after_ex1","pos":null,"exp":null,"chara":null,"serif":"でも……また逢えるから。貴女が寂しくなったときにはきっと、ね"},
	{"font_color": "#e6373c", "background":"after_ex1","pos":null,"exp":null,"chara":null,"serif":"紫は……幻想郷の方が大事なの？"},
	{"font_color": "#8b5fbf", "background":"after_ex1","pos":null,"exp":null,"chara":null,"serif":"……そんなことはないわよ。愛しの子らだもの、貴女も幻想郷も同じくらい好きよ"},
	{"font_color": "#8b5fbf", "background":"after_ex1","pos":null,"exp":null,"chara":null,"serif":"でもね、霊夢。始まりには必ず終わりが来るものなのよ。生きとし生けるものが\n泡沫のように散り去るのと同じように、森羅万象全てにはそう宿命付けられているの"},
	{"font_color": "#8b5fbf", "background":"after_ex1","pos":null,"exp":null,"chara":null,"serif":"それはとても哀しいことだけれども、終わることで始まることもある。\n消えぬ霧を、迎えぬ春を、明けぬ夜を終えて乗り越えた貴女なら分かるでしょう？"},
	{"font_color": "#8b5fbf", "background":"after_ex1","pos":null,"exp":null,"chara":null,"serif":"だから大丈夫、心配する必要なんてないわ。私が愛することが出来なくても、\n今度は代わりに幻想郷が貴女を愛する。貴女はもう素敵な楽園の巫女なのだから、ね？"},
	{"font_color": "#e6373c", "background":"after_ex1","pos":null,"exp":null,"chara":null,"serif":"…………そんなこと……ない"},
	{"font_color": "#e6373c", "background":"after_ex1","pos":null,"exp":null,"chara":null,"serif":"私にだって、終わらせたくない異変もあるのよ……紫"},
	{"font_color": "#8b5fbf", "background":"after_ex1","pos":null,"exp":null,"chara":null,"serif":"ダメよ、霊夢。貴女の手でこの異変に幕を下ろさなきゃ。\n異変を解決するのが、貴女の務めなのだから。お願い、分かって"},
	{"font_color": "#e6373c", "background":"after_ex1","pos":null,"exp":null,"chara":null,"serif":"…………"},

	//（2. 霊夢のわかったわって顔）

	{"background":"after_ex2","pos":null,"exp":null,"chara":null,"serif":"…………わかったわよ。紫にそんな顔されたんじゃ、\nまるで私が紫を困らせる悪い子みたいじゃない"},
	{"background":"after_ex2","pos":null,"exp":null,"chara":null,"serif":"薄々は感じていたわ。紫がこんなことをするってことは、もうどうしようもないところ\nまで来ていることくらいは。それでも可能性があるのなら、それに賭けたかったのよ"},
	{"background":"after_ex2","pos":null,"exp":null,"chara":null,"serif":"……でも、その賭けもどうやら負けのようね。私はこのまま幻想郷に戻るわ。\nそろそろ心も体も限界だし"},
	{"background":"after_ex2","pos":null,"exp":null,"chara":null,"serif":"寂しくないと言ったら嘘になるけれど……、こればかりは仕方ないわよね"},
	{"background":"after_ex2","pos":null,"exp":null,"chara":null,"serif":"じゃあここでお別れね。楽しかったわ、紫"},
	{"background":"after_ex2","pos":null,"exp":null,"chara":null,"serif":"さようなら……"},

	//（白背景）
	{"background":"after_ex3","pos":null,"exp":null,"chara":null,"serif":"霊夢、忘れ物よ"},
	{"background":"after_ex3","pos":null,"exp":null,"chara":null,"serif":"えっ"},

	//（3. 紫が霊夢を抱きしめて撫でる）
	{"background":"after_ex4","pos":null,"exp":null,"chara":null,"serif":"じゃあね、霊夢。またね"},
];
module.exports = Serif;

},{}],50:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
	{"background": "shrine_night", "pos":"right","exp":"confused","chara":"reimu","serif":"ここは……ウチの神社！？"},
	{"background": "shrine_night", "pos":"right","exp":"confused","chara":"reimu","serif":"まさか――始めからこうなることを分かっていて、\n私だけを送り飛ばしたんじゃ……！？"},
	{"background": "shrine_night", "pos":"right","exp":"confused","chara":"reimu","serif":"あ……"},
	{"background": "shrine_night", "pos":"right","exp":null,"chara":null,"serif":null},
	{"background": "reminiscence1", "pos":null,"exp":null,"chara":null,"serif":"私がいつまで霊夢のそばにいられるか分からないでしょ？"},
	{"background": "reminiscence1", "pos":null,"exp":null,"chara":null,"serif":"そんなことあり得るの？　紫の方がずっと長生きするのに"},
	{"background": "reminiscence1", "pos":null,"exp":null,"chara":null,"serif":"さぁ、どうかしら"},
	{"background": "reminiscence1", "pos":null,"exp":null,"chara":null,"serif":"でもね、霊夢。幻想郷は全てを受け入れるのよ。それはそれは残酷な話ですわ"},
	{"background": "shrine_night", "pos":"right","exp":"confused","chara":"reimu","serif":"――紫は今、おそらく博麗大結界と幻と実体の境界との狭間にいるはず……"},
	{"background": "shrine_night", "pos":"right","exp":"confused","chara":"reimu","serif":"けれど――、境界を操る能力を持たない私には、\nその境目にすら行くことが出来ない……"},
	{"background": "shrine_night", "pos":"right","exp":"cry","chara":"reimu","serif":"なら――、これも受け入れなくちゃいけないのね……"},
	{"background": "shrine_night", "pos":"right","exp":"cry","chara":"reimu","serif":"紫――――。"},
];
module.exports = Serif;

},{}],51:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
	{"background":"epilogue1","pos":null,"exp":null,"chara":null,"serif":"――あれから何度目の夏だろう。いつからか、数えることも止めてしまった。\nあの夏からずっと、私の中で何かが止まってしまっていた。"},
	{"background":"epilogue1","pos":null,"exp":null,"chara":null,"serif":"紫とはあの夏を境に一度も会えていない。今もまだ、行方知れずのままだ。"},
	{"background":"epilogue1","pos":null,"exp":null,"chara":null,"serif":"それでも、紫が最後まで愛していたこの幻想郷だけは守るべく、\n暇さえあればこうして霊符を作っては博麗大結界の修復に勤しんでいる。"},


	{"background":"epilogue2","pos":null,"exp":null,"chara":null,"serif":"……ふぅ"},
	{"background":"epilogue2","pos":null,"exp":null,"chara":null,"serif":"これで今日の分はお終いかな。これだけ作っておけば十分でしょ"},
	{"background":"epilogue2","pos":null,"exp":null,"chara":null,"serif":"ただまぁ、流石にアイツのようにはそう綺麗に書けないわね。\n量産ができるようになっただけ、いくらかマシにはなったけれども"},
	{"background":"epilogue2","pos":null,"exp":null,"chara":null,"serif":"…………今頃何してるんだろう、アイツ……"},
	{"background":"epilogue2","pos":null,"exp":null,"chara":null,"serif":"いつかまた会えるとは言っていたけれども――\nやっぱり、あれは嘘だったのかしらね……"},
	{"background":"epilogue2","pos":null,"exp":null,"chara":null,"serif":"もう二度と、アイツの顔は見られないのかな……"},


	{"background":"epilogue3","pos":null,"exp":null,"chara":null,"serif":"……あ、やば"},
	{"background":"epilogue3","pos":null,"exp":null,"chara":null,"serif":"ってあれ？　この辺に筆を落としたはずなんだけれど……"},
	{"font_color": "#8b5fbf", "background":"epilogue3","pos":null,"exp":null,"chara":null,"serif":"――ったく、貴女は昔から何も変わってないのね"},
	{"font_color": "#8b5fbf", "background":"epilogue3","pos":null,"exp":null,"chara":null,"serif":"ダメじゃない、筆を落としちゃ。ちゃんと握りなさいって習わなかった？"},
	{"font_color": "#8b5fbf", "background":"epilogue3","pos":null,"exp":null,"chara":null,"serif":"って、なに泣いてるのよ。貴女らしくもない。せっかくの可愛い顔が台無しじゃない"},
	{"font_color": "#e6373c", "background":"epilogue3","pos":null,"exp":null,"chara":null,"serif":"……うっさい！　待たせ過ぎたアンタが悪い！"},
	{"font_color": "#8b5fbf", "background":"epilogue3","pos":null,"exp":null,"chara":null,"serif":"だって仕方がないじゃない。貴女の心に全然スキマが生まれないせいで、\n通って来ようにもまるで通れなかったんだもの"},
	{"font_color": "#e6373c", "background":"epilogue3","pos":null,"exp":null,"chara":null,"serif":"火間虫入道のしすぎで太りでもしたんじゃないの？"},
	{"font_color": "#8b5fbf", "background":"epilogue3","pos":null,"exp":null,"chara":null,"serif":"久しぶりの再会だっていうのにー。ひどいわー"},
	{"font_color": "#e6373c", "background":"epilogue3","pos":null,"exp":null,"chara":null,"serif":"ひどいのはアンタの方よ！　女を泣かすなんて極刑よ極刑！"},
	{"font_color": "#8b5fbf", "background":"epilogue3","pos":null,"exp":null,"chara":null,"serif":"あら、女って言えるほどの歳になったのかしら？\n見たところ、その両胸の果実はずいぶんとまだ固そうだけれども"},
	{"font_color": "#e6373c", "background":"epilogue3","pos":null,"exp":null,"chara":null,"serif":"あーもう、うっさい！　アンタが来ると調子が狂う"},
	{"font_color": "#e6373c", "background":"epilogue3","pos":null,"exp":null,"chara":null,"serif":"……でも、まぁ……その…………"},
	{"font_color": null, "background":"title_bg","pos":null,"exp":null,"chara":null,"serif":"…………おかえりなさい、紫"},
	{"font_color": null, "background":"title_bg","pos":null,"exp":null,"chara":null,"serif":"ええ。ただいま、霊夢"},
];

module.exports = Serif;

},{}],52:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
	{"pos":"right","exp":"strength1","chara":"reimu","serif":"――――もし、"},
	{"pos":"right","exp":"strength1","chara":"reimu","serif":"もし、この幻想郷が全てを受け入れるというのであれば――"},
	{"pos":"right","exp":"strength2","chara":"reimu","serif":"この結末を受け入れない私もまた、受け入れるはずよ！"},
];


module.exports = Serif;

},{}],53:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
	{"pos":"right","exp":"angry1","chara":"reimu","serif":"あー、ったく暑い！\nもう晩夏だっていうのに、どうしてこうも暑いのよ！"},
	{"pos":"right","exp":"normal2","chara":"reimu","serif":"せめてあの氷精みたいに、そばにいるだけで\n温度を下げてくれるような冷気を帯びた奴がいれば良いのに……"},
	{"pos":"left","exp":"smile","chara":"yukari","serif":"あら、呼んだかしら？"},
	{"pos":"right","exp":"angry2","chara":"reimu","serif":"アンタは呼んでない！"},
	{"pos":"left","exp":"normal1","chara":"yukari","serif":"そう？ 私の手にかかれば、例えばこんな感じで\n貴女の背中をつつーっとなぞれば……"},
	{"pos":"right","exp":"angry2","chara":"reimu","serif":"な、何してんのよ！？"},
	{"pos":"left","exp":"ecstasy2","chara":"yukari","serif":"いやー、こうすれば少しは涼しくなるかなーって"},
	{"pos":"right","exp":"angry2","chara":"reimu","serif":"アンタのそれは冷気じゃなくて寒気！気色悪いからやめて！"},
	{"pos":"left","exp":"disappointed","chara":"yukari","serif":"っもう、相変わらずつれないのね。他にもとっておきの案を持ってきたって言うのに"},
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"……アンタが出してきた案の中で、今までロクなものがなかったじゃない"},
	{"pos":"left","exp":"normal3","chara":"yukari","serif":"まぁまぁそう言わずに。今回は暑がりな霊夢のために、\nとびっきりのスペシャルコースを用意しといたから"},
	{"pos":"left","exp":"smile","chara":"yukari","serif":"それじゃ、早速行くわよ"},

	{"pos":"right","exp":"normal1","chara":"reimu","serif":"行くって、一体何をしに行く気よ"},
	{"pos":"left","exp":"normal1","chara":"yukari","serif":"決まっているじゃない、霊夢"},
	{"pos":"left","exp":"smile","chara":"yukari","serif":"納涼の定番、肝試しよ"},
];
module.exports = Serif;

},{}],54:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
	{"background": "reminiscence1", "pos":null,"exp":null,"chara":null,"serif":"もう、霊夢ったら。そう力任せにぐちゃっと書いちゃダメよ。\n霊符にならないじゃない"},
	{"background": "reminiscence1", "pos":null,"exp":null,"chara":null,"serif":"霊符はね、紙と咒文とが組み合わさって初めて効果を発揮するの。いい？\n書く時はこう、筆の向きに逆らわないようにしながら、すすーっと走らせて――"},
	{"background": "reminiscence1", "pos":null,"exp":null,"chara":null,"serif":"そんなこと言われたって難しいんだもん！"},
	{"background": "reminiscence1", "pos":null,"exp":null,"chara":null,"serif":"そうやってすぐにむくれて筆を投げ落とさないの。ほら、ちゃんと筆を握って。\nいつかは貴女も、この札を使わなきゃいけなくなる時が来るのよ？"},
	{"background": "reminiscence1", "pos":null,"exp":null,"chara":null,"serif":"……紫が書いて作り置きしとけばいいじゃん"},
	{"background": "reminiscence1", "pos":null,"exp":null,"chara":null,"serif":"私がいつまで霊夢のそばにいられるか分からないでしょ？"},
	{"background": "reminiscence1", "pos":null,"exp":null,"chara":null,"serif":"そんなことあり得るの？\n紫の方がずっと長生きするのに"},
	{"background": "reminiscence1", "pos":null,"exp":null,"chara":null,"serif":"さぁ、どうかしら"},
	{"background": "reminiscence2", "pos":null,"exp":null,"chara":null,"serif":"でもね、霊夢。幻想郷は全てを受け入れるのよ。\nそれはそれは残酷な話ですわ"},
];
module.exports = Serif;

},{}],55:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
];
module.exports = Serif;

},{}],56:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
	{"pos":"right","exp":"confused","chara":"reimu","fukidashi":"normal","serif":"きゃっ"},
	{"pos":"left","exp":"smile","chara":"yukari","fukidashi":"normal","serif":"肝試しの会場へようこそ"},
	{"pos":"right","exp":"angry2","chara":"reimu","fukidashi":"normal","serif":"すいぶん丁重な送迎してくれるじゃない"},
	{"pos":"left","exp":"normal3","chara":"yukari","fukidashi":"normal","serif":"ほら、見て"},
	{"pos":"right","exp":"angry2","chara":"reimu","fukidashi":"normal","serif":"なによ"},
	{"pos":"right","exp":"normal1","chara":"reimu","fukidashi":"normal","serif":"御札が落ちてるわ"},
	{"pos":"left","exp":"normal1","chara":"yukari","fukidashi":"normal","serif":"せっかくなので、御札を集めていきましょう"},
	{"pos":"right","exp":"normal1","chara":"reimu","fukidashi":"normal","serif":"わたしじゃ取れない場所にあるじゃない"},
	{"pos":"left","exp":"normal2","chara":"yukari","fukidashi":"normal","serif":"手伝ってあげるわよ"},
	{"pos":"left","exp":"normal2","chara":"yukari","fukidashi":"normal","serif":"X キーで私と霊夢の位置を入れかえることができるわ"},
	{"pos":"left","exp":"smile","chara":"yukari","fukidashi":"normal","serif":"私は霊夢といつも反対の位置にいるから"},
	{"pos":"right","exp":"normal1","chara":"reimu","fukidashi":"normal","serif":"X キーね"},
	{"pos":"left","exp":"normal1","chara":"yukari","fukidashi":"normal","serif":"入れ替えられる回数には上限があるから"},
	{"pos":"left","exp":"normal3","chara":"yukari","fukidashi":"normal","serif":"私の上にある数字はよく見ていてね"},
];
module.exports = Serif;

},{}],57:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],58:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
	{"pos":"left","exp":"ecstasy2","chara":"yukari","fukidashi":"normal","serif": "きゃー、れいむー！"},
	{"pos":"left","exp":"ecstasy2","chara":"yukari","fukidashi":"normal","serif": "オバケ、こわーい！"},
	{"pos":"right","exp":"normal2","chara":"reimu","fukidashi":"normal","serif":"(ベシッ)"},
	{"pos":"left","exp":"yarare","chara":"yukari","fukidashi":"normal","serif": "いたいっ！"},
	{"pos":"right","exp":"normal1","chara":"reimu","fukidashi":"normal","serif":"あれ、なによ"},
	{"pos":"left","exp":"normal4","chara":"yukari","fukidashi":"normal","serif":"オバケみたいね"},
	{"pos":"left","exp":"normal1","chara":"yukari","fukidashi":"normal","serif":"触れちゃダメよ"},
	{"pos":"right","exp":"normal2","chara":"reimu","fukidashi":"normal","serif":"はいはい"},
	{"pos":"left","exp":"smile","chara":"yukari","fukidashi":"normal","serif":"わたしはオバケに触れても大丈夫だから"},
	{"pos":"right","exp":"angry1","chara":"reimu","fukidashi":"normal","serif":"アンタだけずるくない！？"},
];
module.exports = Serif;

},{}],59:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],60:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
	{"pos":"right","exp":"normal1","chara":"reimu","fukidashi":"normal","serif":"リボンが落ちてるわ"},
	{"pos":"left","exp":"normal4","chara":"yukari","fukidashi":"normal","serif":"あら、わたしのリボン"},
	{"pos":"right","exp":"normal1","chara":"reimu","fukidashi":"normal","serif":"なんでこんなところに落ちてるのよ"},
	{"pos":"left","exp":"laugh","chara":"yukari","fukidashi":"normal","serif":"どうりでここ最近、リボンの数が足りないと思ったわー"},
	{"pos":"right","exp":"confused","chara":"reimu","fukidashi":"normal","serif":"アンタ、何個リボン持ってるのよ"},


	{"pos":"left","exp":"normal1","chara":"yukari","fukidashi":"normal","serif":"霊夢が御札を集めて、私がリボンを集めましょう"},
	{"pos":"right","exp":"normal1","chara":"reimu","fukidashi":"normal","serif":"リボンはわたしじゃ拾えないのね"},
];
module.exports = Serif;

},{}],61:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],62:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
	{"pos":"left","exp":"normal1","chara":"yukari","fukidashi":"normal","serif":null},
	{"pos":"right","exp":"normal2","chara":"reimu","fukidashi":"normal","serif":"色の違うブロックがあるわ"},
	{"pos":"left","exp":"normal1","chara":"yukari","fukidashi":"normal","serif":"一度乗ったら消えちゃうみたいね"},
	{"pos":"right","exp":"normal1","chara":"reimu","fukidashi":"normal","serif":"消えちゃうのね"},
];
module.exports = Serif;

},{}],63:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],64:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],65:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],66:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
	{"pos":"right","exp":"normal1","chara":"reimu","fukidashi":"normal","serif":"あれ、ゆかり？どこー？"},
	{"pos":"left","exp":"normal3","chara":"yukari","fukidashi":"normal","serif":"なーに、霊夢？"},
	{"pos":"right","exp":"normal2","chara":"reimu","fukidashi":"normal","serif":"アンタさっきと違う位置にいない？"},
	{"pos":"left","exp":"normal4","chara":"yukari","fukidashi":"normal","serif":"このステージでは上下の反対側にいるみたいね"},
	{"pos":"right","exp":"normal1","chara":"reimu","fukidashi":"normal","serif":"ふぅん"},
];
module.exports = Serif;

},{}],67:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],68:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],69:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],70:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
	{"pos":"right","exp":"normal1","chara":"reimu","fukidashi":"normal","serif":null},
	{"pos":"left","exp":"normal3","chara":"yukari","fukidashi":"normal","serif":"霊夢、見て"},
	{"pos":"right","exp":"normal1","chara":"reimu","fukidashi":"normal","serif":"あら、陰陽玉が落ちてるわ"},
	{"pos":"left","exp":"normal3","chara":"yukari","fukidashi":"normal","serif":"取ると私の位置がかわるわ"},
	{"pos":"right","exp":"normal1","chara":"reimu","fukidashi":"normal","serif":"どういうこと？"},
	{"pos":"left","exp":"normal3","chara":"yukari","fukidashi":"normal","serif":"霊夢の左右の反対側に私がいるときに取ると、\n霊夢の上下の反対側に私がいるようになるの"},
	{"pos":"left","exp":"normal3","chara":"yukari","fukidashi":"normal","serif":"その逆で、霊夢の上下の反対側にいるときは、\n霊夢の左右の反対側になるわ"},
	{"pos":"right","exp":"normal1","chara":"reimu","fukidashi":"normal","serif":"紫が左右の反対にいるのか、上下の反対にいるのかが入れ替わるわけね"},
];
module.exports = Serif;

},{}],71:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],72:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],73:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],74:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],75:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],76:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],77:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],78:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
	{"pos":"left","exp":"normal1","chara":"yukari","serif":null},
	{"pos":"right","exp":"normal2","chara":"reimu","serif":"結構先が長いのね"},
	{"pos":"left","exp":"normal1","chara":"yukari","serif":"少しは涼しくなったかしら"},
	{"pos":"right","exp":"normal2","chara":"reimu","serif":"アンタたち妖怪のほうが、よっぽど怖いわね"},
	{"pos":"left","exp":"normal2","chara":"yukari","serif":"つれないわねぇ..."},
];
module.exports = Serif;

},{}],79:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],80:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],81:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],82:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
	{"pos":"right","exp":"normal1","chara":"reimu","fukidashi":"normal","serif":null},
	{"pos":"left","exp":"normal3","chara":"yukari","fukidashi":"normal","serif":"また陰陽玉があるわね"},
	{"pos":"right","exp":"normal1","chara":"reimu","fukidashi":"normal","serif":"取ると紫の場所が、変わるんでしょ"},
	{"pos":"left","exp":"smile","chara":"yukari","fukidashi":"normal","serif":"そのとおりよ♪"},
];
module.exports = Serif;

},{}],83:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],84:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],85:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],86:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
	{"pos":"left","exp":"normal1","chara":"yukari","serif":null},
	{"pos":"right","exp":"normal2","chara":"reimu","serif":"ねぇ、紫"},
	{"pos":"left","exp":"normal1","chara":"yukari","serif":"うん？ なあに？"},
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"もしかしてだけれども、ここってまさか、\nアンタがお得意のスキマ空間じゃないわよね？"},
	{"pos":"left","exp":"normal1","chara":"yukari","serif":"どうかしら"},
	{"pos":"right","exp":"normal2","chara":"reimu","serif":"どうかしらってどういう意味よ"},
	{"pos":"left","exp":"normal3","chara":"yukari","serif":"そのまんまの意味よ。そうとも言えるし、そうじゃないとも言えるわ"},
	{"pos":"right","exp":"normal2","chara":"reimu","serif":"……？"},
];
module.exports = Serif;

},{}],87:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],88:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],89:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],90:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
	{"pos":"left","exp":"normal1","chara":"yukari","serif":null},
	{"pos":"right","exp":"confused","chara":"reimu","serif":"答えてよ紫。ここは一体どこなの？\nアンタは私に、一体何をやらせようとしているのよ？"},
	{"pos":"left","exp":"normal4","chara":"yukari","serif":"……そうね、前者の問いかけに関して言えば、\n霊夢が言う通り、ここはスキマ空間ということになるかしら"},
	{"pos":"right","exp":"confused","chara":"reimu","serif":"やっぱりそうだったのね。進むごとに見覚えのある目玉が\n増えていくからおかしいと思ったわ"},
	{"pos":"right","exp":"confused","chara":"reimu","serif":"どうしてそう、大事なことを黙っていたのよ？"},

	{"pos":"left","exp":"normal2","chara":"yukari","serif":"……好きで黙っていたわけじゃないわ"},
	{"pos":"left","exp":"normal2","chara":"yukari","serif":"ただ……、少しでも霊夢といつも通りでいたかったからよ"},
	{"pos":"right","exp":"confused","chara":"reimu","serif":"一体、何を言って――"},
];
module.exports = Serif;

},{}],91:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],92:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
	{"pos":"right","exp":"confused","chara":"reimu","serif":null},
	{"pos":"left","exp":"normal1","chara":"yukari","serif":"始めから決まっていたことなのよ。\n元々私は、この幻想郷にいていいはずの妖怪じゃないから"},
	{"pos":"right","exp":"confused","chara":"reimu","serif":"……どういうこと？"},
	{"pos":"left","exp":"angry","chara":"yukari","serif":"幻想郷は２つの結界で成り立っているの。\n１つは貴女が管理している結界――幻想郷を取り囲むようにして張られた“博麗大結界”"},
	{"pos":"left","exp":"angry","chara":"yukari","serif":"そしてもう１つの結界が、その博麗大結界の外側を\nさらに取り囲むようして張られた結界――私が管理している“幻と実体の境界”"},
	{"pos":"left","exp":"angry","chara":"yukari","serif":"ここはね、霊夢。そんな“博麗大結界”と“幻と実体の境界”との境目に生まれた、\n幻になりえども幻想郷入りは叶わなかった有象無象が集う、“スキマ”の淵源よ"},
	{"pos":"right","exp":"confused","chara":"reimu","serif":"なっ！？"},
];

module.exports = Serif;

},{}],93:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],94:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
	{"pos":"left","exp":"angry","chara":"yukari","serif":null},
	{"pos":"right","exp":"confused","chara":"reimu","serif":"まさか……この空間が、アンタが本来住むべき世界だってこと！？"},
	{"pos":"left","exp":"angry","chara":"yukari","serif":"ええ、そうよ。そして私の本当の役目は、\n結界の緩衝地帯であるこの空間を維持する為の、言わば“番人”"},
	{"pos":"left","exp":"laugh","chara":"yukari","serif":"もっとも、これだけ結界が綻んでしまったら、\nもう番人と名乗る資格はないだろうけれどもね"},
	{"pos":"right","exp":"confused","chara":"reimu","serif":"結界が……綻ぶ……？？"},
	{"pos":"right","exp":"normal2","chara":"reimu","serif":"……今の言葉でようやく分かったわ。この肝試しの本当の意味が"},
	{"pos":"right","exp":"normal2","chara":"reimu","serif":"散り散りになったアンタのリボン……それに、この古びた霊符の数々……"},
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"肝試しというのはあくまでも建前で、\n本当はこれらを回収して結界を修復し直すのが、今回の真の目的だったというわけね！"},
];

module.exports = Serif;

},{}],95:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],96:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
	{"pos":"left","exp":"laugh","chara":"yukari","serif":null},
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"どうしてこんなになるまで放っておいたのよ、アンタらしくもない"},
	{"pos":"left","exp":"normal2","chara":"yukari","serif":"…………"},
	{"pos":"left","exp":"normal2","chara":"yukari","serif":"それだけ好きだったのよ、この幻想郷が"},
	{"pos":"left","exp":"normal2","chara":"yukari","serif":"色めく春も、茹だる夏も、枯れゆく秋も、凍える冬も。\n幻想郷の息づかいの、その全てが"},


	{"pos":"left","exp":"normal2","chara":"yukari","serif":"流石に妖力が衰える冬だけは、\nこっちの世界に戻っていたのだけれども"},
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"それで冬だけは冬眠と称して、決して幻想郷には姿を見せようとしなかったのね"},
	{"pos":"left","exp":"normal2","chara":"yukari","serif":"ええ、そうよ。でも、それももうお終い"},
	{"pos":"left","exp":"normal2","chara":"yukari","serif":"これ以上私が幻想郷に留まり続けたら、幻想郷そのものがこの空間と\n溶けて混ざってしまう。それだけは避けなくちゃいけないのよ、何としてもね"},
];

module.exports = Serif;

},{}],97:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],98:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
];

module.exports = Serif;

},{}],99:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],100:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
	{"pos":"right","exp":"normal1","chara":"reimu","serif":null},
	{"pos":"left","exp":"normal1","chara":"yukari","serif":"さっきから手間かけさせてばかりで悪いわね、霊夢"},
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"ええ、その分のお代はきっちりと払ってもらうわ。お酒と一緒にね"},
	{"pos":"left","exp":"normal1","chara":"yukari","serif":"ありがとう、頼りになるわ"},
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"この調子でちゃっちゃっと終わらせるわよ"},
];

module.exports = Serif;

},{}],101:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],102:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],103:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],104:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
	{"pos":"left","exp":"normal1","chara":"yukari","serif":null},
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"ところでだけれどもさ、紫"},
	{"pos":"left","exp":"normal1","chara":"yukari","serif":"ん？　どうしたの？"},
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"仮にこれで全ての結界を私たちが修復しきった場合、\nこの空間って完全に閉じられることになるわけじゃない？"},
	{"pos":"left","exp":"normal1","chara":"yukari","serif":"ええ、そうなるわね"},
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"その状態で私たちが幻想郷に戻っちゃったら、また結界に風穴が開いて\n綻んじゃうわけでしょ？　それでどうやって戻る気なの？"},
	{"pos":"left","exp":"normal1","chara":"yukari","serif":"心配せずとも大丈夫よ、霊夢。ちゃんと帰り道は用意しているから"},
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"そう？　ならいいけれども"},
];

module.exports = Serif;

},{}],105:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],106:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],107:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],108:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],109:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],110:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
	{"pos":"left","exp":"normal1","chara":"yukari","serif":null},
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"ねぇ、あと何か所くらい残っているのかしら？"},
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"そろそろ疲れてきたんだけれども"},
	{"pos":"left","exp":"normal4","chara":"yukari","serif":"そうねぇ、ここを含めてあと3つってところかしら"},
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"はぁ……、早く帰って水風呂でさっぱりしたいわね"},
	{"pos":"left","exp":"smile","chara":"yukari","serif":"あら、久しぶりに一緒に入る？\n昔みたいに頭の先から爪先までくまなく洗ってあげるわ"},
	{"pos":"right","exp":"angry1","chara":"reimu","serif":"ゼッタイに嫌"},
	{"pos":"left","exp":"ecstasy1","chara":"yukari","serif":"恥ずかしがらなくて良いのにー"},
];
module.exports = Serif;

},{}],111:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],112:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],113:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
	{"pos":"left","exp":"normal1","chara":"yukari","serif":null},
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"やっと最後の1枚が終わったわね"},
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"じゃ、とっとと帰りましょ？"},
	{"pos":"left","exp":"normal1","chara":"yukari","serif":"……それは出来ないわ"},
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"えっ？　どうして？"},
	{"pos":"left","exp":"normal1","chara":"yukari","serif":"さっきも言ったでしょ？　ここは“博麗大結界”と“幻と実体の境界”の境目。\nそして私は、この地で番人をしなきゃいけないの"},
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"でも、さっき帰り道は用意してるって……"},
	{"pos":"left","exp":"normal2","chara":"yukari","serif":"“２人分”とは言っていないわ"},
	{"pos":"left","exp":"normal2","chara":"yukari","serif":"だから、ね――"},
	{"pos":"right","exp":"confused","chara":"reimu","serif":"紫っ！？"},
];


module.exports = Serif;

},{}],114:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
	{"pos":"left","exp":"normal1","chara":"yukari","serif":null},
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"長かった肝試しも、残すところこれで最後ってところかしら"},
	{"pos":"left","exp":"normal3","chara":"yukari","serif":"ええ、そうね"},
	{"pos":"left","exp":"normal3","chara":"yukari","serif":"どう？　楽しかったでしょ？"},
	{"pos":"right","exp":"normal2","chara":"reimu","serif":"全然"},
	{"pos":"left","exp":"normal2","chara":"yukari","serif":"最後までつれないのねぇ"},
];

module.exports = Serif;

},{}],115:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],116:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"ふぅ、何とかここまでは来れたわね"},
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"ただ、あまり時間は残されていないみたい。\n巫術を使って、一時的に肉体と精神とを分離させているだけに過ぎないし"},
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"下手したらこの何もかもあやふやな\nこの世界に私が溶け込まれてしまうことだって十分有り得るし……"},
	{"pos":"right","exp":"strength2","chara":"reimu","serif":"意地でもアンタを幻想郷へと連れ戻すわよ、紫"},
];
module.exports = Serif;

},{}],117:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],118:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"やっぱり思った通りだわ。博麗大結界は霊符による\n２つの力で結界が構成されているのね"},
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"１つは真っ白に清められた書紙による“物理的な結力”。\nそしてもう１つが、その書紙に朱で書かれた咒文による“概念的な結力”"},
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"どうりでさっきまでは、いくら霊符を引っ剥がしたところで何も起きなかったわけね。\nおかしいと思ったわ"},
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"この２つの力を同時に取り除いていけば、いつかは必ず結界に綻びが出てくるはずよ。\nその先にはきっと、アイツが――"},
];
module.exports = Serif;

},{}],119:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],120:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],121:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],122:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"ずいぶんと数が増えてきた上に、回収するのが一段と難しくなってきたわね……。\n面倒ったらありゃしない"},
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"それと、この辺りに霊符を張ったのは間違いなく紫本人ね。\nこんなにも綺麗な字で霊符を書くことが出来るのは、アイツ以外にいないし"},
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"その上ずいぶんと古い霊符がところどころに混じってるし……。\nそれだけ厳重にこの結界を長い間守り続けてきたってことなのかしら"},
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"アイツ……こんなにも幻想郷を愛していたんだ……"},
];

module.exports = Serif;

},{}],123:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],124:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],125:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],126:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"ようやく待ちに待ったスキマたちがお目見えね。\n紫がいる境界まで大分近づいてきたってことかしら"},
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"それにしても笑っちゃうわよね。この前の終わらない冬の時は\n紫が境界に穴を空けたのに、今はその逆で私が空けてるだなんて"},
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"紫は番人失格だなんて言ってたけれども、\n私もこんなことしてたんじゃ博麗の巫女失格よね"},
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"今なら少しだけ……アイツの気持ちも分からなくはないかな……"},
];

module.exports = Serif;

},{}],127:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],128:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],129:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],130:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"スキマが相当増えてきたわね。結界が綻ぶのも時間の問題かしらね"},
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"そろそろアイツが出てきても良い頃合いなのだけれども……どこにいるのかしら"},
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"まさかアイツもこの狭間に溶けてしまうなんてことないよね……？"},
];

module.exports = Serif;

},{}],131:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],132:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
	{"pos":"right","exp":"normal2","chara":"reimu","serif":"そろそろ私も辛くなってきたわね。油断したら一瞬で意識を持っていかれそうだわ"},
	{"pos":"right","exp":"normal2","chara":"reimu","serif":"そうなる前に早く見つけ出さないと……！"},
	{"pos":"right","exp":"angry1","chara":"reimu","serif":"一体どこにいるのよ、紫！"},
];

module.exports = Serif;

},{}],133:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],134:[function(require,module,exports){
'use strict';

// セリフ
var Serif= [
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"紫！？"},
	{"pos":"left","exp":"normal1","chara":"yukari","serif":"あら、わざわざここまで来てくれたの？　嬉しいわ"},
	{"pos":"right","exp":"normal1","chara":"reimu","serif":"なにのんきなこといってるのよ、早く帰るわよ"},
	{"pos":"left","exp":"normal1","chara":"yukari","serif":"それは出来ないわ"},
	{"pos":"left","exp":"normal1","chara":"yukari","serif":"前にも話したでしょ？　幻想郷は全てを受け入れるのよ。残酷なほどにね"},
];
module.exports = Serif;

},{}],135:[function(require,module,exports){
'use strict';
var Game = require('./game');
var CONSTANT = require('./constant');

var game;

window.onload = function() {
	// Canvas
	var mainCanvas = document.getElementById('mainCanvas');
	// Game オブジェクト
	game = new Game(mainCanvas);
	// 初期化
	game.init();
	// 各種イベントハンドラをバインド
	game.setupEvents();

	// デバッグ設定
	if (CONSTANT.DEBUG.ON) {
		var debugDOM = document.getElementById('debug');
		game.setupDebug(debugDOM);
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
window.changeFullScreen = function () {
	game.fullscreen();
};

// Electron のレンダラプロセスならば
if(window.require) {
	require('electron').webFrame.setZoomLevelLimits(1,1); //zoomさせない
}



},{"./constant":6,"./game":8,"electron":2}],136:[function(require,module,exports){
'use strict';
var base_object = require('../hakurei').object.sprite;
var util = require('../hakurei').util;
var ExchangeAnim = require('./exchange_anim');
var CONSTANT = require('../constant');

var AlterEgo = function (scene) {
	base_object.apply(this, arguments);

	// 種類
	this.type = CONSTANT.ALTEREGO;
};
util.inherit(AlterEgo, base_object);

AlterEgo.prototype.init = function(chara_no) {
	base_object.prototype.init.apply(this, arguments);

	this.span = 0;
	this.exchange_animation_start_count = 0;
	this.exchange_anim = new ExchangeAnim(this.scene, this.parent); //parent = player 本来のparent は alterego だが...
	this.chara_no = chara_no;
};
AlterEgo.prototype.isYukari = function(){
	return this.chara_no === CONSTANT.YUKARI_NO;
};
AlterEgo.prototype.isExReimu = function(){
	return this.chara_no === CONSTANT.EX_REIMU_NO;
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

	// 紫用アイテムとの接触判定
	var item_for_yukari_list = this.scene.objects_by_tile_type[CONSTANT.ITEM_FOR_YUKARI];
	this.checkCollisionWithObjects(item_for_yukari_list);
};

AlterEgo.prototype.onCollision = function(obj){
	// 紫用アイテムと接触したら
	if (obj.type === CONSTANT.ITEM_FOR_YUKARI) {
		this.scene.addYukariItemNum(); // 獲得数+1
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
	if (this.isYukari()) {
		return 30;
	}
	else {
		return 10;
	}
};
AlterEgo.prototype.spriteIndices = function(){
	// 紫
	if (this.isYukari()) {
		return [{x: 5, y: 0}, {x: 6, y: 0}];
	}
	// 霊夢(精神)
	else {
		if(this.parent.isClimbDown()) {
			return [{x: 5, y: 5}, {x: 6, y: 5}];
		}
		else {
			var is_reflect;
			if (this.scene.isVertical()) {
				is_reflect = this.parent.is_reflect;
			}
			else {
				is_reflect = !this.parent.is_reflect; // 自機と左右対象
			}
			return(is_reflect ? [{x: 3, y: 5}, {x: 4, y: 5}] : [{x: 1, y: 5}, {x: 2, y:5}]);
		}
	}
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

	this.exchange_anim.init(this.x(), this.y(), span, this.chara_no);
	this.addSubObject(this.exchange_anim);
};
module.exports = AlterEgo;

},{"../constant":6,"../hakurei":9,"./exchange_anim":138}],137:[function(require,module,exports){
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

},{"../hakurei":9}],138:[function(require,module,exports){
'use strict';
var base_object = require('../hakurei').object.sprite;
var util = require('../hakurei').util;
var CONSTANT = require('../constant');

var ExchangeAnim = function (scene, parent) {
	base_object.apply(this, arguments);
};
util.inherit(ExchangeAnim, base_object);

ExchangeAnim.prototype.init = function(x, y, anim_span, chara_no) {
	base_object.prototype.init.apply(this, arguments);
	this.x(x);
	this.y(y);
	this.chara_no = chara_no;

	this.anim_span = anim_span;
};

ExchangeAnim.prototype.beforeDraw = function(){
	base_object.prototype.beforeDraw.apply(this, arguments);
};
ExchangeAnim.prototype.isReimu = function(){
	return this.chara_no === CONSTANT.REIMU_NO;
};
ExchangeAnim.prototype.isYukari = function(){
	return this.chara_no === CONSTANT.YUKARI_NO;
};
ExchangeAnim.prototype.isExReimu = function(){
	return this.chara_no === CONSTANT.EX_REIMU_NO;
};


ExchangeAnim.prototype.spriteName = function(){
	return "stage_tile_32";
};
ExchangeAnim.prototype.spriteIndices = function(){
	// 紫
	if (this.isYukari()) {
		return [
			{x: 0, y: 1}, {x: 1, y: 1},{x: 2, y: 1}, {x:3, y: 1}, {x:3, y: 1}, {x:4, y: 1}, {x:5, y: 1}, {x: 6, y:1},
			{x: 6, y: 3}, {x: 5, y: 3},{x: 4, y:3}, {x:3, y:3}, {x:3, y:3}, {x:2, y: 3}, {x:1, y: 3}, {x: 0, y:3},
		];
	}
	// 霊夢(精神)
	else if (this.isExReimu()) {
		return [
			{x: 0, y: 6}, {x: 1, y: 6},{x: 2, y: 6}, {x:3, y: 6}, {x:3, y: 6}, {x:4, y: 6}, {x:5, y: 6}, {x: 6, y:6},
			{x: 6, y: 3}, {x: 5, y: 3},{x: 4, y:3}, {x:3, y:3}, {x:3, y:3}, {x:2, y: 3}, {x:1, y: 3}, {x: 0, y:3},
		];
	}
	// 霊夢(実体)
	else {
		// 分身が紫の場合
		if (this.parent.alterego.isYukari()) {
			return [
				{x: 0, y: 3}, {x: 1, y: 3},{x: 2, y:3}, {x:3, y:3}, {x:3, y:3}, {x:4, y: 3}, {x:5, y: 3}, {x: 6, y:3},
				{x: 6, y: 1}, {x: 5, y: 1},{x: 4, y: 1}, {x:3, y: 1}, {x:3, y: 1}, {x:2, y: 1}, {x:1, y: 1}, {x: 0, y:1},
			];
		}
		// 分身が霊夢(精神)の場合
		else if (this.parent.alterego.isExReimu()) {
			return [
				{x: 0, y: 3}, {x: 1, y: 3},{x: 2, y:3}, {x:3, y:3}, {x:3, y:3}, {x:4, y: 3}, {x:5, y: 3}, {x: 6, y:3},
				{x: 6, y: 6}, {x: 5, y: 6},{x: 4, y: 6}, {x:3, y: 6}, {x:3, y: 6}, {x:2, y: 6}, {x:1, y: 6}, {x: 0, y:6},
			];
		}

	}
};
ExchangeAnim.prototype.spriteWidth = function(){
	return 32;
};
ExchangeAnim.prototype.spriteHeight = function(){
	return 32;
};
ExchangeAnim.prototype.spriteAnimationSpan = function(){
	return 3;
};


module.exports = ExchangeAnim;

},{"../constant":6,"../hakurei":9}],139:[function(require,module,exports){
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

},{"../constant":6,"../hakurei":9}],140:[function(require,module,exports){
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

},{"../hakurei":9}],141:[function(require,module,exports){
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

},{"../hakurei":9}],142:[function(require,module,exports){
'use strict';
var base_object = require('./tile_base');
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
BlockBase.prototype.isBlock = function() {
	return true;
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
	return this._scale * 1.5;
};
BlockBase.prototype.scaleHeight = function(){
	return this._scale * 1.5;
};





module.exports = BlockBase;

},{"../../hakurei":9,"./tile_base":168}],143:[function(require,module,exports){
'use strict';
var CONSTANT = require('../../constant');
var base_object = require('./block_base');
var util = require('../../hakurei').util;

var BlockGreen = function (scene) {
	base_object.apply(this, arguments);
	// 種類
	this.type = CONSTANT.BLOCK_BLUE;
};
util.inherit(BlockGreen, base_object);

BlockGreen.prototype.spriteIndices = function(){
	return [{x: 5, y: 0}];
};


module.exports = BlockGreen;

},{"../../constant":6,"../../hakurei":9,"./block_base":142}],144:[function(require,module,exports){
'use strict';

/* 乗ると消えるブロック */


// 消えるまでの時間
var FALL_SPAN = 40;


var CONSTANT = require('../../constant');
var base_object = require('./block_base');
var util = require('../../hakurei').util;

var BlockDisappear = function (scene) {
	base_object.apply(this, arguments);

	// 種類
	this.type = CONSTANT.BLOCK_DISAPPEAR;
};
util.inherit(BlockDisappear, base_object);

BlockDisappear.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.start_fall_frame = 0;
	this.is_show = true;
	this.is_collision = true;
};

BlockDisappear.prototype.spriteIndices = function(){
	return [{x: 1, y: 0}];
};

BlockDisappear.prototype.beforeDraw = function() {
	base_object.prototype.beforeDraw.apply(this, arguments);
	if(this.start_fall_frame && (FALL_SPAN - this.frame_count + this.start_fall_frame <= 0) ) {
		this.is_show = false;

		// reset
		this.start_fall_frame = 0;
	}
};

BlockDisappear.prototype.fall = function(){
	this.start_fall_frame = this.frame_count;
	this.is_collision = false;
};

BlockDisappear.prototype.isShow = function() {
	return this.is_show;
};
BlockDisappear.prototype.isCollision = function() {
	return this.is_collision;
};
BlockDisappear.prototype.alpha = function() {
	var base_scale = 0.5;
	if (this.start_fall_frame) {
		return(base_scale *  (FALL_SPAN - (this.frame_count - this.start_fall_frame)) / FALL_SPAN );
	}
	else {
		return base_scale;
	}

};


module.exports = BlockDisappear;

},{"../../constant":6,"../../hakurei":9,"./block_base":142}],145:[function(require,module,exports){
'use strict';
var CONSTANT = require('../../constant');
var base_object = require('./block_base');
var util = require('../../hakurei').util;

var BlockGreen = function (scene) {
	base_object.apply(this, arguments);

	// 種類
	this.type = CONSTANT.BLOCK_GREEN;
};
util.inherit(BlockGreen, base_object);

BlockGreen.prototype.spriteIndices = function(){
	return [{x: 4, y: 0}];
};

module.exports = BlockGreen;

},{"../../constant":6,"../../hakurei":9,"./block_base":142}],146:[function(require,module,exports){
'use strict';
var CONSTANT = require('../../constant');
var base_object = require('./block_base');
var util = require('../../hakurei').util;

var BlockGreen = function (scene) {
	base_object.apply(this, arguments);
	// 種類
	this.type = CONSTANT.BLOCK_PURPLE;
};
util.inherit(BlockGreen, base_object);

BlockGreen.prototype.spriteIndices = function(){
	return [{x: 7, y: 0}];
};

module.exports = BlockGreen;

},{"../../constant":6,"../../hakurei":9,"./block_base":142}],147:[function(require,module,exports){
'use strict';
var CONSTANT = require('../../constant');
var base_object = require('./block_base');
var util = require('../../hakurei').util;

var BlockGreen = function (scene) {
	base_object.apply(this, arguments);

	// 種類
	this.type = CONSTANT.BLOCK_RED;
};
util.inherit(BlockGreen, base_object);

BlockGreen.prototype.spriteIndices = function(){
	return [{x: 6, y: 0}];
};


module.exports = BlockGreen;

},{"../../constant":6,"../../hakurei":9,"./block_base":142}],148:[function(require,module,exports){
'use strict';
var CONSTANT = require('../../constant');
var base_object = require('./block_base');
var util = require('../../hakurei').util;

var BlockStone1 = function (scene) {
	base_object.apply(this, arguments);

	// 種類
	this.type = CONSTANT.BLOCK_STONE1;
};
util.inherit(BlockStone1, base_object);

BlockStone1.prototype.spriteIndices = function(){
	return [{x: 0, y: 0}];
};

module.exports = BlockStone1;

},{"../../constant":6,"../../hakurei":9,"./block_base":142}],149:[function(require,module,exports){
'use strict';
var CONSTANT = require('../../constant');
var base_object = require('./block_base');
var util = require('../../hakurei').util;

var BlockStone2 = function (scene) {
	base_object.apply(this, arguments);

	// 種類
	this.type = CONSTANT.BLOCK_STONE2;
};
util.inherit(BlockStone2, base_object);

BlockStone2.prototype.spriteIndices = function(){
	return [{x: 1, y: 0}];
};

module.exports = BlockStone2;

},{"../../constant":6,"../../hakurei":9,"./block_base":142}],150:[function(require,module,exports){
'use strict';
var CONSTANT = require('../../constant');
var base_object = require('./block_base');
var util = require('../../hakurei').util;

var BlockStone3 = function (scene) {
	base_object.apply(this, arguments);

	// 種類
	this.type = CONSTANT.BLOCK_STONE3;
};
util.inherit(BlockStone3, base_object);

BlockStone3.prototype.spriteIndices = function(){
	return [{x: 2, y: 0}];
};

module.exports = BlockStone3;

},{"../../constant":6,"../../hakurei":9,"./block_base":142}],151:[function(require,module,exports){
'use strict';
var CONSTANT = require('../../constant');
var base_object = require('./tile_base');
var util = require('../../hakurei').util;

var Death = function (scene) {
	base_object.apply(this, arguments);

	// 種類
	this.type = CONSTANT.DEATH;
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

},{"../../constant":6,"../../hakurei":9,"./tile_base":168}],152:[function(require,module,exports){
'use strict';

var SPEED = 2;

var CONSTANT = require('../../constant');
var base_object = require('./tile_base');
var util = require('../../hakurei').util;

var Enemy = function (scene) {
	base_object.apply(this, arguments);

	// 種類
	this.type = CONSTANT.ENEMY;
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

	// 移動によって左右の壁にめり込んだら押し返す
	var repulse_x = this.checkCollisionWithLeftRightBlocks();
	if(repulse_x) {
		repulse_x = repulse_x > 0 ? SPEED : -SPEED;
		// 自機の調整
		this._x += repulse_x;

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
	CONSTANT.BLOCK_DISAPPEAR,
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

// 壁ブロック一覧
var BLOCK_TILE_TYPES2 = [
	CONSTANT.BLOCK_GREEN,
	CONSTANT.BLOCK_BLUE,
	CONSTANT.BLOCK_RED,
	CONSTANT.BLOCK_PURPLE,
	CONSTANT.BLOCK_DISAPPEAR,
	CONSTANT.BLOCK_STONE1,
	CONSTANT.BLOCK_STONE2,
	CONSTANT.BLOCK_STONE3,
];

// 壁との衝突判定
Enemy.prototype.checkCollisionWithLeftRightBlocks = function() {
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





Enemy.prototype.collisionWidth = function(obj){
	return 1;
};
Enemy.prototype.collisionHeight = function(obj) {
	if (obj && obj.type === CONSTANT.PLAYER) {
		return 1;
	}
	else {
		return 24 + 1; // 地面との接触のため、+1
	}
};

Enemy.prototype.isReflect = function(){
	return !this.is_left;
};



// sprite configuration

Enemy.prototype.spriteName = function(){
	return "stage_tile_32";
};
Enemy.prototype.spriteIndices = function(){
	return [{x: 2, y: 4}, {x: 3, y: 4}];
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
module.exports = Enemy;

},{"../../constant":6,"../../hakurei":9,"./tile_base":168}],153:[function(require,module,exports){
'use strict';

var SPEED = 1;

var CONSTANT = require('../../constant');
var base_object = require('./tile_base');
var util = require('../../hakurei').util;

var Enemy = function (scene) {
	base_object.apply(this, arguments);

	// 種類
	this.type = CONSTANT.ENEMY_VERTICAL;
};
util.inherit(Enemy, base_object);

Enemy.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.x(x);
	this.y(y);

	this.is_down = false;
};

Enemy.prototype.beforeDraw = function() {
	base_object.prototype.beforeDraw.apply(this, arguments);

	if (this.is_down) {
		this._y += SPEED;
	}
	else {
		this._y -= SPEED;
	}

	// ステージの上限or下限を超えない
	if (this._y < 50 + 12 || this._y > CONSTANT.TILE_SIZE*20 + 50 - 12) {
		this.is_down = !this.is_down;
	}

	// ブロックとの接触判定
	var stage_blocks = this.scene.getBlocks();
	this.checkCollisionWithObjects(stage_blocks);
};

Enemy.prototype.isCollision = function(obj) {
	var self = this;
	// 左右のブロックとは当たり判定しない
	if (obj) {
		if(self.x()-self.collisionWidth()/2 > obj.x()+obj.collisionWidth()/2) return false;
		if(self.x()+self.collisionWidth()/2 < obj.x()-obj.collisionWidth()/2) return false;
	}
	return true;
};

Enemy.prototype.onCollision = function(obj) {
	// ブロックと接触したら
	if (obj.isBlock()) {
		//TODO: this._y = before_y;
		this.is_down = !this.is_down;
	}
};

Enemy.prototype.collisionWidth = function(){
	return 24;
};
Enemy.prototype.collisionHeight = function(){
	return 24;
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
module.exports = Enemy;

},{"../../constant":6,"../../hakurei":9,"./tile_base":168}],154:[function(require,module,exports){
'use strict';
var CONSTANT = require('../../constant');
var base_object = require('./tile_base');
var util = require('../../hakurei').util;

var Item = function (scene) {
	base_object.apply(this, arguments);

	// 種類
	this.type = CONSTANT.ITEM_FOR_REIMU;
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

	this.core.playSound("got_item_ohuda");

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
	// Ex ストーリーになるとアイテムが変わる
	if (this.scene.isInExStory()) {
		return [{x: 2, y: 2}];
	}
	else {
		return [{x: 1, y: 2}];
	}
};
Item.prototype.spriteWidth = function(){
	return 24;
};
Item.prototype.spriteHeight = function(){
	return 24;
};
module.exports = Item;

},{"../../constant":6,"../../hakurei":9,"./tile_base":168}],155:[function(require,module,exports){
'use strict';
var CONSTANT = require('../../constant');
var base_object = require('./tile_base');
var util = require('../../hakurei').util;

var ItemForYukari = function (scene) {
	base_object.apply(this, arguments);

	// 種類
	this.type = CONSTANT.ITEM_FOR_YUKARI;
};
util.inherit(ItemForYukari, base_object);

ItemForYukari.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.x(x);
	this.y(y);
	this.is_show = true;
	this.is_collision = true;

	this.start_got_animation_frame_count = 0;
};

ItemForYukari.prototype.got = function() {
	this.is_collision = false;

	this.core.playSound("got_item_ribon");

	// start animation
	this.start_got_animation_frame_count = this.frame_count;
};

ItemForYukari.prototype.onCollision = function(obj){
	// 紫と接触したら
	if (obj.type === CONSTANT.ALTEREGO) {
		this.got(); // 獲得済
	}
};



ItemForYukari.prototype.isShow = function() {
	return this.is_show;
};

ItemForYukari.prototype.isCollision = function() {
	return this.is_collision;
};

ItemForYukari.prototype.beforeDraw = function(){
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

ItemForYukari.prototype.spriteName = function(){
	return "stage_tile_24";
};
ItemForYukari.prototype.spriteIndices = function(){
	// Ex ストーリーになるとアイテムが変わる
	if (this.scene.isInExStory()) {
		return [{x: 3, y: 2}];
	}
	else {
		return [{x: 0, y: 2}];
	}

};
ItemForYukari.prototype.spriteWidth = function(){
	return 24;
};
ItemForYukari.prototype.spriteHeight = function(){
	return 24;
};
module.exports = ItemForYukari;

},{"../../constant":6,"../../hakurei":9,"./tile_base":168}],156:[function(require,module,exports){
'use strict';
var CONSTANT = require('../../constant');
var base_object = require('./tile_base');
var util = require('../../hakurei').util;

var ItemOfExchange = function (scene) {
	base_object.apply(this, arguments);

	// 種類
	this.type = CONSTANT.ITEM_OF_EXCHANGE;
};
util.inherit(ItemOfExchange, base_object);

ItemOfExchange.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.x(x);
	this.y(y);
	this.is_show = true;
	this.is_collision = true;

	this.start_got_animation_frame_count = 0;
};

ItemOfExchange.prototype.got = function() {
	this.is_collision = false;

	this.core.playSound("got_item_ohuda");

	// start animation
	this.start_got_animation_frame_count = this.frame_count;
};

ItemOfExchange.prototype.isShow = function() {
	return this.is_show;
};

ItemOfExchange.prototype.isCollision = function() {
	return this.is_collision;
};

ItemOfExchange.prototype.beforeDraw = function(){
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

ItemOfExchange.prototype.spriteName = function(){
	return "stage_tile_24";
};
ItemOfExchange.prototype.spriteIndices = function(){
	return [{x: 0, y: 3}];
};
ItemOfExchange.prototype.spriteWidth = function(){
	return 24;
};
ItemOfExchange.prototype.spriteHeight = function(){
	return 24;
};
ItemOfExchange.prototype.rotateAdjust = function(){
	return this.frame_count*2 % 360;
};



module.exports = ItemOfExchange;

},{"../../constant":6,"../../hakurei":9,"./tile_base":168}],157:[function(require,module,exports){
'use strict';
var CONSTANT = require('../../constant');
var base_object = require('./tile_base');
var util = require('../../hakurei').util;

var Ladder = function (scene) {
	base_object.apply(this, arguments);

	// 種類
	this.type = CONSTANT.LADDER;
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
	return this._scale * 0.75;
};
Ladder.prototype.scaleHeight = function(){
	return this._scale * 1.5;
};

// collision configuration

Ladder.prototype.collisionWidth = function() {
	return 24;
};
Ladder.prototype.collisionHeight = function() {
	return 24;
};









module.exports = Ladder;

},{"../../constant":6,"../../hakurei":9,"./tile_base":168}],158:[function(require,module,exports){
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
var DIE_ANIM_SPAN = 60;

// 地面ブロック一覧
var BLOCK_TILE_TYPES = [
	CONSTANT.BLOCK_GREEN,
	CONSTANT.BLOCK_BLUE,
	CONSTANT.BLOCK_RED,
	CONSTANT.BLOCK_PURPLE,
	CONSTANT.BLOCK_DISAPPEAR,
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
	CONSTANT.BLOCK_DISAPPEAR,
	CONSTANT.BLOCK_STONE1,
	CONSTANT.BLOCK_STONE2,
	CONSTANT.BLOCK_STONE3,
];



var base_object = require('./tile_base');
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

	// 種類
	this.type = CONSTANT.PLAYER;

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
	this.alterego.init(this.scene.isInNormalStory() ? CONSTANT.YUKARI_NO : CONSTANT.EX_REIMU_NO);
	this.addSubObject(this.alterego);

	// 位置交換アニメーション
	this.exchange_anim = new ExchangeAnim(this.scene, this);

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

			// 再度はしごとの当たり判定をチェックして、はしごと触れてなければ上移動を戻す
			collision_ladder = this.checkCollisionWithLadder();
			if (!collision_ladder) {
				this.climbDown();
				this.changeState(CONSTANT.STATE_NORMAL);
			}

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

	// 霊夢用アイテムとの接触判定
	var item = this.checkCollisionWithItems();
	if(item) {
		item.got(); // 獲得済
		this.scene.addReimuItemNum();
	}

	// 交換アイテムとの接触判定
	var exchange_item = this.checkCollisionWithExchangeItems();
	if(exchange_item) {
		exchange_item.got(); // 獲得済
		this.scene.exchangeVertical();
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

// 霊夢用アイテムとの衝突判定
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

// 交換アイテムとの衝突判定
Player.prototype.checkCollisionWithExchangeItems = function() {
	var self = this;
	// アイテムと自機の衝突判定
	var collision_item = false;

	self.scene.objects_by_tile_type[CONSTANT.ITEM_OF_EXCHANGE].forEach(function(obj) {
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
		.concat(self.scene.objects_by_tile_type[CONSTANT.ENEMY_VERTICAL])
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

	var tile_objects = self.scene.objects_by_tile_type[CONSTANT.BLOCK_DISAPPEAR];

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
		//console.log(this.state);
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
			if(obj.isCollision() && this.alterego.checkCollision(obj)) {
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
Player.prototype.collisionWidth = function(obj) {
	return 24;
};
Player.prototype.collisionHeight = function(obj) {
	return 32;
};

module.exports = Player;

},{"../../constant":6,"../../hakurei":9,"../alterego":136,"../exchange_anim":138,"./block_base":142,"./player/state_climbdown":160,"./player/state_dying":161,"./player/state_exchange":162,"./player/state_falldown":163,"./player/state_moveleft":165,"./player/state_moveright":166,"./player/state_normal":167,"./tile_base":168}],159:[function(require,module,exports){
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

},{"../../../hakurei":9}],160:[function(require,module,exports){
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

},{"../../../constant":6,"../../../hakurei":9,"./state_base":159}],161:[function(require,module,exports){
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

},{"../../../constant":6,"../../../hakurei":9,"./state_base":159}],162:[function(require,module,exports){
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

},{"../../../constant":6,"../../../hakurei":9,"./state_base":159}],163:[function(require,module,exports){
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

},{"../../../constant":6,"../../../hakurei":9,"./state_base":159}],164:[function(require,module,exports){
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

},{"../../../constant":6,"../../../hakurei":9,"./state_base":159}],165:[function(require,module,exports){
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

},{"../../../constant":6,"../../../hakurei":9,"./state_move_base":164}],166:[function(require,module,exports){
arguments[4][165][0].apply(exports,arguments)
},{"../../../constant":6,"../../../hakurei":9,"./state_move_base":164,"dup":165}],167:[function(require,module,exports){
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

},{"../../../constant":6,"../../../hakurei":9,"./state_base":159}],168:[function(require,module,exports){
'use strict';
var base_object = require('../../hakurei').object.sprite;
var util = require('../../hakurei').util;

var TileBase = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(TileBase, base_object);

TileBase.prototype.init = function(x, y, scale) {
	scale = scale || 1;

	base_object.prototype.init.apply(this, arguments);
	this.x(x);
	this.y(y);

	this._scale = scale;
};

TileBase.prototype.isBlock = function() {
	return false;
};
module.exports = TileBase;

},{"../../hakurei":9}],169:[function(require,module,exports){
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

	var ext = util.canPlayOgg() ? ".ogg" : ".m4a";

	// ゲームで使用する画像一覧
	for (var key in AssetsConfig.images) {
		this.core.image_loader.loadImage(key, AssetsConfig.images[key]);
	}

	// ゲームで使用するSE一覧
	for (var key2 in AssetsConfig.sounds) {
		var conf2 = AssetsConfig.sounds[key2];
		this.core.audio_loader.loadSound(key2, conf2.path + ext, conf2.volume);
	}

	// ゲームで使用するBGM一覧
	for (var key3 in AssetsConfig.bgms) {
		var conf3 = AssetsConfig.bgms[key3];
		this.core.audio_loader.loadBGM(key3, conf3.path + ext, 1.0, conf3.loopStart, conf3.loopEnd);
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

},{"../assets_config":5,"../constant":6,"../hakurei":9}],170:[function(require,module,exports){
'use strict';

var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;
var H_CONSTANT = require('../hakurei').constant;
var CONSTANT = require('../constant');

// transition time ready to show canvas
var SHOW_TRANSITION_COUNT = 100;

// blink interval time
var SHOW_START_MESSAGE_INTERVAL = 50;

var MENU = [
	["menu_story_start", "reminiscence", function (core) {
		var progress_stage_no = core.storage_story.getNormalStageProgress();

		// 最初から
		if (!progress_stage_no) {
			// 回想シーン画面へ
			core.changeScene("reminiscence");
		}
		// 続きから
		else {
			// 続きのステージから
			core.changeScene("stage", progress_stage_no + 1, "talk");
		}
	}],
	["menu_ex_story_start", "ex_epigraph", function (core) {
		var progress_stage_no = core.storage_story.getExStageProgress();

		// 最初から
		if (!progress_stage_no) {
			// Ex エピグラフ画面へ
			core.changeScene("ex_epigraph");
		}
		// 続きから
		else {
			// 続きのステージから
			core.changeScene("stage", progress_stage_no + 1, "talk");
		}
	}],
	["menu_select_stage", "select", function (core) {
		// ステージセレクト画面へ
		core.changeScene("select");
	}],
	/*
	["menu_how_to", "howto", function (core) {
		// 遊び方画面へ
		core.changeScene("howto");
	}],
	["menu_config", "config", function (core) {
		core.changeScene("config");
	}],
	*/
	["menu_music_room", "music", function (core) {
		// Music Room 画面へ
		core.changeScene("music");
	}],
];

var SceneTitle = function(core) {
	base_scene.apply(this, arguments);
};
util.inherit(SceneTitle, base_scene);

SceneTitle.prototype.init = function(){
	base_scene.prototype.init.apply(this, arguments);

	// 今どれにカーソルがあるか
	this.index = 0;

	// Exステージ解放されているかどうか */
	var is_normal_stage_cleared = this.core.storage_story.getIsNormalStageCleared();

	// いずれかのステージがクリアされているかどうか
	var is_any_stage_cleared = this.core.storage_story.getLatestStageResult() ? true : false;

	// メニュー一覧
	this.menu_list = [];
	for(var i = 0, len = MENU.length; i < len; i++) {
		var menu = MENU[i];

		// 通常ストーリークリア後のみ、Ex Story を表示する
		if(!is_normal_stage_cleared && menu[1] === "ex_epigraph") {
			continue;
		}
		// stage 1クリア後のみ、ステージセレクトを表示する
		else if (!is_any_stage_cleared && menu[1] === "select") {
			continue;
		}

		this.menu_list.push(menu);
	}

	this.core.stopBGM();

	// フェードインする
	this.setFadeIn(SHOW_TRANSITION_COUNT);
};


SceneTitle.prototype.beforeDraw = function(){
	base_scene.prototype.beforeDraw.apply(this, arguments);

	if(this.frame_count === 60) {
		// 通常ストーリーのみクリアしていれば、BGMを霊夢1人 ver に
		if(this.core.storage_story.getIsNormalStageCleared() && !this.core.storage_story.getIsExStageCleared()) {
			this.core.playBGM("title_without_yukari");
		}
		else {
			this.core.playBGM("title");
		}


	}

	// カーソルを下移動
	if(this.core.isKeyPushOrLongDown(H_CONSTANT.BUTTON_DOWN)) {
		this.core.playSound('select');
		this.index++;

		if(this.index >= this.menu_list.length) {
			this.index = this.menu_list.length - 1;
		}
	}
	// カーソルを上移動
	if(this.core.isKeyPushOrLongDown(H_CONSTANT.BUTTON_UP)) {
		this.core.playSound('select');
		this.index--;

		if(this.index < 0) {
			this.index = 0;
		}
	}

	// 決定
	if(this.core.isKeyPush(H_CONSTANT.BUTTON_Z)) {
		this.core.playSound('select');

		// メニューに設定された関数を実行
		var exec_func = this.menu_list[this.index][2];
		exec_func(this.core);
	}
};

// 画面更新
SceneTitle.prototype.draw = function(){
	this.core.clearCanvas();
	var ctx = this.core.ctx;

	ctx.save();

	var title_bg;
	// 通常ストーリーのみクリアしていれば、背景を霊夢1人 ver に
	if(this.core.storage_story.getIsNormalStageCleared() && !this.core.storage_story.getIsExStageCleared()) {
		title_bg = this.core.image_loader.getImage('title_bg_without_yukari');
	}
	else {
		title_bg = this.core.image_loader.getImage('title_bg');
	}

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

	// タイトルロゴ
	var title = this.core.image_loader.getImage('title');
	ctx.drawImage(title,
					20,
					-20,
					title.width,
					title.height);



	var text_x    = this.core.width - 120;
	var y = 130;

	// メニュー一覧表示
	for(var i = 0, len = this.menu_list.length; i < len; i++) {
		var menu = this.menu_list[i];

		var suffix, pre_x;
		if(this.index === i) {
			suffix = "_on";
			pre_x = 10;
		}
		else {
			suffix = "_off";
			pre_x = 0;
		}
		var menu_image = this.core.image_loader.getImage(menu[0] + suffix);
		ctx.drawImage(menu_image,
						text_x - pre_x,
						y,
						menu_image.width,
						menu_image.height);
		y+= menu_image.height;
	}

	ctx.restore();


};

SceneTitle.prototype._drawText = function(text, x, y){
	var ctx = this.core.ctx;
	ctx.fillStyle = 'rgb( 0, 0, 0 )';
	ctx.lineWidth = 4.0;
	ctx.strokeText(text, x, y);

	ctx.fillStyle = 'rgb( 255, 255, 255 )';
	ctx.fillText(text, x, y);
};




module.exports = SceneTitle;

},{"../constant":6,"../hakurei":9}],171:[function(require,module,exports){
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
	this.core.changeScene("logo");
};

// セリフスクリプト
SceneReminiscence.prototype.serifScript = function() {
	return serif_script;
};

// BGM
SceneReminiscence.prototype.bgm = function() {
	return "reminiscence";
};
// トランジションカラー
SceneReminiscence.prototype.backgroundTransitionColor = function() {
	return "black";
};



module.exports = SceneReminiscence;

},{"../constant":6,"../hakurei":9,"../logic/serif/reminiscence":54,"./serif_base":224}],172:[function(require,module,exports){
'use strict';

/* 題字画面 */

// メッセージ表示の遷移時間
var TRANSITION_COUNT = 240;

var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;

var SceneLogo = function(core) {
	base_scene.apply(this, arguments);
};
util.inherit(SceneLogo, base_scene);

SceneLogo.prototype.init = function() {
	base_scene.prototype.init.apply(this, arguments);

	this.core.stopBGM();
};

SceneLogo.prototype.beforeDraw = function() {
	base_scene.prototype.beforeDraw.apply(this, arguments);

	// メッセージ表示終了
	if(this.isTransitionEnd()) {
		this.core.changeScene("prologue");
	}
};
SceneLogo.prototype.draw = function(){
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

	// タイトルロゴ
	var title = this.core.image_loader.getImage('title');

	var x = 20;
	var y = this.core.height/2 - title.height/2;

	ctx.save();
	ctx.globalAlpha = alpha;
	ctx.drawImage(title,
					x,
					y,
					title.width,
					title.height);
	ctx.restore();
};

SceneLogo.prototype.isTransitionEnd = function(){
	return TRANSITION_COUNT < this.frame_count;
};

module.exports = SceneLogo;

},{"../hakurei":9}],173:[function(require,module,exports){
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
	this.core.changeScene("stage", stage_no, "talk");
};

// セリフスクリプト
ScenePrologue.prototype.serifScript = function() {
	return serif_script;
};

// 背景画像名
ScenePrologue.prototype.background = function() {
	return "shrine_noon";
};
// BGM
ScenePrologue.prototype.bgm = function() {
	return "prologue";
};
module.exports = ScenePrologue;

},{"../constant":6,"../hakurei":9,"../logic/serif/prologue":53,"./serif_base":224}],174:[function(require,module,exports){
'use strict';

var util = require('../hakurei').util;
var H_CONSTANT = require('../hakurei').constant;
var CONSTANT = require('../constant');

var BackGroundEye  = require('../object/background_eye');
var LogicScore = require('../logic/score');
var LogicCreateMap = require('../logic/create_map');

var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;
var SceneStageBeforeTalk         = require("./stage/before_talk");
var SceneStageAfterTalk          = require("./stage/after_talk");
var SceneStagePlay               = require("./stage/play");
var SceneStageResultClearByStory = require("./stage/result_clear_by_story");
var SceneStageResultClearBySelect= require("./stage/result_clear_by_select");
var ScenePause                   = require("./stage/pause");


var StageConfig = require('../stage_config');
var MAPS = StageConfig.MAPS;
var SERIF_BEFORES = StageConfig.SERIF_BEFORES;
var SERIF_AFTERS = StageConfig.SERIF_AFTERS;
var EYES_NUM = StageConfig.EYES_NUM;

var SceneStage = function(core) {
	base_scene.apply(this, arguments);

	this.addSubScene("talk",                  new SceneStageBeforeTalk(core, this));
	this.addSubScene("after_talk",            new SceneStageAfterTalk(core, this));
	this.addSubScene("play",                  new SceneStagePlay(core, this));
	this.addSubScene("result_clear_by_story", new SceneStageResultClearByStory(core, this));
	this.addSubScene("result_clear_by_select",new SceneStageResultClearBySelect(core, this));
	this.addSubScene("pause",                 new ScenePause(core, this));
};
util.inherit(SceneStage, base_scene);

SceneStage.prototype.init = function(stage_no, sub_scene, is_from_select_scene){
	base_scene.prototype.init.apply(this, arguments);

	// stage no
	this.stage_no = stage_no || 1;

	// デフォルトは talk シーンから開始
	if(!sub_scene) sub_scene = "talk";

	if(this.core.audio_loader.currentPlayingBGM() !== this.getBGMName()) {
		this.core.stopBGM();
	}

	// ステージセレクトから遷移したのか、ストーリーから遷移したのか
	this.is_from_select_scene = is_from_select_scene ? true : false;

	this.reimu_item_num = 0;
	this.yukari_item_num = 0;

	// 背景の眼
	this.eyes = [];

	// このマップでの位置交代可能回数
	this.max_exchange_num = MAPS[this.stage_no].exchange_num;

	// 位置交代が垂直か水平か(true: 垂直, false: 水平)
	this._is_vertical = MAPS[this.stage_no].is_vertical;

	// タイルの種類毎のオブジェクトの配列
	this.objects_by_tile_type = null;

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
	/* 基底クラスの beforeDraw 処理 start */
	this.frame_count++;

	// go to next sub scene if next scene is set
	this.changeNextSubSceneIfReserved();

	if(this.currentSubScene()) this.currentSubScene().beforeDraw();
	/* 基底クラスの beforeDraw 処理 end */

	// サブオブジェクトのbeforeDraw は sub scene play の中でやっている

	if(this.frame_count === 60) {
		this.core.changeBGM(this.getBGMName());
	}
};

SceneStage.prototype.getBlocks = function(){
	var blocks = [];
	for (var i = 0, len = this.objects.length; i < len; i++) {
		if (!this.objects[i].isBlock()) continue;
		blocks.push(this.objects[i]);
	}

	return blocks;
};



SceneStage.prototype.notifyPlayerDie = function(){
	// 当該ステージの最初から
	this.notifyRestart();
};
// ポーズ画面から、restart
SceneStage.prototype.notifyRestart = function(){
	this.core.changeScene("stage", this.stage_no, "play", this.is_from_select_scene);
};
// ポーズ画面から、quit
SceneStage.prototype.notifyQuit = function(){
	// ストーリー中ならばタイトル画面へ
	if (!this.is_from_select_scene) {
		this.core.changeScene("title");
	}
	// セレクト画面からプレイしたならセレクト画面へ
	else {
		this.core.changeScene("select", this.stage_no);
	}
};

SceneStage.prototype.notifyStageClear = function(){
	// (ストーリー／セレクト両方) ステージ実績に更新があればセーブ
	this.core.storage_story.updateStageResult(this.stage_no, this.getSubScene("play").frame_count, this.player().exchange_num);

	// ストーリー中かつ
	if (!this.is_from_select_scene) {
		// 通常ストーリーならば
		if(!this.isInExStory()) {
			/// 通常ストーリー進捗を更新
			this.core.storage_story.incrementNormalStageProgress();

			// 通常ストーリーの最後ならば
			if (this.isLastNormalStory()) {
				// 進捗をリセット
				this.core.storage_story.resetNormalStageProgress();

				// Ex ストーリー解放
				this.core.storage_story.clearNormalStage();
			}

		}
		// Ex ストーリーならば
		else {
			/// Ex ストーリー進捗を更新
			this.core.storage_story.incrementExStageProgress();

			// Ex ストーリーの最後ならば
			if (this.isLastExStory()) {
				// 進捗をリセット
				this.core.storage_story.resetExStageProgress();

				// Ex ストーリー クリア フラグON
				this.core.storage_story.clearExStage();
			}
		}
	}

	this.core.storage_story.save();

	// セレクト画面からプレイしたなら
	if (this.is_from_select_scene) {
		this.changeSubScene("result_clear_by_select");
	}
	// ストーリーモードでプレイしたなら
	else {
		this.changeSubScene("result_clear_by_story");
	}
};
// ストーリー: クリア後のリザルト画面終了後
SceneStage.prototype.notifyResultClearEndByStory = function(){
	// 終了後のセリフがある場合
	if (SERIF_AFTERS[this.stage_no].length > 0) {
		this.changeSubScene("after_talk", SERIF_AFTERS[this.stage_no]);
	}
	// 終了後のセリフがない場合
	else {
		this.notifyAfterTalkEnd();
	}
};

// セレクト: クリア後のリザルト画面終了後
SceneStage.prototype.notifyResultClearEndBySelect = function(){

	// セレクト画面から来た場合、フェードアウトする
	this.setFadeOut(60);
	this.core.changeScene("select", this.stage_no);
};

// ステージクリア
SceneStage.prototype.notifyAfterTalkEnd = function() {
	// 通常ストーリークリア後
	if (this.isLastNormalStory()) {
		// フェードアウトして終了
		this.setFadeOut(60, 'white');
		// 次のシーンへ
		this.core.changeScene("after_normal");
	}
	// Exステージクリア後
	else if (this.isLastExStory()) {
		// 次のシーンへ
		this.core.changeScene("after_ex");
	}
	// 次のステージへ
	else {
		this.core.changeScene("stage", this.stage_no + 1);
	}
};
// ノーマルステージの最終ステージかどうか
SceneStage.prototype.isLastNormalStory = function() {
	return this.stage_no === (CONSTANT.EX_STORY_START_STAGE_NO - 1) ? true : false;
};
// ノーマル ストーリーのステージかどうか
SceneStage.prototype.isInNormalStory = function() {
	return !this.isInExStory();
};
// Exステージの最終ステージかどうか
SceneStage.prototype.isLastExStory = function() {
	return MAPS[this.stage_no + 1] ? false : true;
};
// Ex ストーリーのステージかどうか
SceneStage.prototype.isInExStory = function() {
	return this.stage_no >= CONSTANT.EX_STORY_START_STAGE_NO ? true : false;
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

// 位置移動の垂直<=>水平の変更
SceneStage.prototype.exchangeVertical = function () {
	this._is_vertical = !this._is_vertical;
};





SceneStage.prototype.draw = function() {
	var ctx = this.core.ctx;

	// background
	ctx.save();

	var bg = this.core.image_loader.getImage(this.getBGImageName());
	var cpt = ctx.createPattern(bg, "repeat");

	ctx.fillStyle = cpt;
	ctx.translate(-this.core.frame_count%103,-103 + this.core.frame_count%103);
	ctx.fillRect(0, 0, 1648, 1648);
	ctx.restore();

	// stage background
	LogicCreateMap.drawBackground(ctx, this.core.image_loader.getImage("bg"), CONSTANT.STAGE_OFFSET_X, CONSTANT.STAGE_OFFSET_Y);

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
	LogicCreateMap.drawFrames(this, CONSTANT.STAGE_OFFSET_X, CONSTANT.STAGE_OFFSET_Y);

	// draw sub scene
	if(this.currentSubScene()) this.currentSubScene().draw();
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
	if (map.length !== CONSTANT.STAGE_TILE_Y_NUM) {
		window.alert("マップの縦が20行である必要があります。");
	}

	var is_exists_player = false;
	for (var pos_y = 0; pos_y < map.length; pos_y++) {
		var line = map[pos_y];

		if (line.length !== CONSTANT.STAGE_TILE_X_NUM) {
			window.alert("マップの縦が30行である必要があります。");
		}

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
	this.objects_by_tile_type = LogicCreateMap.exec(this, map, CONSTANT.STAGE_OFFSET_X, CONSTANT.STAGE_OFFSET_Y);


	for (var key in this.objects_by_tile_type) {
		this.addObjects(this.objects_by_tile_type[key]);
	}
};

SceneStage.prototype.createBackGroundEyes = function() {
	var width = CONSTANT.TILE_SIZE * CONSTANT.STAGE_TILE_X_NUM;
	var height = CONSTANT.TILE_SIZE * CONSTANT.STAGE_TILE_Y_NUM;

	for (var i = 0; i < EYES_NUM[this.stage_no]; i++) {
		var x = CONSTANT.STAGE_OFFSET_X + Math.floor(Math.random() * width);
		var y = CONSTANT.STAGE_OFFSET_Y + Math.floor(Math.random() * height);

		var instance = new BackGroundEye(this);
		instance.init(x, y);
		this.eyes.push(instance);
	}
};


SceneStage.prototype.calcItemNum = function() {
	return this.objects_by_tile_type[CONSTANT.ITEM_FOR_REIMU].length + this.objects_by_tile_type[CONSTANT.ITEM_FOR_YUKARI].length;
};

SceneStage.prototype.calcHonor = function() {
	return LogicScore.calcHonor(
		this.stage_no,
		this.getSubScene("play").frame_count,
		this.player().exchange_num
	);
};

// ステージ背景画像名
SceneStage.prototype.getBGImageName = function() {
	if (this.stage_no <= 10) {
		return "stage_bg01";
	}
	else if (10 < this.stage_no && this.stage_no <= 20) {
		return "stage_bg02";
	}
	else if (20 < this.stage_no && this.stage_no <= 30) {
		return "stage_bg03";
	}
	else if (30 < this.stage_no && this.stage_no <= 40) {
		return "stage_bg04";
	}
	else {
		// ここにくることはないはず
		return "stage_bg01";
	}
};
// ステージBGM名
SceneStage.prototype.getBGMName = function() {
	if (this.stage_no <= 10) {
		return "stage_a";
	}
	else if (10 < this.stage_no && this.stage_no <= 20) {
		return "stage_b";
	}
	else if (20 < this.stage_no && this.stage_no <= 30) {
		return "stage_c";
	}
	else if (30 < this.stage_no && this.stage_no <= 35) {
		return "stage_d";
	}
	else if (35 < this.stage_no && this.stage_no <= 40) {
		return "stage_e";
	}
	else {
		// ここにくることはないはず
		return "stage_a";
	}
};





SceneStage.prototype.clearStageForDebug = function () {
	// サブシーンがゲームの操作できるシーンならば
	if(this.currentSubScene() instanceof SceneStagePlay) {
		// 御札獲得数を強制的にMAXにする
		this.reimu_item_num = this.max_item_num - this.yukari_item_num;
	}
};

module.exports = SceneStage;

},{"../constant":6,"../hakurei":9,"../logic/create_map":45,"../logic/score":48,"../object/background_eye":137,"../stage_config":232,"./stage/after_talk":225,"./stage/before_talk":226,"./stage/pause":227,"./stage/play":228,"./stage/result_clear_by_select":229,"./stage/result_clear_by_story":230}],175:[function(require,module,exports){
'use strict';

/* 通常ストーリー クリア後画面 */

var serif_script = require("../logic/serif/after_normal");


var util = require('../hakurei').util;
var CONSTANT = require('../constant');
var base_scene = require('./serif_base');

var SceneAfterNormal = function(game) {
	base_scene.apply(this, arguments);
};

util.inherit(SceneAfterNormal, base_scene);

// 立ち絵＆セリフ終了後
SceneAfterNormal.prototype.notifySerifEnd = function() {
	// タイトル画面へ
	this.core.changeScene("title");
};

// セリフスクリプト
SceneAfterNormal.prototype.serifScript = function() {
	return serif_script;
};

// BGM
SceneAfterNormal.prototype.bgm = function() {
};

SceneAfterNormal.prototype.isPlayFadeIn = function() {
	return true;
};


module.exports = SceneAfterNormal;

},{"../constant":6,"../hakurei":9,"../logic/serif/after_normal":50,"./serif_base":224}],176:[function(require,module,exports){
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

	this.core.stopBGM();
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

},{"../hakurei":9}],177:[function(require,module,exports){
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
	this.core.changeScene("stage", stage_no, "talk");
};

// セリフスクリプト
ScenePrologue.prototype.serifScript = function() {
	return serif_script;
};

// 背景画像名
ScenePrologue.prototype.background = function() {
	return "shrine_night";
};
ScenePrologue.prototype.isPlayFadeOut = function() {
	return true;
};



module.exports = ScenePrologue;

},{"../constant":6,"../hakurei":9,"../logic/serif/ex_prologue":52,"./serif_base":224}],178:[function(require,module,exports){
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

var SceneAfterEx = function(game) {
	base_scene.apply(this, arguments);
};

util.inherit(SceneAfterEx, base_scene);

SceneAfterEx.prototype.init = function() {
	base_scene.prototype.init.apply(this, arguments);

};

SceneAfterEx.prototype.beforeDraw = function() {
	base_scene.prototype.beforeDraw.apply(this, arguments);
};

SceneAfterEx.prototype.isPlayFadeIn = function() {
	return true;
};
SceneAfterEx.prototype.isPlayFadeOut = function() {
	return true;
};




// 立ち絵＆セリフ終了後
SceneAfterEx.prototype.notifySerifEnd = function() {
	this.core.changeScene("staffroll");
};

// セリフスクリプト
SceneAfterEx.prototype.serifScript = function() {
	return serif_script;
};

// BGM
SceneAfterEx.prototype.bgm = function() {
	return "after_ex";
};

module.exports = SceneAfterEx;

},{"../constant":6,"../hakurei":9,"../logic/serif/after_ex":49,"./serif_base":224}],179:[function(require,module,exports){
'use strict';

/* スタッフロール画面 */

var serifs = [
	["プログラム","さい"],
	["ドット絵・UI","AOI"],
	["イラスト","シノバ (shnva)"],
	["脚本・演出","土露団子"],
	["BGM","敷き紙"],
	["DLカード デザイン","RF"],
];
var RESULT_TRANSITION_COUNT = 600;


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

	this.core.playBGM("staffroll");
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

},{"../hakurei":9,"../object/reimu_for_staffroll":139}],180:[function(require,module,exports){
'use strict';

/* エピローグ画面 */

var serif_script = require("../logic/serif/epilogue");


var util = require('../hakurei').util;
var CONSTANT = require('../constant');
var base_scene = require('./serif_base');

var ScenePrologue = function(game) {
	base_scene.apply(this, arguments);
};

util.inherit(ScenePrologue, base_scene);

ScenePrologue.prototype.init = function() {
	base_scene.prototype.init.apply(this, arguments);

	this._is_play_drop_sound = false;
};
ScenePrologue.prototype.beforeDraw = function() {
	base_scene.prototype.beforeDraw.apply(this, arguments);

	// 霊夢が筆を落とす音
	if(this.serif.progress === 9 && !this._is_play_drop_sound) {
		this._is_play_drop_sound = true;
		this.core.playSound("drop");
	}
};

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

// BGM
ScenePrologue.prototype.bgm = function() {
	return "epilogue";
};

ScenePrologue.prototype.isPlayFadeIn = function() {
	return true;
};


module.exports = ScenePrologue;

},{"../constant":6,"../hakurei":9,"../logic/serif/epilogue":51,"./serif_base":224}],181:[function(require,module,exports){
'use strict';

/* 遊び方 */

var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;
var H_CONSTANT = require('../hakurei').constant;
var CONSTANT = require('../constant');

var HOWTOS = [
	{
		image: "thumbnail15",
		messages: [
			"主人公は霊夢",
		],
	},
	{
		image: "thumbnail15",
		messages: [
			"霊夢が動くと反対側の紫も動く",
		],
	},
	{
		image: "thumbnail15",
		messages: [
			"紫は壁や敵を無視できる",
		],
	},
	{
		image: "thumbnail15",
		messages: [
			"御札は霊夢しか獲得できない",
		],
	},
	{
		image: "thumbnail15",
		messages: [
			"リボンは紫しか獲得できない",
		],
	},
	{
		image: "thumbnail15",
		messages: [
			"Xキーで霊夢と紫の位置を",
			"入れ替えて進もう",
		],
	},
	{
		image: "thumbnail15",
		messages: [
			"入れ替え回数には上限があるよ",
		],
	},
	{
		image: "thumbnail15",
		messages: [
			"ステージのアイテムを",
			"すべて集めるとクリア！",
		],
	},

];



var SceneHowTo = function(core) {
	base_scene.apply(this, arguments);
};
util.inherit(SceneHowTo, base_scene);

SceneHowTo.prototype.init = function(){
	base_scene.prototype.init.apply(this, arguments);
	this.index = 0;
};


SceneHowTo.prototype.beforeDraw = function(){
	base_scene.prototype.beforeDraw.apply(this, arguments);

	// カーソルを下移動
	if(this.core.isKeyPush(H_CONSTANT.BUTTON_RIGHT)) {
		this.index++;

		if(this.index >= HOWTOS.length) {
			this.index = HOWTOS.length - 1;
			// 終了
			this.core.changeScene("title");
		}
	}
	// カーソルを上移動
	if(this.core.isKeyPush(H_CONSTANT.BUTTON_LEFT)) {
		this.index--;

		if(this.index < 0) {
			this.index = 0;
		}
	}

};

// 画面更新
SceneHowTo.prototype.draw = function(){
	this.core.clearCanvas();
	var ctx = this.core.ctx;

	ctx.save();

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

	// 背景をちょっと暗めに表示
	ctx.fillStyle = 'rgb( 0, 0, 0 )' ;
	ctx.globalAlpha = 0.5; // 半透明
	ctx.fillRect(0, 0, this.core.width, this.core.height);

	ctx.restore();

	ctx.font = "36px 'Migu'";
	ctx.textAlign = 'left';

	// メッセージ
	this._drawText(HOWTOS[this.index].messages[0], 100, 500);
	if (HOWTOS[this.index].messages[1]) {
		this._drawText(HOWTOS[this.index].messages[1], 100, 540);
	}

	// 矢印
	if (this.index !== 0) {
		this._drawText("◀", 10, 250);
	}
	this._drawText("▶", this.core.width - 50, 250);

	// 画像
	var image = this.core.image_loader.getImage(HOWTOS[this.index].image);

	// 背景画像表示
	ctx.drawImage(image,
					0,
					0,
					image.width,
					image.height,
					80,
					20,
					image.width*0.8,
					image.height*0.8
	);

};

SceneHowTo.prototype._drawText = function(text, x, y){
	var ctx = this.core.ctx;
	ctx.fillStyle = 'rgb( 0, 0, 0 )';
	ctx.lineWidth = 4.0;
	ctx.strokeText(text, x, y);

	ctx.fillStyle = 'rgb( 255, 255, 255 )';
	ctx.fillText(text, x, y);
};

module.exports = SceneHowTo;

},{"../constant":6,"../hakurei":9}],182:[function(require,module,exports){
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
	[0,0,0,0,0,0,0,0,0,0,0,0,0,A,B,B,C,0,0,P,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,A,B,B,C,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,A,B,B,C,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,A,B,B,C,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,A,B,B,B,B,B,C,6,A,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,C,0],
	[0,0,0,0,A,C,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,A,B,C,0,0],
	[0,0,0,0,A,C,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,A,B,C,0,0],
	[0,0,0,0,A,C,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,I,0,0,0,A,B,C,0,0],
	[0,0,0,0,A,C,0,A,B,C,0,0,0,0,0,0,0,0,0,0,A,B,C,0,0,A,B,C,0,0],
	[0,0,0,0,A,C,0,A,B,C,0,0,0,0,0,0,0,0,0,0,A,B,C,0,0,A,B,C,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,I,0,0,0,0,I,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,A,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,C,0],
	[0,0,A,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,C,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
];

module.exports = {
	map:                   map,   // マップ
	exchange_num:          2,     // 位置移動上限回数
	is_vertical:           false, // 交代が垂直かどうか
	criteria_time:         420,   // スコア計算用基準タイム
	criteria_exchange_num: 2,     // スコア計算用基準 交換回数
};

},{}],183:[function(require,module,exports){
'use strict';
var A = 11;
var B = 12;
var C = 13;
var D = 10;
var E = 8;
var F = 16;
var I = 9;
var L = 6;
var N = -1;
var P = 7;
var K = 5;
var Y = 14;
var X = 15;

var map = [
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,I,I,I,0,0,0,0,0,0,0,0,0,0,0,0,I,I,I,0,0,0,0],
	[0,0,0,0,0,A,B,L,B,B,B,B,B,C,0,0,0,0,0,A,B,L,B,B,B,B,B,C,0,0],
	[0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,L,0,0,E,0,0,0,0,0,0,0,0,E,0,L,0,0,0,0,0,0,0,0],
	[0,0,0,0,A,B,B,B,B,L,B,C,0,0,0,0,0,0,A,B,B,B,B,L,B,C,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,L,0,0,0,0,P,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,I,I,0,0,L,0,0,0,0,0,0],
	[0,0,0,0,0,0,A,B,B,B,B,B,B,B,B,C,0,0,A,B,B,B,B,B,B,B,B,B,C,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
];
  //[B,B,B,B,B,B,B,B,B,B,B,B,B,B,0,0,B,B,B,B,B,B,B,B,B,B,B,B,B,B],

module.exports = {
	map: map, // マップ
	exchange_num: 1, // 位置移動上限回数
	is_vertical: false, // 交代が垂直かどうか
	criteria_time:         820,   // スコア計算用基準タイム
	criteria_exchange_num: 1,     // スコア計算用基準 交換回数
};

},{}],184:[function(require,module,exports){
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
	criteria_time:         770,   // スコア計算用基準タイム
	criteria_exchange_num: 3,     // スコア計算用基準 交換回数
};

},{}],185:[function(require,module,exports){
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
	criteria_time:         1200,   // スコア計算用基準タイム
	criteria_exchange_num: 0,     // スコア計算用基準 交換回数
};

},{}],186:[function(require,module,exports){
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
	criteria_time:         1300,   // スコア計算用基準タイム
	criteria_exchange_num: 2,     // スコア計算用基準 交換回数
};

},{}],187:[function(require,module,exports){
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
	criteria_time:         730,   // スコア計算用基準タイム
	criteria_exchange_num: 2,     // スコア計算用基準 交換回数
};

},{}],188:[function(require,module,exports){
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
	[0,0,E,0,0,E,0,0,E,0,0,Y,Y,0,0,0,0,0,0,0,0,0,0,0,0,I,I,0,0,0],
	[0,A,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,L,B,B,B,B,B,B,C,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0],
	[0,0,0,Y,Y,0,E,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,I,I,0,0,0,0,0],
	[0,0,A,B,B,B,B,B,B,B,B,L,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,C,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,I,I,I,I,0,0,0,L,0,0,0,0,0,0,0,0,Y,Y,0,E,0,0,0,0,0,0],
	[0,0,0,A,B,B,B,B,B,B,B,B,B,B,B,L,B,B,B,B,B,B,B,B,B,B,C,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,P,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,A,B,B,B,B,B,B,C,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
];

module.exports = {
	map: map, // マップ
	exchange_num: 4, // 位置移動上限回数
	is_vertical: false, // 交代が垂直かどうか
	criteria_time:         1400,   // スコア計算用基準タイム
	criteria_exchange_num: 0,     // スコア計算用基準 交換回数
};

},{}],189:[function(require,module,exports){
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
var X = 15;

var map = [
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,A,B,C,0,A,B,B,B,L,B,B,B,B,B,B,B,B,B,B,B,B,C,0,A,B,C,0,0],
	[0,0,0,B,0,Y,0,B,B,0,L,0,0,0,0,0,0,0,0,0,0,B,B,0,I,0,B,0,0,0],
	[0,0,0,B,0,Y,0,B,B,0,L,0,0,0,0,0,0,0,0,0,0,B,B,0,I,0,B,0,0,0],
	[0,0,0,B,0,Y,0,B,B,0,L,0,0,0,0,0,0,0,0,0,0,B,B,0,I,0,B,0,0,0],
	[0,0,0,B,0,Y,0,B,B,0,L,0,0,0,E,0,0,0,0,0,0,B,B,0,I,0,B,0,0,0],
	[0,0,0,B,0,0,0,B,B,0,A,B,B,B,B,B,B,B,C,L,0,B,B,0,0,0,B,0,0,0],
	[0,0,0,B,0,I,0,B,B,0,0,0,0,0,0,0,0,0,0,L,0,B,B,0,Y,0,B,0,0,0],
	[0,0,0,B,0,I,0,B,B,0,0,0,0,0,0,0,0,0,0,L,0,B,B,0,Y,0,B,0,0,0],
	[0,0,0,B,0,I,0,B,B,0,0,0,0,0,P,0,0,0,0,L,0,B,B,0,Y,0,B,0,0,0],
	[0,0,0,B,0,I,0,B,B,0,X,0,0,0,0,0,0,0,0,L,0,B,B,0,Y,0,B,0,0,0],
	[0,0,0,B,0,0,0,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,0,0,0,B,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,A,B,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,A,B,C,0,0,0,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
];

module.exports = {
	map: map, // マップ
	exchange_num: 2, // 位置移動上限回数
	is_vertical: true, // 交代が垂直かどうか
	criteria_time:         800,   // スコア計算用基準タイム
	criteria_exchange_num: 2,     // スコア計算用基準 交換回数
};

},{}],190:[function(require,module,exports){
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
	[0,0,0,0,0,0,0,E,0,0,0,I,I,0,0,0,0,0,I,I,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,A,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,C,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,P,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,I,I,0,0,0,0,0,0,0,I,I,0,0,0,0,0],
	[0,0,A,B,B,B,B,B,B,C,0,B,L,A,B,B,C,L,B,0,A,B,B,B,B,B,B,C,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,L,0,Y,Y,0,L,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,A,B,B,B,B,B,B,C,0,0,0,0,0,0,0,0,0,0,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
];

module.exports = {
	map: map, // マップ
	exchange_num: 4, // 位置移動上限回数
	is_vertical: true, // 交代が垂直かどうか
	criteria_time:         1200,   // スコア計算用基準タイム
	criteria_exchange_num: 3,     // スコア計算用基準 交換回数
};

},{}],191:[function(require,module,exports){
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
	[0,0,0,0,Y,Y,Y,Y,0,0,0,0,0,0,0,0,0,0,0,0,0,0,E,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,C,L,A,B,B,B,B,B,B,B,B,B,B,B,B,C,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,E,0,0,0,0,0,0,0,L,0,0,0,0,0,0,Y,Y,Y,Y,0,0,0,0,0],
	[0,A,B,B,B,B,B,B,B,B,B,B,B,C,L,B,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,Y,0,0,0,0,A,B,B,B,C,L,0,0,0,0,E,0,0,0,P,0,0,0],
	[0,0,0,A,B,B,B,B,B,B,B,B,C,0,0,0,A,B,B,B,B,B,C,L,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,A,B,B,B,B,C,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
];

module.exports = {
	map: map, // マップ
	exchange_num: 2, // 位置移動上限回数
	is_vertical: false, // 交代が垂直かどうか
	criteria_time:         1350,   // スコア計算用基準タイム
	criteria_exchange_num: 2,     // スコア計算用基準 交換回数
};

},{}],192:[function(require,module,exports){
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
	[0,0,0,0,0,0,0,0,0,0,0,0,0,A,0,0,C,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,A,B,B,C,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,P,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,I,I,I,I,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,A,B,C,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,A,B,C,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,I,I,I,0,0,I,I,I,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,B,L,K,K,K,K,K,K,K,K,K,K,L,B,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,B,L,0,0,0,0,0,0,0,0,0,0,L,B,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,E,I,B,L,0,0,0,0,I,I,0,0,E,0,L,B,I,E,0,0,0,0,0,0],
	[0,A,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,C,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
];

module.exports = {
	map: map, // マップ
	exchange_num: 1, // 位置移動上限回数
	is_vertical: false, // 交代が垂直かどうか
	criteria_time:         740,   // スコア計算用基準タイム
	criteria_exchange_num: 1,     // スコア計算用基準 交換回数
};

},{}],193:[function(require,module,exports){
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
	[0,0,0,0,0,0,E,0,0,0,0,I,0,I,0,0,I,0,I,0,0,0,0,E,0,0,0,0,0,0],
	[0,0,0,A,L,A,B,B,B,B,L,B,B,B,B,B,B,B,B,L,B,B,B,B,B,B,C,0,0,0],
	[0,0,0,0,L,0,0,0,0,0,L,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,L,0,0,0,0,0,L,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,L,0,0,0,0,0,L,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,L,0,0,0,0,0,L,0,I,0,0,0,0,I,0,L,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,I,L,I,0,0,0,0,A,B,B,B,B,B,B,B,B,C,0,0,0,0,I,0,I,0,0,0],
	[0,0,A,B,B,B,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,A,B,L,B,C,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,P,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,A,K,K,C,0,0,0,0,0,0,0,0,L,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0],
	[0,0,0,0,0,0,E,0,0,0,0,0,I,0,I,I,0,I,0,0,0,0,0,E,0,L,0,0,0,0],
	[0,0,0,A,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,C,0,0,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
];

module.exports = {
	map: map, // マップ
	exchange_num: 1, // 位置移動上限回数
	is_vertical: false, // 交代が垂直かどうか
	criteria_time:         2040,   // スコア計算用基準タイム
	criteria_exchange_num: 1,     // スコア計算用基準 交換回数
};

},{}],194:[function(require,module,exports){
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
	[0,0,0,0,0,0,0,0,0,0,0,Y,0,I,0,0,Y,0,I,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,A,L,C,0,0,A,L,C,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,I,I,I,I,0,E,L,0,0,0,0,L,E,0,I,I,I,I,0,0,0,0,0,0],
	[0,0,A,B,B,B,B,B,B,B,B,B,B,B,K,K,B,B,B,B,B,B,B,C,L,A,B,C,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0],
	[0,0,0,I,0,0,0,0,0,0,0,E,I,0,0,0,0,I,E,0,0,0,0,0,L,0,I,0,0,0],
	[0,0,A,B,B,B,B,L,B,B,B,B,B,B,K,K,B,B,B,B,B,B,B,B,B,B,B,C,0,0],
	[0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[B,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,P,0,0,0,0,B],
	[B,0,0,0,0,0,0,L,0,0,0,0,0,0,I,I,I,I,0,0,0,0,0,0,0,0,0,0,0,B],
	[B,K,K,A,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,C,K,K,B],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
];

module.exports = {
	map: map, // マップ
	exchange_num: 2, // 位置移動上限回数
	is_vertical: false, // 交代が垂直かどうか
	criteria_time:         2300,   // スコア計算用基準タイム
	criteria_exchange_num: 1,     // スコア計算用基準 交換回数
};

},{}],195:[function(require,module,exports){
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
var X = 15;

var map = [
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,I,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,I,0,0,0,0,0],
	[0,0,A,B,B,B,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,A,B,B,B,C,0,0],
	[0,0,0,0,P,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,I,0,X,0,0,I,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,A,L,C,0,0,0,A,L,A,B,B,B,B,C,L,C,0,0,0,A,L,C,0,0,0,0],
	[0,0,0,0,0,L,0,0,0,0,0,L,0,0,0,0,0,0,L,0,0,0,0,0,L,0,0,0,0,0],
	[0,0,0,0,0,L,0,0,0,0,0,L,0,0,0,0,0,0,L,0,0,0,0,0,L,0,0,0,0,0],
	[0,0,0,0,0,L,0,0,0,0,0,L,0,0,E,E,0,0,L,0,0,0,0,0,L,0,0,0,0,0],
	[0,0,0,A,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,C,0,0,0],
	[0,0,0,0,A,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,C,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,I,I,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,A,B,B,C,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,I,I,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,I,I,0,0,0,0],
	[0,0,0,A,B,B,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,A,B,B,C,0,0,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
];

module.exports = {
	map: map, // マップ
	exchange_num: 5, // 位置移動上限回数
	is_vertical: false, // 交代が垂直かどうか
	criteria_time:         1900,   // スコア計算用基準タイム
	criteria_exchange_num: 5,     // スコア計算用基準 交換回数
};

},{}],196:[function(require,module,exports){
'use strict';
var A = 11;
var B = 12;
var C = 13;
var D = 10;
var E = 8;
var F = 16;
var I = 9;
var L = 6;
var N = -1;
var P = 7;
var K = 5;
var Y = 14;
var X = 15;

var map = [
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,P,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,I,0,0,0,0,I,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,B,B,B,B,B,B,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,B,K,K,K,K,K,K,K,B,B,B,B,B,B,K,K,K,L,K,K,K,B,0,0,0,0],
	[B,0,Y,0,B,0,0,0,Y,0,0,0,B,B,B,B,B,B,0,0,0,L,0,0,0,B,0,I,0,B],
	[B,K,K,K,B,0,0,0,Y,0,0,0,B,B,B,B,B,B,0,0,0,L,0,0,0,B,K,K,K,B],
	[B,0,0,0,B,0,0,0,Y,0,0,0,B,B,B,B,B,B,0,0,0,L,0,0,0,B,0,0,0,B],
	[B,0,0,0,B,0,0,0,Y,0,0,0,B,B,B,B,B,B,0,0,0,L,0,0,0,B,0,0,0,B],
	[B,0,F,0,B,0,0,0,0,0,0,0,B,B,B,B,B,B,0,0,0,L,0,0,0,B,0,F,0,B],
	[0,0,0,0,B,0,0,0,0,0,0,0,B,B,B,B,B,B,0,0,0,L,0,0,0,B,0,0,0,0],
	[B,0,0,0,B,K,K,K,L,K,K,K,B,B,B,B,B,B,K,K,K,K,K,K,K,B,0,0,0,B],
	[B,0,I,0,B,0,0,0,L,0,0,0,B,B,B,B,B,B,0,0,0,Y,0,0,0,B,0,Y,0,B],
	[B,K,K,K,B,0,0,0,L,0,0,0,B,B,B,B,B,B,0,0,0,Y,0,0,0,B,K,K,K,B],
	[B,0,0,0,B,0,0,0,L,0,0,0,B,B,B,B,B,B,0,0,0,Y,0,0,0,B,0,0,0,B],
	[0,0,0,0,B,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,Y,0,0,0,B,0,0,0,0],
	[0,0,0,0,B,0,0,0,L,0,0,0,E,0,I,I,0,0,0,0,0,0,0,0,0,B,0,0,0,0],
	[0,0,0,0,A,K,K,K,K,K,K,K,A,B,B,B,B,C,K,K,K,K,K,K,K,C,0,0,0,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
];

module.exports = {
	map: map, // マップ
	exchange_num: 3, // 位置移動上限回数
	is_vertical: false, // 交代が垂直かどうか
	criteria_time:         1600,   // スコア計算用基準タイム
	criteria_exchange_num: 2,     // スコア計算用基準 交換回数
};

},{}],197:[function(require,module,exports){
'use strict';
var A = 11;
var B = 12;
var C = 13;
var D = 10;
var E = 8;
var F = 16;
var I = 9;
var L = 6;
var N = -1;
var P = 7;
var K = 5;
var Y = 14;
var X = 15;

var map = [
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,I,0,0,I,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,A,B,C,L,A,C,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,I,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,A,B,C,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,I,0,I,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,A,B,B,B,B,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,P,0,0,0,0,0,0,0,0,0,0,I,0,I,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,A,L,A,B,B,B,B,C,L,C,0],
	[0,0,0,0,0,0,0,0,0,A,B,B,B,B,C,0,0,0,0,0,L,0,0,0,0,0,0,L,0,0],
	[0,0,0,0,0,0,0,F,0,0,0,0,0,0,0,0,0,0,0,Y,0,Y,0,0,0,0,Y,0,Y,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,A,B,C,0,F,0,0,A,B,C,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,I,0,0,0,0,0,0,I,0,0,0,0,0,0,I,0,I,0,0,0,0,0],
	[0,0,0,0,0,0,0,A,B,C,0,0,0,0,A,B,C,0,0,0,0,A,B,B,B,C,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,I,I,0,0,0,0,0,0,0,0,0,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,A,B,B,C,D,D,D,D,D,D,D,D,D],
];

module.exports = {
	map: map, // マップ
	exchange_num: 5, // 位置移動上限回数
	is_vertical: true, // 交代が垂直かどうか
	criteria_time:         1420,   // スコア計算用基準タイム
	criteria_exchange_num: 3,     // スコア計算用基準 交換回数
};

},{}],198:[function(require,module,exports){
'use strict';
var A = 11;
var B = 12;
var C = 13;
var D = 10;
var E = 8;
var F = 16;
var I = 9;
var L = 6;
var N = -1;
var P = 7;
var K = 5;
var Y = 14;
var X = 15;

var map = [
	[A,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,C],
	[A,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,C],
	[A,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,C],
	[A,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,C],
	[A,0,0,0,F,0,0,0,0,0,0,0,0,0,I,I,0,0,0,0,0,0,0,0,0,F,0,0,0,C],
	[A,0,0,0,0,0,0,0,0,0,0,0,A,K,K,K,K,C,0,0,0,0,0,0,0,0,0,0,0,C],
	[A,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,C],
	[A,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,C],
	[A,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,C],
	[A,0,0,0,I,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Y,0,0,0,C],
	[A,P,L,A,C,0,0,0,0,0,0,0,0,0,I,I,0,0,0,0,0,0,0,0,0,A,C,L,0,C],
	[A,0,L,A,C,0,0,0,0,0,0,0,L,A,B,B,C,L,0,0,0,0,0,0,0,A,C,L,0,C],
	[A,C,L,A,C,K,K,K,K,K,K,K,A,B,B,B,B,C,K,K,K,K,K,K,K,A,C,L,A,C],
	[A,0,L,A,C,0,0,0,I,0,0,0,0,0,0,0,0,0,0,0,0,Y,0,0,0,A,C,L,0,C],
	[A,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,C],
	[A,0,L,0,0,0,0,0,Y,0,0,0,0,0,0,0,0,0,0,0,0,I,0,0,0,0,0,L,0,C],
	[A,0,L,0,0,0,0,0,B,0,0,0,0,0,0,0,0,0,0,0,0,B,0,0,0,0,0,L,0,C],
	[A,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,C],
	[A,0,L,0,0,0,0,0,E,0,E,0,0,0,X,0,0,0,0,0,E,0,E,0,0,0,0,L,0,C],
	[A,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,C],
];

module.exports = {
	map: map, // マップ
	exchange_num: 3, // 位置移動上限回数
	is_vertical: false, // 交代が垂直かどうか
	criteria_time:         1200,   // スコア計算用基準タイム
	criteria_exchange_num: 2,     // スコア計算用基準 交換回数
};

},{}],199:[function(require,module,exports){
'use strict';
var A = 11;
var B = 12;
var C = 13;
var D = 10;
var E = 8;
var F = 16;
var I = 9;
var L = 6;
var N = -1;
var P = 7;
var K = 5;
var Y = 14;
var X = 15;

var map = [
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,B,0,0,I,I,E,0,0,0,0,0,0,0,0,0,0,I,I,0,0,B,0,0,0,0,0],
	[0,0,0,0,B,K,B,B,B,B,B,B,B,B,L,B,B,B,B,B,B,B,B,K,B,0,0,0,0,0],
	[0,0,0,0,B,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,B,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,B,0,I,Y,0,0,0,0,0,0,E,0,0,L,0,0,0,0,Y,0,E,0,0,0,0,I,0,B,0],
	[0,B,K,B,B,B,L,B,B,B,B,B,B,B,B,B,0,B,B,B,B,B,B,B,L,B,B,K,B,0],
	[0,B,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0],
	[0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,P,L,0,0,0,0,0],
	[0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,B,0,I,0,0,L,0,I,0,B,0],
	[0,B,0,I,0,0,L,0,0,I,0,B,0,0,0,0,0,0,0,B,K,B,B,B,B,B,B,K,B,0],
	[0,B,K,A,B,B,B,B,B,C,K,B,0,0,0,0,0,0,0,B,0,0,0,0,0,0,0,0,B,0],
	[0,B,0,0,0,0,0,0,0,0,0,B,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
];

module.exports = {
	map: map, // マップ
	exchange_num: 3, // 位置移動上限回数
	is_vertical: false, // 交代が垂直かどうか
	criteria_time:         1100,   // スコア計算用基準タイム
	criteria_exchange_num: 2,     // スコア計算用基準 交換回数
};

},{}],200:[function(require,module,exports){
'use strict';
var A = 11;
var B = 12;
var C = 13;
var D = 10;
var E = 8;
var F = 16;
var I = 9;
var L = 6;
var N = -1;
var P = 7;
var K = 5;
var Y = 14;
var X = 15;

var map = [
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,I,0,0,0,0,E,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,E,0,0,0,I,0,0],
	[0,B,K,K,K,K,A,L,C,K,K,K,K,K,C,0,A,K,K,K,K,A,L,C,K,K,K,B,0,0],
	[0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0],
	[0,0,I,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0],
	[0,0,B,K,0,0,0,L,0,0,0,0,0,0,I,0,I,E,0,0,E,0,L,0,0,0,0,0,I,0],
	[0,0,0,0,0,A,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,0,K,B,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,I,0,0,0,0,0,0,E,0,0,E,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,I,0,0],
	[0,B,0,0,0,A,L,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,L,B,B,0,B,0,0],
	[0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0],
	[0,0,0,0,0,0,L,P,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0],
	[0,0,I,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,I,0],
	[0,0,B,0,A,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,A,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
];

module.exports = {
	map: map, // マップ
	exchange_num: 4, // 位置移動上限回数
	is_vertical: true, // 交代が垂直かどうか
	criteria_time:         1850,   // スコア計算用基準タイム
	criteria_exchange_num: 2,     // スコア計算用基準 交換回数
};

},{}],201:[function(require,module,exports){
'use strict';
var A = 11;
var B = 12;
var C = 13;
var D = 10;
var E = 8;
var F = 16;
var I = 9;
var L = 6;
var N = -1;
var P = 7;
var K = 5;
var Y = 14;
var X = 15;

var map = [
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,L,K,B,K,L,0,A,B,C,0,A,B,B,C,0,A,B,C,L,I,K,B,K,0,0,0,0],
	[0,0,0,L,0,B,0,L,0,A,0,0,0,0,0,0,0,0,0,0,C,L,0,0,B,0,I,0,0,0],
	[0,0,0,L,0,B,0,L,0,A,0,0,0,0,0,0,0,0,0,0,C,L,0,0,B,0,0,0,0,0],
	[0,0,0,L,0,B,0,L,0,A,0,0,0,0,E,0,I,0,0,0,C,L,I,0,B,0,0,0,0,0],
	[0,0,0,L,0,B,0,L,0,A,C,K,K,K,K,K,K,K,K,A,C,L,0,0,B,0,I,0,0,0],
	[0,0,0,L,0,B,0,L,0,A,0,0,0,0,0,0,0,0,0,0,C,L,0,0,B,0,0,0,0,0],
	[0,0,0,L,0,B,0,L,0,A,0,0,0,0,0,0,0,0,0,0,C,0,I,0,B,0,0,0,0,0],
	[0,0,0,L,0,B,0,L,0,A,0,0,0,0,0,0,0,0,0,0,C,0,0,0,B,0,I,0,0,0],
	[0,0,0,L,0,B,0,L,0,A,0,0,0,0,I,0,0,E,0,0,C,0,0,0,B,0,0,0,0,0],
	[0,0,0,L,0,B,0,L,0,A,C,K,K,K,K,K,K,K,K,A,C,0,I,0,B,0,0,0,0,0],
	[0,0,0,L,0,B,0,L,0,A,0,0,0,0,0,0,0,0,0,0,C,0,0,0,B,0,I,0,0,0],
	[0,0,0,L,0,B,0,L,0,A,0,0,0,0,0,0,0,0,0,0,C,0,0,0,B,0,0,0,0,0],
	[0,0,0,L,0,B,0,L,0,A,0,0,0,0,0,0,0,0,0,0,C,0,0,0,0,0,0,0,0,0],
	[0,0,0,L,0,B,0,L,0,A,C,0,0,0,0,0,0,0,0,A,C,0,0,0,0,P,0,0,0,0],
	[0,0,0,L,0,B,0,L,0,A,C,0,0,0,I,0,I,0,0,A,C,0,0,0,0,0,0,0,0,0],
	[0,A,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,C,0,0,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
];

module.exports = {
	map: map, // マップ
	exchange_num: 6, // 位置移動上限回数
	is_vertical: false, // 交代が垂直かどうか
	criteria_time:         1800,   // スコア計算用基準タイム
	criteria_exchange_num: 6,     // スコア計算用基準 交換回数
};

},{}],202:[function(require,module,exports){
'use strict';
var A = 11;
var B = 12;
var C = 13;
var D = 10;
var E = 8;
var F = 16;
var I = 9;
var L = 6;
var N = -1;
var P = 7;
var K = 5;
var Y = 14;
var X = 15;

var map = [
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,L,A,Y,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,I,C,0,0,0,0],
	[0,0,0,L,A,C,I,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Y,A,C,0,0,0,0],
	[0,0,0,L,A,B,C,Y,0,0,0,0,0,0,0,0,0,0,0,0,0,0,I,A,B,C,0,0,0,0],
	[0,0,0,L,A,B,B,B,C,0,0,0,0,0,0,0,0,0,0,0,0,A,B,B,B,C,0,0,0,0],
	[0,0,0,L,A,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,C,0,0,0,0],
	[0,0,0,L,A,0,0,Y,0,0,0,0,0,0,I,0,0,I,0,0,0,0,I,0,0,C,L,0,0,0],
	[0,0,0,L,A,B,B,B,B,K,B,B,B,B,B,B,B,B,B,B,K,B,B,B,B,C,L,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,P,0,0,0,0,0,0,0,0,0,0,L,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,Y,0,0,0,0,0,0,Y,0,0,0,0,0,0,0,L,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,A,K,K,B,B,K,K,C,0,0,0,0,0,0,0,L,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,A,0,0,B,B,0,0,C,0,0,0,0,0,0,0,L,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,A,0,0,B,B,0,0,C,0,0,0,0,0,0,0,L,0,0,0],
	[0,0,A,B,B,B,B,B,B,B,B,B,D,D,B,B,D,D,B,B,B,B,B,B,B,B,B,B,C,0],
	[0,0,0,A,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,C,0,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
];

module.exports = {
	map: map, // マップ
	exchange_num: 4, // 位置移動上限回数
	is_vertical: false, // 交代が垂直かどうか
	criteria_time:         1400,   // スコア計算用基準タイム
	criteria_exchange_num: 4,     // スコア計算用基準 交換回数
};

},{}],203:[function(require,module,exports){
'use strict';
var A = 11;
var B = 12;
var C = 13;
var D = 10;
var E = 8;
var F = 16;
var I = 9;
var L = 6;
var N = -1;
var P = 7;
var K = 5;
var Y = 14;
var X = 15;

var map = [
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,A,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,L,A,0,I,0,I,0,0,0,A,C,0,0,0,I,0,I,0,C,L,0,0,0,0,0],
	[0,0,0,0,0,L,A,K,K,K,K,K,K,K,A,C,K,K,K,K,K,K,K,C,L,0,0,0,0,0],
	[0,0,0,0,0,L,A,0,0,0,0,0,0,0,A,C,0,0,0,0,0,0,0,C,L,0,0,0,0,0],
	[0,0,0,0,0,L,A,0,0,0,0,0,0,0,A,C,0,0,0,0,0,0,0,C,L,0,0,0,0,0],
	[0,0,0,0,0,L,A,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,C,L,0,0,0,0,0],
	[0,0,0,0,0,L,A,0,I,0,0,E,0,I,0,0,I,0,E,0,0,I,0,C,L,0,0,0,0,0],
	[0,0,0,0,0,L,A,0,A,B,B,B,B,B,B,B,B,B,B,B,B,C,0,C,L,0,0,0,0,0],
	[0,0,0,0,0,L,A,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,C,L,0,0,0,0,0],
	[0,0,0,0,0,L,A,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,C,L,0,0,0,0,0],
	[0,0,0,0,0,L,A,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,C,L,0,0,0,0,0],
	[0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,F,0,0,0,L,0,0,0,0,0],
	[0,0,0,A,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,C,0,0,0],
	[0,0,0,A,0,L,0,0,0,0,0,0,0,P,0,0,0,0,0,0,0,0,0,0,L,0,C,0,0,0],
	[0,0,0,A,0,L,0,0,0,F,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,C,0,0,0],
	[0,0,0,A,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,C,0,0,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
];

module.exports = {
	map: map, // マップ
	exchange_num: 5, // 位置移動上限回数
	is_vertical: false, // 交代が垂直かどうか
	criteria_time:         900,   // スコア計算用基準タイム
	criteria_exchange_num: 2,   // スコア計算用基準 交換回数
};

},{}],204:[function(require,module,exports){
'use strict';
var A = 11;
var B = 12;
var C = 13;
var D = 10;
var E = 8;
var F = 16;
var I = 9;
var L = 6;
var N = -1;
var P = 7;
var K = 5;
var Y = 14;
var X = 15;

var map = [
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,Y,0,0,0,0,0,0,I,I,I,0,0,0,E,0,0,0,0,0,0,I,0,0,0,0,0],
	[0,0,0,A,B,C,0,0,A,L,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,C,0,0,0,0],
	[0,0,0,0,L,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,L,0,0,0,0,L,0,0,0,E,0,0,0,I,I,I,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,L,0,0,0,A,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,C,0,0,0,0],
	[0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,I,0,L,0,I,0,0,0,0,0,0,0,0,0,0,0,0,0,I,I,I,0,0,0,0,0,0,0],
	[0,0,A,B,B,B,C,K,K,K,K,K,K,K,K,K,A,L,B,B,B,B,B,B,C,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,P,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,A,B,B,B,B,B,B,B,B,B,B,B,B,C,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
];

module.exports = {
	map: map, // マップ
	exchange_num: 4, // 位置移動上限回数
	is_vertical: false, // 交代が垂直かどうか
	criteria_time:         1300,   // スコア計算用基準タイム
	criteria_exchange_num: 3,   // スコア計算用基準 交換回数
};

},{}],205:[function(require,module,exports){
'use strict';
var A = 11;
var B = 12;
var C = 13;
var D = 10;
var E = 8;
var F = 16;
var I = 9;
var L = 6;
var N = -1;
var P = 7;
var K = 5;
var Y = 14;
var X = 15;

var map = [
	[A,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,F,0,A,C],
	[A,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,A,C],
	[A,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,A,C],
	[A,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,A,C],
	[A,C,0,0,0,L,0,0,0,0,0,P,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,A,C],
	[A,C,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,I,0,0,0,A,C],
	[A,C,0,0,0,L,0,0,0,0,0,A,Y,0,0,0,0,Y,C,0,0,0,0,0,I,0,0,0,A,C],
	[A,C,0,0,0,L,0,0,0,0,0,0,A,Y,0,0,Y,C,0,0,0,0,0,0,L,0,0,0,A,C],
	[A,C,0,0,0,Y,0,0,0,0,0,0,0,A,K,K,C,0,0,0,0,0,0,0,L,0,0,0,A,C],
	[A,C,0,0,0,Y,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,A,C],
	[A,C,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,A,C],
	[A,C,0,0,0,L,0,0,0,A,0,0,0,0,I,I,0,0,0,0,C,0,0,0,Y,0,0,0,A,C],
	[A,C,0,0,0,L,0,0,0,A,K,K,K,K,K,K,K,K,K,K,C,0,0,0,Y,0,0,0,A,C],
	[A,C,0,0,0,L,0,0,0,A,0,0,0,0,0,0,0,0,0,0,C,0,0,0,L,0,0,0,A,C],
	[A,C,0,0,0,I,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,A,C],
	[A,C,0,0,0,I,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,A,C],
	[A,C,0,0,A,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,C,0,0,A,C],
	[A,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,A,C],
	[A,C,0,F,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,A,C],
	[A,C,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,A,C],
];

module.exports = {
	map: map, // マップ
	exchange_num: 6, // 位置移動上限回数
	is_vertical: false, // 交代が垂直かどうか
	criteria_time:         1100,   // スコア計算用基準タイム
	criteria_exchange_num: 6,   // スコア計算用基準 交換回数
};

},{}],206:[function(require,module,exports){
'use strict';
var A = 11;
var B = 12;
var C = 13;
var D = 10;
var E = 8;
var F = 16;
var I = 9;
var L = 6;
var N = -1;
var P = 7;
var K = 5;
var Y = 14;
var X = 15;

var map = [
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,L,0,0,0,0,0,0,L,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,L,0,0,0,0,0,0,L,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,L,0,I,E,E,0,0,L,0,I,E,E,0,0,L,0,I,E,E,0,0,0,0],
	[0,0,0,A,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,C,0,0,0],
	[0,0,0,0,0,0,0,L,0,0,0,0,0,0,L,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,L,0,0,0,0,0,0,L,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0],
	[0,0,0,P,0,0,0,L,0,0,0,0,0,0,L,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,L,0,0,0,0,0,0,L,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0],
	[0,0,0,A,B,C,0,L,0,0,0,0,0,0,L,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,L,0,I,0,0,0,0,L,0,0,0,0,0,0,L,0,I,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,A,B,C,0,0,0,0,L,F,I,0,0,0,0,A,B,C,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,A,B,C,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
];

module.exports = {
	map: map, // マップ
	exchange_num: 6, // 位置移動上限回数
	is_vertical: true, // 交代が垂直かどうか
	criteria_time:         1300,   // スコア計算用基準タイム
	criteria_exchange_num: 6,   // スコア計算用基準 交換回数
};

},{}],207:[function(require,module,exports){
'use strict';
var A = 11;
var B = 12;
var C = 13;
var D = 10;
var E = 8;
var F = 16;
var I = 9;
var L = 6;
var N = -1;
var P = 7;
var K = 5;
var Y = 14;
var X = 15;

var map = [
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,I,0,I,E,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,E,I,0,I,0,0,0],
	[0,0,0,A,B,B,B,B,B,B,B,B,B,B,B,L,B,B,B,B,B,B,B,B,B,B,C,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,I,0,0,0,0,0,0,0],
	[0,0,0,A,0,0,0,A,K,K,K,K,K,K,K,L,K,K,K,K,K,K,C,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,I,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,A,K,K,K,K,K,K,K,L,K,K,K,K,K,K,C,0,0,0,0,0,0,0],
	[0,0,0,P,0,0,0,0,0,0,F,0,0,0,0,L,0,0,0,F,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,F,0,0,0,0,L,0,0,0,F,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,A,0,A,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,C,L,C,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0],
	[0,0,0,E,I,I,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,I,L,E,0,0,0],
	[0,0,0,A,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,C,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
];

module.exports = {
	map: map, // マップ
	exchange_num: 5, // 位置移動上限回数
	is_vertical: true, // 交代が垂直かどうか
	criteria_time:         1300,   // スコア計算用基準タイム
	criteria_exchange_num: 4,   // スコア計算用基準 交換回数
};

},{}],208:[function(require,module,exports){
'use strict';
var A = 11;
var B = 12;
var C = 13;
var D = 10;
var E = 8;
var F = 16;
var I = 9;
var L = 6;
var N = -1;
var P = 7;
var K = 5;
var Y = 14;
var X = 15;

var map = [
	[0,0,0,0,F,0,F,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,F,0,F,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,F,0,0,0,0,F,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,F,0,I,0,L,A,B,B,C,L,0,I,0,F,0,0,0,0,0,0,0,0],
	[0,0,0,0,F,0,F,0,L,A,B,C,L,0,0,0,0,L,A,B,C,L,0,F,0,F,0,0,0,0],
	[0,0,0,0,L,A,L,C,L,0,0,0,L,0,0,0,0,L,0,0,0,L,A,L,C,L,0,0,0,0],
	[0,0,P,0,L,0,L,0,L,0,0,0,L,0,0,0,0,L,0,0,0,L,0,L,0,L,0,0,0,0],
	[0,0,0,0,L,0,L,0,L,0,0,0,L,0,0,0,0,L,0,0,0,L,0,L,0,L,0,I,0,0],
	[0,A,B,C,L,0,L,0,L,0,0,0,L,0,0,0,0,L,0,0,0,L,0,L,0,L,A,B,C,0],
	[0,0,0,0,L,0,L,0,L,0,0,0,L,0,0,0,0,L,0,0,0,L,0,L,0,L,0,0,0,0],
	[0,0,0,0,L,0,L,0,L,0,0,0,L,0,0,0,0,L,0,0,0,L,0,L,0,L,0,0,0,0],
	[0,0,0,0,L,A,L,C,L,0,I,0,L,0,0,0,0,L,0,I,0,L,A,L,C,L,0,0,0,0],
	[0,0,0,0,F,0,F,0,L,A,B,C,L,0,0,0,0,L,A,B,C,L,0,F,0,F,0,0,0,0],
	[0,0,0,0,0,0,0,0,F,0,0,0,L,A,B,B,C,L,0,0,0,F,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,F,0,0,0,0,F,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,F,0,F,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,F,0,F,0,0,0,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
];

module.exports = {
	map: map, // マップ
	exchange_num: 4, // 位置移動上限回数
	is_vertical: false, // 交代が垂直かどうか
	criteria_time:         2000,   // スコア計算用基準タイム
	criteria_exchange_num: 0,   // スコア計算用基準 交換回数
};

},{}],209:[function(require,module,exports){
'use strict';
var A = 11;
var B = 12;
var C = 13;
var D = 10;
var E = 8;
var F = 16;
var I = 9;
var L = 6;
var N = -1;
var P = 7;
var K = 5;
var Y = 14;
var X = 15;

var map = [
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,P,0,0,0,0,A,0,0,A,B,B,B,B,B,B,B,B,B,B,C,0,C,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,A,0,0,A,B,B,B,B,B,B,B,B,B,B,C,0,C,0,0,0,0,0,0],
	[0,0,A,B,B,L,C,A,0,0,A,B,B,B,B,B,B,B,B,B,B,C,0,C,0,0,0,0,0,0],
	[0,0,0,0,0,L,0,A,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,C,0,Y,0,I,0,0],
	[0,0,0,0,0,L,0,A,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,C,0,A,L,C,0,0],
	[0,0,0,0,0,L,0,A,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,C,0,0,L,0,0,0],
	[0,0,0,0,0,L,0,A,0,0,0,Y,Y,Y,0,0,I,I,I,0,0,0,0,C,0,0,L,0,0,0],
	[0,0,0,0,0,L,0,A,C,K,K,K,K,K,K,K,K,K,K,K,K,K,A,C,0,0,L,0,0,0],
	[0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0],
	[0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0],
	[0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0],
	[0,0,0,0,0,L,0,0,0,0,0,0,I,I,0,0,I,I,0,0,0,0,0,0,0,0,L,0,0,0],
	[0,0,A,B,B,B,B,B,C,K,K,K,K,K,0,0,K,K,K,K,K,A,B,B,B,B,B,C,0,0],
	[0,0,A,0,0,0,0,0,C,0,0,0,0,0,0,0,0,0,0,0,0,A,0,0,0,0,0,C,0,0],
	[0,0,A,0,0,I,0,0,C,0,0,0,0,0,0,0,0,0,0,0,0,A,0,0,0,0,0,C,0,0],
	[0,0,A,0,0,I,0,0,C,0,0,0,0,0,0,0,0,0,0,0,0,A,0,0,0,0,0,C,0,0],
	[0,0,A,0,0,0,0,0,C,0,0,0,0,0,0,0,0,0,0,0,0,A,0,0,I,0,0,C,0,0],
	[0,0,A,K,K,K,K,K,C,0,0,0,0,0,F,F,0,0,0,0,0,A,K,K,K,K,K,C,0,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
];

module.exports = {
	map: map, // マップ
	exchange_num: 5, // 位置移動上限回数
	is_vertical: true, // 交代が垂直かどうか
	criteria_time:         1100,   // スコア計算用基準タイム
	criteria_exchange_num: 4,   // スコア計算用基準 交換回数
};

},{}],210:[function(require,module,exports){
'use strict';
var A = 11;
var B = 12;
var C = 13;
var D = 10;
var E = 8;
var F = 16;
var I = 9;
var L = 6;
var N = -1;
var P = 7;
var K = 5;
var Y = 14;
var X = 15;

var map = [
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,A,C,0,0,0,0,0,0,0,0,0,0,0,0,0,A,C,K,K,K,K,K,K,K,A,C,0,0],
	[0,0,A,C,0,0,0,0,0,0,0,0,0,0,0,0,0,A,C,0,0,0,0,0,0,0,A,C,0,0],
	[0,0,A,C,0,0,0,0,0,0,0,0,0,0,0,0,0,A,C,0,0,0,0,0,0,0,A,C,0,0],
	[0,0,A,C,0,0,L,L,L,L,0,0,0,0,0,0,0,A,C,0,I,I,I,I,0,0,A,C,0,0],
	[0,0,A,C,0,0,L,L,L,L,0,0,0,0,0,0,0,A,C,0,I,I,I,I,0,0,A,C,0,0],
	[0,0,A,C,0,0,L,L,L,L,0,0,0,0,0,0,0,A,C,0,I,I,I,I,0,0,A,C,0,0],
	[0,0,A,C,0,0,L,L,L,L,0,0,0,0,0,0,0,0,0,0,I,I,I,I,0,0,A,C,0,0],
	[0,0,A,C,E,0,L,L,L,L,E,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,A,C,0,0],
	[0,0,A,B,B,B,B,B,B,B,B,B,B,B,B,L,B,B,B,B,B,A,B,B,B,B,B,C,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,P,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,A,B,B,B,B,B,B,B,B,B,B,B,B,B,B,C,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
];
  //[B,B,B,B,B,B,B,B,B,B,B,B,B,B,0,0,B,B,B,B,B,B,B,B,B,B,B,B,B,B],

module.exports = {
	map: map, // マップ
	exchange_num: 4, // 位置移動上限回数
	is_vertical: false, // 交代が垂直かどうか
	criteria_time:         2500,   // スコア計算用基準タイム
	criteria_exchange_num: 4,   // スコア計算用基準 交換回数
};

},{}],211:[function(require,module,exports){
'use strict';
var A = 11;
var B = 12;
var C = 13;
var D = 10;
var E = 8;
var F = 16;
var I = 9;
var L = 6;
var N = -1;
var P = 7;
var K = 5;
var Y = 14;
var X = 15;

var map = [
	[0,A,B,B,B,B,B,B,B,B,B,B,B,C,0,0,A,B,B,B,B,B,B,B,B,B,B,B,C,0],
	[0,A,C,0,0,0,0,0,0,0,0,0,A,C,0,0,A,C,0,0,0,0,0,0,0,0,0,A,C,0],
	[0,A,C,0,0,0,I,I,I,0,0,0,A,C,0,0,A,C,0,0,0,Y,Y,Y,0,0,0,A,C,0],
	[0,0,A,K,L,K,K,K,K,K,K,K,C,0,0,0,0,A,K,K,K,K,K,K,K,L,K,C,0,0],
	[0,0,A,0,L,0,0,0,0,0,0,0,C,0,0,0,0,A,0,0,0,0,0,0,0,L,0,C,0,0],
	[0,0,A,0,L,0,0,0,0,0,0,0,C,0,0,0,0,A,0,0,0,0,0,0,0,L,0,C,0,0],
	[0,0,A,0,L,0,0,0,0,0,0,0,C,0,0,0,0,A,0,0,0,0,0,0,0,L,0,C,0,0],
	[0,0,A,E,L,0,I,0,I,0,0,0,C,0,0,0,0,A,0,0,0,I,0,I,0,L,0,C,0,0],
	[0,0,A,B,B,B,B,B,B,B,B,B,C,0,0,0,0,A,B,B,B,B,B,B,B,B,B,C,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,A,B,B,B,B,B,B,B,B,B,C,0,0,0,0,A,B,B,B,B,B,B,B,B,B,C,0,0],
	[0,0,A,0,0,0,0,0,0,0,0,0,C,0,0,0,0,A,0,0,0,0,0,0,0,0,0,C,0,0],
	[0,0,A,X,0,0,0,0,0,0,0,E,C,0,0,0,0,A,X,0,0,0,0,0,0,0,E,C,0,0],
	[0,0,A,K,K,K,K,L,K,K,K,K,C,0,0,0,0,A,K,K,K,K,L,K,K,K,K,C,0,0],
	[0,0,A,0,0,0,0,L,0,0,0,0,C,0,0,0,0,A,0,0,0,0,L,0,0,0,0,C,0,0],
	[0,0,A,0,0,0,0,L,0,0,0,0,C,0,0,0,0,A,0,0,0,0,L,0,0,0,0,C,0,0],
	[0,0,A,P,0,0,0,L,0,0,0,0,C,0,0,0,0,A,0,0,0,0,L,0,0,0,0,C,0,0],
	[0,0,A,0,Y,Y,0,L,0,Y,Y,0,C,0,0,0,0,A,0,I,I,0,L,0,I,I,0,C,0,0],
	[0,A,B,B,B,B,B,B,B,B,B,B,B,C,0,0,A,B,B,B,B,B,B,B,B,B,B,B,C,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
];
  //[B,B,B,B,B,B,B,B,B,B,B,B,B,B,0,0,B,B,B,B,B,B,B,B,B,B,B,B,B,B],

module.exports = {
	map: map, // マップ
	exchange_num: 4, // 位置移動上限回数
	is_vertical: true, // 交代が垂直かどうか
	criteria_time:         1200,   // スコア計算用基準タイム
	criteria_exchange_num: 4,   // スコア計算用基準 交換回数
};

},{}],212:[function(require,module,exports){
'use strict';
var A = 11;
var B = 12;
var C = 13;
var D = 10;
var E = 8;
var F = 16;
var I = 9;
var L = 6;
var N = -1;
var P = 7;
var K = 5;
var Y = 14;
var X = 15;

var map = [
	[A,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,C],
	[A,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,C],
	[A,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,C],
	[A,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,C],
	[A,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,C],
	[A,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,C],
	[A,0,0,0,0,0,I,I,0,0,0,0,I,E,0,0,0,I,0,0,0,0,I,I,0,0,0,0,0,C],
	[A,0,0,A,K,K,K,K,K,K,K,L,K,K,K,K,K,K,L,K,K,K,K,K,K,K,C,0,0,C],
	[A,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,C],
	[A,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,C],
	[A,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,C],
	[A,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,C],
	[A,0,0,0,0,0,0,0,F,0,0,L,I,I,E,E,I,I,L,0,0,F,0,0,0,0,0,0,0,C],
	[A,0,0,A,B,B,B,L,B,B,B,B,B,B,B,B,B,B,B,B,B,B,L,B,B,B,C,0,0,C],
	[A,0,0,0,0,0,0,L,0,0,0,0,F,0,0,0,0,F,0,0,0,0,L,0,0,0,0,0,0,C],
	[A,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,C],
	[A,0,0,0,0,0,0,L,0,0,F,0,0,0,F,0,F,0,0,F,0,0,L,0,0,0,0,0,0,C],
	[A,0,0,0,0,0,0,L,0,0,0,0,0,0,0,P,0,0,0,0,0,0,L,0,0,0,0,0,0,C],
	[A,I,I,I,0,0,F,L,F,0,0,0,0,0,0,0,0,0,0,0,0,F,L,F,0,0,I,I,I,C],
	[A,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,C],
];
  //[B,B,B,B,B,B,B,B,B,B,B,B,B,B,0,0,B,B,B,B,B,B,B,B,B,B,B,B,B,B],

module.exports = {
	map: map, // マップ
	exchange_num: 1, // 位置移動上限回数
	is_vertical: false, // 交代が垂直かどうか
	criteria_time:         2000,   // スコア計算用基準タイム
	criteria_exchange_num: 0,   // スコア計算用基準 交換回数
};

},{}],213:[function(require,module,exports){
'use strict';
var A = 11;
var B = 12;
var C = 13;
var D = 10;
var E = 8;
var F = 16;
var I = 9;
var L = 6;
var N = -1;
var P = 7;
var K = 5;
var Y = 14;
var X = 15;

var map = [
	[0,0,0,0,0,0,0,0,0,A,B,C,0,0,0,0,0,0,0,A,B,C,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,A,C,F,A,C,0,0,0,0,0,A,C,F,A,C,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,I,0,0,0,0,L,0,0,0,0,I,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,I,0,0,Y,0,L,0,Y,0,0,I,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,I,0,0,A,B,L,B,C,0,0,I,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,X,0,0,0,0,L,0,0,0,0,I,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,A,B,C,0,0,0,L,0,0,0,A,B,C,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,P,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,A,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,C,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,X,0,0,0,0,X,0,0,0,0,I,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,A,B,B,B,B,B,B,B,B,B,C,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
];
  //[B,B,B,B,B,B,B,B,B,B,B,B,B,B,0,0,B,B,B,B,B,B,B,B,B,B,B,B,B,B],

module.exports = {
	map: map, // マップ
	exchange_num: 4, // 位置移動上限回数
	is_vertical: true, // 交代が垂直かどうか
	criteria_time:         1500,   // スコア計算用基準タイム
	criteria_exchange_num: 4,   // スコア計算用基準 交換回数
};

},{}],214:[function(require,module,exports){
'use strict';
var A = 11;
var B = 12;
var C = 13;
var D = 10;
var E = 8;
var F = 16;
var I = 9;
var L = 6;
var N = -1;
var P = 7;
var K = 5;
var Y = 14;
var X = 15;

var map = [
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,P,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,A,B,B,B,B,C,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,A,B,B,B,C,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,I,I,I,I,I,I,I,I,I,I,I,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,A,B,C,K,K,K,K,K,K,K,K,K,K,K,A,B,C,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,I,I,I,I,I,I,I,I,I,I,I,E,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,A,B,C,K,K,K,K,K,K,K,K,K,A,B,C,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,E,0,I,I,I,X,I,I,I,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,A,B,C,K,K,K,K,K,K,K,A,B,C,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,Y,0,0,E,0,E,0,E,0,Y,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,A,B,C,K,K,K,K,K,A,C,0,0,0,0,0,0,0,0,0,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
];
  //[B,B,B,B,B,B,B,B,B,B,B,B,B,B,0,0,B,B,B,B,B,B,B,B,B,B,B,B,B,B],

module.exports = {
	map: map, // マップ
	exchange_num: 1, // 位置移動上限回数
	is_vertical: true, // 交代が垂直かどうか
	criteria_time:         1100,   // スコア計算用基準タイム
	criteria_exchange_num: 1,   // スコア計算用基準 交換回数
};

},{}],215:[function(require,module,exports){
'use strict';
var A = 11;
var B = 12;
var C = 13;
var D = 10;
var E = 8;
var F = 16;
var I = 9;
var L = 6;
var N = -1;
var P = 7;
var K = 5;
var Y = 14;
var X = 15;

var map = [
	[0,0,0,0,0,0,0,0,0,A,B,C,0,0,0,0,0,0,A,B,C,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,P,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,L,0,0,A,B,B,C,0,0,L,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,Y,Y,Y,0,L,0,0,0,0,0,0,0,0,L,0,Y,Y,Y,0,0,0,0,0,0],
	[0,0,0,A,B,B,B,B,B,B,L,B,B,B,B,B,B,B,B,L,B,B,B,B,B,B,C,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,F,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,F,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,Y,0,0,0,0,0,0,0,0,Y,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,I,I,I,E,E,E,E,E,E,E,E,E,E,E,E,I,I,I,0,0,0,0,0,0],
	[0,0,0,A,B,C,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,A,B,C,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
];
  //[B,B,B,B,B,B,B,B,B,B,B,B,B,B,0,0,B,B,B,B,B,B,B,B,B,B,B,B,B,B],

module.exports = {
	map: map, // マップ
	exchange_num: 4, // 位置移動上限回数
	is_vertical: true, // 交代が垂直かどうか
	criteria_time:         960,   // スコア計算用基準タイム
	criteria_exchange_num: 3,   // スコア計算用基準 交換回数
};

},{}],216:[function(require,module,exports){
'use strict';
var A = 11;
var B = 12;
var C = 13;
var D = 10;
var E = 8;
var F = 16;
var I = 9;
var L = 6;
var N = -1;
var P = 7;
var K = 5;
var Y = 14;
var X = 15;

var map = [
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,E,0,0,0,Y,0,0,0,0,0,0,0,0,0,0,0,0,Y,0,0,0,E,0,0,0,0],
	[0,0,A,B,B,B,B,L,C,0,0,0,0,0,0,0,0,0,0,0,0,A,L,B,B,B,B,C,0,0],
	[0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,L,0,0,0,0,0,0,X,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,L,0,0,K,K,K,A,B,B,C,K,K,K,0,0,L,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,E,L,Y,Y,0,0,0,0,0,0,0,0,0,0,Y,Y,L,E,0,0,0,0,0,0],
	[0,A,B,B,B,B,B,B,B,C,0,0,0,0,0,0,0,0,0,0,A,B,B,B,B,B,B,B,C,0],
	[0,0,0,0,0,0,0,0,0,C,Y,0,Y,0,0,0,0,Y,0,Y,A,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,A,B,L,C,0,0,0,0,A,L,B,C,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,L,0,0,P,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,X,0,0,0,L,0,0,0,0,0,0,L,0,0,0,X,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,A,B,B,B,B,B,B,B,B,B,B,B,B,B,B,C,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
];
  //[B,B,B,B,B,B,B,B,B,B,B,B,B,B,0,0,B,B,B,B,B,B,B,B,B,B,B,B,B,B],

module.exports = {
	map: map, // マップ
	exchange_num: 3, // 位置移動上限回数
	is_vertical: true, // 交代が垂直かどうか
	criteria_time:         1600,   // スコア計算用基準タイム
	criteria_exchange_num: 2,   // スコア計算用基準 交換回数
};

},{}],217:[function(require,module,exports){
'use strict';
var A = 11;
var B = 12;
var C = 13;
var D = 10;
var E = 8;
var F = 16;
var I = 9;
var L = 6;
var N = -1;
var P = 7;
var K = 5;
var Y = 14;
var X = 15;

var map = [
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,P,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,I,0,0,0,0,0,0,0,0,0,0,0,0,I,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,A,B,C,0,0,0,A,B,B,C,0,0,0,A,B,C,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,A,B,C,0,0,0,0,0,0,0,0,0,0,A,B,C,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,F,0,0,0,0,0,0,0,0,0,0,0,0,F,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,E,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,E,0,0,0,0,0,0,0],
	[0,0,0,0,A,B,B,C,0,A,B,B,B,C,0,0,A,B,B,B,C,0,A,B,B,C,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,I,0,0,0,0,0,0,0,0,0,0,0,0,I,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,A,B,C,0,0,0,0,0,0,0,0,0,0,A,B,C,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,I,Y,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,A,B,B,B,B,B,B,B,B,B,B,C,0,0,0,0,0,0,0,0,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
];
  //[B,B,B,B,B,B,B,B,B,B,B,B,B,B,0,0,B,B,B,B,B,B,B,B,B,B,B,B,B,B],

module.exports = {
	map: map, // マップ
	exchange_num: 3, // 位置移動上限回数
	is_vertical: true, // 交代が垂直かどうか
	criteria_time:         1660,   // スコア計算用基準タイム
	criteria_exchange_num: 2,   // スコア計算用基準 交換回数
};

},{}],218:[function(require,module,exports){
'use strict';
var A = 11;
var B = 12;
var C = 13;
var D = 10;
var E = 8;
var F = 16;
var I = 9;
var L = 6;
var N = -1;
var P = 7;
var K = 5;
var Y = 14;
var X = 15;

var map = [
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,I,X,I,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,I,I,I,0,0,0],
	[0,0,0,A,B,C,0,0,0,0,0,0,E,0,0,I,I,I,0,0,E,0,0,0,A,B,C,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,A,B,B,B,L,B,B,B,C,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,A,K,K,K,K,K,K,A,B,L,B,B,C,K,K,K,K,K,K,C,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,P,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,I,X,I,0,0,0,0,0,A,B,B,B,B,B,C,0,0,0,0,0,0,I,X,I,0,0,0],
	[0,0,0,A,B,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,A,B,C,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
];
  //[B,B,B,B,B,B,B,B,B,B,B,B,B,B,0,0,B,B,B,B,B,B,B,B,B,B,B,B,B,B],

module.exports = {
	map: map, // マップ
	exchange_num: 3, // 位置移動上限回数
	is_vertical: true, // 交代が垂直かどうか
	criteria_time:         940,   // スコア計算用基準タイム
	criteria_exchange_num: 3,   // スコア計算用基準 交換回数
};

},{}],219:[function(require,module,exports){
'use strict';
var A = 11;
var B = 12;
var C = 13;
var D = 10;
var E = 8;
var F = 16;
var I = 9;
var L = 6;
var N = -1;
var P = 7;
var K = 5;
var Y = 14;
var X = 15;

var map = [
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,Y,0,0,0,0,0,0,0,0,Y,E,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,A,B,B,B,B,C,L,L,A,B,B,B,B,C,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,Y,L,L,Y,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,A,C,L,A,B,B,C,L,A,C,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,I,I,I,0,0,0,L,0,0,0,0,L,0,0,0,I,I,I,0,0,0,0,0,0],
	[0,0,A,K,K,K,A,B,C,0,0,0,L,0,0,0,P,L,0,0,0,A,B,C,K,K,K,C,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,A,C,L,L,A,C,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,I,0,0,0,0,0,0,0,0,0,0,0,Y,L,L,Y,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,A,L,A,B,B,B,B,C,L,C,0,0,0,0,0,0,0,0,B,0],
	[0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,E,0,0,L,0,Y,Y,Y,Y,0,L,0,0,0,0,0,0,0,0,0,I,0],
	[0,B,0,0,0,0,0,A,B,B,B,B,B,B,B,B,B,B,B,B,B,B,C,0,0,0,0,0,0,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
];
  //[B,B,B,B,B,B,B,B,B,B,B,B,B,B,0,0,B,B,B,B,B,B,B,B,B,B,B,B,B,B],

module.exports = {
	map: map, // マップ
	exchange_num: 2, // 位置移動上限回数
	is_vertical: false, // 交代が垂直かどうか
	criteria_time:         1900,   // スコア計算用基準タイム
	criteria_exchange_num: 1,   // スコア計算用基準 交換回数
};

},{}],220:[function(require,module,exports){
'use strict';
var A = 11;
var B = 12;
var C = 13;
var D = 10;
var E = 8;
var F = 16;
var I = 9;
var L = 6;
var N = -1;
var P = 7;
var K = 5;
var Y = 14;
var X = 15;

var map = [
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,A,L,A,C,Y,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Y,A,B,B,C,0],
	[0,0,L,0,A,B,C,0,0,0,0,0,0,0,F,F,0,0,0,0,0,0,0,A,B,C,0,0,0,0],
	[0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,L,0,0,0,0,Y,Y,Y,Y,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,A,B,B,B,B,C,0,0,0,L,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Y,Y,Y,Y,0,0,0,0,L,0,0],
	[0,0,0,0,0,0,A,B,B,B,B,C,0,P,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0],
	[0,0,L,0,0,0,0,0,0,0,0,0,0,A,B,B,C,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,L,0,0,0,0,0,0,0,0,0,E,E,E,E,E,E,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,A,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,C,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
];
  //[B,B,B,B,B,B,B,B,B,B,B,B,B,B,0,0,B,B,B,B,B,B,B,B,B,B,B,B,B,B],

module.exports = {
	map: map, // マップ
	exchange_num: 4, // 位置移動上限回数
	is_vertical: false, // 交代が垂直かどうか
	criteria_time:         900,   // スコア計算用基準タイム
	criteria_exchange_num: 4,   // スコア計算用基準 交換回数
};

},{}],221:[function(require,module,exports){
'use strict';
var A = 11;
var B = 12;
var C = 13;
var D = 10;
var E = 8;
var F = 16;
var I = 9;
var L = 6;
var N = -1;
var P = 7;
var K = 5;
var Y = 14;
var X = 15;

var map = [
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,A,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,A,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,A,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,I,0,0,0,0,0,0,A,C,0,0,0,0,X,0,0,0,I,0,0,X,0,0],
	[0,A,C,0,0,A,B,B,B,C,0,0,0,0,A,C,0,0,0,0,A,C,0,A,B,B,B,B,C,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,A,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,X,0,0,X,0,0,0,A,C,0,0,0,0,0,0,I,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,A,C,0,A,C,0,0,A,C,0,0,A,B,B,B,C,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,A,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,A,C,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
	[A,B,B,B,B,B,B,B,B,B,B,B,B,B,A,C,B,B,B,B,B,B,B,B,B,B,B,B,B,C],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,A,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,A,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,I,I,I,0,0,0,0,0,0,A,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,A,B,B,B,C,0,0,0,0,0,0,A,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,P,0,0,0,0,0,0,0,0,0,0,0,A,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,Y,Y,Y,0,0,0,0,0,I,X,0,0,0,A,C,0,0,0,0,I,X,0,0,X,0,0,I,0,0],
	[0,A,B,C,0,A,B,B,B,B,B,C,0,0,A,C,0,0,0,0,A,C,0,A,B,B,B,B,C,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,A,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,A,C,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
];
  //[B,B,B,B,B,B,B,B,B,B,B,B,B,B,0,0,B,B,B,B,B,B,B,B,B,B,B,B,B,B],

module.exports = {
	map: map, // マップ
	exchange_num: 11, // 位置移動上限回数
	is_vertical: false, // 交代が垂直かどうか
	criteria_time:         1300,   // スコア計算用基準タイム
	criteria_exchange_num: 11,   // スコア計算用基準 交換回数
};

},{}],222:[function(require,module,exports){
'use strict';

/* music room */

var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;
var H_CONSTANT = require('../hakurei').constant;
var CONSTANT = require('../constant');
var AssetsConfig = require('../assets_config');

/* BGM 一覧を配列化 */
var BGMS = [];
for (var key in AssetsConfig.bgms) {
	var data = util.shallowCopyHash(AssetsConfig.bgms[key]);

	data.name = key;
	BGMS.push(data);
}

var SceneMusic = function(core) {
	base_scene.apply(this, arguments);
};
util.inherit(SceneMusic, base_scene);

SceneMusic.prototype.init = function(){
	base_scene.prototype.init.apply(this, arguments);

	// 今どれにカーソルがあるか
	this.index = 0;

	this.core.stopBGM();
};


SceneMusic.prototype.beforeDraw = function(){
	base_scene.prototype.beforeDraw.apply(this, arguments);

	// 戻る
	if(this.core.isKeyPush(H_CONSTANT.BUTTON_X)) {
		this.core.changeScene("title");
	}

	// カーソルを下移動
	if(this.core.isKeyPushOrLongDown(H_CONSTANT.BUTTON_DOWN)) {
		this.index++;

		if(this.index >= BGMS.length) {
			this.index = BGMS.length - 1;
		}
	}
	// カーソルを上移動
	if(this.core.isKeyPushOrLongDown(H_CONSTANT.BUTTON_UP)) {
		this.index--;

		if(this.index < 0) {
			this.index = 0;
		}
	}

	// 決定
	if(this.core.isKeyPush(H_CONSTANT.BUTTON_Z)) {
		if (BGMS[this.index].is_normal && !this.isNormalStoryCleared()) { // Normal未クリア
			// Normal 未クリアなら聴けない
		}
		else if (BGMS[this.index].is_ex && !this.isExStoryCleared()) { // Ex未クリア
			// Ex未クリアなら聴けない
		}
		else {
			var bgm_name = BGMS[this.index].name;
			this.core.playBGM(bgm_name);
		}
	}
};

// 画面更新
SceneMusic.prototype.draw = function(){
	this.core.clearCanvas();
	var ctx = this.core.ctx;

	ctx.save();

	// 背景表示
	this._showBackGround();

	// キャラ表示
	this._showRightChara();

	// メッセージウィンドウを表示
	this._showMessageWindow();

	var cursor_x    = 50;
	var text_x      = cursor_x + 30;
	var y = 80;

	// 文字表示
	ctx.font = "18px 'Migu'";
	ctx.textAlign = 'left';
	ctx.textBaseAlign = 'middle';
	ctx.fillStyle = 'rgb( 255, 255, 255 )';

	for(var i = 0, len = BGMS.length; i < len; i++) {
		var bgm = BGMS[i];
		var music_no = ( '00' + (i + 1) ).slice(-2); // 数字を2桁に揃える

		if(this.index === i) {
			// cursor 表示
			this._drawText("▶", cursor_x, y);

			// メッセージ表示
			if (bgm.is_normal && !this.isNormalStoryCleared()) { // Normal未クリア
				this._showMessage("ゲームをすすめたら聴けるわよ");
			}
			else if (bgm.is_ex && !this.isExStoryCleared()) { // Ex未クリア
				this._showMessage("ゲームをすすめたら聴けるわよ");
			}
			else {
				this._showMessage(bgm.message);
			}
		}

		// 文字表示
		if (bgm.is_normal && !this.isNormalStoryCleared()) { // Normal未クリア
			this._drawText(music_no + ": " + "???????", text_x, y); // 1行表示
		}
		else if (bgm.is_ex && !this.isExStoryCleared()) { // Ex未クリア
			this._drawText(music_no + ": " + "???????", text_x, y); // 1行表示
		}
		else {
			this._drawText(music_no + ": " + bgm.title, text_x, y); // 1行表示
		}

		y+= 30;
	}

	ctx.restore();

	// 操作方法説明
	this._showHowTo();
};

SceneMusic.prototype._drawText = function(text, x, y){
	var ctx = this.core.ctx;
	ctx.fillStyle = 'rgb( 0, 0, 0 )';
	ctx.lineWidth = 4.0;
	ctx.strokeText(text, x, y);

	ctx.fillStyle = 'rgb( 255, 255, 255 )';
	ctx.fillText(text, x, y);
};

// 操作説明 表示
SceneMusic.prototype._showHowTo = function() {
	var ctx = this.core.ctx;
	ctx.save();

	var text = "Xキー：戻る";

	ctx.font = "14px 'Migu'";
	ctx.textAlign = 'left';
	ctx.textBaseAlign = 'middle';

	this._drawText(text, 10, this.core.height - 10);
	ctx.restore();
};

SceneMusic.prototype._showRightChara = function(){
	var ctx = this.core.ctx;
	ctx.save();

	var x = 400;
	var y = 65;

	var right_image = this.core.image_loader.getImage("reimu_normal1");
	ctx.drawImage(right_image,
		x,
		y,
		right_image.width,
		right_image.height
	);

	ctx.restore();
};

var MESSAGE_WINDOW_OUTLINE_MARGIN = 10;
SceneMusic.prototype._showMessageWindow = function(){
	var ctx = this.core.ctx;
	// show message window
	ctx.save();

	var message_height = 100;

	ctx.globalAlpha = 0.5;
	ctx.fillStyle = 'rgb( 0, 0, 0 )';
	ctx.fillRect(
		MESSAGE_WINDOW_OUTLINE_MARGIN,
		this.core.height - 125,
		this.core.width - MESSAGE_WINDOW_OUTLINE_MARGIN * 2,
		message_height
	);

	ctx.restore();
};

// セリフ表示
SceneMusic.prototype._showMessage = function(message) {
	var ctx = this.core.ctx;
	ctx.save();

	ctx.font = "18px 'Migu'";
	ctx.textAlign = 'left';
	ctx.textBaseAlign = 'middle';

	var x, y;
	// セリフ表示
	var lines = message.split("\n");
	if (lines.length) {
		// セリフテキストの y 座標初期位置
		var message_height = 80;
		y = this.core.height - 125 + 40;

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




SceneMusic.prototype._showBackGround = function(){
	var ctx = this.core.ctx;
	var title_bg = this.core.image_loader.getImage('shrine_noon');
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
	// 背景をちょっと暗めに表示
	ctx.fillStyle = 'rgb( 0, 0, 0 )' ;
	ctx.globalAlpha = 0.4; // 半透明
	ctx.fillRect(0, 0, this.core.width, this.core.height);

	ctx.globalAlpha = 1.0; // 半透明戻す
};


SceneMusic.prototype.isExStoryCleared = function(){
	return this.core.storage_story.getIsExStageCleared();
};
SceneMusic.prototype.isNormalStoryCleared = function(){
	return this.core.storage_story.getIsNormalStageCleared();
};



module.exports = SceneMusic;

},{"../assets_config":5,"../constant":6,"../hakurei":9}],223:[function(require,module,exports){
'use strict';

/* ステージセレクト画面 */


var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;
var H_CONSTANT = require('../hakurei').constant;
var CONSTANT = require('../constant');

var StageConfig = require('../stage_config');
var LogicScore = require('../logic/score');
var LogicCreateMap = require('../logic/create_map');

// 画面に何個までステージを表示するか
var SHOW_STAGE_LIST_NUM = 20;

var StageConfig = require('../stage_config');
var MAPS = StageConfig.MAPS;


var SceneSelect = function(core) {
	base_scene.apply(this, arguments);
};
util.inherit(SceneSelect, base_scene);

SceneSelect.prototype.init = function(selected_stage_no){
	base_scene.prototype.init.apply(this, arguments);

	// ステージ一覧
	this.stage_list = this.core.storage_story.getStageResultList();

	// カーソル位置
	if (selected_stage_no) {
		this.selected_stage = selected_stage_no - 1; // selected_stage は 0 から始まるので
	}
	else {
		this.selected_stage = 0;
	}

	// マップを更新
	this.stage_objects = this.createMap();

	this.core.changeBGM("title");
};
SceneSelect.prototype.beforeDraw = function(){
	base_scene.prototype.beforeDraw.apply(this, arguments);

	// 決定
	if(this.core.isKeyPush(H_CONSTANT.BUTTON_Z)) {
		this.core.changeScene("stage", this.selected_stage + 1, "play", true); // 0 から selected_stage は始まるので +1
	}
	// 戻る
	else if(this.core.isKeyPush(H_CONSTANT.BUTTON_X)) {
		this.core.changeScene("title");
	}

	// カーソルを下移動
	if(this.core.isKeyPushOrLongDown(H_CONSTANT.BUTTON_DOWN)) {
		this.selected_stage++;

		if(this.selected_stage >= this.stage_list.length) {
			this.selected_stage = this.stage_list.length - 1;
		}

		// マップを更新
		this.stage_objects = this.createMap();
	}
	// カーソルを上移動
	if(this.core.isKeyPushOrLongDown(H_CONSTANT.BUTTON_UP)) {
		this.selected_stage--;

		if(this.selected_stage < 0) {
			this.selected_stage = 0;
		}

		// マップを更新
		this.stage_objects = this.createMap();
	}


};

SceneSelect.prototype.createMap = function(){
	var stage_objects = [];
	var objects_by_tile_type = LogicCreateMap.exec(this, MAPS[this.selected_stage + 1].map, 12, 70, 0.8);

	for (var key in objects_by_tile_type) {
		// プレイヤーは描画しない
		if (Number(key) === CONSTANT.PLAYER) {
			continue;
		}

		stage_objects = stage_objects.concat(objects_by_tile_type[key]);
	}

	return stage_objects;
};
// ノーマル ストーリーのステージかどうか
SceneSelect.prototype.isInNormalStory = function() {
	return !this.isInExStory();
};
// Ex ストーリーのステージかどうか
SceneSelect.prototype.isInExStory = function() {
	return this.selected_stage+1 >= CONSTANT.EX_STORY_START_STAGE_NO ? true : false;
};




// 画面更新
SceneSelect.prototype.draw = function(){
	this.core.clearCanvas();
	var ctx = this.core.ctx;

	ctx.save();

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

	// 背景をちょっと暗めに表示
	ctx.fillStyle = 'rgb( 0, 0, 0 )' ;
	ctx.globalAlpha = 0.5; // 半透明
	ctx.fillRect(0, 0, this.core.width, this.core.height);

	// ステージ一覧背景 表示
	ctx.globalAlpha = 1.0; // 半透明戻す
	ctx.fillRect(this.core.width - 170, 0, 170, this.core.height);


	var stage_list;   // 表示するステージ一覧
	var index;        // カーソルの表示位置
	var is_show_up;   // 上カーソルを表示するかどうか
	var is_show_down; // 下カーソルを表示するかどうか
	if (this.selected_stage <= SHOW_STAGE_LIST_NUM/2) {
		stage_list = this.stage_list.slice(0, SHOW_STAGE_LIST_NUM);
		index = this.selected_stage;
		is_show_up   = false;
		is_show_down = true;
	}
	else if (SHOW_STAGE_LIST_NUM/2 < this.selected_stage && this.selected_stage <= StageConfig.MAP_NUM - SHOW_STAGE_LIST_NUM/2) {
		stage_list = this.stage_list.slice(this.selected_stage - SHOW_STAGE_LIST_NUM/2, SHOW_STAGE_LIST_NUM/2 + this.selected_stage);
		index = SHOW_STAGE_LIST_NUM/2;
		is_show_up   = true;
		is_show_down = true;
	}
	else if (StageConfig.MAP_NUM - SHOW_STAGE_LIST_NUM/2 < this.selected_stage) {
		stage_list = this.stage_list.slice(SHOW_STAGE_LIST_NUM, StageConfig.MAP_NUM);
		index = this.selected_stage - (StageConfig.MAP_NUM - SHOW_STAGE_LIST_NUM/2) + SHOW_STAGE_LIST_NUM/2;
		is_show_up   = true;
		is_show_down = false;
	}


	// ステージ一覧 文字列
	ctx.font = "18px 'Migu'";
	ctx.textAlign = 'left';
	ctx.textBaseAlign = 'middle';
	ctx.fillStyle = 'rgb( 255, 255, 255 )';

	var i, len;
	var x = (this.core.height - 24 * SHOW_STAGE_LIST_NUM)/2;

	for(i = 0, len = stage_list.length; i < len; i++) {
		var data = stage_list[i];
		var stage_no = data.stage_no.toString();
		stage_no = ( '00' + stage_no ).slice(-2); // 数字を2桁に揃える
		var menu = "Stage " + stage_no;

		if(i === index) {
			// カーソル表示
			var cursor = this.core.image_loader.getImage('cursor');
			ctx.drawImage(cursor, this.core.width - 150, x - 14 + 24*i);
		}
		// 文字表示
		this._drawText(menu, this.core.width - 120, x + 24 * i); // 1行表示

	}

	if (is_show_up) {
		ctx.fillText("▲", this.core.width - 100, 20);
	}
	if (is_show_down) {
		ctx.fillText("▼", this.core.width - 100, this.core.height- 10);
	}

	var stage_data = this.core.storage_story.getStageResult(this.selected_stage + 1); // selected_stage は 0から始まるので +1

	if (stage_data) {
		var stage_no_string = ( '00' + stage_data.stage_no ).slice(-2); // 数字を2桁に揃える
		// ステージ名表示
		ctx.font = "36px 'Migu'";
		ctx.textAlign = 'left';
		this._drawText("Stage " + stage_no_string, 20, 50);

		// ステージサムネイル 表示
		// 横720px 縦480px
		/*
		var thumbnail = this.core.image_loader.getImage('thumbnail15');
		ctx.drawImage(thumbnail,
						25,
						50,
						30*24,
						20*24,
						10,
						90,
						30*24 *0.80,
						20*24 *0.80);
		*/

		LogicCreateMap.drawBackground(ctx, this.core.image_loader.getImage("bg"), 12, 70, 0.8);
		// ステージ描画
		for (i = 0; i < this.stage_objects.length; i++) {
			this.stage_objects[i].draw();
		}

		LogicCreateMap.drawFrames(this, 12, 70, 0.8);

		var honor_num = LogicScore.calcHonor(
			stage_data.stage_no,
			stage_data.time,
			stage_data.exchange_num
		);

		// ステージスコア表示
		var star_on = this.core.image_loader.getImage('star_on');
		var star_off = this.core.image_loader.getImage('star_off');
		for (i = 0; i < CONSTANT.MAX_SCORE; i++) {
			var star = i < honor_num ? star_on : star_off;
			ctx.drawImage(star, this.core.width - 300 + i*star.width, this.core.height - 120);
		}
	}

	// 操作方法説明
	this._showHowTo();

	ctx.restore();
};
SceneSelect.prototype._drawText = function(text, x, y){
	var ctx = this.core.ctx;
	ctx.fillStyle = 'rgb( 0, 0, 0 )';
	ctx.lineWidth = 4.0;
	ctx.strokeText(text, x, y);

	ctx.fillStyle = 'rgb( 255, 255, 255 )';
	ctx.fillText(text, x, y);
};

// 操作説明 表示
SceneSelect.prototype._showHowTo = function() {
	var ctx = this.core.ctx;
	ctx.save();

	var text = "Xキー：戻る";

	ctx.font = "14px 'Migu'";
	ctx.textAlign = 'left';
	ctx.textBaseAlign = 'middle';

	this._drawText(text, 10, this.core.height - 10);
	ctx.restore();
};





module.exports = SceneSelect;

},{"../constant":6,"../hakurei":9,"../logic/create_map":45,"../logic/score":48,"../stage_config":232}],224:[function(require,module,exports){
'use strict';

/* 立ち絵＆セリフ */
var MESSAGE_WINDOW_OUTLINE_MARGIN = 10;
var TALKER_MOVE_PX = 5;
var SCALE = 1;

var TRANSITION_COUNT = 100;

// セリフウィンドウの縦の長さ
var MESSAGE_WINDOW_HEIGHT = 100;


var util = require('../hakurei').util;
var CONSTANT = require('../constant');
var H_CONSTANT = require('../hakurei').constant;
var base_scene = require('../hakurei').scene.base;

var SerifManager = require('../hakurei').serif_manager;

var CreateDarkerImage = require('../logic/create_darker_image');

var SceneSerifBase = function(game) {
	base_scene.apply(this, arguments);

	this.serif = new SerifManager();
};

util.inherit(SceneSerifBase, base_scene);

SceneSerifBase.prototype.init = function(serif){
	base_scene.prototype.init.apply(this, arguments);
	this.serif.init(this.serifScript());

	this.transition_count = 0;

	// シーン遷移前の BGM 止める
	if (this.bgm()) {
		this.core.stopBGM();
	}

	if (this.isPlayFadeIn()) {
		this.setFadeIn(60);
	}

	if (this.isPlayFadeOut()) {
		this.setFadeOut(60);
	}
};

SceneSerifBase.prototype.beforeDraw = function(){
	base_scene.prototype.beforeDraw.apply(this, arguments);

	// BGM 再生
	if (this.frame_count === 60 && this.bgm()) {
		this.core.playBGM(this.bgm());
	}


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

	// スキップ
	if(this.core.isKeyPush(H_CONSTANT.BUTTON_X)) {
		this.notifySerifEnd();
	}
};

// 画面更新
SceneSerifBase.prototype.draw = function(){
	base_scene.prototype.draw.apply(this, arguments);
	var ctx = this.core.ctx;

	if (this.isInTransition()) {
		ctx.fillStyle = this.backgroundTransitionColor();
		ctx.fillRect(0, 0, this.width, this.height);

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

		// 操作説明 表示
		this._showHowTo();

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

	var right_image = this.core.image_loader.getImage(this.serif.right_image());
	if(!this.serif.is_right_talking()) {
		// 喋ってない方のキャラは暗くなる
		right_image = CreateDarkerImage.exec(right_image);
	}
	else {
		x -= TALKER_MOVE_PX;
		y -= TALKER_MOVE_PX;
	}


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

	var left_image = this.core.image_loader.getImage(this.serif.left_image());
	if(!this.serif.is_left_talking()) {
		// 喋ってない方のキャラは暗くなる
		left_image = CreateDarkerImage.exec(left_image);
	}
	else {
		x += TALKER_MOVE_PX;
		y -= TALKER_MOVE_PX;
	}


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

	ctx.globalAlpha = 0.5;
	ctx.fillStyle = 'rgb( 0, 0, 0 )';
	ctx.fillRect(
		MESSAGE_WINDOW_OUTLINE_MARGIN,
		this.core.height - 125,
		this.core.width - MESSAGE_WINDOW_OUTLINE_MARGIN * 2,
		MESSAGE_WINDOW_HEIGHT
	);

	ctx.restore();
};

// セリフ表示
SceneSerifBase.prototype._showMessage = function() {
	var ctx = this.core.ctx;
	ctx.save();

	// セリフの色
	var font_color = this.serif.font_color();
	if(font_color) {
		font_color = util.hexToRGBString(font_color);
	}
	else {
		font_color = 'rgb(255, 255, 255)';
	}

	ctx.font = "18px 'Migu'";
	ctx.textAlign = 'left';
	ctx.textBaseAlign = 'middle';

	var x, y;
	// セリフ表示
	var lines = this.serif.lines();
	if (lines.length) {
		// セリフテキストの y 座標初期位置
		y = this.core.height - 125 + 40;

		for(var i = 0, len = lines.length; i < len; i++) {
			ctx.fillStyle = 'rgb( 0, 0, 0 )';
			ctx.lineWidth = 4.0;
			ctx.strokeText(lines[i], MESSAGE_WINDOW_OUTLINE_MARGIN * 2 + 20, y); // 1行表示

			ctx.fillStyle = font_color;
			ctx.fillText(lines[i], MESSAGE_WINDOW_OUTLINE_MARGIN * 2 + 20, y); // 1行表示

			y+= 30;
		}
	}

	ctx.restore();
};

// 操作説明 表示
SceneSerifBase.prototype._showHowTo = function() {
	var ctx = this.core.ctx;
	ctx.save();

	var text = "Xキー：スキップ";

	ctx.font = "14px 'Migu'";
	ctx.textAlign = 'left';
	ctx.textBaseAlign = 'middle';

	ctx.fillStyle = 'rgb( 0, 0, 0 )';
	ctx.lineWidth = 4.0;
	ctx.strokeText(text, this.core.width - 130, this.core.height - 10);

	ctx.fillStyle = 'white';
	ctx.fillText(text, this.core.width - 130, this.core.height - 10);

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
// トランジションカラー
SceneSerifBase.prototype.backgroundTransitionColor = function() {
	return "white";
};
// BGM
SceneSerifBase.prototype.bgm = function() {
};

// フェードインするかどうか
SceneSerifBase.prototype.isPlayFadeIn = function() {
	return false;
};
// フェードアウトするかどうか
SceneSerifBase.prototype.isPlayFadeOut = function() {
	return false;
};





SceneSerifBase.prototype.isInTransition = function() {
	return this.transition_count ? true : false;
};




module.exports = SceneSerifBase;

},{"../constant":6,"../hakurei":9,"../logic/create_darker_image":44}],225:[function(require,module,exports){
'use strict';
// ステージクリア後のセリフ

var base_scene = require('./talk_base');
var util = require('../../hakurei').util;

var SceneAfterTalk = function(core, parent) {
	base_scene.apply(this, arguments);
};
util.inherit(SceneAfterTalk, base_scene);

SceneAfterTalk.prototype.init = function(serif_before){
	base_scene.prototype.init.apply(this, arguments);

};

// リザルト画面が終了した
SceneAfterTalk.prototype.notifyTalkEnd = function () {
	this.parent.notifyAfterTalkEnd();
};

module.exports = SceneAfterTalk;

},{"../../hakurei":9,"./talk_base":231}],226:[function(require,module,exports){
'use strict';
// ステージ開始前のセリフ

var base_scene = require('./talk_base');
var util = require('../../hakurei').util;

var SceneBeforeTalk = function(core, parent) {
	base_scene.apply(this, arguments);
};
util.inherit(SceneBeforeTalk, base_scene);

// リザルト画面が終了した
SceneBeforeTalk.prototype.notifyTalkEnd = function () {
		this.parent.changeSubScene("play");
};

module.exports = SceneBeforeTalk;

},{"../../hakurei":9,"./talk_base":231}],227:[function(require,module,exports){
'use strict';
// ポーズ画面

var base_scene = require('../../hakurei').scene.base;
var CONSTANT = require('../../hakurei').constant;
var util = require('../../hakurei').util;

var SceneStagePause = function(core, parent) {
	base_scene.apply(this, arguments);
};

util.inherit(SceneStagePause, base_scene);

SceneStagePause.prototype.init = function(){
	base_scene.prototype.init.apply(this, arguments);

	// カーソルがどこにあるか
	this.selectIndex = 0;
};

SceneStagePause.prototype.beforeDraw = function(){
	base_scene.prototype.beforeDraw.apply(this, arguments);

	if(this.core.isKeyPushOrLongDown(CONSTANT.BUTTON_UP)) {
		this.core.playSound('select');
		this.selectIndex--;

		// 最小値を超えないように
		if (this.selectIndex < 0) {
			this.selectIndex = 0;
		}
	}
	else if(this.core.isKeyPushOrLongDown(CONSTANT.BUTTON_DOWN)) {
		this.core.playSound('select');
		this.selectIndex++;

		// 最大値を超えないように
		if (this.selectIndex > 2) {
			this.selectIndex = 2;
		}
	}

	if(this.core.isKeyPushOrLongDown(CONSTANT.BUTTON_SPACE)) {
		this.core.playSound('select');

		// Continue
		this.parent.changeSubScene("play");
	}
	else if(this.core.isKeyPush(CONSTANT.BUTTON_Z)) {
		this.core.playSound('select');
		if(this.selectIndex === 0) {
			// Continue
			this.parent.changeSubScene("play");
		}
		else if(this.selectIndex === 1) {
			// Restart
			this.parent.notifyRestart();
		}
		else if(this.selectIndex === 2) {
			// Quit
			this.parent.notifyQuit();
		}
	}
};

// 画面更新
SceneStagePause.prototype.draw = function(){
	var ctx = this.core.ctx;

	ctx.save();

	ctx.fillStyle = 'rgb( 0, 0, 0 )' ;
	ctx.globalAlpha = 0.7; // 半透明
	ctx.fillRect(0, 0, this.parent.width, this.parent.height);

	ctx.fillStyle = 'rgb( 255, 255, 255 )';
	ctx.textAlign = 'center';
	ctx.font = "18px 'Migu'" ;

	ctx.textBaseAlign = 'middle';

	if(this.selectIndex === 0) {
		ctx.globalAlpha = 1.0;
	}
	else {
		ctx.globalAlpha = 0.2;
	}

	ctx.fillText( 'Continue', this.parent.width/2, 200 ) ;

	if(this.selectIndex === 1) {
		ctx.globalAlpha = 1.0;
	}
	else {
		ctx.globalAlpha = 0.2;
	}

	ctx.fillText( 'Restart',     this.parent.width/2, 240 ) ;

	if(this.selectIndex === 2) {
		ctx.globalAlpha = 1.0;
	}
	else {
		ctx.globalAlpha = 0.2;
	}

	ctx.fillText( 'Quit',     this.parent.width/2, 280 ) ;

	ctx.restore();
};
module.exports = SceneStagePause;

},{"../../hakurei":9}],228:[function(require,module,exports){
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

	// parent class (stage scene) に所属するオブジェクトを動かす
	for(var i = 0, len = this.parent.objects.length; i < len; i++) {
		this.parent.objects[i].beforeDraw();
	}



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

	// ポーズ
	if(this.core.isKeyPush(CONSTANT.BUTTON_SPACE)) {
		this.parent.changeSubScene("pause");
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

},{"../../hakurei":9}],229:[function(require,module,exports){
'use strict';
// クリア リザルト

var base_scene = require('../../hakurei').scene.base;
var H_CONSTANT = require('../../hakurei').constant;
var CONSTANT = require('../../constant');
var util = require('../../hakurei').util;
var LogicScore = require('../../logic/score');
var Message = require('../../logic/result_message/select');

var SceneStageResultClearBySelect = function(core, parent) {
	base_scene.apply(this, arguments);
};

util.inherit(SceneStageResultClearBySelect, base_scene);

SceneStageResultClearBySelect.prototype.init = function(){
	base_scene.prototype.init.apply(this, arguments);

	// 表示するメッセージを取得
	this.message = this.getMessage();

	this.sound_count = 0;

	this.move_frame_count0 = 0;
	this.is_show_bg = false;
	this.move_frame_count1 = 1000;
	this.move_frame_count2 = 1000;
	this.move_frame_count3 = -500;
	this.is_show_serif = false;
};

SceneStageResultClearBySelect.prototype.beforeDraw = function(){
	base_scene.prototype.beforeDraw.apply(this, arguments);

	// parent class (stage scene) に所属するオブジェクトを動かす
	for(var i = 0, len = this.parent.objects.length; i < len; i++) {
		this.parent.objects[i].beforeDraw();
	}

	if(this.core.isKeyPush(H_CONSTANT.BUTTON_Z)) {
		this.core.playSound('select');
		this.goToNextScene();
	}

	// 何もしない
	if (this.move_frame_count0 < 40) {
		this.move_frame_count0 += 1;
	}
	// 背景画像表示
	else if (!this.is_show_bg) {
		this.is_show_bg = true;
	}
	// SE再生(1度だけ)
	else if (this.sound_count === 0) {
		this.sound_count++;
		this.core.playSound("stage_result1");
	}
	// Stage Clear メッセージ表示
	else if (this.move_frame_count1 > 150) {
		this.move_frame_count1-=50;
	}
	// SE再生(1度だけ)
	else if (this.sound_count === 1) {
		this.sound_count++;
		this.core.playSound("stage_result1");
	}
	// スコア表示
	else if (this.move_frame_count2 > 250) {
		this.move_frame_count2-=50;
	}
	// キャラ画像表示
	else if (this.move_frame_count3 < 400) {
		this.move_frame_count3+=50;
	}
	// セリフ表示
	else if (!this.is_show_serif) {
		this.is_show_serif = true;
	}
	// SE再生(1度だけ)
	else if (this.sound_count === 2) {
		this.sound_count++;
		this.core.playSound("stage_result2");
	}


};

// 画面更新
SceneStageResultClearBySelect.prototype.draw = function(){
	var ctx = this.core.ctx;

	/*
	// 背景をちょっと暗転
	ctx.save();
	var alpha = 0.5;
	ctx.fillStyle = 'rgb( 0, 0, 0 )' ;
	ctx.globalAlpha = alpha;
	ctx.fillRect(0, 0, this.parent.width, this.parent.height);
	ctx.restore();
	*/

	if (this.is_show_bg) {
		var image = this.core.image_loader.getImage("mari_bg");
		ctx.drawImage(image,
			// sprite position
			3, 928,
			// sprite size to get
			this.core.width*4, 868,
			// position which where to draw
			0, this.core.height/2 - 868*0.25/2,
			// sprite size to show
			this.core.width, 868 * 0.25
		);
	}

	ctx.save();
	ctx.textAlign = 'left';
	ctx.textBaseAlign = 'middle';

	ctx.fillStyle = 'rgb(232, 52, 33)';
	ctx.font = "24px 'Migu'";
	ctx.fillText("STAGE CLEAR !", this.move_frame_count1, 250);
	ctx.fillRect(this.move_frame_count1, 260, 280, 1);
	ctx.font = "28px 'Migu'";
	ctx.fillText("Score:", this.move_frame_count2, 320);

	// スコア計算
	var honor_num = this.parent.calcHonor();


	// ステージスコア表示
	var star_on = this.core.image_loader.getImage('star_on');
	var star_off = this.core.image_loader.getImage('star_off');
	for (var i = 0; i < CONSTANT.MAX_SCORE; i++) {
		var star = i < honor_num ? star_on : star_off;
		ctx.drawImage(star, this.move_frame_count2 + 100 + i*star.width, 285);
	}

	ctx.restore();

	// キャラ表示
	this._showRightChara(this.message.chara, this.message.face);

	ctx.save();
	if (this.is_show_serif) {
		// メッセージウィンドウ
		this._showMessageWindow();

		// メッセージ表示
		this._showMessage(this.message.message);
	}
	ctx.restore();
};

SceneStageResultClearBySelect.prototype._showRightChara = function(chara, face){
	var ctx = this.core.ctx;
	ctx.save();

	var right_image = this.core.image_loader.getImage(chara + "_" + face);
	var x = this.move_frame_count3 + right_image.width/2;
	var y = 65 + right_image.height/2;

	if (this.message.chara === "yukari") {
		y -= 40; // 紫の方が背が高い
	}

	// 移動
	ctx.translate(x, y);

	// 紫の場合反転
	if (this.message.chara === "yukari") {
		ctx.transform(-1, 0, 0, 1, 0, 0);
	}

	ctx.drawImage(right_image,
		-right_image.width/2,
		-right_image.height/2,
		right_image.width,
		right_image.height
	);

	ctx.restore();
};

var MESSAGE_WINDOW_OUTLINE_MARGIN = 10;
SceneStageResultClearBySelect.prototype._showMessageWindow = function(){
	var ctx = this.core.ctx;
	// show message window
	ctx.save();

	var message_height = 100;

	ctx.globalAlpha = 0.5;
	ctx.fillStyle = 'rgb(0, 0, 0)';
	ctx.fillRect(
		MESSAGE_WINDOW_OUTLINE_MARGIN,
		this.core.height - 125,
		this.core.width - MESSAGE_WINDOW_OUTLINE_MARGIN * 2,
		message_height
	);

	ctx.restore();
};

// セリフ表示
SceneStageResultClearBySelect.prototype._showMessage = function(message) {
	var ctx = this.core.ctx;
	ctx.save();

	ctx.font = "18px 'Migu'";
	ctx.textAlign = 'left';
	ctx.textBaseAlign = 'middle';

	var x, y;
	// セリフ表示
	var lines = [message];
	if (lines.length) {
		// セリフテキストの y 座標初期位置
		var message_height = 80;
		y = this.core.height - 125 + 40;

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

// 次のシーンへ
SceneStageResultClearBySelect.prototype.goToNextScene = function() {
	this.parent.notifyResultClearEndBySelect();
};

// メッセージ取得
SceneStageResultClearBySelect.prototype.getMessage = function() {
	var honor_num = this.parent.calcHonor();

	// 称号に該当するメッセージ一覧を取得
	var message_list = Message[honor_num];

	// ランダムに1つ取得
	var message = message_list[Math.floor(Math.random() * message_list.length)];

	return {
		chara: message[0],
		face: message[1],
		message: message[2],
	};
};








module.exports = SceneStageResultClearBySelect;

},{"../../constant":6,"../../hakurei":9,"../../logic/result_message/select":46,"../../logic/score":48}],230:[function(require,module,exports){
'use strict';
// クリア リザルト
// ステージセレクトと一緒なので継承して実装

var base_scene = require('./result_clear_by_select');
var CONSTANT = require('../../hakurei').constant;
var util = require('../../hakurei').util;
var Message = require('../../logic/result_message/story');

var SceneStageResultClear = function(core, parent) {
	base_scene.apply(this, arguments);
};

util.inherit(SceneStageResultClear, base_scene);

// 次のシーンへ
SceneStageResultClear.prototype.goToNextScene = function() {
	this.parent.notifyResultClearEndByStory();
};

// メッセージ取得
SceneStageResultClear.prototype.getMessage = function() {
	var stage_no = this.parent.stage_no;

	// ステージに該当するメッセージ一覧を取得
	var message_list = Message[stage_no - 1];

	// ランダムに1つ取得
	var message = message_list[Math.floor(Math.random() * message_list.length)];

	return {
		chara: message[0],
		face: message[1],
		message: message[2],
	};
};





module.exports = SceneStageResultClear;

},{"../../hakurei":9,"../../logic/result_message/story":47,"./result_clear_by_select":229}],231:[function(require,module,exports){
'use strict';

var MESSAGE_WINDOW_OUTLINE_MARGIN = 10;
var TALKER_MOVE_PX = 5;
var SCALE = 1;

var base_scene = require('../../hakurei').scene.base;
var CONSTANT = require('../../hakurei').constant;
var util = require('../../hakurei').util;

var SerifManager = require('../../hakurei').serif_manager;

var CreateDarkerImage = require('../../logic/create_darker_image');

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

	// セリフのないステージならば、そのまま終了
	if(this.frame_count === 1 && this.serif.is_end()) {
		this.notifyTalkEnd();
		return;
	}

	if(this.core.isKeyPush(CONSTANT.BUTTON_Z)) {
		if(this.serif.is_end()) {
			this.notifyTalkEnd();
		}
		else {
			// セリフを送る
			this.serif.next();
		}
	}

	// スキップ
	if(this.core.isKeyPush(CONSTANT.BUTTON_X)) {
		this.notifyTalkEnd();
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

	// 操作説明 表示
	this._showHowTo();
};

SceneStageTalk.prototype._showRightChara = function(){
	var ctx = this.core.ctx;
	ctx.save();

	var x = 400;
	var y = 65;

	var right_image = this.core.image_loader.getImage(this.serif.right_image());
	if(!this.serif.is_right_talking()) {
		// 喋ってない方のキャラは暗くなる
		right_image = CreateDarkerImage.exec(right_image);
	}
	else {
		x -= TALKER_MOVE_PX;
		y -= TALKER_MOVE_PX;
	}


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

	var left_image = this.core.image_loader.getImage(this.serif.left_image());
	if(!this.serif.is_left_talking()) {
		// 喋ってない方のキャラは暗くなる
		left_image = CreateDarkerImage.exec(left_image);
	}
	else {
		x += TALKER_MOVE_PX;
		y -= TALKER_MOVE_PX;
	}

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
		this.core.height - 125,
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
		y = this.core.height - 125 + 40;

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

// 操作説明 表示
SceneStageTalk.prototype._showHowTo = function() {
	var ctx = this.core.ctx;
	ctx.save();

	var text = "Xキー：スキップ";

	ctx.font = "14px 'Migu'";
	ctx.textAlign = 'left';
	ctx.textBaseAlign = 'middle';

	ctx.fillStyle = 'rgb( 0, 0, 0 )';
	ctx.lineWidth = 4.0;
	ctx.strokeText(text, this.core.width - 130, this.core.height - 10);

	ctx.fillStyle = 'white';
	ctx.fillText(text, this.core.width - 130, this.core.height - 10);

	ctx.restore();
};




SceneStageTalk.prototype.notifyTalkEnd = function() {
	throw new Error("notifyTalkEnd must be implemented.");
};

module.exports = SceneStageTalk;

},{"../../hakurei":9,"../../logic/create_darker_image":44}],232:[function(require,module,exports){
'use strict';

// ステージマップ一覧
var MAPS = [
	null,
	require("./scene/map/stage01"),
	require("./scene/map/stage02"),
	require("./scene/map/stage03"),
	require("./scene/map/stage04"),
	require("./scene/map/stage05"),
	require("./scene/map/stage06"),
	require("./scene/map/stage07"),
	require("./scene/map/stage08"),
	require("./scene/map/stage09"),
	require("./scene/map/stage10"),
	require("./scene/map/stage11"),
	require("./scene/map/stage12"),
	require("./scene/map/stage13"),
	require("./scene/map/stage14"),
	require("./scene/map/stage15"),
	require("./scene/map/stage16"),
	require("./scene/map/stage17"),
	require("./scene/map/stage18"),
	require("./scene/map/stage19"),
	require("./scene/map/stage20"),
	require("./scene/map/stage21"),
	require("./scene/map/stage22"),
	require("./scene/map/stage23"),
	require("./scene/map/stage24"),
	require("./scene/map/stage25"),
	require("./scene/map/stage26"),
	require("./scene/map/stage27"),
	require("./scene/map/stage28"),
	require("./scene/map/stage29"),
	require("./scene/map/stage30"),
	require("./scene/map/stage31"),
	require("./scene/map/stage32"),
	require("./scene/map/stage33"),
	require("./scene/map/stage34"),
	require("./scene/map/stage35"),
	require("./scene/map/stage36"),
	require("./scene/map/stage37"),
	require("./scene/map/stage38"),
	require("./scene/map/stage39"),
	require("./scene/map/stage40"),
];

// セリフ(ステージ開始前) 一覧
var SERIF_BEFORES = [
	null,
	require("./logic/serif/stage01/before"),
	require("./logic/serif/stage02/before"),
	require("./logic/serif/stage03/before"),
	require("./logic/serif/stage04/before"),
	require("./logic/serif/stage05/before"),
	require("./logic/serif/stage06/before"),
	require("./logic/serif/stage07/before"),
	require("./logic/serif/stage08/before"),
	require("./logic/serif/stage09/before"),
	require("./logic/serif/stage10/before"),
	require("./logic/serif/stage11/before"),
	require("./logic/serif/stage12/before"),
	require("./logic/serif/stage13/before"),
	require("./logic/serif/stage14/before"),
	require("./logic/serif/stage15/before"),
	require("./logic/serif/stage16/before"),
	require("./logic/serif/stage17/before"),
	require("./logic/serif/stage18/before"),
	require("./logic/serif/stage19/before"),
	require("./logic/serif/stage20/before"),
	require("./logic/serif/stage21/before"),
	require("./logic/serif/stage22/before"),
	require("./logic/serif/stage23/before"),
	require("./logic/serif/stage24/before"),
	require("./logic/serif/stage25/before"),
	require("./logic/serif/stage26/before"),
	require("./logic/serif/stage27/before"),
	require("./logic/serif/stage28/before"),
	require("./logic/serif/stage29/before"),
	require("./logic/serif/stage30/before"),
	require("./logic/serif/stage31/before"),
	require("./logic/serif/stage32/before"),
	require("./logic/serif/stage33/before"),
	require("./logic/serif/stage34/before"),
	require("./logic/serif/stage35/before"),
	require("./logic/serif/stage36/before"),
	require("./logic/serif/stage37/before"),
	require("./logic/serif/stage38/before"),
	require("./logic/serif/stage39/before"),
	require("./logic/serif/stage40/before"),
];

// セリフ(ステージクリア後) 一覧
var SERIF_AFTERS = [
	null,
	require("./logic/serif/stage01/after"),
	require("./logic/serif/stage02/after"),
	require("./logic/serif/stage03/after"),
	require("./logic/serif/stage04/after"),
	require("./logic/serif/stage05/after"),
	require("./logic/serif/stage06/after"),
	require("./logic/serif/stage07/after"),
	require("./logic/serif/stage08/after"),
	require("./logic/serif/stage09/after"),
	require("./logic/serif/stage10/after"),
	require("./logic/serif/stage11/after"),
	require("./logic/serif/stage12/after"),
	require("./logic/serif/stage13/after"),
	require("./logic/serif/stage14/after"),
	require("./logic/serif/stage15/after"),
	require("./logic/serif/stage16/after"),
	require("./logic/serif/stage17/after"),
	require("./logic/serif/stage18/after"),
	require("./logic/serif/stage19/after"),
	require("./logic/serif/stage20/after"),
	require("./logic/serif/stage21/after"),
	require("./logic/serif/stage22/after"),
	require("./logic/serif/stage23/after"),
	require("./logic/serif/stage24/after"),
	require("./logic/serif/stage25/after"),
	require("./logic/serif/stage26/after"),
	require("./logic/serif/stage27/after"),
	require("./logic/serif/stage28/after"),
	require("./logic/serif/stage29/after"),
	require("./logic/serif/stage30/after"),
	require("./logic/serif/stage31/after"),
	require("./logic/serif/stage32/after"),
	require("./logic/serif/stage33/after"),
	require("./logic/serif/stage34/after"),
	require("./logic/serif/stage35/after"),
	require("./logic/serif/stage36/after"),
	require("./logic/serif/stage37/after"),
	require("./logic/serif/stage38/after"),
	require("./logic/serif/stage39/after"),
	require("./logic/serif/stage40/after"),
];

// ステージに表示する目玉の数
var EYES_NUM = [
	null,
	0,
	1,
	3,
	4,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
];

module.exports = {
	MAPS: MAPS,
	MAP_NUM: MAPS.length - 1, // マップ数
	SERIF_BEFORES: SERIF_BEFORES,
	SERIF_AFTERS: SERIF_AFTERS,
	EYES_NUM: EYES_NUM,
};

},{"./logic/serif/stage01/after":55,"./logic/serif/stage01/before":56,"./logic/serif/stage02/after":57,"./logic/serif/stage02/before":58,"./logic/serif/stage03/after":59,"./logic/serif/stage03/before":60,"./logic/serif/stage04/after":61,"./logic/serif/stage04/before":62,"./logic/serif/stage05/after":63,"./logic/serif/stage05/before":64,"./logic/serif/stage06/after":65,"./logic/serif/stage06/before":66,"./logic/serif/stage07/after":67,"./logic/serif/stage07/before":68,"./logic/serif/stage08/after":69,"./logic/serif/stage08/before":70,"./logic/serif/stage09/after":71,"./logic/serif/stage09/before":72,"./logic/serif/stage10/after":73,"./logic/serif/stage10/before":74,"./logic/serif/stage11/after":75,"./logic/serif/stage11/before":76,"./logic/serif/stage12/after":77,"./logic/serif/stage12/before":78,"./logic/serif/stage13/after":79,"./logic/serif/stage13/before":80,"./logic/serif/stage14/after":81,"./logic/serif/stage14/before":82,"./logic/serif/stage15/after":83,"./logic/serif/stage15/before":84,"./logic/serif/stage16/after":85,"./logic/serif/stage16/before":86,"./logic/serif/stage17/after":87,"./logic/serif/stage17/before":88,"./logic/serif/stage18/after":89,"./logic/serif/stage18/before":90,"./logic/serif/stage19/after":91,"./logic/serif/stage19/before":92,"./logic/serif/stage20/after":93,"./logic/serif/stage20/before":94,"./logic/serif/stage21/after":95,"./logic/serif/stage21/before":96,"./logic/serif/stage22/after":97,"./logic/serif/stage22/before":98,"./logic/serif/stage23/after":99,"./logic/serif/stage23/before":100,"./logic/serif/stage24/after":101,"./logic/serif/stage24/before":102,"./logic/serif/stage25/after":103,"./logic/serif/stage25/before":104,"./logic/serif/stage26/after":105,"./logic/serif/stage26/before":106,"./logic/serif/stage27/after":107,"./logic/serif/stage27/before":108,"./logic/serif/stage28/after":109,"./logic/serif/stage28/before":110,"./logic/serif/stage29/after":111,"./logic/serif/stage29/before":112,"./logic/serif/stage30/after":113,"./logic/serif/stage30/before":114,"./logic/serif/stage31/after":115,"./logic/serif/stage31/before":116,"./logic/serif/stage32/after":117,"./logic/serif/stage32/before":118,"./logic/serif/stage33/after":119,"./logic/serif/stage33/before":120,"./logic/serif/stage34/after":121,"./logic/serif/stage34/before":122,"./logic/serif/stage35/after":123,"./logic/serif/stage35/before":124,"./logic/serif/stage36/after":125,"./logic/serif/stage36/before":126,"./logic/serif/stage37/after":127,"./logic/serif/stage37/before":128,"./logic/serif/stage38/after":129,"./logic/serif/stage38/before":130,"./logic/serif/stage39/after":131,"./logic/serif/stage39/before":132,"./logic/serif/stage40/after":133,"./logic/serif/stage40/before":134,"./scene/map/stage01":182,"./scene/map/stage02":183,"./scene/map/stage03":184,"./scene/map/stage04":185,"./scene/map/stage05":186,"./scene/map/stage06":187,"./scene/map/stage07":188,"./scene/map/stage08":189,"./scene/map/stage09":190,"./scene/map/stage10":191,"./scene/map/stage11":192,"./scene/map/stage12":193,"./scene/map/stage13":194,"./scene/map/stage14":195,"./scene/map/stage15":196,"./scene/map/stage16":197,"./scene/map/stage17":198,"./scene/map/stage18":199,"./scene/map/stage19":200,"./scene/map/stage20":201,"./scene/map/stage21":202,"./scene/map/stage22":203,"./scene/map/stage23":204,"./scene/map/stage24":205,"./scene/map/stage25":206,"./scene/map/stage26":207,"./scene/map/stage27":208,"./scene/map/stage28":209,"./scene/map/stage29":210,"./scene/map/stage30":211,"./scene/map/stage31":212,"./scene/map/stage32":213,"./scene/map/stage33":214,"./scene/map/stage34":215,"./scene/map/stage35":216,"./scene/map/stage36":217,"./scene/map/stage37":218,"./scene/map/stage38":219,"./scene/map/stage39":220,"./scene/map/stage40":221}],233:[function(require,module,exports){
'use strict';

// セーブデータ ストーリー進捗

// TODO: createStageResultObject 実装したい
var base_class = require('../hakurei').storage.save;
var util = require('../hakurei').util;
var CONSTANT = require('../constant');
var LogicScore = require('../logic/score');

var StorageStory = function(scene) {
	base_class.apply(this, arguments);
};
util.inherit(StorageStory, base_class);

// 通常ストーリーの進捗を +1
StorageStory.prototype.incrementNormalStageProgress = function(){
	var progress = this.getNormalStageProgress();

	if (progress) {
		progress += 1;
	}
	else {
		progress = 1;
	}

	this.set("normal_stage_progress", progress);
};
// 通常ストーリーをどのステージまで進めているか取得
StorageStory.prototype.getNormalStageProgress = function(){
	return this.get("normal_stage_progress");
};
// 通常ストーリーを進捗を削除
StorageStory.prototype.resetNormalStageProgress = function(){
	return this.remove("normal_stage_progress");
};

// Ex ストーリーの進捗を +1
StorageStory.prototype.incrementExStageProgress = function(){
	var progress = this.getExStageProgress();

	if (progress) {
		progress += 1;
	}
	else {
		progress = CONSTANT.EX_STORY_START_STAGE_NO;
	}

	this.set("ex_stage_progress", progress);
};
// Ex ストーリーをどのステージまで進めているか取得
StorageStory.prototype.getExStageProgress = function(){
	return this.get("ex_stage_progress");
};
// Ex ストーリーを進捗を削除
StorageStory.prototype.resetExStageProgress = function(){
	return this.remove("ex_stage_progress");
};

// 通常ストーリーを1度でもクリアしたことを設定
StorageStory.prototype.clearNormalStage = function(){
	this.set("is_normal_stage_cleared", true);
};
// 通常ストーリーを1度でもクリアしたか否かを取得
StorageStory.prototype.getIsNormalStageCleared = function(){
	return this.get("is_normal_stage_cleared");
};

// Exストーリーを1度でもクリアしたことを設定
StorageStory.prototype.clearExStage = function(){
	this.set("is_ex_stage_cleared", true);
};
// Exストーリーを1度でもクリアしたか否かを取得
StorageStory.prototype.getIsExStageCleared = function(){
	return this.get("is_ex_stage_cleared");
};





// ステージ実績の一覧を取得
StorageStory.prototype.getStageResultList = function(){
	var list = this.get("stage_result_list");

	if(!list) list = [];

	return list;
};

// 対象のステージ実績を取得
StorageStory.prototype.getStageResult = function(stage_no){
	var list = this.getStageResultList();

	return list[stage_no - 1];
};

// 最新のステージ実績を取得
StorageStory.prototype.getLatestStageResult = function(){
	var list = this.getStageResultList();

	if (list.length === 0) {
		return null;
	}

	return list[list.length - 1];
};

// 対象のステージ実績を更新
StorageStory.prototype.updateStageResult = function(stage_no, time, exchange_num){
	stage_no -= 1; // 配列なので 0 から
	var list = this.getStageResultList();

	// ステージ実績がなければ現在の実績でハイスコアを更新
	if(!list[stage_no]) {
		list[stage_no] = {
			stage_no: stage_no + 1,     // -1 しちゃったのでここだけ正常なstage noに戻す
			time:         time,         // クリア時刻
			exchange_num: exchange_num, // 使用 交換回数
		};
	}
	else {
		// 以前のハイスコア
		var previous_honor_num = LogicScore.calcHonor(
			stage_no + 1,
			list[stage_no].time,
			list[stage_no].exchange_num
		);
		// 今回のスコア
		var next_honor_num = LogicScore.calcHonor(
			stage_no + 1,
			time,
			exchange_num
		);

		// ベストスコアであれば更新
		if(next_honor_num > previous_honor_num) {
			list[stage_no].time = time;
			list[stage_no].exchange_num = exchange_num;
		}
	}
	// セーブ
	this.set("stage_result_list", list);
};

// 通常ストーリーの実績を全て解放
StorageStory.prototype.clearNormalStageForDebug = function(){
	var list = this.getStageResultList();

	var last_stage_no = CONSTANT.EX_STORY_START_STAGE_NO - 1;

	for (var i = 0; i < last_stage_no; i++) {
		// 実績がないステージのみ解放
		if(!list[i]) {
			list[i] = {
				stage_no: i+1,
				time: 1,
				exchange_num: 1,
			};
		}
	}
	this.set("stage_result_list", list);

	// クリアフラグを立てる
	this.clearNormalStage();
	this.save();
};

// Exストーリーの実績を全て解放
StorageStory.prototype.clearExStageForDebug = function(){
	var list = this.getStageResultList();

	var begin_stage_no = CONSTANT.EX_STORY_START_STAGE_NO;

	for (var i = begin_stage_no - 1; i < 40; i++) { // TODO: 40固定なのを直す
		// 実績がないステージのみ解放
		if(!list[i]) {
			list[i] = {
				stage_no: i+1,
				time: 1,
				exchange_num: 1,
			};
		}
	}
	this.set("stage_result_list", list);

	// クリアフラグを立てる
	this.clearExStage();

	this.save();
};

module.exports = StorageStory;

},{"../constant":6,"../hakurei":9,"../logic/score":48}]},{},[135]);
