'use strict';

/* 題字画面 */

// メッセージ表示の遷移時間
var TRANSITION_COUNT = 240;

var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;

var SceneLogo = function(core) {
	base_scene.apply(this, arguments);
};
util.inherit(SceneLogo, base_scene);

SceneLogo.prototype.init = function() {
	base_scene.prototype.init.apply(this, arguments);

	this.core.stopBGM();
};

SceneLogo.prototype.beforeDraw = function() {
	base_scene.prototype.beforeDraw.apply(this, arguments);

	// メッセージ表示終了
	if(this.isTransitionEnd()) {
		this.core.changeScene("prologue");
	}
};
SceneLogo.prototype.draw = function(){
	var ctx = this.core.ctx;
	// 背景
	ctx.save();
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, this.core.width, this.core.height);
	ctx.restore();

	// 文字の透過度
	var alpha = 0.0;
	if(this.frame_count < TRANSITION_COUNT/3) {
		alpha = this.frame_count / (TRANSITION_COUNT/3);
	}
	else if (TRANSITION_COUNT/3 <= this.frame_count && this.frame_count < TRANSITION_COUNT*2/3) {
		alpha = 1.0;
	}
	else if (TRANSITION_COUNT*2/3 <= this.frame_count && this.frame_count < TRANSITION_COUNT) {
		alpha = (TRANSITION_COUNT - this.frame_count) / (TRANSITION_COUNT/3);
	}

	// 文字
	var message1 = "幻想郷は全てを受け入れるのよ。";
	var message2 = "それはそれは残酷な話ですわ。";

	var x = this.core.width/2 - 250;

	ctx.save();
	ctx.globalAlpha = alpha;
	ctx.fillStyle = 'rgb( 255, 255, 255 )';
	ctx.textAlign = 'left';
	ctx.font = "30px 'Migu'";
	ctx.fillText(message1, x, this.core.height/2);
	ctx.fillText(message2, x, this.core.height/2 + 35);
	ctx.restore();

};

SceneLogo.prototype.isTransitionEnd = function(){
	return TRANSITION_COUNT < this.frame_count;
};

module.exports = SceneLogo;
