'use strict';
var base_class = require('./hakurei').storage.save;
var util = require('./hakurei').util;

var StorageSave = function(scene) {
	base_class.apply(this, arguments);
};
util.inherit(StorageSave, base_class);

// 通常ストーリークリアしたことを設定
StorageSave.prototype.clearNormalStage = function(){
	this.set("is_normal_stage_cleared", true);
};
// 通常ストーリークリアしたか否かを取得
StorageSave.prototype.getIsNormalStageCleared = function(){
	return this.get("is_normal_stage_cleared");
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





module.exports = StorageSave;
