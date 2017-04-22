'use strict';
var CONSTANT = require('../../constant');
var base_object = require('./block_base');
var util = require('../../hakurei').util;

var BlockStone2 = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(BlockStone2, base_object);

BlockStone2.prototype.spriteIndices = function(){
	return [{x: 1, y: 0}];
};

module.exports = BlockStone2;
