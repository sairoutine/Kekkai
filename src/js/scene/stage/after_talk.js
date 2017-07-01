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
	console.log("ok");

};

// リザルト画面が終了した
SceneAfterTalk.prototype.notifyTalkEnd = function () {
	this.parent.notifyClearEnd();
};

module.exports = SceneAfterTalk;
