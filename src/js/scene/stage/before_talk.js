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
