'use strict';

var SPEED = 2;

var CONSTANT = require('../../constant');
var base_object = require('../../hakurei').object.sprite;
var util = require('../../hakurei').util;

var Enemy = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(Enemy, base_object);

Enemy.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.x = x;
	this.y = y;

	this.is_left = false;
};

Enemy.prototype.beforeDraw = function() {
	base_object.prototype.beforeDraw.apply(this, arguments);

	var before_x = this.x;
	if (this.is_left) {
		this.x -= SPEED;
	}
	else {
		this.x += SPEED;
	}

	if(!this.checkCollisionWithBlocks()) {
		// ステージから落ちるなら戻って反転
		this.x = before_x;
		this.is_left = !this.is_left;
	}
};

Enemy.prototype.isCollision = function() {
	return true;
};




// 地面ブロック一覧
var BLOCK_TILE_TYPES = [
	CONSTANT.BLOCK_GREEN,
	CONSTANT.BLOCK_BLUE,
	CONSTANT.BLOCK_RED,
	CONSTANT.BLOCK_PURPLE,
	CONSTANT.BLOCK_BROWN,
	CONSTANT.BLOCK_STONE1,
	CONSTANT.BLOCK_STONE2,
	CONSTANT.BLOCK_STONE3,
	CONSTANT.LADDER, // はしごも
];

// 落下判定
Enemy.prototype.checkCollisionWithBlocks = function() {
	var self = this;
	// 壁と自機の衝突判定
	var is_collision = false;
	for (var i = 0; i < BLOCK_TILE_TYPES.length; i++) {
		var tile_type = BLOCK_TILE_TYPES[i];
		var tile_objects = self.scene.objects_by_tile_type[tile_type];

		for (var j = 0; j < tile_objects.length; j++) {
			var obj = tile_objects[j];

			// 落下判定なので、自機より上のブロックは無視する
			if(self.y-self.collisionHeight()/2 > obj.y-obj.collisionHeight()/2) continue;
			if(self.checkCollision(obj)) {
				is_collision = true;
				break;
			}
		}
	}

	return is_collision;
};





Enemy.prototype.collisionWidth = function(){
	return 24;
};
Enemy.prototype.collisionHeight = function(){
	return 24 + 1; // 地面との接触のため、+1
};

// sprite configuration

Enemy.prototype.spriteName = function(){
	return "enemy";
};
Enemy.prototype.spriteIndices = function(){
	return [{x: 0, y: 2}, {x: 1, y: 2}, {x: 2, y: 2}];
};

Enemy.prototype.spriteAnimationSpan = function(){
	return 10;
};

Enemy.prototype.spriteWidth = function(){
	return 32;
};
Enemy.prototype.spriteHeight = function(){
	return 32;
};
Enemy.prototype.scaleWidth = function(){
	return 0.75;
};
Enemy.prototype.scaleHeight = function(){
	return 0.75;
};

module.exports = Enemy;
