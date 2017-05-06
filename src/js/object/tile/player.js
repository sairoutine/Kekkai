'use strict';

var CONSTANT = require('../../constant');
var H_CONSTANT = require('../../hakurei').constant;

// 移動速度
var MOVE_SPEED = 2;
// 落下速度
var FALL_SPEED = 3;
// はしごを上るスピード
var LADDER_SPEED = 2;

// 交代アニメーション時間
var EXCHANGE_ANIM_SPAN = 5 * 6.9; //anim span * 7
// 死亡アニメーション時間
var DIE_ANIM_SPAN = 90;

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
var StateMoveLeft  = require('./player/state_moveleft');
var StateMoveRight = require('./player/state_moveright');
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
	this.states[ CONSTANT.STATE_MOVELEFT ]  = new StateMoveLeft(scene, this);
	this.states[ CONSTANT.STATE_MOVERIGHT ] = new StateMoveRight(scene, this);
	this.states[ CONSTANT.STATE_CLIMBDOWN ] = new StateClimbDown(scene, this);
	this.states[ CONSTANT.STATE_DYING ]     = new StateDying(scene, this);
	this.states[ CONSTANT.STATE_EXCHANGE ]  = new StateExchange(scene, this);
	this.states[ CONSTANT.STATE_FALLDOWN ]  = new StateFallDown(scene, this);
};
util.inherit(Player, base_object);

Player.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.x(x);
	this.y(y);

	this.exchange_num = 0; //位置移動した回数

	// 右を向いているか左を向いているか
	if (this.scene.width/2 < this.x()) {
		this.is_reflect = true;
	}
	else {
		this.is_reflect = false;
	}

	this.fall_blocks = {}; //着地している落下ブロック

	// 分身
	this.alterego = new AlterEgo(this.scene, this);
	this.alterego.init();
	this.addSubObject(this.alterego);

	// 位置交換アニメーション
	this.exchange_anim = new ExchangeAnim(this.scene);

	// 初期状態
	this.changeState(CONSTANT.STATE_NORMAL);
};

Player.prototype.beforeDraw = function(){
	base_object.prototype.beforeDraw.apply(this, arguments);

	this.currentState().beforeDraw();

};

Player.prototype.update = function(){
	// 移動
	if (this.currentState() instanceof StateMoveLeft) {
		this.moveLeft();
	}
	else if(this.currentState() instanceof StateMoveRight) {
		this.moveRight();
	}

	// 落下判定
	if(this.currentState().isFallDown()) {
		if(!this.checkCollisionWithBlocks()) {
			this.changeState(CONSTANT.STATE_FALLDOWN);
		}
		else {
			this.changeState(CONSTANT.STATE_NORMAL);
		}
	}

	// はしごを降りているか判定
	var collision_ladder = this.checkCollisionWithLadder();
	if(collision_ladder && this.currentState().isEnableToPlayMove()) {
		if(!this.isClimbDown() || !this.checkCollisionWithBlocks2()) {
			if(this.core.isKeyDown(H_CONSTANT.BUTTON_DOWN)) {
				this.changeState(CONSTANT.STATE_CLIMBDOWN);
				this._x = collision_ladder.x();
				this.climbDown();
			}
			else if(this.core.isKeyDown(H_CONSTANT.BUTTON_UP)) {
				this.changeState(CONSTANT.STATE_CLIMBDOWN);
				this._x = collision_ladder.x();
				this.climbUp();
			}
		}
	}

	// はしごを降りるのが終了したかどうか判定
	if(!collision_ladder && this.isClimbDown()) {
		this.changeState(CONSTANT.STATE_NORMAL);
	}

	// 死亡判定
	if (this.currentState().isEnableToDie()) {
		var is_collision_to_death = this.checkCollisionWithDeathOrEnemy();
		if(is_collision_to_death) {
			this.startDie();
		}
	}

	// 死亡アニメーションが終了判定
	if(this.isDying()) {
		if(this.currentState().frame_count > DIE_ANIM_SPAN) {
			this.scene.notifyPlayerDie();
			this.quitDie();
		}
	}

	// 交代アニメーション終了判定
	if(this.isExchanging() && this.currentState().frame_count > EXCHANGE_ANIM_SPAN) {
		// 位置移動
		this.exchangePosition();

		// リセット
		this.quitExchange();
		this.removeSubObject(this.exchange_anim);
	}


	// 落下
	if (this.isFallingDown()) {
		this.fallDown();
	}

	// 壁との接触判定
	var repulse_x = this.checkCollisionWithLeftRightBlocks();
	if(repulse_x) {
		repulse_x = repulse_x > 0 ? MOVE_SPEED : -MOVE_SPEED;
		// 自機の調整
		this._x += repulse_x;
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

	// もう既に設地していない落下ブロックは削除
	for (var key in this.fall_blocks) {
		var obj = this.fall_blocks[key];
		if(!this.checkCollision(obj)) {
			obj.fall();
			delete this.fall_blocks[obj.id];
		}
	}

	// 設地している落下ブロックを保存しておく
	var brown_block = this.checkCollisionWithFallBlock();
	if(brown_block) {
		this.fall_blocks[brown_block.id] = brown_block;
	}


	// 踏んでいるブロックにめり込んでいるなら修正
	var collision_block = this.checkCollisionWithBlocks3();
	if(this.isNormal() && collision_block) {
		var before_y = this.y();
		this._y = collision_block.getCollisionUpY() - this.collisionHeight()/2 + 1;
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
			if(self.y()-self.collisionHeight()/2 > obj.y()-obj.collisionHeight()/2) continue;
			if(obj.isCollision() && self.checkCollision(obj)) {
				is_collision = obj;
				break;
			}
		}
	}

	return is_collision;
};

Player.prototype.checkCollisionWithBlocks2 = function() {
	var self = this;
	// 壁と自機の衝突判定
	var is_collision = false;
	for (var i = 0; i < BLOCK_TILE_TYPES2.length; i++) {
		var tile_type = BLOCK_TILE_TYPES2[i];
		var tile_objects = self.scene.objects_by_tile_type[tile_type];

		for (var j = 0; j < tile_objects.length; j++) {
			var obj = tile_objects[j];

			// 落下判定なので、自機より上のブロックは無視する
			//if(self.y()-self.collisionHeight()/2 > obj.y()-obj.collisionHeight()/2) continue;
			if(obj.isCollision() && self.checkCollision(obj)) {
				is_collision = true;
				break;
			}
		}
	}

	return is_collision;
};

Player.prototype.checkCollisionWithBlocks3 = function() {
	var self = this;
	// 壁と自機の衝突判定
	var is_collision = false;
	for (var i = 0; i < BLOCK_TILE_TYPES2.length; i++) {
		var tile_type = BLOCK_TILE_TYPES2[i];
		var tile_objects = self.scene.objects_by_tile_type[tile_type];

		for (var j = 0; j < tile_objects.length; j++) {
			var obj = tile_objects[j];

			// 落下判定なので、自機より上のブロックは無視する
			if(self.y()-self.collisionHeight()/2 > obj.y()-obj.collisionHeight()/2) continue;
			if(obj.isCollision() && self.checkCollision(obj)) {
				is_collision = obj;
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
			if(self.getCollisionUpY() > obj.getCollisionUpY()) continue; // 自機より下
			if(self.getCollisionDownY() < obj.getCollisionDownY()) continue; // 自機より上
			if(obj.isCollision() && self.checkCollision(obj)) {
				repulse_x = self.x() - obj.x();
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
		if(obj.isCollision() && self.checkCollision(obj)) {
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

// 自分の下に落下ブロックがあるか
Player.prototype.checkCollisionWithFallBlock = function() {
	var self = this;
	var is_collision = null;

	var tile_objects = self.scene.objects_by_tile_type[CONSTANT.BLOCK_BROWN];

	for (var j = 0; j < tile_objects.length; j++) {
		var obj = tile_objects[j];

		// 落下判定なので、自機より上のブロックは無視する
		if(self.y()-self.collisionHeight()/2 > obj.y()-obj.collisionHeight()/2) continue;
		if(obj.isCollision() && self.checkCollision(obj)) {
			is_collision = obj;
			break;
		}
	}

	return is_collision;
};

Player.prototype.changeState = function(state) {
	this.state = state;
	this.currentState().init();

	if (CONSTANT.DEBUG.ON) {
		console.log(this.state);
	}
};
Player.prototype.currentState = function() {
	return this.states[this.state];
};

// 左右移動
Player.prototype.moveLeft = function() {
	// 自機の移動
	this._x -= MOVE_SPEED;
	this.is_reflect = true;
};
Player.prototype.moveRight = function() {
	// 自機の移動
	this._x += MOVE_SPEED;
	this.is_reflect = false;

};
// はしご上移動
Player.prototype.climbUp = function() {
	if(!this.currentState().isEnableToPlayMove()) return;

	// 自機の移動
	this._y -= LADDER_SPEED;
};
// はしご下移動
Player.prototype.climbDown = function() {
	if(!this.currentState().isEnableToPlayMove()) return;

	// 自機の移動
	this._y += LADDER_SPEED;
};







Player.prototype.notifyMoveRight = function() {
	if(!this.currentState().isEnableToPlayMove()) return;

	this.changeState(CONSTANT.STATE_MOVERIGHT);
};
Player.prototype.notifyMoveLeft = function() {
	if(!this.currentState().isEnableToPlayMove()) return;

	this.changeState(CONSTANT.STATE_MOVELEFT);
};
Player.prototype.notifyMoveUp = function() {
	if(!this.currentState().isEnableToPlayMove()) return;

	this.changeState(CONSTANT.STATE_MOVEUP);
};
Player.prototype.notifyMoveDown = function() {
	if(!this.currentState().isEnableToPlayMove()) return;

	this.changeState(CONSTANT.STATE_MOVEDOWN);
};

Player.prototype.notifyNotMove = function() {
	if(!this.currentState().isEnableToPlayMove()) return;

	this.changeState(CONSTANT.STATE_NORMAL);
};




// はしご移動中かどうか
Player.prototype.isClimbDown = function() {
	return this.currentState() instanceof StateClimbDown;
};
// 落下
Player.prototype.fallDown = function() {
	// 自機の移動
	this._y += FALL_SPEED;
};
Player.prototype.isFallingDown = function() {
	return this.currentState() instanceof StateFallDown;
};
// 位置移動
Player.prototype.startExchange = function() {
	if(!this.currentState().isEnableToPlayExchange()) return false;

	// 分身が壁とぶつかってるなら、位置移動できない
	if(this.checkCollisionBetweenAlterEgoAndBlocks()) return false;

	// 交換可能回数上限に達したら
	if(this.remainExchangeNum() <= 0) return false;

	// 状態を位置移動状態に変更
	this.changeState(CONSTANT.STATE_EXCHANGE);

	// 位置移動アニメーション
	this.exchange_anim.init(this.x(), this.y(), EXCHANGE_ANIM_SPAN);
	this.addSubObject(this.exchange_anim);

	// 分身もアニメーション
	this.alterego.startExchange(EXCHANGE_ANIM_SPAN);

	this.exchange_num++;

	return true;
};
Player.prototype.isExchanging = function() {
	return this.currentState() instanceof StateExchange;
};
Player.prototype.quitExchange = function() {
	this.changeState(CONSTANT.STATE_NORMAL);
};


Player.prototype.isNormal = function() {
	return this.currentState() instanceof StateNormal;
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

// 自機と分身の位置入れ替え
Player.prototype.exchangePosition = function() {
	var alterego_x = this.alterego.x();
	var alterego_y = this.alterego.y();

	this.x(alterego_x);
	this.y(alterego_y);

};

// 死亡開始
Player.prototype.startDie = function() {
	this.core.playSound("dead");
	this.changeState(CONSTANT.STATE_DYING);
};
// 死亡中かどうか
Player.prototype.isDying = function() {
	return this.currentState() instanceof StateDying;
};
Player.prototype.quitDie = function() {
	this.changeState(CONSTANT.STATE_NORMAL);
};

Player.prototype.remainExchangeNum = function() {
	return this.scene.max_exchange_num - this.exchange_num;
};





Player.prototype.spriteName = function(){
	return "stage_tile_32";
};
Player.prototype.spriteIndices = function(){
	if(this.isClimbDown()) {
		return [{x: 5, y: 2}, {x: 6, y: 2}];
	}
	else {
		return this.is_reflect ? [{x: 3, y: 2}, {x: 4, y: 2}] : [{x: 1, y: 2}, {x: 2, y:2}];
	}
};
Player.prototype.spriteAnimationSpan = function(){
	return 10;
};

Player.prototype.spriteWidth = function(){
	return 32;
};
Player.prototype.spriteHeight = function(){
	return 32;
};
Player.prototype.isShow = function(){
	if(this.isDying()) { // 死亡中は点滅する
		return this.frame_count % 40 > 20;
	}
	else {
		return this.isExchanging() ? false : true; // 交代中は表示しない
	}
};
Player.prototype.collisionWidth = function() {
	return 24;
};
Player.prototype.collisionHeight = function() {
	return 32;
};

module.exports = Player;
