'use strict';

	var offset_x = 25;
	var offset_y = 50;

var MAX_REIMU_ITEM_NUM = 3;

var util = require('../hakurei').util;
var CONSTANT = require('../constant');

var BackGroundEye  = require('../object/background_eye');

var BlockGreen  = require('../object/tile/block_green');
var BlockBlue   = require('../object/tile/block_blue');
var BlockRed    = require('../object/tile/block_red');
var BlockPurple = require('../object/tile/block_purple');
var BlockBrown  = require('../object/tile/block_brown');
var Ladder      = require('../object/tile/ladder');
var Player      = require('../object/tile/player');
var Enemy       = require('../object/tile/enemy');
var Item        = require('../object/tile/item');
var Death       = require('../object/tile/death');
var BlockStone1 = require('../object/tile/block_stone1');
var BlockStone2 = require('../object/tile/block_stone2');
var BlockStone3 = require('../object/tile/block_stone3');

// tile_type => クラス名
var TILE_TYPE_TO_CLASS = {};
//TILE_TYPE_TO_CLASS[CONSTANT.BACKGROUND]  = BackGround;
TILE_TYPE_TO_CLASS[CONSTANT.BLOCK_GREEN]  = BlockGreen;
TILE_TYPE_TO_CLASS[CONSTANT.BLOCK_BLUE]   = BlockBlue;
TILE_TYPE_TO_CLASS[CONSTANT.BLOCK_RED]    = BlockRed;
TILE_TYPE_TO_CLASS[CONSTANT.BLOCK_PURPLE] = BlockPurple;
TILE_TYPE_TO_CLASS[CONSTANT.BLOCK_BROWN]  = BlockBrown;
TILE_TYPE_TO_CLASS[CONSTANT.LADDER]       = Ladder;
TILE_TYPE_TO_CLASS[CONSTANT.PLAYER]       = Player;
TILE_TYPE_TO_CLASS[CONSTANT.ENEMY]        = Enemy;
TILE_TYPE_TO_CLASS[CONSTANT.ITEM]         = Item;
TILE_TYPE_TO_CLASS[CONSTANT.DEATH]        = Death;
TILE_TYPE_TO_CLASS[CONSTANT.BLOCK_STONE1]       = BlockStone1;
TILE_TYPE_TO_CLASS[CONSTANT.BLOCK_STONE2]       = BlockStone2;
TILE_TYPE_TO_CLASS[CONSTANT.BLOCK_STONE3]       = BlockStone3;


var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;
var SceneStageTalk           = require("./stage/talk");
var SceneStagePlay           = require("./stage/play");
var SceneStageResultClear    = require("./stage/result_clear");
var SceneStageResultGameOver = require("./stage/result_gameover");
var stage1_map = require("./map/stage1");

var SceneStage = function(core) {
	base_scene.apply(this, arguments);

	this.addSubScene("talk",            new SceneStageTalk(core, this));
	this.addSubScene("play",            new SceneStagePlay(core, this));
	this.addSubScene("result_clear",    new SceneStageResultClear(core, this));
	this.addSubScene("result_gameover", new SceneStageResultGameOver(core, this));
};
util.inherit(SceneStage, base_scene);

SceneStage.prototype.init = function(){
	base_scene.prototype.init.apply(this, arguments);

	this.reimu_item_num = 0;

	// タイルの種類毎のオブジェクトの配列
	this.objects_by_tile_type = this.initializeObjectsByTileType();

	// 背景の目玉を作成
	this.createBackGroundEyes();

	// マップデータからオブジェクト生成
	this.parseAndCreateMap(stage1_map.map);

	// このマップでの位置交代可能回数
	this.max_exchange_num = stage1_map.exchange_num;

	// 会話シーン
	this.changeSubScene("talk");
};
SceneStage.prototype.beforeDraw = function(){
	base_scene.prototype.beforeDraw.apply(this, arguments);

	var self = this;

	var player = self.player();

};

SceneStage.prototype.notifyPlayerDie = function(){
	this.changeSubScene("result_gameover");
};
SceneStage.prototype.notifyStageClear = function(){
	this.changeSubScene("result_clear");
};


SceneStage.prototype.notifyClearEnd = function(){
	// TODO: ステージクリア
};
SceneStage.prototype.notifyGameOverEnd = function(){
	// TODO: ゲームオーバー終了
};




// プレイヤー(1ステージにプレイヤーは1人の想定)
SceneStage.prototype.player = function () {
	return this.objects_by_tile_type[ CONSTANT.PLAYER ][0];
};
// ステージをクリアしたかどうか
SceneStage.prototype.isClear = function () {
	return this.reimu_item_num >= MAX_REIMU_ITEM_NUM ? true : false;
};




SceneStage.prototype.draw = function() {
	var ctx = this.core.ctx;

	// background
	ctx.save();
	ctx.fillStyle = util.hexToRGBString("000000");
	ctx.fillRect(0, 0, this.core.width, this.core.height);
	ctx.restore();

	// stage background
	ctx.save();
	ctx.fillStyle = util.hexToRGBString("000000");
	ctx.fillRect(
		offset_x, offset_y,
		CONSTANT.TILE_SIZE * 30, CONSTANT.TILE_SIZE * 20
	);
	ctx.restore();

	// show exchange num
	ctx.save();
	var player = this.player();
	var num = this.player().remainExchangeNum();
	ctx.fillStyle = 'rgb( 255, 255, 255 )';
	ctx.textAlign = 'left';
	ctx.font = "18px 'PixelMplus'";
	ctx.fillText("交換可能数: " + num, 0, 20);
	ctx.restore();

	ctx.save();

	// タイル毎に順番にレンダリング

	for (var i = 0; i < CONSTANT.RENDER_SORT.length; i++) {
		var tile = CONSTANT.RENDER_SORT[i];
		for(var j = 0, len = this.objects_by_tile_type[tile].length; j < len; j++) {
			this.objects_by_tile_type[tile][j].draw();
		}
	}

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

SceneStage.prototype.createBackGroundEyes = function() {
	var width = this.width;
	var height = this.height;

	for (var i = 0; i < 10; i++) {
		var x = Math.floor(Math.random() * width);
		var y = Math.floor(Math.random() * height);

		var instance = new BackGroundEye(this);
		instance.init(x, y);
		this.addObject(instance);
	}
};








module.exports = SceneStage;
