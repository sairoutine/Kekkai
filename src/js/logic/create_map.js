'use strict';

/* マップ内の各種オブジェクトを生成 */
var CONSTANT = require('../constant');

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

var LogicScore = require('../logic/score');

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

// 静的クラス
var CreateMap = function() {};

// 初期化
CreateMap._initializeObjectsByTileType = function () {
	var data = {};

	for (var tile_type in TILE_TYPE_TO_CLASS) {
		data[ tile_type ] = [];
	}

	return data;
};

// 実行
CreateMap.exec = function (scene, map, offset_x, offset_y, scale) {
	scale = scale || 1;

	var tile_size = CONSTANT.TILE_SIZE * scale;

	// 初期化
	var objects_by_tile_type = this._initializeObjectsByTileType();

	for (var pos_y = 0; pos_y < map.length; pos_y++) {
		var line = map[pos_y];
		for (var pos_x = 0; pos_x < line.length; pos_x++) {
			var tile = line[pos_x];
			var x = pos_x * tile_size + offset_x + tile_size/2;
			var y = pos_y * tile_size + offset_y + tile_size/2;

			var Class = TILE_TYPE_TO_CLASS[ tile ];

			if(!Class) continue; // 何もタイルがなければ何も表示しない

			// シーンにオブジェクト追加
			var instance = new Class(scene);
			instance.init(x, y);

			// タイルの種類毎にオブジェクトを管理
			if(!objects_by_tile_type[ tile ]) objects_by_tile_type[ tile ] = []; //初期化
			objects_by_tile_type[ tile ].push(instance);
		}
	}

	return objects_by_tile_type;
};

module.exports = CreateMap;
