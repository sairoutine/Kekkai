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

// 背景画像名
SceneAfterNormal.prototype.background = function() {
	return "shrine_night";
};
module.exports = SceneAfterNormal;