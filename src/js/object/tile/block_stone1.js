'use strict';
var CONSTANT = require('../../constant');
var base_object = require('./block_base');
var util = require('../../hakurei').util;

var BlockStone1 = function (scene) {
	base_object.apply(this, arguments);

	// 種類
	this.type = CONSTANT.BLOCK_STONE1;
};
util.inherit(BlockStone1, base_object);

BlockStone1.prototype.spriteIndices = function(){
	return [{x: 0, y: 0}];
};
BlockStone1.prototype.spriteName = function(){
	return "tile_gray";
};

module.exports = BlockStone1;
