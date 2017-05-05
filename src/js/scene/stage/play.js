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

	this.parent.player().update();
};

module.exports = SceneStagePlay;
