'use strict';
var base_object = require('../../hakurei').object.base;
var util = require('../../hakurei').util;

var BlockBase = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(BlockBase, base_object);

BlockBase.prototype.collisionWidth = function() {
	return 16;
};
BlockBase.prototype.collisionHeight = function() {
	return 48;
};



module.exports = BlockBase;
