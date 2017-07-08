'use strict';

var SPEED = 1;

var CONSTANT = require('../../constant');
var base_object = require('./tile_base');
var util = require('../../hakurei').util;

var Enemy = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(Enemy, base_object);

Enemy.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.x(x);
	this.y(y);

	this.is_down = false;
};

Enemy.prototype.beforeDraw = function() {
	base_object.prototype.beforeDraw.apply(this, arguments);

	var before_y = this.y();
	if (this.is_down) {
		this._y += SPEED;
	}
	else {
		this._y -= SPEED;
	}

	// ステージの上限or下限を超えない
	if (this._y < 50 + 12 || this._y > CONSTANT.TILE_SIZE*20 + 50 - 12) {
		this.is_down = !this.is_down;
	}

	if(this.checkCollisionWithBlocks()) {
		// ブロックと接触するならば戻って反転
		this._y = before_y;
		this.is_down = !this.is_down;
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
];

// ブロックとの接触判定
Enemy.prototype.checkCollisionWithBlocks = function() {
	var self = this;
	// 壁と敵の衝突判定
	var is_collision = false;
	for (var i = 0; i < BLOCK_TILE_TYPES.length; i++) {
		var tile_type = BLOCK_TILE_TYPES[i];
		var tile_objects = self.scene.objects_by_tile_type[tile_type];

		for (var j = 0; j < tile_objects.length; j++) {
			var obj = tile_objects[j];

			// 敵の左右のブロックは無視する
			if(self.x()-self.collisionWidth()/2 > obj.x()+obj.collisionWidth()/2) continue;
			if(self.x()+self.collisionWidth()/2 < obj.x()-obj.collisionWidth()/2) continue;
			if(obj.isCollision() && self.checkCollision(obj)) {
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
	return 24;
};

Enemy.prototype.isReflect = function(){
	return !this.is_left;
};



// sprite configuration

Enemy.prototype.spriteName = function(){
	return "stage_tile_32";
};
Enemy.prototype.spriteIndices = function(){
	return [{x: 0, y: 4}, {x: 1, y: 4}];
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
