'use strict';
var CONSTANT = require('../../constant');
var base_object = require('./block_base');
var util = require('../../hakurei').util;

var BlockStone3 = function (scene) {
	base_object.apply(this, arguments);

	// 種類
	this.type = CONSTANT.BLOCK_STONE3;
};
util.inherit(BlockStone3, base_object);

BlockStone3.prototype.spriteIndices = function(){
	return [{x: 0, y: 0}];
};
BlockStone3.prototype.spriteName = function(){
	return "tile_gray";
};


module.exports = BlockStone3;
