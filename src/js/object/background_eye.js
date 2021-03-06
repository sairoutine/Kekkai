'use strict';
var base_object = require('../hakurei').object.sprite;
var util = require('../hakurei').util;

var BackGroundEye = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(BackGroundEye, base_object);

BackGroundEye.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.x(x);
	this.y(y);
};

BackGroundEye.prototype.spriteName = function(){
	return "stage_tile_24";
};
BackGroundEye.prototype.spriteIndices = function(){
	return [{x: 0, y: 1}];
};
BackGroundEye.prototype.spriteWidth = function(){
	return 24;
};
BackGroundEye.prototype.spriteHeight = function(){
	return 24;
};
module.exports = BackGroundEye;
