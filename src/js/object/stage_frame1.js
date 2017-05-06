'use strict';
/* ステージ枠(縦横) */

var base_object = require('../hakurei').object.sprite;
var util = require('../hakurei').util;

var BackGroundEye = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(BackGroundEye, base_object);

BackGroundEye.prototype.init = function(x, y, is_vertical) {
	base_object.prototype.init.apply(this, arguments);
	this.x(x);
	this.y(y);
	this.is_vertical = is_vertical;
};

BackGroundEye.prototype.draw = function(x, y, is_vertical) {
	this.init(x, y, is_vertical);
	base_object.prototype.draw.apply(this, arguments);
};

BackGroundEye.prototype.spriteName = function(){
	return "stage_tile_24";
};
BackGroundEye.prototype.spriteIndices = function(){
	return [{x: 0, y: 0}];
};
BackGroundEye.prototype.spriteWidth = function(){
	return 24;
};
BackGroundEye.prototype.spriteHeight = function(){
	return 24;
};
BackGroundEye.prototype.rotateAdjust = function(){
	return this.is_vertical ? 90 : 0;
};



module.exports = BackGroundEye;
