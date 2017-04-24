'use strict';
// クリア リザルト

var base_scene = require('./result_base');
var util = require('../../hakurei').util;

var SceneStageResultClear = function(core, parent) {
	base_scene.apply(this, arguments);
};
util.inherit(SceneStageResultClear, base_scene);

// リザルト画面が終了した
SceneStageResultClear.prototype.notifyResultEnd = function () {
	this.parent.notifyGameOverEnd();
};

SceneStageResultClear.prototype.resultName = function(){
	return "GAME OVER...";
};
SceneStageResultClear.prototype.resultMessage = function(){
	return "Press Z to Retry";
};


module.exports = SceneStageResultClear;
