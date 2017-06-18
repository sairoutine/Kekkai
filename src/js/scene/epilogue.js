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
