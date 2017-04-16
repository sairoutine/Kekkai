'use strict';
var CONSTANT = require('../../constant');
var base_object = require('../../hakurei').object.sprite;
var util = require('../../hakurei').util;

var Enemy = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(Enemy, base_object);

Enemy.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.x = x;
	this.y = y;

	this.is_left = false;
};

// sprite configuration

Enemy.prototype.spriteName = function(){
	return "enemy";
};
Enemy.prototype.spriteIndices = function(){
	return [{x: 0, y: 2}, {x: 1, y: 2}, {x: 2, y: 2}];
};

Enemy.prototype.spriteAnimationSpan = function(){
	return 10;
};



Enemy.prototype.spriteWidth = function(){
	return 32;
};
Enemy.prototype.spriteHeight = function(){
	return 32;
};
Enemy.prototype.scaleWidth = function(){
	return 0.75;
};
Enemy.prototype.scaleHeight = function(){
	return 0.75;
};
module.exports = Enemy;
