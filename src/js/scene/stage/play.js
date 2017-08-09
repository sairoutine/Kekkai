'use strict';

var base_scene = require('../../hakurei').scene.base;
var CONSTANT = require('../../hakurei').constant;
var util = require('../../hakurei').util;

var SceneStagePlay = function(core, parent) {
	base_scene.apply(this, arguments);
};

util.inherit(SceneStagePlay, base_scene);

SceneStagePlay.prototype.init = function(){
	base_scene.prototype.init.apply(this, arguments);
};

SceneStagePlay.prototype.beforeDraw = function(){
	base_scene.prototype.beforeDraw.apply(this, arguments);

	// parent class (stage scene) に所属するオブジェクトを動かす
	for(var i = 0, len = this.parent.objects.length; i < len; i++) {
		this.parent.objects[i].beforeDraw();
	}



	// キー入力
	if(this.core.isKeyDown(CONSTANT.BUTTON_LEFT)) {
		this.parent.player().notifyMoveLeft();
	}
	else if(this.core.isKeyDown(CONSTANT.BUTTON_RIGHT)) {
		this.parent.player().notifyMoveRight();
	}
	else {
		this.parent.player().notifyNotMove();
	}

	if(this.core.isKeyPush(CONSTANT.BUTTON_X)) {
		if(this.parent.player().startExchange()) {
			// 位置交換成功
			this.core.playSound("boss_powerup");
		}
		else {
			// 位置交換失敗
			this.core.playSound("forbidden");
		}
	}

	// ポーズ
	if(this.core.isKeyPush(CONSTANT.BUTTON_SPACE)) {
		this.parent.changeSubScene("pause");
	}

	// プレイヤーの更新
	this.parent.player().update();

	// ステージクリア判定
	if (this.parent.isClear()) {
		this.parent.notifyStageClear();
	}
};

SceneStagePlay.prototype.draw = function() {
	var ctx = this.core.ctx;

	// 操作説明
	ctx.save();
	ctx.fillStyle = 'rgb( 255, 255, 255 )';
	ctx.font = "18px 'PixelMplus'";
	ctx.textAlign = 'left';
	ctx.fillText("矢印キー: 移動, Xキー: スキマ移動, スペースキー: ポーズ", 30, this.core.height - 15);
	ctx.restore();
};



module.exports = SceneStagePlay;
