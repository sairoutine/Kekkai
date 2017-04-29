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
	return "stage_tile_24";
};
Death.prototype.spriteIndices = function(){
	return [{x: 2, y: 0}];
};
Death.prototype.spriteWidth = function(){
	return 24;
};
Death.prototype.spriteHeight = function(){
	return 24;
};
module.exports = Death;
