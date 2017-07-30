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
	return "mute";
};
// トランジションカラー
SceneReminiscence.prototype.backgroundTransitionColor = function() {
	return "black";
};



module.exports = SceneReminiscence;
