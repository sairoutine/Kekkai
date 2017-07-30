'use strict';
var CONSTANT = require('../../constant');
var base_object = require('./tile_base');
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
};

Item.prototype.got = function() {
	this.is_collision = false;

	this.core.playSound("got_item_ohuda");

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
};









// sprite configuration

Item.prototype.spriteName = function(){
	return "stage_tile_24";
};
Item.prototype.spriteIndices = function(){
	// Ex ストーリーになるとアイテムが変わる
	if (this.scene.isInExStory()) {
		return [{x: 2, y: 2}];
	}
	else {
		return [{x: 1, y: 2}];
	}
};
Item.prototype.spriteWidth = function(){
	return 24;
};
Item.prototype.spriteHeight = function(){
	return 24;
};
module.exports = Item;
