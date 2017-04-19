'use strict';
var CONSTANT = require('../../constant');
var base_object = require('./block_base');
var util = require('../../hakurei').util;

var BlockGreen = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(BlockGreen, base_object);

BlockGreen.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.x = x;
	this.y = y;

	this.is_show = true;
};

BlockGreen.prototype.spriteIndices = function(){
	return [{x: 3, y: 0}];
};


BlockGreen.prototype.fall = function(){
	this.is_show = false;
};

BlockGreen.prototype.isShow = function() {
	return this.is_show;
};
module.exports = BlockGreen;
