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

	this.parent.player().update();

	if(this.core.isKeyDown(CONSTANT.BUTTON_LEFT)) {
		this.parent.player().moveLeft();
	}

	if(this.core.isKeyDown(CONSTANT.BUTTON_RIGHT)) {
		this.parent.player().moveRight();
	}

	if(this.core.isKeyPush(CONSTANT.BUTTON_X)) {
		if(this.parent.player().startExchange()) {
			this.core.playSound("boss_powerup");
		}
		else {
			this.core.playSound("forbidden");
		}
	}
};

module.exports = SceneStagePlay;
