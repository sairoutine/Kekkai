'use strict';
var base_object = require('../hakurei').object.sprite;
var util = require('../hakurei').util;
var ExchangeAnim = require('./exchange_anim');
var CONSTANT = require('../constant');

var AlterEgo = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(AlterEgo, base_object);

AlterEgo.prototype.init = function(chara_no) {
	base_object.prototype.init.apply(this, arguments);

	this.span = 0;
	this.exchange_animation_start_count = 0;
	this.exchange_anim = new ExchangeAnim(this.scene, this.parent); //parent = player 本来のparent は alterego だが...
	this.chara_no = chara_no;
};
AlterEgo.prototype.isYukari = function(){
	return this.chara_no === CONSTANT.YUKARI_NO;
};
AlterEgo.prototype.isExReimu = function(){
	return this.chara_no === CONSTANT.EX_REIMU_NO;
};


AlterEgo.prototype.x = function(){
	if (this.scene.isVertical()) {
		return this.parent.x();
	}
	else {
		return this.scene.width - this.parent.x();
	}
};

AlterEgo.prototype.y = function(){
	if (this.scene.isVertical()) {
		return this.scene.height - this.parent.y(); // 垂直
	}
	else {
		return this.parent.y();
	}
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

	// アイテムとの接触判定
	var item = this.checkCollisionWithItems();
	if(item) {
		item.got(); // 獲得済
		this.scene.addYukariItemNum();
	}
};

AlterEgo.prototype.checkCollisionWithItems = function() {
	var self = this;
	// アイテムと分身の衝突判定
	var collision_item = false;

	self.scene.objects_by_tile_type[CONSTANT.ITEM_FOR_YUKARI].forEach(function(obj) {
		if(obj.isCollision() && self.checkCollision(obj)) {
			collision_item = obj;
			// TODO: break;
		}
	});

	return collision_item;
};





AlterEgo.prototype.draw = function(){
	base_object.prototype.draw.apply(this, arguments);

	var ctx = this.core.ctx;
	// 交換可能回数
	ctx.save();
	var num = this.scene.player().remainExchangeNum();
	ctx.fillStyle = 'rgb( 255, 255, 255 )';
	ctx.textAlign = 'center';
	ctx.font = "12px 'PixelMplus'";
	ctx.fillText(num, this.x(), this.y() - this.height()/2 - 10);
	ctx.restore();
};


AlterEgo.prototype.collisionWidth = function(){
	return 24;
};
AlterEgo.prototype.collisionHeight = function(){
	return 24;
};

AlterEgo.prototype.isShow = function(){
	return this.exchange_animation_start_count ? false : true; // 交換中は表示しない
};



AlterEgo.prototype.spriteName = function(){
	return "stage_tile_32";
};
AlterEgo.prototype.spriteAnimationSpan = function(){
	if (this.isYukari()) {
		return 30;
	}
	else {
		return 10;
	}
};
AlterEgo.prototype.spriteIndices = function(){
	// 紫
	if (this.isYukari()) {
		return [{x: 5, y: 0}, {x: 6, y: 0}];
	}
	// 霊夢(精神)
	else {
		if(this.parent.isClimbDown()) {
			return [{x: 5, y: 5}, {x: 6, y: 5}];
		}
		else {
			var is_reflect;
			if (this.scene.isVertical()) {
				is_reflect = this.parent.is_reflect;
			}
			else {
				is_reflect = !this.parent.is_reflect; // 自機と左右対象
			}
			return(is_reflect ? [{x: 3, y: 5}, {x: 4, y: 5}] : [{x: 1, y: 5}, {x: 2, y:5}]);
		}
	}
};

AlterEgo.prototype.spriteWidth = function(){
	return 32;
};
AlterEgo.prototype.spriteHeight = function(){
	return 32;
};
// 位置移動
AlterEgo.prototype.startExchange = function(span) {
	this.exchange_animation_start_count = this.frame_count;
	this.span = span;

	this.exchange_anim.init(this.x(), this.y(), span, this.chara_no);
	this.addSubObject(this.exchange_anim);
};
module.exports = AlterEgo;
