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

	// TODO:
	//console.log("score: " + this.parent.calcHonor());
	this.parent.notifyResultClearEnd();
};

SceneStageResultClear.prototype.resultName = function(){
	return "STAGE CLEAR !";
};
SceneStageResultClear.prototype.resultMessage = function(){
	return "Press Z to Next";
};


module.exports = SceneStageResultClear;
