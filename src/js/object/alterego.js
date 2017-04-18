'use strict';
var base_object = require('../hakurei').object.sprite;
var util = require('../hakurei').util;
var ExchangeAnim = require('./exchange_anim');

var AlterEgo = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(AlterEgo, base_object);

AlterEgo.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.x = x;
	this.y = y;

	this.span = 0;
	this.exchange_animation_start_count = 0;
	this.exchange_anim = new ExchangeAnim(this.scene);
};

AlterEgo.prototype.beforeDraw = function(){
	base_object.prototype.beforeDraw.apply(this, arguments);

	// 交代アニメーション再生
	if(this.exchange_animation_start_count) {
		// 交代アニメーション終了
		if(this.frame_count - this.exchange_animation_start_count > this.span) {
			// リセット
			this.exchange_animation_start_count = 0;
			this.removeSubObject(this.exchange_anim);
		}
	}

};

AlterEgo.prototype.collisionWidth = function(){
	return 32;
};
AlterEgo.prototype.collisionHeight = function(){
	return 32;
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

AlterEgo.prototype.scaleWidth = function(){
	if(this.exchange_animation_start_count && (this.span/2) < this.frame_count - this.exchange_animation_start_count) {
		return 0.2 * (this.span/2 - (this.frame_count - this.exchange_animation_start_count -  this.span/2)) / (this.span/2);
	}
	else {
		return 0.2;
	}

};
AlterEgo.prototype.scaleHeight = function(){
	if(this.exchange_animation_start_count && (this.span/2) < this.frame_count - this.exchange_animation_start_count) {
		return 0.2 * (this.span/2 - (this.frame_count - this.exchange_animation_start_count -  this.span/2)) / (this.span/2);
	}
	else {
		return 0.2;
	}
};






// 位置移動
AlterEgo.prototype.startExchange = function(span) {
	this.exchange_animation_start_count = this.frame_count;
	this.span = span;

	this.exchange_anim.init(this.x, this.y, span);
	this.addSubObject(this.exchange_anim);
};







module.exports = AlterEgo;
