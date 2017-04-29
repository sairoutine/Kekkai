'use strict';

// メッセージを表示する間隔
var SHOW_MESSAGE_INTERVAL = 50;

// メッセージの黒帯の表示
var RESULT_TRANSITION_COUNT = 100;

var base_scene = require('../../hakurei').scene.base;
var CONSTANT = require('../../hakurei').constant;
var util = require('../../hakurei').util;

var SceneStageResultBase = function(core, parent) {
	base_scene.apply(this, arguments);
};

util.inherit(SceneStageResultBase, base_scene);

SceneStageResultBase.prototype.init = function(){
	base_scene.prototype.init.apply(this, arguments);

	this.transitionStartFrame = 0;
};

SceneStageResultBase.prototype.beforeDraw = function(){
	base_scene.prototype.beforeDraw.apply(this, arguments);

	if(this.isTransitionEnd()) {
		//this.core.stopBGM();
		this.notifyResultEnd();
	}
	else {
		if(this.core.isKeyPush(CONSTANT.BUTTON_Z) && !this.isInTransition()) {
				this.core.playSound('select');
				this.setTransition();
		}
	}

};

SceneStageResultBase.prototype.isInTransition = function(){
	return this.transitionStartFrame ? true : false;
};
SceneStageResultBase.prototype.isTransitionEnd = function(){
	return this.isInTransition() && (this.transitionStartFrame + RESULT_TRANSITION_COUNT < this.frame_count);
};
SceneStageResultBase.prototype.setTransition = function(){
	this.transitionStartFrame = this.frame_count;
};

// 画面更新
SceneStageResultBase.prototype.draw = function(){
	var ctx = this.core.ctx;

	// スコア表示
	this._showScoreWindow();

	// トランジション表示
	if(this.isInTransition()) {
		ctx.save();
		var alpha = 1.0 ;
		if(this.transitionStartFrame + RESULT_TRANSITION_COUNT >= this.frame_count) {
			alpha = (this.frame_count - this.transitionStartFrame) / RESULT_TRANSITION_COUNT;
		}
		else {
			alpha = 1.0;
		}
		ctx.fillStyle = 'rgb( 0, 0, 0 )' ;
		ctx.globalAlpha = alpha;
		ctx.fillRect(0, 0, this.parent.width, this.parent.height);

		ctx.restore();
	}

};
SceneStageResultBase.prototype._showScoreWindow = function(){
	var ctx = this.core.ctx;

	ctx.save();

	var alpha = 1.0 ;
	if(this.frame_count < RESULT_TRANSITION_COUNT) {
		alpha = this.frame_count / RESULT_TRANSITION_COUNT;
	}
	else {
		alpha = 1.0;
	}

	ctx.fillStyle = 'rgb(119, 66, 244)' ;
	ctx.globalAlpha = alpha * 1.0; // タイトル背景黒は半透明
	ctx.fillRect( this.parent.width/2 - 100, this.parent.height/2 - 140, 100*2, 140);

	ctx.globalAlpha = alpha; // 文字を表示するので戻す

	ctx.fillStyle = 'rgb( 0, 0, 0 )';
	ctx.textAlign = 'center';
	ctx.font = "18px 'Migu'" ;
	ctx.fillText(this.resultName(), this.parent.width/2, 180);


	ctx.fillStyle = 'rgb( 0, 0, 0 )';
	ctx.textAlign = 'left';
	ctx.font = "16px 'Migu'" ;
	// N秒ごとにメッセージを点滅
	if (Math.floor(this.frame_count / SHOW_MESSAGE_INTERVAL) % 2 === 0) {
		ctx.textAlign = 'center';
		ctx.fillText(this.resultMessage(), this.parent.width/2, 255);
	}

	ctx.restore();
};

// リザルト画面のタイトル名
SceneStageResultBase.prototype.resultName = function(){
	return "";
};

// リザルト画面のメッセージ
SceneStageResultBase.prototype.resultMessage = function(){
	return "";
};

// リザルト画面が終了したら
SceneStageResultBase.prototype.notifyResultEnd = function(){
	console.error("notifyResultEnd method must be overridden");
};

module.exports = SceneStageResultBase;

