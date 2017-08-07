'use strict';
var CONSTANT = require('../../constant');
var base_object = require('./tile_base');
var util = require('../../hakurei').util;

var ItemForYukari = function (scene) {
	base_object.apply(this, arguments);

	// 種類
	this.type = CONSTANT.ITEM_FOR_YUKARI;
};
util.inherit(ItemForYukari, base_object);

ItemForYukari.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.x(x);
	this.y(y);
	this.is_show = true;
	this.is_collision = true;

	this.start_got_animation_frame_count = 0;
};

ItemForYukari.prototype.got = function() {
	this.is_collision = false;

	this.core.playSound("got_item_ribon");

	// start animation
	this.start_got_animation_frame_count = this.frame_count;
};

ItemForYukari.prototype.onCollision = function(obj){
	// 紫と接触したら
	if (obj.type === CONSTANT.ALTEREGO) {
		this.got(); // 獲得済
	}
};



ItemForYukari.prototype.isShow = function() {
	return this.is_show;
};

ItemForYukari.prototype.isCollision = function() {
	return this.is_collision;
};

ItemForYukari.prototype.beforeDraw = function(){
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

ItemForYukari.prototype.spriteName = function(){
	return "stage_tile_24";
};
ItemForYukari.prototype.spriteIndices = function(){
	// Ex ストーリーになるとアイテムが変わる
	if (this.scene.isExReimu()) {
		return [{x: 3, y: 2}];
	}
	else {
		return [{x: 0, y: 2}];
	}

};
ItemForYukari.prototype.spriteWidth = function(){
	return 24;
};
ItemForYukari.prototype.spriteHeight = function(){
	return 24;
};
module.exports = ItemForYukari;
