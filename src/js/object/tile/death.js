'use strict';
var CONSTANT = require('../../constant');
var base_object = require('../../hakurei').object.sprite;
var util = require('../../hakurei').util;

var Death = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(Death, base_object);

Death.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.x = x;
	this.y = y;
	this.is_show = true;
};

Death.prototype.isCollision = function() {
	return true;
};

// sprite configuration

Death.prototype.spriteName = function(){
	return "water";
};
Death.prototype.spriteIndices = function(){
	return [{x: 0, y: 0}];
};
Death.prototype.spriteWidth = function(){
	return 16;
};
Death.prototype.spriteHeight = function(){
	return 16;
};
Death.prototype.scaleWidth = function(){
	return 1.5;
};
Death.prototype.scaleHeight = function(){
	return 1.5;
};
module.exports = Death;
