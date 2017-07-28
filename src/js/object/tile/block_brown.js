'use strict';

/* 乗ると消えるブロック */


// 消えるまでの時間
var FALL_SPAN = 20;


var CONSTANT = require('../../constant');
var base_object = require('./block_base');
var util = require('../../hakurei').util;

var BlockGreen = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(BlockGreen, base_object);

BlockGreen.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.start_fall_frame = 0;
	this.is_show = true;
	this.is_collision = true;
};

BlockGreen.prototype.spriteIndices = function(){
	return [{x: 1, y: 0}];
};

BlockGreen.prototype.beforeDraw = function() {
	base_object.prototype.beforeDraw.apply(this, arguments);
	if(this.start_fall_frame && (FALL_SPAN - this.frame_count + this.start_fall_frame <= 0) ) {
		this.is_show = false;

		// reset
		this.start_fall_frame = 0;
	}
};

BlockGreen.prototype.draw = function() {
	var ctx = this.core.ctx;
	ctx.globalAlpha = 0.5;
	base_object.prototype.draw.apply(this, arguments);
	ctx.globalAlpha = 1.0;
};


BlockGreen.prototype.fall = function(){
	this.start_fall_frame = this.frame_count;
	this.is_collision = false;
};

BlockGreen.prototype.isShow = function() {
	return this.is_show;
};
BlockGreen.prototype.isCollision = function() {
	return this.is_collision;
};

BlockGreen.prototype.scaleWidth = function(){
	var base_scale = base_object.prototype.scaleWidth.apply(this, arguments);
	if (this.start_fall_frame) {
		return(base_scale *  (FALL_SPAN - (this.frame_count - this.start_fall_frame)) / FALL_SPAN );
	}
	else {
		return base_scale;
	}
};
BlockGreen.prototype.scaleHeight = function(){
	var base_scale = base_object.prototype.scaleHeight.apply(this, arguments);

	if (this.start_fall_frame) {
		return(base_scale *  (FALL_SPAN - (this.frame_count - this.start_fall_frame)) / FALL_SPAN );
	}
	else {
		return base_scale;
	}
};




module.exports = BlockGreen;
