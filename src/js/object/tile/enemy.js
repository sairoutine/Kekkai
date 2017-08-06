'use strict';

var SPEED = 2;

var CONSTANT = require('../../constant');
var base_object = require('./tile_base');
var util = require('../../hakurei').util;

var Enemy = function (scene) {
	base_object.apply(this, arguments);

	// 種類
	this.type = CONSTANT.ENEMY;
};
util.inherit(Enemy, base_object);

Enemy.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.x(x);
	this.y(y);

	this.is_left = false;
};

Enemy.prototype.beforeDraw = function() {
	base_object.prototype.beforeDraw.apply(this, arguments);

	var before_x = this.x();
	if (this.is_left) {
		this._x -= SPEED;
	}
	else {
		this._x += SPEED;
	}

	if(!this.checkCollisionWithBlocks()) {
		// ステージから落ちるなら戻って反転
		this._x = before_x;
		this.is_left = !this.is_left;
	}

	// 移動によって左右の壁にめり込んだら押し返す
	var repulse_x = this.checkCollisionWithLeftRightBlocks();
	if(repulse_x) {
		repulse_x = repulse_x > 0 ? SPEED : -SPEED;
		// 自機の調整
		this._x += repulse_x;

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
	CONSTANT.BLOCK_DISAPPEAR,
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
			if(self.y()-self.collisionHeight()/2 > obj.y()-obj.collisionHeight()/2) continue;
			if(obj.isCollision() && self.checkCollision(obj)) {
				is_collision = true;
				break;
			}
		}
	}

	return is_collision;
};

// 壁ブロック一覧
var BLOCK_TILE_TYPES2 = [
	CONSTANT.BLOCK_GREEN,
	CONSTANT.BLOCK_BLUE,
	CONSTANT.BLOCK_RED,
	CONSTANT.BLOCK_PURPLE,
	CONSTANT.BLOCK_DISAPPEAR,
	CONSTANT.BLOCK_STONE1,
	CONSTANT.BLOCK_STONE2,
	CONSTANT.BLOCK_STONE3,
];

// 壁との衝突判定
Enemy.prototype.checkCollisionWithLeftRightBlocks = function() {
	var self = this;
	// 壁と自機の衝突判定
	var repulse_x = 0;
	for (var i = 0; i < BLOCK_TILE_TYPES2.length; i++) {
		var tile_type = BLOCK_TILE_TYPES2[i];
		var tile_objects = self.scene.objects_by_tile_type[tile_type];

		for (var j = 0; j < tile_objects.length; j++) {
			var obj = tile_objects[j];

			// 壁の衝突判定なので自機より上あるいは下のブロックは無視する
			if(self.getCollisionDownY() -1 <= obj.getCollisionUpY()) continue; // 自機より下(-1 は地面とのめり込み分)
			if(self.getCollisionUpY() > obj.getCollisionDownY()) continue; // 自機より上
			if(obj.isCollision() && self.checkCollision(obj)) {
				repulse_x = self.x() - obj.x();
				break;
			}
		}
	}

	return repulse_x;
};





Enemy.prototype.collisionWidth = function(obj){
	return 1;
};
Enemy.prototype.collisionHeight = function(obj) {
	return 24 + 1; // 地面との接触のため、+1
};

Enemy.prototype.isReflect = function(){
	return !this.is_left;
};



// sprite configuration

Enemy.prototype.spriteName = function(){
	return "stage_tile_32";
};
Enemy.prototype.spriteIndices = function(){
	return [{x: 2, y: 4}, {x: 3, y: 4}];
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
module.exports = Enemy;
