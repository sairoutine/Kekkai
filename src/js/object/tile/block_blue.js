'use strict';
var CONSTANT = require('../../constant');
var base_object = require('./block_base');
var util = require('../../hakurei').util;

var BlockGreen = function (scene) {
	base_object.apply(this, arguments);
	// 種類
	this.type = CONSTANT.BLOCK_BLUE;
};
util.inherit(BlockGreen, base_object);

BlockGreen.prototype.spriteIndices = function(){
	return [{x: 5, y: 0}];
};


module.exports = BlockGreen;
