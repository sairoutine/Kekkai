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
