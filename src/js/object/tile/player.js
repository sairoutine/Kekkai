'use strict';

var CONSTANT = require('../../constant');
var H_CONSTANT = require('../../hakurei').constant;

// 移動速度
var MOVE_SPEED = 4;
// 落下速度
var FALL_SPEED = 4;

// 壁ブロック一覧
var BLOCK_TILE_TYPES = [
	CONSTANT.BLOCK_GREEN,
	CONSTANT.BLOCK_BLUE,
	CONSTANT.BLOCK_RED,
	CONSTANT.BLOCK_PURPLE,
	CONSTANT.BLOCK_BROWN,
	CONSTANT.LADDER, // はしごも
];



var base_object = require('../../hakurei').object.sprite;
var BlockBase = require('./block_base');
var AlterEgo = require('../alterego');
var util = require('../../hakurei').util;

var Player = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(Player, base_object);

Player.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.x = x;
	this.y = y;

	this.is_reflect = false; // 左を向いているか
	this.is_down = false; // 落下中かどうか
	this.is_down_ladder = false; // はしごを降りている最中かどうか

	this.alterego = new AlterEgo(this.scene);
	this.alterego.init(this.scene.width - this.x, this.y); // TODO: not only verticies
	this.addSubObject(this.alterego);
};

Player.prototype.beforeDraw = function(){
	base_object.prototype.beforeDraw.apply(this, arguments);


	// 落下していく
	if(!this.checkCollisionWithBlocks()) {
		this.moveY(FALL_SPEED);
		this.is_down = true;
	}
	else {
		this.is_down = false;
	}

	// はしごを降りている
	if(this.checkCollisionWithLadder()) {
		if(this.core.isKeyDown(H_CONSTANT.BUTTON_DOWN)) {
			this.moveY(FALL_SPEED);
			this.is_down_ladder = true;
		}
		else if(this.core.isKeyDown(H_CONSTANT.BUTTON_UP)) {
			this.moveY(-FALL_SPEED);
			this.is_down_ladder = true;
		}
	}
	else {
		this.is_down_ladder = false;
	}
};

Player.prototype.checkCollisionWithBlocks = function() {
	var self = this;
	// 壁と自機の衝突判定
	var is_collision = false;
	BLOCK_TILE_TYPES.forEach(function (tile_type) {
		self.scene.objects_by_tile_type[tile_type].forEach(function(obj) {
			if(self.checkCollision(obj)) {
				is_collision = true;
				// TODO: break;
			}
		});
	});

	return is_collision;
};

Player.prototype.checkCollisionWithLadder = function() {
	var self = this;
	// はしごと自機の衝突判定
	var is_collision = false;

	self.scene.objects_by_tile_type[CONSTANT.LADDER].forEach(function(obj) {
		if(self.checkCollision(obj)) {
			is_collision = true;
			// TODO: break;
		}
	});

	return is_collision;
};





Player.prototype.moveLeft = function() {
	if(this.is_down) return;

	this.x -= MOVE_SPEED;
	this.is_reflect = true;

	this.alterego.x += MOVE_SPEED;
};
Player.prototype.moveRight = function() {
	if(this.is_down) return;

	this.x += MOVE_SPEED;
	this.is_reflect = false;

	this.alterego.x -= MOVE_SPEED;
};

Player.prototype.moveY = function(y) {
	this.y += y;
	this.alterego.y += y;
};

Player.prototype.exchange = function(){
	var player_x = this.x;
	var player_y = this.y;
	var alterego_x = this.alterego.x;
	var alterego_y = this.alterego.y;

	this.x = alterego_x;
	this.y = alterego_y;

	this.alterego.x = player_x;
	this.alterego.y = player_y;
};





/*
Player.prototype.draw = function() {
	base_object.prototype.draw.apply(this, arguments);

	var ctx = this.core.ctx;
	var player = this.core.image_loader.getImage("player");

	var player_width=32;

	ctx.save();
	if (this.is_left_to) {
		ctx.transform(-1, 0, 0, 1, player_width,  0); // 左右反転
		ctx.drawImage(player,
			// sprite position
			32 * 1, 48 * 2,
			// sprite size to get
			32, 48,
			-this.x, this.y,
			// sprite size to show
			32, 48
		);
	}
	else {
		ctx.drawImage(player,
			// sprite position
			32 * 1, 48 * 2,
			// sprite size to get
			32, 48,
			this.x, this.y,
			// sprite size to show
			32, 48
		);
	}
	ctx.restore();
};
*/
Player.prototype.spriteName = function(){
	return "player";
};
Player.prototype.spriteIndices = function(){
	return this.is_down_ladder ? [{x: 1, y: 3}] : [{x: 1, y: 2}];
};
Player.prototype.spriteWidth = function(){
	return 32;
};
Player.prototype.spriteHeight = function(){
	return 48;
};
Player.prototype.scaleWidth = function(){
	return 1;
};
Player.prototype.scaleHeight = function(){
	return 1;
};
Player.prototype.isReflect = function(){
	return this.is_reflect;
};











/*
Player.prototype.onCollision = function(obj) {
	if (obj instanceof BlockBase) {
		var player_down_y = this.globalDownY();
		var block_up_y = obj.globalUpY();

		if(player_down_y < block_up_y) { // 落下させない
			this.y = block_up_y - 48;
		}
	}
};
*/
Player.prototype.collisionWidth = function() {
	return 16;
};
Player.prototype.collisionHeight = function() {
	return 48;
};





module.exports = Player;
