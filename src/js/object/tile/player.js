'use strict';

var CONSTANT = require('../../constant');
var H_CONSTANT = require('../../hakurei').constant;

// 移動速度
var MOVE_SPEED = 4;
// 落下速度
var FALL_SPEED = 4;

// 交代アニメーション時間
var EXCHANGE_ANIM_SPAN = 60;
// 死亡アニメーション時間
var DIE_ANIM_SPAN = 180;

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

// 壁ブロック一覧
var BLOCK_TILE_TYPES2 = [
	CONSTANT.BLOCK_GREEN,
	CONSTANT.BLOCK_BLUE,
	CONSTANT.BLOCK_RED,
	CONSTANT.BLOCK_PURPLE,
	CONSTANT.BLOCK_BROWN,
	CONSTANT.BLOCK_STONE1,
	CONSTANT.BLOCK_STONE2,
	CONSTANT.BLOCK_STONE3,
];



var base_object = require('../../hakurei').object.sprite;
var BlockBase = require('./block_base');
var AlterEgo = require('../alterego');
var ExchangeAnim = require('../exchange_anim');
var util = require('../../hakurei').util;

// プレイヤーの状態一覧
var StateNormal    = require('./player/state_normal');
var StateClimbDown = require('./player/state_climbdown');
var StateDying     = require('./player/state_dying');
var StateExchange  = require('./player/state_exchange');
var StateFallDown  = require('./player/state_falldown');

var Player = function (scene) {
	base_object.apply(this, arguments);

	// プレイヤーの状態一覧
	this.state = null;
	this.states = {};
	this.states[ CONSTANT.STATE_NORMAL ]    = new StateNormal(scene, this);
	this.states[ CONSTANT.STATE_CLIMBDOWN ] = new StateClimbDown(scene, this);
	this.states[ CONSTANT.STATE_DYING ]     = new StateDying(scene, this);
	this.states[ CONSTANT.STATE_EXCHANGE ]  = new StateExchange(scene, this);
	this.states[ CONSTANT.STATE_FALLDOWN ]  = new StateFallDown(scene, this);
};
util.inherit(Player, base_object);

Player.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.x = x;
	this.y = y;

	this.is_reflect = false; // 左を向いているか

	// 分身
	this.alterego = new AlterEgo(this.scene);
	this.alterego.init(this.scene.width - this.x, this.y); // TODO: not only verticies
	this.addSubObject(this.alterego);

	// 位置交換アニメーション
	this.exchange_anim = new ExchangeAnim(this.scene);

	// 初期状態
	this.changeState(CONSTANT.STATE_NORMAL);
};

Player.prototype.beforeDraw = function(){
	base_object.prototype.beforeDraw.apply(this, arguments);

	this.currentState().beforeDraw();

	// 落下していく
	if(!this.isDying() && !this.isExchanging()) {
		if(!this.checkCollisionWithBlocks()) {
			this.fallDown();
			this.changeState(CONSTANT.STATE_FALLDOWN);
		}
		else {
			this.changeState(CONSTANT.STATE_NORMAL);
		}
	}

	// はしごを降りている
	var collision_ladder = this.checkCollisionWithLadder();
	if(collision_ladder && !this.isExchanging()) {
		if(this.core.isKeyDown(H_CONSTANT.BUTTON_DOWN)) {
			this.x = collision_ladder.x;
			this.climbDown();
		}
		else if(this.core.isKeyDown(H_CONSTANT.BUTTON_UP)) {
			this.x = collision_ladder.x;
			this.climbUp();
		}
		this.changeState(CONSTANT.STATE_CLIMBDOWN);
	}


	// 交代アニメーション再生
	if(this.isExchanging()) {
		// 交代アニメーション終了
		if(this.currentState().frame_count > EXCHANGE_ANIM_SPAN) {
			// 位置移動
			this.exchange_position();

			// リセット
			this.quitExchange();
			this.removeSubObject(this.exchange_anim);
		}
	}

	// 死亡アニメーションが終了するかどうか
	if(this.isDying()) {
		// 交代アニメーション終了
		if(this.currentState().frame_count > DIE_ANIM_SPAN) {
			this.scene.notifyPlayerDie();
			this.quitDie();
		}
	}

	// 壁との接触判定
	var repulse_x = this.checkCollisionWithLeftRightBlocks();
	if(repulse_x) {
		this.moveX(repulse_x);
	}

	// アイテムとの接触判定
	var item = this.checkCollisionWithItems();
	if(item) {
		item.got(); // 獲得済
		this.scene.addReimuItemNum();
		// ステージクリア
		if (this.scene.isClear()) {
			this.scene.notifyStageClear();
		}
	}

	// 死亡判定
	var is_collision_to_death = this.checkCollisionWithDeathOrEnemy();
	if(!this.isDying() && is_collision_to_death) {
		this.startDie();
	}

};

// 落下判定
Player.prototype.checkCollisionWithBlocks = function() {
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

// 壁との衝突判定
Player.prototype.checkCollisionWithLeftRightBlocks = function() {
	var self = this;
	// 壁と自機の衝突判定
	var repulse_x = 0;
	for (var i = 0; i < BLOCK_TILE_TYPES2.length; i++) {
		var tile_type = BLOCK_TILE_TYPES2[i];
		var tile_objects = self.scene.objects_by_tile_type[tile_type];

		for (var j = 0; j < tile_objects.length; j++) {
			var obj = tile_objects[j];

			// 壁の衝突判定なので自機より上あるいは下のブロックは無視する
			if(self.y-self.collisionHeight()/2 > obj.y-obj.collisionHeight()/2) continue; // 自機より下
			if(self.y+self.collisionHeight()/2 < obj.y+obj.collisionHeight()/2) continue; // 自機より上
			if(self.checkCollision(obj)) {
				repulse_x = self.x - obj.x;
				break;
			}
		}
	}

	return repulse_x;
};

Player.prototype.checkCollisionWithLadder = function() {
	var self = this;
	// はしごと自機の衝突判定
	var collision_ladder = false;

	self.scene.objects_by_tile_type[CONSTANT.LADDER].forEach(function(obj) {
		if(self.checkCollision(obj)) {
			collision_ladder = obj;
			// TODO: break;
		}
	});

	return collision_ladder;
};

Player.prototype.checkCollisionWithItems = function() {
	var self = this;
	// アイテムと自機の衝突判定
	var collision_item = false;

	self.scene.objects_by_tile_type[CONSTANT.ITEM].forEach(function(obj) {
		if(obj.isShow() && self.checkCollision(obj)) {
			collision_item = obj;
			// TODO: break;
		}
	});

	return collision_item;
};

Player.prototype.checkCollisionWithDeathOrEnemy = function() {
	var self = this;
	// 死亡ゾーン or 敵と自機の衝突判定
	var is_collision = false;

	self.scene.objects_by_tile_type[CONSTANT.DEATH]
		.concat(self.scene.objects_by_tile_type[CONSTANT.ENEMY])
		.forEach(function(obj) {
		if(self.checkCollision(obj)) {
			is_collision = obj;
			// TODO: break;
		}
	});

	return is_collision;
};

Player.prototype.changeState = function(state) {
	this.state = state;
	this.currentState().init();
};
Player.prototype.currentState = function() {
	return this.states[this.state];
};

// 左右移動
Player.prototype.moveLeft = function() {
	if(!this.currentState().isEnableToPlayMove()) return;

	// 自機の移動
	this.x -= MOVE_SPEED;
	this.is_reflect = true;

	// 分身の移動
	this.alterego.x += MOVE_SPEED;
};
Player.prototype.moveRight = function() {
	if(!this.currentState().isEnableToPlayMove()) return;

	// 自機の移動
	this.x += MOVE_SPEED;
	this.is_reflect = false;

	// 分身の移動
	this.alterego.x -= MOVE_SPEED;
};

// はしご上下移動
Player.prototype.climbUp = function() {
	if(!this.currentState().isEnableToPlayMove()) return;

	// 自機の移動
	this.y -= FALL_SPEED;
	// 分身の移動
	this.alterego.y -= FALL_SPEED;
};
// はしご上下移動
Player.prototype.climbDown = function() {
	if(!this.currentState().isEnableToPlayMove()) return;

	// 自機の移動
	this.y += FALL_SPEED;
	// 分身の移動
	this.alterego.y += FALL_SPEED;
};
// 落下
Player.prototype.fallDown = function() {
	// 自機の移動
	this.y += FALL_SPEED;
	// 分身の移動
	this.alterego.y += FALL_SPEED;
};








Player.prototype.moveX = function(x) {
	if(!this.isEnableMove()) return;
	this.x += x;
	this.alterego.x -= x;
};
Player.prototype.moveY = function(y) {
	if(!this.isEnableMove()) return;
	this.y += y;
	this.alterego.y += y;
};

Player.prototype.isEnableMove = function() {
	if(this.isExchanging()) return false; // 位置移動中は実行できない

	return true;
};




// 位置移動
Player.prototype.startExchange = function() {
	if(!this.isEnableMove()) return;

	// 分身が壁とぶつかってるなら、位置移動できない
	if(this.checkCollisionBetweenAlterEgoAndBlocks()) return;


	this.changeState(CONSTANT.STATE_EXCHANGE);

	this.exchange_anim.init(this.x, this.y, EXCHANGE_ANIM_SPAN);
	this.addSubObject(this.exchange_anim);

	// 紫もアニメーション
	this.alterego.startExchange(EXCHANGE_ANIM_SPAN);
};
Player.prototype.isExchanging = function() {
	return this.currentState() instanceof StateExchange;
};
Player.prototype.quitExchange = function() {
	this.changeState(CONSTANT.STATE_NORMAL);
};




// 分身が壁とぶつかっているかどうか
Player.prototype.checkCollisionBetweenAlterEgoAndBlocks = function() {
	var is_collision = false;
	for (var i = 0; i < BLOCK_TILE_TYPES2.length; i++) {
		var tile_type = BLOCK_TILE_TYPES2[i];
		var tile_objects = this.scene.objects_by_tile_type[tile_type];

		for (var j = 0; j < tile_objects.length; j++) {
			var obj = tile_objects[j];
			if(this.alterego.checkCollision(obj)) {
				is_collision = true;
				break;
			}
		}
	}

	return is_collision;
};







Player.prototype.exchange_position = function() {
	var player_x = this.x;
	var player_y = this.y;
	var alterego_x = this.alterego.x;
	var alterego_y = this.alterego.y;

	this.x = alterego_x;
	this.y = alterego_y;

	this.alterego.x = player_x;
	this.alterego.y = player_y;
};

// 死亡開始
Player.prototype.startDie = function() {
	this.changeState(CONSTANT.STATE_DYING);
};
// 死亡中かどうか
Player.prototype.isDying = function() {
	return this.currentState() instanceof StateDying;
};
Player.prototype.quitDie = function() {
	this.changeState(CONSTANT.STATE_NORMAL);
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

Player.prototype.isShow = function() {
	if(this.isDying()) { // 死亡中は点滅する
		return this.frame_count % 40 > 20;
	}
	else {
		return true;
	}
};



Player.prototype.spriteName = function(){
	return "player";
};
Player.prototype.spriteIndices = function(){
	return this.currentState() instanceof StateClimbDown ? [{x: 1, y: 3}] : [{x: 1, y: 2}];
};
Player.prototype.spriteWidth = function(){
	return 32;
};
Player.prototype.spriteHeight = function(){
	return 48;
};
Player.prototype.scaleWidth = function(){
	if(this.isExchanging() && (EXCHANGE_ANIM_SPAN/2) < this.currentState().frame_count) {
		return (EXCHANGE_ANIM_SPAN/2 - (this.currentState().frame_count -  EXCHANGE_ANIM_SPAN/2)) / (EXCHANGE_ANIM_SPAN/2);
	}
	else {
		return 1;
	}

};
Player.prototype.scaleHeight = function(){
	if(this.isExchanging() && (EXCHANGE_ANIM_SPAN/2) < this.currentState().frame_count) {
		return (EXCHANGE_ANIM_SPAN/2 - (this.currentState().frame_count -  EXCHANGE_ANIM_SPAN/2)) / (EXCHANGE_ANIM_SPAN/2);
	}
	else {
		return 1;
	}
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
	return 24;
};
Player.prototype.collisionHeight = function() {
	return 48;
};





module.exports = Player;
