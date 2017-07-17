'use strict';
// クリア リザルト
// ステージセレクトと一緒なので継承して実装

var base_scene = require('./result_clear_by_select');
var CONSTANT = require('../../hakurei').constant;
var util = require('../../hakurei').util;
var Message = require('../../logic/result_message/story');

var SceneStageResultClear = function(core, parent) {
	base_scene.apply(this, arguments);
};

util.inherit(SceneStageResultClear, base_scene);

// 次のシーンへ
SceneStageResultClear.prototype.goToNextScene = function() {
	this.parent.notifyResultClearEndByStory();
};

// メッセージ取得
SceneStageResultClear.prototype.getMessage = function() {
	var stage_no = this.parent.stage_no;

	// ステージに該当するメッセージ一覧を取得
	var message_list = Message[stage_no - 1];

	// ランダムに1つ取得
	var message = message_list[Math.floor(Math.random() * message_list.length)];

	return {
		chara: message[0],
		message: message[1],
	};
};





module.exports = SceneStageResultClear;
