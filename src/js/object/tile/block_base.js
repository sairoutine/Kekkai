'use strict';
var base_object = require('./tile_base');
var util = require('../../hakurei').util;

var BlockBase = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(BlockBase, base_object);

BlockBase.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.x(x);
	this.y(y);

	this.is_collision = true;
};
BlockBase.prototype.isBlock = function() {
	return true;
};

BlockBase.prototype.isCollision = function() {
	return this.is_collision;
};

BlockBase.prototype.collisionWidth = function() {
	return 24;
};
BlockBase.prototype.collisionHeight = function() {
	return 24;
};

// sprite configuration

BlockBase.prototype.spriteName = function(){
	return "block";
};
BlockBase.prototype.spriteIndices = function(){
	console.error("spriteIndices must be overwritten");
};
BlockBase.prototype.spriteWidth = function(){
	return 16;
};
BlockBase.prototype.spriteHeight = function(){
	return 16;
};
BlockBase.prototype.scaleWidth = function(){
	return this._scale * 1.5;
};
BlockBase.prototype.scaleHeight = function(){
	return this._scale * 1.5;
};





module.exports = BlockBase;
