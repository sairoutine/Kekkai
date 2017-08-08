'use strict';

/* 立ち絵＆セリフ */
var MESSAGE_WINDOW_OUTLINE_MARGIN = 10;
var TALKER_MOVE_PX = 5;
var SCALE = 1;

var TRANSITION_COUNT = 100;

// セリフウィンドウの縦の長さ
var MESSAGE_WINDOW_HEIGHT = 100;


var util = require('../hakurei').util;
var CONSTANT = require('../constant');
var H_CONSTANT = require('../hakurei').constant;
var base_scene = require('../hakurei').scene.base;

var SerifManager = require('../hakurei').serif_manager;

var CreateDarkerImage = require('../logic/create_darker_image');

var SceneSerifBase = function(game) {
	base_scene.apply(this, arguments);

	this.serif = new SerifManager();
};

util.inherit(SceneSerifBase, base_scene);

SceneSerifBase.prototype.init = function(serif){
	base_scene.prototype.init.apply(this, arguments);
	this.serif.init(this.serifScript());

	this.transition_count = 0;

	// シーン遷移前の BGM 止める
	this.core.stopBGM();

	if (this.isPlayFadeIn()) {
		this.setFadeIn(60);
	}

	if (this.isPlayFadeOut()) {
		this.setFadeOut(60);
	}
};

SceneSerifBase.prototype.beforeDraw = function(){
	base_scene.prototype.beforeDraw.apply(this, arguments);

	// BGM 再生
	if (this.frame_count === 60 && this.bgm()) {
		this.core.playBGM(this.bgm());
	}


	if (this.isInTransition()) {
		this.transition_count--;

		// トランジションが終わればセリフ送り再開
		if (this.transition_count === 0) {
			this.serif.startPrintMessage();
		}
	}


	if(this.core.isKeyPush(H_CONSTANT.BUTTON_Z)) {
		if(this.serif.is_end()) {
			this.notifySerifEnd();
		}
		else {
			// トランジション中でなければ
			if (!this.isInTransition()) {
				// セリフを送る
				this.serif.next();

				if (this.serif.is_background_changed()) {
					// トランジション開始
					this.transition_count = TRANSITION_COUNT;

					// トランジション中はセリフ送り中断
					this.serif.cancelPrintMessage();
				}
			}
			else {
				// トランジション終了
				this.transition_count = 0;
				// トランジションが終わればセリフ送り再開
				this.serif.startPrintMessage();
			}
		}
	}

	// スキップ
	if(this.core.isKeyPush(H_CONSTANT.BUTTON_X)) {
		this.notifySerifEnd();
	}
};

// 画面更新
SceneSerifBase.prototype.draw = function(){
	base_scene.prototype.draw.apply(this, arguments);
	var ctx = this.core.ctx;

	if (this.isInTransition()) {
		ctx.fillStyle = this.backgroundTransitionColor();
		ctx.fillRect(0, 0, this.width, this.height);

		// 背景表示
		ctx.globalAlpha = (TRANSITION_COUNT - this.transition_count) / TRANSITION_COUNT;
		this._showBackground();
		ctx.globalAlpha = 1.0;
	}
	else {
		// 背景表示
		this._showBackground();

		// キャラ表示
		if(this.serif.right_image()) {
			this._showRightChara();
		}
		if(this.serif.left_image()) {
			this._showLeftChara();
		}

		// メッセージウィンドウ表示
		this._showMessageWindow();

		// メッセージ表示
		this._showMessage();

		// 操作説明 表示
		this._showHowTo();

	}
};

// 背景画像表示
SceneSerifBase.prototype._showBackground = function(){
	var ctx = this.core.ctx;
	var background_name = this.serif.background_image() ? this.serif.background_image() : this.background();
	var background = this.core.image_loader.getImage(background_name);
	ctx.drawImage(background,
					0,
					0,
					background.width,
					background.height,
					0,
					0,
					this.core.width,
					this.core.height);
};

SceneSerifBase.prototype._showRightChara = function(){
	var ctx = this.core.ctx;
	ctx.save();

	var x = 400;
	var y = 65;

	var right_image = this.core.image_loader.getImage(this.serif.right_image());
	if(!this.serif.is_right_talking()) {
		// 喋ってない方のキャラは暗くなる
		right_image = CreateDarkerImage.exec(right_image);
	}
	else {
		x -= TALKER_MOVE_PX;
		y -= TALKER_MOVE_PX;
	}


	ctx.drawImage(right_image,
		x,
		y,
		right_image.width  * SCALE,
		right_image.height * SCALE
	);

	ctx.restore();
};

SceneSerifBase.prototype._showLeftChara = function(){
	var ctx = this.core.ctx;
	ctx.save();

	var x = -50;
	var y = 25;

	var left_image = this.core.image_loader.getImage(this.serif.left_image());
	if(!this.serif.is_left_talking()) {
		// 喋ってない方のキャラは暗くなる
		left_image = CreateDarkerImage.exec(left_image);
	}
	else {
		x += TALKER_MOVE_PX;
		y -= TALKER_MOVE_PX;
	}


	ctx.drawImage(left_image,
		x,
		y,
		left_image.width  * SCALE,
		left_image.height * SCALE
	);

	ctx.restore();
};

SceneSerifBase.prototype._showMessageWindow = function(){
	var ctx = this.core.ctx;
	// show message window
	ctx.save();

	ctx.globalAlpha = 0.5;
	ctx.fillStyle = 'rgb( 0, 0, 0 )';
	ctx.fillRect(
		MESSAGE_WINDOW_OUTLINE_MARGIN,
		this.core.height - 125,
		this.core.width - MESSAGE_WINDOW_OUTLINE_MARGIN * 2,
		MESSAGE_WINDOW_HEIGHT
	);

	ctx.restore();
};

// セリフ表示
SceneSerifBase.prototype._showMessage = function() {
	var ctx = this.core.ctx;
	ctx.save();

	// セリフの色
	var font_color = this.serif.font_color();
	if(font_color) {
		font_color = util.hexToRGBString(font_color);
	}
	else {
		font_color = 'rgb(255, 255, 255)';
	}

	ctx.font = "18px 'Migu'";
	ctx.textAlign = 'left';
	ctx.textBaseAlign = 'middle';

	var x, y;
	// セリフ表示
	var lines = this.serif.lines();
	if (lines.length) {
		// セリフテキストの y 座標初期位置
		y = this.core.height - 125 + 40;

		for(var i = 0, len = lines.length; i < len; i++) {
			ctx.fillStyle = 'rgb( 0, 0, 0 )';
			ctx.lineWidth = 4.0;
			ctx.strokeText(lines[i], MESSAGE_WINDOW_OUTLINE_MARGIN * 2 + 20, y); // 1行表示

			ctx.fillStyle = font_color;
			ctx.fillText(lines[i], MESSAGE_WINDOW_OUTLINE_MARGIN * 2 + 20, y); // 1行表示

			y+= 30;
		}
	}

	ctx.restore();
};

// 操作説明 表示
SceneSerifBase.prototype._showHowTo = function() {
	var ctx = this.core.ctx;
	ctx.save();

	var text = "Xキー：スキップ";

	ctx.font = "14px 'Migu'";
	ctx.textAlign = 'left';
	ctx.textBaseAlign = 'middle';

	ctx.fillStyle = 'rgb( 0, 0, 0 )';
	ctx.lineWidth = 4.0;
	ctx.strokeText(text, this.core.width - 130, this.core.height - 10);

	ctx.fillStyle = 'white';
	ctx.fillText(text, this.core.width - 130, this.core.height - 10);

	ctx.restore();
};




// 立ち絵＆セリフ終了後
SceneSerifBase.prototype.notifySerifEnd = function() {
	throw new Error("notifySerifEnd method must be defined.");
};

// セリフスクリプト
SceneSerifBase.prototype.serifScript = function() {
	throw new Error("serifScript method must be defined.");
};

// 背景画像名
SceneSerifBase.prototype.background = function() {
	throw new Error("background method must be defined.");
};
// トランジションカラー
SceneSerifBase.prototype.backgroundTransitionColor = function() {
	return "white";
};
// BGM
SceneSerifBase.prototype.bgm = function() {
};

// フェードインするかどうか
SceneSerifBase.prototype.isPlayFadeIn = function() {
	return false;
};
// フェードアウトするかどうか
SceneSerifBase.prototype.isPlayFadeOut = function() {
	return false;
};





SceneSerifBase.prototype.isInTransition = function() {
	return this.transition_count ? true : false;
};




module.exports = SceneSerifBase;
