'use strict';

var util = require('../hakurei').util;
var H_CONSTANT = require('../hakurei').constant;
var CONSTANT = require('../constant');

var BackGroundEye  = require('../object/background_eye');
var LogicScore = require('../logic/score');
var LogicCreateMap = require('../logic/create_map');

var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;
var SceneStageBeforeTalk         = require("./stage/before_talk");
var SceneStageAfterTalk          = require("./stage/after_talk");
var SceneStagePlay               = require("./stage/play");
var SceneStageResultClearByStory = require("./stage/result_clear_by_story");
var SceneStageResultClearBySelect= require("./stage/result_clear_by_select");
var ScenePause                   = require("./stage/pause");


var StageConfig = require('../stage_config');
var MAPS = StageConfig.MAPS;
var SERIF_BEFORES = StageConfig.SERIF_BEFORES;
var SERIF_AFTERS = StageConfig.SERIF_AFTERS;
var EYES_NUM = StageConfig.EYES_NUM;

var SceneStage = function(core) {
	base_scene.apply(this, arguments);

	this.addSubScene("talk",                  new SceneStageBeforeTalk(core, this));
	this.addSubScene("after_talk",            new SceneStageAfterTalk(core, this));
	this.addSubScene("play",                  new SceneStagePlay(core, this));
	this.addSubScene("result_clear_by_story", new SceneStageResultClearByStory(core, this));
	this.addSubScene("result_clear_by_select",new SceneStageResultClearBySelect(core, this));
	this.addSubScene("pause",                 new ScenePause(core, this));
};
util.inherit(SceneStage, base_scene);

SceneStage.prototype.init = function(stage_no, sub_scene, is_play_bgm, is_from_select_scene){
	base_scene.prototype.init.apply(this, arguments);

	// stage no
	this.stage_no = stage_no || 1;

	// デフォルトは talk シーンから開始
	if(!sub_scene) sub_scene = "talk";

	this.is_play_bgm = is_play_bgm ? true : false;
	if(this.is_play_bgm) {
		this.core.stopBGM();
	}

	// ステージセレクトから遷移したのか、ストーリーから遷移したのか
	this.is_from_select_scene = is_from_select_scene ? true : false;

	this.reimu_item_num = 0;
	this.yukari_item_num = 0;

	// 背景の眼
	this.eyes = [];

	// このマップでの位置交代可能回数
	this.max_exchange_num = MAPS[this.stage_no].exchange_num;

	// 位置交代が垂直か水平か(true: 垂直, false: 水平)
	this._is_vertical = MAPS[this.stage_no].is_vertical;

	// タイルの種類毎のオブジェクトの配列
	this.objects_by_tile_type = null;

	// 背景の目玉を作成
	//this.createBackGroundEyes();

	// マップデータが正しいかチェック
	if (CONSTANT.DEBUG.ON) {
		this.checkValidMap(MAPS[this.stage_no].map);
	}
	// マップデータからオブジェクト生成
	this.parseAndCreateMap(MAPS[this.stage_no].map);

	// ステージ内で集めないといけないアイテム数
	this.max_item_num = this.calcItemNum();

	// 会話シーン
	if(sub_scene === "talk") {
		this.changeSubScene("talk", SERIF_BEFORES[this.stage_no]);
	}
	else {
		this.changeSubScene(sub_scene);
	}
};
SceneStage.prototype.beforeDraw = function(){
	/* 基底クラスの beforeDraw 処理 start */
	this.frame_count++;

	// go to next sub scene if next scene is set
	this.changeNextSubSceneIfReserved();

	if(this.currentSubScene()) this.currentSubScene().beforeDraw();
	/* 基底クラスの beforeDraw 処理 end */

	// サブオブジェクトのbeforeDraw は sub scene play の中でやっている

	if(this.is_play_bgm && this.frame_count === 60) {
		this.core.playBGM('stage_a');
	}
};

SceneStage.prototype.notifyPlayerDie = function(){
	// 当該ステージの最初から
	this.notifyRestart();
};
// ポーズ画面から、restart
SceneStage.prototype.notifyRestart = function(){
	this.core.changeScene("stage", this.stage_no, "play", false, this.is_from_select_scene);
};
// ポーズ画面から、quit
SceneStage.prototype.notifyQuit = function(){
	// ストーリー中ならばタイトル画面へ
	if (!this.is_from_select_scene) {
		this.core.changeScene("title");
	}
	// セレクト画面からプレイしたならセレクト画面へ
	else {
		this.core.changeScene("select");
	}
};

SceneStage.prototype.notifyStageClear = function(){
	// (ストーリー／セレクト両方) ステージ実績に更新があればセーブ
	this.core.save.updateStageResult(this.stage_no, this.getSubScene("play").frame_count, this.player().exchange_num);

	// ストーリー中かつ
	if (!this.is_from_select_scene) {
		// 通常ストーリーならば
		if(!this.isInExStory()) {
			/// 通常ストーリー進捗を更新
			this.core.save.incrementNormalStageProgress();

			// 通常ストーリーの最後ならば
			if (this.isLastNormalStory()) {
				// 進捗をリセット
				this.core.save.resetNormalStageProgress();

				// Ex ストーリー解放
				this.core.save.clearNormalStage();
			}

		}
		// Ex ストーリーならば
		else {
			/// Ex ストーリー進捗を更新
			this.core.save.incrementExStageProgress();

			// Ex ストーリーの最後ならば
			if (this.isLastExStory()) {
				// 進捗をリセット
				this.core.save.resetExStageProgress();

				// Ex ストーリー クリア フラグON
				this.core.save.clearExStage();
			}
		}
	}

	this.core.save.save();

	// セレクト画面からプレイしたなら
	if (this.is_from_select_scene) {
		this.changeSubScene("result_clear_by_select");
	}
	// ストーリーモードでプレイしたなら
	else {
		this.changeSubScene("result_clear_by_story");
	}
};
// ストーリー: クリア後のリザルト画面終了後
SceneStage.prototype.notifyResultClearEndByStory = function(){
	// 終了後のセリフがある場合
	if (SERIF_AFTERS[this.stage_no].length > 0) {
		this.changeSubScene("after_talk", SERIF_AFTERS[this.stage_no]);
	}
	// 終了後のセリフがない場合
	else {
		this.notifyAfterTalkEnd();
	}
};

// セレクト: クリア後のリザルト画面終了後
SceneStage.prototype.notifyResultClearEndBySelect = function(){
	this.core.changeScene("select", this.stage_no);
};

// ステージクリア
SceneStage.prototype.notifyAfterTalkEnd = function() {
	// 通常ストーリークリア後
	if (this.isLastNormalStory()) {
		// フェードアウトして終了
		this.setFadeOut(60, 'white');
		// 次のシーンへ
		this.core.changeScene("after_normal");
	}
	// Exステージクリア後
	else if (this.isLastExStory()) {
		// 次のシーンへ
		this.core.changeScene("after_ex");
	}
	// 次のステージへ
	else {
		this.core.changeScene("stage", this.stage_no + 1);
	}
};
// ノーマルステージの最終ステージかどうか
SceneStage.prototype.isLastNormalStory = function() {
	return this.stage_no === (CONSTANT.EX_STORY_START_STAGE_NO - 1) ? true : false;
};
// Exステージの最終ステージかどうか
SceneStage.prototype.isLastExStory = function() {
	return MAPS[this.stage_no + 1] ? false : true;
};
// Ex ストーリーのステージかどうか
SceneStage.prototype.isInExStory = function() {
	return this.stage_no >= CONSTANT.EX_STORY_START_STAGE_NO ? true : false;
};


// プレイヤー(1ステージにプレイヤーは1人の想定)
SceneStage.prototype.player = function () {
	return this.objects_by_tile_type[ CONSTANT.PLAYER ][0];
};
// ステージをクリアしたかどうか
SceneStage.prototype.isClear = function () {
	return(this.reimu_item_num + this.yukari_item_num >= this.max_item_num ? true : false);
};

// 位置移動が垂直かどうか
SceneStage.prototype.isVertical = function () {
	return this._is_vertical;
};

// 位置移動の垂直<=>水平の変更
SceneStage.prototype.exchangeVertical = function () {
	this._is_vertical = !this._is_vertical;
};





SceneStage.prototype.draw = function() {
	var ctx = this.core.ctx;

	// background
	ctx.save();

	var bg = this.core.image_loader.getImage(this.getBGImageName());
	var cpt = ctx.createPattern(bg, "repeat");

	ctx.fillStyle = cpt;
	ctx.translate(-this.core.frame_count%103,-103 + this.core.frame_count%103);
	ctx.fillRect(0, 0, 1648, 1648);
	ctx.restore();

	// stage background
	LogicCreateMap.drawBackground(ctx, this.core.image_loader.getImage("bg"), CONSTANT.STAGE_OFFSET_X, CONSTANT.STAGE_OFFSET_Y);

	// ステージNo.
	ctx.save();
	ctx.fillStyle = 'rgb( 255, 255, 255 )';
	ctx.font = "24px 'PixelMplus'";
	ctx.textAlign = 'right';
	ctx.fillText("ステージ: " + this.stage_no, this.core.width - 30, 30);
	ctx.restore();

	ctx.save();

	// 眼を描画
	for(var h = 0, len1 = this.eyes.length; h < len1; h++) {
		this.eyes[h].draw();
	}

	// タイル毎に順番にレンダリング
	for (var i = 0; i < CONSTANT.RENDER_SORT.length; i++) {
		var tile = CONSTANT.RENDER_SORT[i];
		for(var j = 0, len = this.objects_by_tile_type[tile].length; j < len; j++) {
			this.objects_by_tile_type[tile][j].draw();
		}
	}

	// ステージ枠を描画
	LogicCreateMap.drawFrames(this, CONSTANT.STAGE_OFFSET_X, CONSTANT.STAGE_OFFSET_Y);

	// draw sub scene
	if(this.currentSubScene()) this.currentSubScene().draw();
};

// 霊夢用アイテム獲得
SceneStage.prototype.addReimuItemNum = function () {
	this.reimu_item_num += 1;
};
// 紫用アイテム獲得
SceneStage.prototype.addYukariItemNum = function () {
	this.yukari_item_num += 1;
};

// マップデータが正しいか確認する
SceneStage.prototype.checkValidMap = function(map) {
	if (map.length !== CONSTANT.STAGE_TILE_Y_NUM) {
		window.alert("マップの縦が20行である必要があります。");
	}

	var is_exists_player = false;
	for (var pos_y = 0; pos_y < map.length; pos_y++) {
		var line = map[pos_y];

		if (line.length !== CONSTANT.STAGE_TILE_X_NUM) {
			window.alert("マップの縦が30行である必要があります。");
		}

		for (var pos_x = 0; pos_x < line.length; pos_x++) {
			var tile = line[pos_x];
			if (tile === CONSTANT.PLAYER) is_exists_player = true;
		}
	}

	if(!is_exists_player) {
		window.alert("このマップではプレイヤーの位置が定義されていません。");
	}
};

SceneStage.prototype.parseAndCreateMap = function(map) {
	this.objects_by_tile_type = LogicCreateMap.exec(this, map, CONSTANT.STAGE_OFFSET_X, CONSTANT.STAGE_OFFSET_Y);


	for (var key in this.objects_by_tile_type) {
		this.addObjects(this.objects_by_tile_type[key]);
	}
};

SceneStage.prototype.createBackGroundEyes = function() {
	var width = CONSTANT.TILE_SIZE * CONSTANT.STAGE_TILE_X_NUM;
	var height = CONSTANT.TILE_SIZE * CONSTANT.STAGE_TILE_Y_NUM;

	for (var i = 0; i < EYES_NUM[this.stage_no]; i++) {
		var x = CONSTANT.STAGE_OFFSET_X + Math.floor(Math.random() * width);
		var y = CONSTANT.STAGE_OFFSET_Y + Math.floor(Math.random() * height);

		var instance = new BackGroundEye(this);
		instance.init(x, y);
		this.eyes.push(instance);
	}
};


SceneStage.prototype.calcItemNum = function() {
	return this.objects_by_tile_type[CONSTANT.ITEM_FOR_REIMU].length + this.objects_by_tile_type[CONSTANT.ITEM_FOR_YUKARI].length;
};

SceneStage.prototype.calcHonor = function() {
	return LogicScore.calcHonor(
		this.getSubScene("play").frame_count,
		this.player().exchange_num,
		// TODO: 各マップから取得する
		100,
		1
	);
};

// ステージ背景画像名
SceneStage.prototype.getBGImageName = function() {
	if (this.stage_no <= 10) {
		return "stage_bg01";
	}
	else if (10 < this.stage_no && this.stage_no <= 20) {
		return "stage_bg02";
	}
	else if (20 < this.stage_no && this.stage_no <= 30) {
		return "stage_bg03";
	}
	else if (30 < this.stage_no && this.stage_no <= 40) {
		return "stage_bg04";
	}
	else {
		// ここにくることはないはず
		return "stage_bg01";
	}
};

SceneStage.prototype.clearStageForDebug = function () {
	// サブシーンがゲームの操作できるシーンならば
	if(this.currentSubScene() instanceof SceneStagePlay) {
		// 御札獲得数を強制的にMAXにする
		this.reimu_item_num = this.max_item_num - this.yukari_item_num;
	}
};

module.exports = SceneStage;
