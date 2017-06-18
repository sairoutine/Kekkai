'use strict';

	var offset_x = 25;
	var offset_y = 50;


var util = require('../hakurei').util;
var CONSTANT = require('../constant');

var BackGroundEye  = require('../object/background_eye');
var StageFrame1  = require('../object/stage_frame1');
var StageFrame2  = require('../object/stage_frame2');

var BlockGreen    = require('../object/tile/block_green');
var BlockBlue     = require('../object/tile/block_blue');
var BlockRed      = require('../object/tile/block_red');
var BlockPurple   = require('../object/tile/block_purple');
var BlockBrown    = require('../object/tile/block_brown');
var Ladder        = require('../object/tile/ladder');
var Player        = require('../object/tile/player');
var Enemy         = require('../object/tile/enemy');
var EnemyVertical = require('../object/tile/enemy_vertical');
var ItemForReimu  = require('../object/tile/item_for_reimu');
var ItemForYukari = require('../object/tile/item_for_yukari');
var ItemOfExchange= require('../object/tile/item_of_exchange');
var Death         = require('../object/tile/death');
var BlockStone1   = require('../object/tile/block_stone1');
var BlockStone2   = require('../object/tile/block_stone2');
var BlockStone3   = require('../object/tile/block_stone3');

// tile_type => クラス名
var TILE_TYPE_TO_CLASS = {};
//TILE_TYPE_TO_CLASS[CONSTANT.BACKGROUND]  = BackGround;
TILE_TYPE_TO_CLASS[CONSTANT.BLOCK_GREEN]     = BlockGreen;
TILE_TYPE_TO_CLASS[CONSTANT.BLOCK_BLUE]      = BlockBlue;
TILE_TYPE_TO_CLASS[CONSTANT.BLOCK_RED]       = BlockRed;
TILE_TYPE_TO_CLASS[CONSTANT.BLOCK_PURPLE]    = BlockPurple;
TILE_TYPE_TO_CLASS[CONSTANT.BLOCK_BROWN]     = BlockBrown;
TILE_TYPE_TO_CLASS[CONSTANT.LADDER]          = Ladder;
TILE_TYPE_TO_CLASS[CONSTANT.PLAYER]          = Player;
TILE_TYPE_TO_CLASS[CONSTANT.ENEMY]           = Enemy;
TILE_TYPE_TO_CLASS[CONSTANT.ENEMY_VERTICAL]  = EnemyVertical;
TILE_TYPE_TO_CLASS[CONSTANT.ITEM_FOR_REIMU]  = ItemForReimu;
TILE_TYPE_TO_CLASS[CONSTANT.ITEM_FOR_YUKARI] = ItemForYukari;
TILE_TYPE_TO_CLASS[CONSTANT.ITEM_OF_EXCHANGE]= ItemOfExchange;
TILE_TYPE_TO_CLASS[CONSTANT.DEATH]           = Death;
TILE_TYPE_TO_CLASS[CONSTANT.BLOCK_STONE1]    = BlockStone1;
TILE_TYPE_TO_CLASS[CONSTANT.BLOCK_STONE2]    = BlockStone2;
TILE_TYPE_TO_CLASS[CONSTANT.BLOCK_STONE3]    = BlockStone3;


var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;
var SceneStageTalk           = require("./stage/talk");
var SceneStagePlay           = require("./stage/play");
var SceneStageResultClear    = require("./stage/result_clear");
var SceneStageResultGameOver = require("./stage/result_gameover");


var MAPS = [
	null,
	require("./map/stage01"),
	require("./map/stage02"),
	require("./map/stage03"),
	require("./map/stage04"),
	require("./map/stage05"),
	require("./map/stage06"),
	require("./map/stage07"),
	require("./map/stage08"),
	require("./map/stage09"),
	require("./map/stage10"),
	require("./map/stage11"),
	require("./map/stage12"),
	require("./map/stage13"),
	require("./map/stage14"),
	require("./map/stage15"),
	require("./map/stage16"),
	require("./map/stage17"),
	require("./map/stage18"),
	require("./map/stage19"),
	require("./map/stage20"),
	require("./map/stage07"),
	require("./map/stage07"),
	require("./map/stage07"),
	require("./map/stage07"),
	require("./map/stage07"),
	require("./map/stage07"),
	require("./map/stage07"),
	require("./map/stage07"),
	require("./map/stage07"),
	require("./map/stage07"),
	require("./map/stage07"),
	require("./map/stage07"),
	require("./map/stage07"),
	require("./map/stage07"),
	require("./map/stage07"),
	require("./map/stage07"),
	require("./map/stage07"),
	require("./map/stage07"),
	require("./map/stage07"),
	require("./map/stage07"),
];
var SERIF_BEFORES = [
	null,
	require("../logic/serif/stage01/before"),
	require("../logic/serif/stage02/before"),
	require("../logic/serif/stage03/before"),
	require("../logic/serif/stage04/before"),
	require("../logic/serif/stage05/before"),
	require("../logic/serif/stage06/before"),
	require("../logic/serif/stage07/before"),
	require("../logic/serif/stage08/before"),
	require("../logic/serif/stage09/before"),
	require("../logic/serif/stage10/before"),
	require("../logic/serif/stage11/before"),
	require("../logic/serif/stage12/before"),
	require("../logic/serif/stage13/before"),
	require("../logic/serif/stage14/before"),
	require("../logic/serif/stage15/before"),
	require("../logic/serif/stage16/before"),
	require("../logic/serif/stage17/before"),
	require("../logic/serif/stage18/before"),
	require("../logic/serif/stage19/before"),
	require("../logic/serif/stage20/before"),
	require("../logic/serif/stage21/before"),
	require("../logic/serif/stage22/before"),
	require("../logic/serif/stage23/before"),
	require("../logic/serif/stage24/before"),
	require("../logic/serif/stage25/before"),
	require("../logic/serif/stage26/before"),
	require("../logic/serif/stage27/before"),
	require("../logic/serif/stage28/before"),
	require("../logic/serif/stage29/before"),
	require("../logic/serif/stage30/before"),
	require("../logic/serif/stage31/before"),
	require("../logic/serif/stage32/before"),
	require("../logic/serif/stage33/before"),
	require("../logic/serif/stage34/before"),
	require("../logic/serif/stage35/before"),
	require("../logic/serif/stage36/before"),
	require("../logic/serif/stage37/before"),
	require("../logic/serif/stage38/before"),
	require("../logic/serif/stage39/before"),
	require("../logic/serif/stage40/before"),
];

var EYES_NUM = [
	null,
	0,
	1,
	3,
	4,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
];







var SceneStage = function(core) {
	base_scene.apply(this, arguments);

	this.addSubScene("talk",            new SceneStageTalk(core, this));
	this.addSubScene("play",            new SceneStagePlay(core, this));
	this.addSubScene("result_clear",    new SceneStageResultClear(core, this));
	this.addSubScene("result_gameover", new SceneStageResultGameOver(core, this));
};
util.inherit(SceneStage, base_scene);

SceneStage.prototype.init = function(stage_no, sub_scene, is_play_bgm){
	base_scene.prototype.init.apply(this, arguments);

	if (CONSTANT.DEBUG.START_STAGE_NO) {
		stage_no = CONSTANT.DEBUG.START_STAGE_NO;
	}

	// stage no
	this.stage_no = stage_no || 1;

	// デフォルトは talk シーンから開始
	if(!sub_scene) sub_scene = "talk";

	this.is_play_bgm = is_play_bgm ? true : false;
	if(this.is_play_bgm) {
		this.core.stopBGM();
	}

	this.reimu_item_num = 0;
	this.yukari_item_num = 0;

	// 背景の眼
	this.eyes = [];

	// このマップでの位置交代可能回数
	this.max_exchange_num = MAPS[this.stage_no].exchange_num;

	// 位置交代が垂直か水平か(true: 垂直, false: 水平)
	this._is_vertical = MAPS[this.stage_no].is_vertical;

	// タイルの種類毎のオブジェクトの配列
	this.objects_by_tile_type = this.initializeObjectsByTileType();

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
	base_scene.prototype.beforeDraw.apply(this, arguments);

	if(this.is_play_bgm && this.frame_count === 60) {
		this.core.playBGM('stage_a');
	}
};

SceneStage.prototype.notifyPlayerDie = function(){
	this.changeSubScene("result_gameover");
};
SceneStage.prototype.notifyStageClear = function(){
	this.changeSubScene("result_clear");
};


// ステージクリア
SceneStage.prototype.notifyClearEnd = function() {
	// 通常ストーリークリア後
	if (this.isLastNormalStory()) {
		this.core.changeScene("after_normal");
	}
	// Exステージクリア後
	else if (this.isLastExStory()) {
		this.core.changeScene("after_ex");
	}
	// 次のステージへ
	else {
		this.core.changeScene("stage", this.stage_no + 1);
	}
};
// ゲームオーバー後
SceneStage.prototype.notifyGameOverEnd = function() {
	// 当該ステージの最初から
	this.core.changeScene("stage", this.stage_no, "play");
};
// ノーマルステージの最終ステージかどうか
SceneStage.prototype.isLastNormalStory = function() {
	return this.stage_no === 5 ? true : false;
};
// Exステージの最終ステージかどうか
SceneStage.prototype.isLastExStory = function() {
	return MAPS[this.stage_no + 1] ? false : true;
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

	var bg = this.core.image_loader.getImage("stage_bg");
	var cpt = ctx.createPattern(bg, "repeat");

	ctx.fillStyle = cpt;
	ctx.translate(-this.frame_count%103,-103 + this.frame_count%103);
	ctx.fillRect(0, 0, 1648, 1648);
	ctx.restore();

	// stage background
	ctx.save();

	var bg2 = this.core.image_loader.getImage("bg");
	var cpt2 = ctx.createPattern(bg2, "repeat");

	ctx.fillStyle = cpt2;
	ctx.fillRect(
		offset_x, offset_y,
		CONSTANT.TILE_SIZE * 30, CONSTANT.TILE_SIZE * 20
	);
	ctx.restore();

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
	this.drawFrames();

	// draw sub scene
	if(this.currentSubScene()) this.currentSubScene().draw();
};

SceneStage.prototype.initializeObjectsByTileType = function () {
	var data = {};

	for (var tile_type in TILE_TYPE_TO_CLASS) {
		data[ tile_type ] = [];
	}

	return data;
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
	if (map.length !== 20) {
		window.alert("マップの縦が20行である必要があります。");
	}

	var is_exists_player = false;
	for (var pos_y = 0; pos_y < map.length; pos_y++) {
		var line = map[pos_y];
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
	var stage = map;


	for (var pos_y = 0; pos_y < map.length; pos_y++) {
		var line = stage[pos_y];
		for (var pos_x = 0; pos_x < line.length; pos_x++) {
			var tile = line[pos_x];
			var x = pos_x * CONSTANT.TILE_SIZE + offset_x + 12; // 12 = TILE TIP SIZE * 1.5 / 2
			var y = pos_y * CONSTANT.TILE_SIZE + offset_y + 12;

			var Class = TILE_TYPE_TO_CLASS[ tile ];

			if(!Class) continue; // 何もタイルがなければ何も表示しない

			// シーンにオブジェクト追加
			var instance = new Class(this);
			instance.init(x, y);
			this.addObject(instance);

			// タイルの種類毎にオブジェクトを管理
			if(!this.objects_by_tile_type[ tile ]) this.objects_by_tile_type[ tile ] = []; //初期化
			this.objects_by_tile_type[ tile ].push(instance);
		}
	}
};

SceneStage.prototype.drawFrames = function() {
	var x,y, is_vertical;

	var stage_frame1 = new StageFrame1(this);
	var stage_frame2 = new StageFrame2(this);

	for (var pos_y = 0; pos_y < 20-1; pos_y++) { //縦
		// 左
		x = offset_x;
		y = pos_y * CONSTANT.TILE_SIZE + (offset_y) + 24;

		is_vertical = true;
		stage_frame1.draw(x, y, is_vertical);

		// 右
		x = offset_x + CONSTANT.TILE_SIZE * 30;

		is_vertical = true;
		stage_frame1.draw(x, y, is_vertical);

	}
	for (var pos_x = 0; pos_x < 30-1; pos_x++) { // 横
		// 上
		x = pos_x * CONSTANT.TILE_SIZE + (offset_x) + 24;
		y = offset_y;

		is_vertical = false;
		stage_frame1.draw(x, y, is_vertical);

		// 下
		y = offset_y + CONSTANT.TILE_SIZE * 20;

		is_vertical = false;
		stage_frame1.draw(x, y, is_vertical);
	}

	// 角
	stage_frame2.draw(offset_x, offset_y, 270);
	stage_frame2.draw(offset_x+CONSTANT.TILE_SIZE*30, offset_y, 0);
	stage_frame2.draw(offset_x, offset_y+CONSTANT.TILE_SIZE*20, 180);
	stage_frame2.draw(offset_x+CONSTANT.TILE_SIZE*30, offset_y+CONSTANT.TILE_SIZE*20, 90);
};









SceneStage.prototype.createBackGroundEyes = function() {
	var width = CONSTANT.TILE_SIZE * 30;
	var height = CONSTANT.TILE_SIZE * 20;

	for (var i = 0; i < EYES_NUM[this.stage_no]; i++) {
		var x = offset_x + Math.floor(Math.random() * width);
		var y = offset_y + Math.floor(Math.random() * height);

		var instance = new BackGroundEye(this);
		instance.init(x, y);
		this.eyes.push(instance);
	}
};


SceneStage.prototype.calcItemNum = function() {
	return this.objects_by_tile_type[CONSTANT.ITEM_FOR_REIMU].length + this.objects_by_tile_type[CONSTANT.ITEM_FOR_YUKARI].length;
};





module.exports = SceneStage;
