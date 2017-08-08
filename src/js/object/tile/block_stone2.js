'use strict';
var CONSTANT = require('../../constant');
var base_object = require('./block_base');
var util = require('../../hakurei').util;

var BlockStone2 = function (scene) {
	base_object.apply(this, arguments);

	// 種類
	this.type = CONSTANT.BLOCK_STONE2;
};
util.inherit(BlockStone2, base_object);

BlockStone2.prototype.spriteIndices = function(){
	return [{x: 0, y: 0}];
};
BlockStone2.prototype.spriteName = function(){
	if (this.scene.isInExStory()) {
		return "tile_red";
	}
	else {
		return "tile_gray";
	}
};

module.exports = BlockStone2;
