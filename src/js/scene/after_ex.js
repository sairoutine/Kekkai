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
