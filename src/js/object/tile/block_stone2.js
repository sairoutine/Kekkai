'use strict';
var CONSTANT = require('../../constant');
var base_object = require('./block_base');
var util = require('../../hakurei').util;

var BlockStone2 = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(BlockStone2, base_object);

BlockStone2.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.x = x;
	this.y = y;
};

BlockStone2.prototype.spriteIndices = function(){
	return [{x: 2, y: 0}];
};

module.exports = BlockStone2;
