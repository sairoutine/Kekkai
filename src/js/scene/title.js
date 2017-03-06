'use strict';

var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;
var CONSTANT = require('../hakurei').constant;

// transition time ready to show canvas
var SHOW_TRANSITION_COUNT = 100;

// blink interval time
var SHOW_START_MESSAGE_INTERVAL = 50;




var SceneTitle = function(core) {
	base_scene.apply(this, arguments);
};
util.inherit(SceneTitle, base_scene);

SceneTitle.prototype.beforeDraw = function(){
	base_scene.prototype.beforeDraw.apply(this, arguments);

	// TODO: to play bgm

	if(this.core.isKeyPush(CONSTANT.BUTTON_Z)) {
			//TODO: this.core.playSound('select');
			this.core.changeScene("stage");
	}
};

// 画面更新
SceneTitle.prototype.draw = function(){
	this.core.clearCanvas();
	var ctx = this.core.ctx;

	ctx.save();

	// 切り替え効果
	if( this.frame_count < SHOW_TRANSITION_COUNT ) {
		ctx.globalAlpha = this.frame_count / SHOW_TRANSITION_COUNT;
	}
	else {
		ctx.globalAlpha = 1.0;
	}

	// show game title text
	ctx.fillStyle = 'rgb( 0, 0, 0 )';
	ctx.textAlign = 'right';
	ctx.font = "30px 'ＭＳ ゴシック'";
	ctx.fillText('Kekkai(仮)', 400, 225);

	// show press z
	ctx.fillText('Press Z to Start', 400, 350);
	ctx.restore();
};

module.exports = SceneTitle;
