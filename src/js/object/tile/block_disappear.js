'use strict';

/* 乗ると消えるブロック */


// 消えるまでの時間
var FALL_SPAN = 40;


var CONSTANT = require('../../constant');
var base_object = require('./block_base');
var util = require('../../hakurei').util;

var BlockDisappear = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(BlockDisappear, base_object);

BlockDisappear.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.start_fall_frame = 0;
	this.is_show = true;
	this.is_collision = true;
};

BlockDisappear.prototype.spriteIndices = function(){
	return [{x: 1, y: 0}];
};

BlockDisappear.prototype.beforeDraw = function() {
	base_object.prototype.beforeDraw.apply(this, arguments);
	if(this.start_fall_frame && (FALL_SPAN - this.frame_count + this.start_fall_frame <= 0) ) {
		this.is_show = false;

		// reset
		this.start_fall_frame = 0;
	}
};

BlockDisappear.prototype.fall = function(){
	this.start_fall_frame = this.frame_count;
	this.is_collision = false;
};

BlockDisappear.prototype.isShow = function() {
	return this.is_show;
};
BlockDisappear.prototype.isCollision = function() {
	return this.is_collision;
};
BlockDisappear.prototype.alpha = function() {
	var base_scale = 0.5;
	if (this.start_fall_frame) {
		return(base_scale *  (FALL_SPAN - (this.frame_count - this.start_fall_frame)) / FALL_SPAN );
	}
	else {
		return base_scale;
	}

};


module.exports = BlockDisappear;
