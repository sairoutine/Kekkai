'use strict';
// ポーズ画面

var base_scene = require('../../hakurei').scene.base;
var CONSTANT = require('../../hakurei').constant;
var util = require('../../hakurei').util;

var SceneStagePause = function(core, parent) {
	base_scene.apply(this, arguments);
};

util.inherit(SceneStagePause, base_scene);

SceneStagePause.prototype.init = function(){
	base_scene.prototype.init.apply(this, arguments);

	// カーソルがどこにあるか
	this.selectIndex = 0;
};

SceneStagePause.prototype.beforeDraw = function(){
	base_scene.prototype.beforeDraw.apply(this, arguments);

	if(this.core.isKeyPushOrLongDown(CONSTANT.BUTTON_UP)) {
		this.core.playSound('select');
		this.selectIndex--;

		// 最小値を超えないように
		if (this.selectIndex < 0) {
			this.selectIndex = 0;
		}
	}
	else if(this.core.isKeyPushOrLongDown(CONSTANT.BUTTON_DOWN)) {
		this.core.playSound('select');
		this.selectIndex++;

		// 最大値を超えないように
		if (this.selectIndex > 2) {
			this.selectIndex = 2;
		}
	}

	if(this.core.isKeyPushOrLongDown(CONSTANT.BUTTON_SPACE)) {
		this.core.playSound('select');

		// Continue
		this.parent.changeSubScene("play");
	}
	else if(this.core.isKeyPush(CONSTANT.BUTTON_Z)) {
		this.core.playSound('select');
		if(this.selectIndex === 0) {
			// Continue
			this.parent.changeSubScene("play");
		}
		else if(this.selectIndex === 1) {
			// Restart
			this.parent.notifyRestart();
		}
		else if(this.selectIndex === 2) {
			// Quit
			this.parent.notifyQuit();
		}
	}
};

// 画面更新
SceneStagePause.prototype.draw = function(){
	var ctx = this.core.ctx;

	ctx.save();

	ctx.fillStyle = 'rgb( 0, 0, 0 )' ;
	ctx.globalAlpha = 0.7; // 半透明
	ctx.fillRect(0, 0, this.parent.width, this.parent.height);

	ctx.fillStyle = 'rgb( 255, 255, 255 )';
	ctx.textAlign = 'center';
	ctx.font = "18px 'Migu'" ;

	//ctx.textBaseline = 'middle';

	if(this.selectIndex === 0) {
		ctx.globalAlpha = 1.0;
	}
	else {
		ctx.globalAlpha = 0.2;
	}

	ctx.fillText( 'Continue', this.parent.width/2, 200 ) ;

	if(this.selectIndex === 1) {
		ctx.globalAlpha = 1.0;
	}
	else {
		ctx.globalAlpha = 0.2;
	}

	ctx.fillText( 'Restart',     this.parent.width/2, 240 ) ;

	if(this.selectIndex === 2) {
		ctx.globalAlpha = 1.0;
	}
	else {
		ctx.globalAlpha = 0.2;
	}

	ctx.fillText( 'Quit',     this.parent.width/2, 280 ) ;

	ctx.restore();
};
module.exports = SceneStagePause;
