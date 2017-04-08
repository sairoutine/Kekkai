'use strict';
var base_object = require('../hakurei').object.sprite;
var util = require('../hakurei').util;

var AlterEgo = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(AlterEgo, base_object);

AlterEgo.prototype.init = function(x, y, anim_span) {
	base_object.prototype.init.apply(this, arguments);
	this.x = x;
	this.y = y;

	this.anim_span = anim_span;
};

AlterEgo.prototype.beforeDraw = function(){
	base_object.prototype.beforeDraw.apply(this, arguments);
};

AlterEgo.prototype.spriteName = function(){
	return "exchange";
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
	if(this.frame_count < this.anim_span/2) {
		return 0.25 * this.frame_count / (this.anim_span/2);
	}
	else {
		return 0.25;
	}
};
AlterEgo.prototype.scaleHeight = function(){
	if(this.frame_count < this.anim_span/2) {
		return 0.25 * this.frame_count / (this.anim_span/2);
	}
	else {
		return 0.25;
	}

};

module.exports = AlterEgo;
