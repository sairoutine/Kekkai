'use strict';
var CONSTANT = require('../../constant');
var base_object = require('./tile_base');
var util = require('../../hakurei').util;

var ItemOfExchange = function (scene) {
	base_object.apply(this, arguments);

	// 種類
	this.type = CONSTANT.ITEM_OF_EXCHANGE;
};
util.inherit(ItemOfExchange, base_object);

ItemOfExchange.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.x(x);
	this.y(y);
	this.is_show = true;
	this.is_collision = true;

	this.start_got_animation_frame_count = 0;
};

ItemOfExchange.prototype.got = function() {
	this.is_collision = false;

	this.core.playSound("got_item_ohuda");

	// start animation
	this.start_got_animation_frame_count = this.frame_count;
};

ItemOfExchange.prototype.isShow = function() {
	return this.is_show;
};

ItemOfExchange.prototype.isCollision = function() {
	return this.is_collision;
};

ItemOfExchange.prototype.beforeDraw = function(){
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
};









// sprite configuration

ItemOfExchange.prototype.spriteName = function(){
	return "stage_tile_24";
};
ItemOfExchange.prototype.spriteIndices = function(){
	return [{x: 0, y: 3}];
};
ItemOfExchange.prototype.spriteWidth = function(){
	return 24;
};
ItemOfExchange.prototype.spriteHeight = function(){
	return 24;
};
ItemOfExchange.prototype.rotateAdjust = function(){
	return this.frame_count*2 % 360;
};



module.exports = ItemOfExchange;
