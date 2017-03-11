'use strict';

	var offset_x = 25;
	var offset_y = 50;

var util = require('../hakurei').util;
var CONSTANT = require('../constant');

var BlockGreen  = require('../object/tile/block_green');
var BlockBlue   = require('../object/tile/block_blue');
var BlockRed    = require('../object/tile/block_red');
var BlockPurple = require('../object/tile/block_purple');
var BlockBrown  = require('../object/tile/block_brown');
var Ladder      = require('../object/tile/ladder');
var Player      = require('../object/tile/player');
var Enemy       = require('../object/tile/enemy');
var Item        = require('../object/tile/item');


var TILE_TYPE_TO_CLASS = {
	//0: BackGround
	1: BlockGreen,
	2: BlockBlue,
	3: BlockRed,
	4: BlockPurple,
	5: BlockBrown,
	6: Ladder,
	7: Player,
	8: Enemy,
	9: Item,
};


var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;
var SceneStageTalk = require("./stage/talk");
var SceneStagePlay = require("./stage/play");
var stage1_map = require("./map/stage1");

var SceneStage = function(core) {
	base_scene.apply(this, arguments);

	this.addSubScene("talk", new SceneStageTalk(core, this));
	this.addSubScene("play", new SceneStagePlay(core, this));
};
util.inherit(SceneStage, base_scene);

SceneStage.prototype.init = function(){
	base_scene.prototype.init.apply(this, arguments);

	this.parseAndCreateMap(stage1_map);
};
SceneStage.prototype.beforeDraw = function(){
	base_scene.prototype.beforeDraw.apply(this, arguments);
	if(this.frame_count === 2) {
		this.changeSubScene("talk");
	}

};
SceneStage.prototype.draw = function() {
	var ctx = this.core.ctx;

	ctx.save();

	// background
	ctx.fillStyle = util.hexToRGBString("EEEEEE");
	ctx.fillRect(0, 0, this.core.width, this.core.height);

	ctx.restore();

	ctx.save();

	ctx.fillStyle = util.hexToRGBString("DDDDDD");
	ctx.fillRect(
		offset_x, offset_y,
		CONSTANT.TILE_SIZE * 30, CONSTANT.TILE_SIZE * 20
	);
	ctx.restore();

	ctx.save();

	base_scene.prototype.draw.apply(this, arguments);
};
SceneStage.prototype.parseAndCreateMap = function(map) {
	var stage = stage1_map;

	for (var pos_y = 0; pos_y < map.length; pos_y++) {
		var line = stage[pos_y];
		for (var pos_x = 0; pos_x < line.length; pos_x++) {
			var tile = line[pos_x];
			var x = pos_x * CONSTANT.TILE_SIZE + offset_x;
			var y = pos_y * CONSTANT.TILE_SIZE + offset_y;

			var Class = TILE_TYPE_TO_CLASS[ tile ];
			if(Class) {
				var instance = new Class(this);
				instance.init(x, y);
				this.addObject(instance);
			}
		}
	}
};

module.exports = SceneStage;
