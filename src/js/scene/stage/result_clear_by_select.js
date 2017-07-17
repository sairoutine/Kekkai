'use strict';
// クリア リザルト

var base_scene = require('../../hakurei').scene.base;
var CONSTANT = require('../../hakurei').constant;
var util = require('../../hakurei').util;
var LogicScore = require('../../logic/score');
var Message = require('../../logic/result_message/select');

var SceneStageResultClearBySelect = function(core, parent) {
	base_scene.apply(this, arguments);
};

util.inherit(SceneStageResultClearBySelect, base_scene);

SceneStageResultClearBySelect.prototype.init = function(){
	base_scene.prototype.init.apply(this, arguments);

	// 表示するメッセージを取得
	this.message = this.getMessage();

	this.move_frame_count0 = 0;
	this.is_show_bg = false;
	this.move_frame_count1 = 1000;
	this.move_frame_count2 = 1000;
	this.move_frame_count3 = -500;
	this.is_show_serif = false;
};

SceneStageResultClearBySelect.prototype.beforeDraw = function(){
	base_scene.prototype.beforeDraw.apply(this, arguments);

	// parent class (stage scene) に所属するオブジェクトを動かす
	for(var i = 0, len = this.parent.objects.length; i < len; i++) {
		this.parent.objects[i].beforeDraw();
	}

	if(this.core.isKeyPush(CONSTANT.BUTTON_Z)) {
		this.core.playSound('select');
		this.goToNextScene();
	}

	// 何もしない
	if (this.move_frame_count0 < 40) {
		this.move_frame_count0 += 1;
	}
	// 背景画像表示
	else if (!this.is_show_bg) {
		this.is_show_bg = true;
	}
	// Stage Clear メッセージ表示
	else if (this.move_frame_count1 > 150) {
		this.move_frame_count1-=50;
	}
	// スコア表示
	else if (this.move_frame_count2 > 250) {
		this.move_frame_count2-=50;
	}
	// キャラ画像表示
	else if (this.move_frame_count3 < 400) {
		this.move_frame_count3+=50;
	}
	// セリフ表示
	else if (!this.is_show_serif) {
		this.is_show_serif = true;
	}

};

// 画面更新
SceneStageResultClearBySelect.prototype.draw = function(){
	var ctx = this.core.ctx;

	/*
	// 背景をちょっと暗転
	ctx.save();
	var alpha = 0.5;
	ctx.fillStyle = 'rgb( 0, 0, 0 )' ;
	ctx.globalAlpha = alpha;
	ctx.fillRect(0, 0, this.parent.width, this.parent.height);
	ctx.restore();
	*/

	if (this.is_show_bg) {
		var image = this.core.image_loader.getImage("mari_bg");
		ctx.drawImage(image,
			// sprite position
			3, 928,
			// sprite size to get
			this.core.width*4, 868,
			// position which where to draw
			0, this.core.height/2 - 868*0.25/2,
			// sprite size to show
			this.core.width, 868 * 0.25
		);
	}

	ctx.save();
	ctx.textAlign = 'left';
	ctx.textBaseAlign = 'middle';

	ctx.fillStyle = 'rgb(232, 52, 33)';
	ctx.font = "24px 'Migu'";
	ctx.fillText("STAGE CLEAR !", this.move_frame_count1, 250);
	ctx.fillRect(this.move_frame_count1, 260, 280, 1);
	ctx.font = "28px 'Migu'";
	ctx.fillText("Score:", this.move_frame_count2, 320);

	// スコア計算
	var honor_num = this.parent.calcHonor();

	var honor_str = "";
	for (var i = 0; i < honor_num; i++) {
		honor_str = honor_str + "★";
	}

	ctx.textAlign = 'right';
	ctx.fillText(honor_str, this.move_frame_count2 + 190, 320);
	ctx.restore();

	// キャラ表示
	this._showRightChara(this.message.chara);

	if (this.is_show_serif) {
		// メッセージウィンドウ
		this._showMessageWindow();

		// メッセージ表示
		this._showMessage(this.message.message);
	}
};

SceneStageResultClearBySelect.prototype._showRightChara = function(image_name){
	var ctx = this.core.ctx;
	ctx.save();

	var x = this.move_frame_count3;
	var y = 65;

	var right_image = this.core.image_loader.getImage(image_name);
	ctx.drawImage(right_image,
		x,
		y,
		right_image.width,
		right_image.height
	);

	ctx.restore();
};

var MESSAGE_WINDOW_OUTLINE_MARGIN = 10;
SceneStageResultClearBySelect.prototype._showMessageWindow = function(){
	var ctx = this.core.ctx;
	// show message window
	ctx.save();

	var message_height = 100;

	ctx.globalAlpha = 0.5;
	ctx.fillStyle = 'rgb(0, 0, 0)';
	ctx.fillRect(
		MESSAGE_WINDOW_OUTLINE_MARGIN,
		this.core.height - 125,
		this.core.width - MESSAGE_WINDOW_OUTLINE_MARGIN * 2,
		message_height
	);

	ctx.restore();
};

// セリフ表示
SceneStageResultClearBySelect.prototype._showMessage = function(message) {
	var ctx = this.core.ctx;
	ctx.save();

	ctx.font = "18px 'Migu'";
	ctx.textAlign = 'left';
	ctx.textBaseAlign = 'middle';

	var x, y;
	// セリフ表示
	var lines = [message];
	if (lines.length) {
		// セリフテキストの y 座標初期位置
		var message_height = 80;
		y = this.core.height - 125 + 40;

		for(var i = 0, len = lines.length; i < len; i++) {
			ctx.fillStyle = 'rgb( 0, 0, 0 )';
			ctx.lineWidth = 4.0;
			ctx.strokeText(lines[i], MESSAGE_WINDOW_OUTLINE_MARGIN * 2 + 20, y); // 1行表示

			ctx.fillStyle = 'white';
			ctx.fillText(lines[i], MESSAGE_WINDOW_OUTLINE_MARGIN * 2 + 20, y); // 1行表示

			y+= 30;
		}
	}

	ctx.restore();
};

// 次のシーンへ
SceneStageResultClearBySelect.prototype.goToNextScene = function() {
	this.parent.notifyResultClearEndBySelect();
};

// メッセージ取得
SceneStageResultClearBySelect.prototype.getMessage = function() {
	var honor_num = this.parent.calcHonor();

	// 称号に該当するメッセージ一覧を取得
	var message_list = Message[honor_num];

	// ランダムに1つ取得
	var message = message_list[Math.floor(Math.random() * message_list.length)];

	return {
		chara: message[0],
		message: message[1],
	};
};








module.exports = SceneStageResultClearBySelect;
