'use strict';
// クリア リザルト
// ステージセレクトと一緒なので継承して実装

var base_scene = require('./result_clear_by_select');
var CONSTANT = require('../../hakurei').constant;
var util = require('../../hakurei').util;

var SceneStageResultClear = function(core, parent) {
	base_scene.apply(this, arguments);
};

util.inherit(SceneStageResultClear, base_scene);

// 次のシーンへ
SceneStageResultClear.prototype.goToNextScene = function() {
	this.parent.notifyResultClearEndByStory();
};

module.exports = SceneStageResultClear;
