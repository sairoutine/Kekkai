'use strict';
var base_object = require('../hakurei').object.sprite;
var util = require('../hakurei').util;

var AlterEgo = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(AlterEgo, base_object);

AlterEgo.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.x = x;
	this.y = y;
};

AlterEgo.prototype.beforeDraw = function(){
	base_object.prototype.beforeDraw.apply(this, arguments);
};

AlterEgo.prototype.spriteName = function(){
	return "alterego";
};
AlterEgo.prototype.spriteIndices = function(){
	return [{x: 0, y: 0}];
};
AlterEgo.prototype.spriteWidth = function(){
	return 200;
};
AlterEgo.prototype.spriteHeight = function(){
	return 200;
};
AlterEgo.prototype.scaleWidth = function(){
	return 0.2;
};
AlterEgo.prototype.scaleHeight = function(){
	return 0.2;
};

module.exports = AlterEgo;
