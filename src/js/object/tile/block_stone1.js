'use strict';
var CONSTANT = require('../../constant');
var base_object = require('./block_base');
var util = require('../../hakurei').util;

var BlockStone1 = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(BlockStone1, base_object);

BlockStone1.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.x = x;
	this.y = y;
};

BlockStone1.prototype.spriteIndices = function(){
	return [{x: 0, y: 0}];
};

module.exports = BlockStone1;
