'use strict';
var base_object = require('../hakurei').object.sprite;
var util = require('../hakurei').util;
var CONSTANT = require('../constant');

var AlterEgo = function (scene, parent) {
	base_object.apply(this, arguments);
};
util.inherit(AlterEgo, base_object);

AlterEgo.prototype.init = function(x, y, anim_span, chara_no) {
	base_object.prototype.init.apply(this, arguments);
	this.x(x);
	this.y(y);
	this.chara_no = chara_no;

	this.anim_span = anim_span;
};

AlterEgo.prototype.beforeDraw = function(){
	base_object.prototype.beforeDraw.apply(this, arguments);
};
AlterEgo.prototype.isReimu = function(){
	return this.chara_no === CONSTANT.REIMU_NO;
};
AlterEgo.prototype.isYukari = function(){
	return this.chara_no === CONSTANT.YUKARI_NO;
};
AlterEgo.prototype.isExReimu = function(){
	return this.chara_no === CONSTANT.EX_REIMU_NO;
};


AlterEgo.prototype.spriteName = function(){
	return "stage_tile_32";
};
AlterEgo.prototype.spriteIndices = function(){
	// 紫
	if (this.isYukari()) {
		return [
			{x: 0, y: 1}, {x: 1, y: 1},{x: 2, y: 1}, {x:3, y: 1}, {x:3, y: 1}, {x:4, y: 1}, {x:5, y: 1}, {x: 6, y:1},
			{x: 6, y: 3}, {x: 5, y: 3},{x: 4, y:3}, {x:3, y:3}, {x:3, y:3}, {x:2, y: 3}, {x:1, y: 3}, {x: 0, y:3},
		];
	}
	// 霊夢(精神)
	else if (this.isExReimu()) {
		return [
			{x: 0, y: 6}, {x: 1, y: 6},{x: 2, y: 6}, {x:3, y: 6}, {x:3, y: 6}, {x:4, y: 6}, {x:5, y: 6}, {x: 6, y:6},
			{x: 6, y: 3}, {x: 5, y: 3},{x: 4, y:3}, {x:3, y:3}, {x:3, y:3}, {x:2, y: 3}, {x:1, y: 3}, {x: 0, y:3},
		];
	}
	// 霊夢(実体)
	else {
		// 分身が紫の場合
		if (this.parent.alterego.isYukari()) {
			return [
				{x: 0, y: 3}, {x: 1, y: 3},{x: 2, y:3}, {x:3, y:3}, {x:3, y:3}, {x:4, y: 3}, {x:5, y: 3}, {x: 6, y:3},
				{x: 6, y: 1}, {x: 5, y: 1},{x: 4, y: 1}, {x:3, y: 1}, {x:3, y: 1}, {x:2, y: 1}, {x:1, y: 1}, {x: 0, y:1},
			];
		}
		// 分身が霊夢(精神)の場合
		else if (this.parent.alterego.isExReimu()) {
			return [
				{x: 0, y: 3}, {x: 1, y: 3},{x: 2, y:3}, {x:3, y:3}, {x:3, y:3}, {x:4, y: 3}, {x:5, y: 3}, {x: 6, y:3},
				{x: 6, y: 6}, {x: 5, y: 6},{x: 4, y: 6}, {x:3, y: 6}, {x:3, y: 6}, {x:2, y: 6}, {x:1, y: 6}, {x: 0, y:6},
			];
		}

	}
};
AlterEgo.prototype.spriteWidth = function(){
	return 32;
};
AlterEgo.prototype.spriteHeight = function(){
	return 32;
};
AlterEgo.prototype.spriteAnimationSpan = function(){
	return 3;
};


module.exports = AlterEgo;
