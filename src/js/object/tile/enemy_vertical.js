'use strict';

var SPEED = 1;

var CONSTANT = require('../../constant');
var base_object = require('./tile_base');
var util = require('../../hakurei').util;

var Enemy = function (scene) {
	base_object.apply(this, arguments);

	// 種類
	this.type = CONSTANT.ENEMY_VERTICAL;
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

	// ブロックとの接触判定
	var stage_blocks = this.scene.getBlocks();
	this.checkCollisionWithObjects(stage_blocks);
};

Enemy.prototype.isCollision = function(obj) {
	var self = this;
	// 左右のブロックとは当たり判定しない
	if (obj) {
		if(self.x()-self.collisionWidth()/2 > obj.x()+obj.collisionWidth()/2) return false;
		if(self.x()+self.collisionWidth()/2 < obj.x()-obj.collisionWidth()/2) return false;
	}
	return true;
};

Enemy.prototype.onCollision = function(obj) {
	// ブロックと接触したら
	if (obj.isBlock()) {
		//TODO: this._y = before_y;
		this.is_down = !this.is_down;
	}
};

Enemy.prototype.collisionWidth = function(obj){
	return 1;
};
Enemy.prototype.collisionHeight = function(obj){
	if (obj && obj.type === CONSTANT.PLAYER) {
		return 1;
	}
	else {
		return 24;
	}
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
