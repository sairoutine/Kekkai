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
