'use strict';


// TODO: createStageResultObject 実装したい
var base_class = require('./hakurei').storage.save;
var util = require('./hakurei').util;
var CONSTANT = require('./constant');

var StorageSave = function(scene) {
	base_class.apply(this, arguments);
};
util.inherit(StorageSave, base_class);

// 通常ストーリーの進捗を +1
StorageSave.prototype.incrementNormalStageProgress = function(){
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
StorageSave.prototype.getNormalStageProgress = function(){
	return this.get("normal_stage_progress");
};
// 通常ストーリーを進捗を削除
StorageSave.prototype.resetNormalStageProgress = function(){
	return this.remove("normal_stage_progress");
};

// Ex ストーリーの進捗を +1
StorageSave.prototype.incrementExStageProgress = function(){
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
StorageSave.prototype.getExStageProgress = function(){
	return this.get("ex_stage_progress");
};
// Ex ストーリーを進捗を削除
StorageSave.prototype.resetExStageProgress = function(){
	return this.remove("ex_stage_progress");
};

// 通常ストーリーを1度でもクリアしたことを設定
StorageSave.prototype.clearNormalStage = function(){
	this.set("is_normal_stage_cleared", true);
};
// 通常ストーリーを1度でもクリアしたか否かを取得
StorageSave.prototype.getIsNormalStageCleared = function(){
	return this.get("is_normal_stage_cleared");
};

// Exストーリーを1度でもクリアしたことを設定
StorageSave.prototype.clearExStage = function(){
	this.set("is_ex_stage_cleared", true);
};
// Exストーリーを1度でもクリアしたか否かを取得
StorageSave.prototype.getIsExStageCleared = function(){
	return this.get("is_ex_stage_cleared");
};





// ステージ実績の一覧を取得
StorageSave.prototype.getStageResultList = function(){
	var list = this.get("stage_result_list");

	if(!list) list = [];

	return list;
};

// 対象のステージ実績を取得
StorageSave.prototype.getStageResult = function(stage_no){
	var list = this.getStageResultList();

	return list[stage_no - 1];
};

// 最新のステージ実績を取得
StorageSave.prototype.getLatestStageResult = function(){
	var list = this.getStageResultList();

	if (list.length === 0) {
		return null;
	}

	return list[list.length - 1];
};

// 対象のステージ実績を更新
StorageSave.prototype.updateStageResult = function(stage_no, time, exchange_num){
	stage_no -= 1; // 配列なので 0 から
	var list = this.getStageResultList();

	// 初期化
	if(!list[stage_no]) {
		list[stage_no] = {
			stage_no: stage_no + 1, // -1 しちゃったのでここだけ正常なstage noに戻す
			time:         null, // クリア時刻
			exchange_num: null, // 使用 交換回数
		};
	}

	// クリア時刻が早ければ更新
	if(list[stage_no].time === null || list[stage_no].time > time) {
		list[stage_no].time = time;
	}

	// 交換回数が少なければ更新
	if(list[stage_no].exchange_num === null || list[stage_no].exchange_num > exchange_num) {
		list[stage_no].exchange_num = exchange_num;
	}

	// セーブ
	this.set("stage_result_list", list);
};

// 通常ストーリーの実績を全て解放
StorageSave.prototype.clearNormalStageForDebug = function(){
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
StorageSave.prototype.clearExStageForDebug = function(){
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

module.exports = StorageSave;
