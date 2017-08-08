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
	this._is_play_bgm = false;
};
ScenePrologue.prototype.beforeDraw = function() {
	base_scene.prototype.beforeDraw.apply(this, arguments);

	// 霊夢が筆を落とす音
	if(this.serif.progress === 9 && !this._is_play_drop_sound) {
		this._is_play_drop_sound = true;
		this.core.playSound("drop");
	}

	// BGM再生
	if(this.serif.progress === 3 && !this._is_play_bgm) {
		this._is_play_bgm = true;
		this.core.playBGM("epilogue");
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
//ScenePrologue.prototype.bgm = function() {
//};

ScenePrologue.prototype.isPlayFadeIn = function() {
	return true;
};


module.exports = ScenePrologue;
