'use strict';
var base_object = require('../hakurei').object.sprite;
var util = require('../hakurei').util;

var AlterEgo = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(AlterEgo, base_object);

AlterEgo.prototype.init = function(x, y, anim_span, is_yukari) {
	base_object.prototype.init.apply(this, arguments);
	this.x = x;
	this.y = y;
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
	var y = this.is_yukari ? 1 : 3;
	return [{x: 0, y: y}, {x: 1, y: y},{x: 2, y:y}, {x:3, y:y}, {x:4, y:y}, {x:5, y:y}];
};
AlterEgo.prototype.spriteWidth = function(){
	return 32;
};
AlterEgo.prototype.spriteHeight = function(){
	return 32;
};
AlterEgo.prototype.spriteAnimationSpan = function(){
	return 10;
};


module.exports = AlterEgo;
