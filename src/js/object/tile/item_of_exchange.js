'use strict';
var CONSTANT = require('../../constant');
var base_object = require('../../hakurei').object.sprite;
var util = require('../../hakurei').util;

var Item = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(Item, base_object);

Item.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.x(x);
	this.y(y);
	this.is_show = true;
	this.is_collision = true;

	this.start_got_animation_frame_count = 0;

	// blink
	this.alpha_for_blink = 100;
};

Item.prototype.got = function() {
	this.is_collision = false;

	this.core.playSound("powerup");

	// start animation
	this.start_got_animation_frame_count = this.frame_count;
};

Item.prototype.isShow = function() {
	return this.is_show;
};

Item.prototype.isCollision = function() {
	return this.is_collision;
};

Item.prototype.beforeDraw = function(){
	base_object.prototype.beforeDraw.apply(this, arguments);

	if (this.start_got_animation_frame_count) {
		var count = this.frame_count - this.start_got_animation_frame_count;
		if (10 > count && count >= 0) {
			this._y -= 5;
		}
		else if (15 > count && count >= 10) {

		}
		else {
			this.is_show = false;
			this.start_got_animation_frame_count = 0; //reset
		}
	}

	this.alpha_for_blink--;
	if (this.alpha_for_blink === 0) {
		this.alpha_for_blink = 100;
	}
};

Item.prototype.draw = function(){
	var ctx = this.core.ctx;
	ctx.globalAlpha = (this.alpha_for_blink)/100;
	base_object.prototype.draw.apply(this, arguments);
	ctx.globalAlpha = 1.0;
};






// sprite configuration

Item.prototype.spriteName = function(){
	return "stage_tile_24";
};
Item.prototype.spriteIndices = function(){
	return [{x: 1, y: 2}];
};
Item.prototype.spriteWidth = function(){
	return 24;
};
Item.prototype.spriteHeight = function(){
	return 24;
};
module.exports = Item;
