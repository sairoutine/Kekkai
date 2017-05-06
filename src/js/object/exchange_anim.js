'use strict';
var base_object = require('../hakurei').object.sprite;
var util = require('../hakurei').util;

var AlterEgo = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(AlterEgo, base_object);

AlterEgo.prototype.init = function(x, y, anim_span, is_yukari) {
	base_object.prototype.init.apply(this, arguments);
	this.x(x);
	this.y(y);
	this.is_yukari = is_yukari ? true : false;

	this.anim_span = anim_span;
};

AlterEgo.prototype.beforeDraw = function(){
	base_object.prototype.beforeDraw.apply(this, arguments);
};

AlterEgo.prototype.spriteName = function(){
	return "stage_tile_32";
};
AlterEgo.prototype.spriteIndices = function(){
	if (this.is_yukari) {
		return [
			{x: 0, y: 1}, {x: 1, y: 1},{x: 2, y: 1}, {x:3, y: 1}, {x:3, y: 1}, {x:4, y: 1}, {x:5, y: 1}, {x: 6, y:1},
			{x: 6, y: 3}, {x: 5, y: 3},{x: 4, y:3}, {x:3, y:3}, {x:3, y:3}, {x:2, y: 3}, {x:1, y: 3}, {x: 0, y:3},
		];
	}
	else {
		return [
			{x: 0, y: 3}, {x: 1, y: 3},{x: 2, y:3}, {x:3, y:3}, {x:3, y:3}, {x:4, y: 3}, {x:5, y: 3}, {x: 6, y:3},
			{x: 6, y: 1}, {x: 5, y: 1},{x: 4, y: 1}, {x:3, y: 1}, {x:3, y: 1}, {x:2, y: 1}, {x:1, y: 1}, {x: 0, y:1},
		];
	}
};
AlterEgo.prototype.spriteWidth = function(){
	return 32;
};
AlterEgo.prototype.spriteHeight = function(){
	return 32;
};
AlterEgo.prototype.spriteAnimationSpan = function(){
	return 5;
};


module.exports = AlterEgo;
