'use strict';

// セーブデータ ストーリー進捗

// TODO: createStageResultObject 実装したい
var base_class = require('../hakurei').storage.save;
var util = require('../hakurei').util;
var CONSTANT = require('../constant');
var LogicScore = require('../logic/score');

var StorageStory = function(scene) {
	base_class.apply(this, arguments);
};
util.inherit(StorageStory, base_class);

// 通常ストーリーの進捗を +1
StorageStory.prototype.incrementNormalStageProgress = function(){
	var progress = this.getNormalStageProgress();

	if (progress) {
		progress += 1;
	}
	else {
		progress = 1;
	}

	this.set("normal_stage_progress", progress);
};
// 通常ストーリーをどのステージまで進めているか取得
StorageStory.prototype.getNormalStageProgress = function(){
	return this.get("normal_stage_progress");
};
// 通常ストーリーを進捗を削除
StorageStory.prototype.resetNormalStageProgress = function(){
	return this.remove("normal_stage_progress");
};

// Ex ストーリーの進捗を +1
StorageStory.prototype.incrementExStageProgress = function(){
	var progress = this.getExStageProgress();

	if (progress) {
		progress += 1;
	}
	else {
		progress = CONSTANT.EX_STORY_START_STAGE_NO;
	}

	this.set("ex_stage_progress", progress);
};
// Ex ストーリーをどのステージまで進めているか取得
StorageStory.prototype.getExStageProgress = function(){
	return this.get("ex_stage_progress");
};
// Ex ストーリーを進捗を削除
StorageStory.prototype.resetExStageProgress = function(){
	return this.remove("ex_stage_progress");
};

// 通常ストーリーを1度でもクリアしたことを設定
StorageStory.prototype.clearNormalStage = function(){
	this.set("is_normal_stage_cleared", true);
};
// 通常ストーリーを1度でもクリアしたか否かを取得
StorageStory.prototype.getIsNormalStageCleared = function(){
	return this.get("is_normal_stage_cleared");
};

// Exストーリーを1度でもクリアしたことを設定
StorageStory.prototype.clearExStage = function(){
	this.set("is_ex_stage_cleared", true);
};
// Exストーリーを1度でもクリアしたか否かを取得
StorageStory.prototype.getIsExStageCleared = function(){
	return this.get("is_ex_stage_cleared");
};





// ステージ実績の一覧を取得
StorageStory.prototype.getStageResultList = function(){
	var list = this.get("stage_result_list");

	if(!list) list = [];

	return list;
};

// 対象のステージ実績を取得
StorageStory.prototype.getStageResult = function(stage_no){
	var list = this.getStageResultList();

	return list[stage_no - 1];
};

// 最新のステージ実績を取得
StorageStory.prototype.getLatestStageResult = function(){
	var list = this.getStageResultList();

	if (list.length === 0) {
		return null;
	}

	return list[list.length - 1];
};

// 対象のステージ実績を更新
StorageStory.prototype.updateStageResult = function(stage_no, time, exchange_num){
	stage_no -= 1; // 配列なので 0 から
	var list = this.getStageResultList();

	// ステージ実績がなければ現在の実績でハイスコアを更新
	if(!list[stage_no]) {
		list[stage_no] = {
			stage_no: stage_no + 1,     // -1 しちゃったのでここだけ正常なstage noに戻す
			time:         time,         // クリア時刻
			exchange_num: exchange_num, // 使用 交換回数
		};
	}
	else {
		// 以前のハイスコア
		var previous_honor_num = LogicScore.calcHonor(
			stage_no + 1,
			list[stage_no].time,
			list[stage_no].exchange_num
		);
		// 今回のスコア
		var next_honor_num = LogicScore.calcHonor(
			stage_no + 1,
			time,
			exchange_num
		);

		// ベストスコアであれば更新
		if(next_honor_num > previous_honor_num) {
			list[stage_no].time = time;
			list[stage_no].exchange_num = exchange_num;
		}
	}
	// セーブ
	this.set("stage_result_list", list);
};

// 通常ストーリーの実績を全て解放
StorageStory.prototype.clearNormalStageForDebug = function(){
	var list = this.getStageResultList();

	var last_stage_no = CONSTANT.EX_STORY_START_STAGE_NO - 1;

	for (var i = 0; i < last_stage_no; i++) {
		// 実績がないステージのみ解放
		if(!list[i]) {
			list[i] = {
				stage_no: i+1,
				time: 1,
				exchange_num: 1,
			};
		}
	}
	this.set("stage_result_list", list);

	// クリアフラグを立てる
	this.clearNormalStage();
	this.save();
};

// Exストーリーの実績を全て解放
StorageStory.prototype.clearExStageForDebug = function(){
	var list = this.getStageResultList();

	var begin_stage_no = CONSTANT.EX_STORY_START_STAGE_NO;

	for (var i = begin_stage_no - 1; i < 40; i++) { // TODO: 40固定なのを直す
		// 実績がないステージのみ解放
		if(!list[i]) {
			list[i] = {
				stage_no: i+1,
				time: 1,
				exchange_num: 1,
			};
		}
	}
	this.set("stage_result_list", list);

	// クリアフラグを立てる
	this.clearExStage();

	this.save();
};

module.exports = StorageStory;
