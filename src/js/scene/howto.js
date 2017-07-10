'use strict';

/* 遊び方 */

var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;
var H_CONSTANT = require('../hakurei').constant;
var CONSTANT = require('../constant');

var HOWTOS = [
	{
		image: "thumbnail15",
		messages: [
			"主人公は霊夢",
		],
	},
	{
		image: "thumbnail15",
		messages: [
			"霊夢が動くと反対側の紫も動く",
		],
	},
	{
		image: "thumbnail15",
		messages: [
			"紫は壁や敵を無視できる",
		],
	},
	{
		image: "thumbnail15",
		messages: [
			"御札は霊夢しか獲得できない",
		],
	},
	{
		image: "thumbnail15",
		messages: [
			"リボンは紫しか獲得できない",
		],
	},
	{
		image: "thumbnail15",
		messages: [
			"Xキーで霊夢と紫の位置を",
			"入れ替えて進もう",
		],
	},
	{
		image: "thumbnail15",
		messages: [
			"入れ替え回数には上限があるよ",
		],
	},
	{
		image: "thumbnail15",
		messages: [
			"ステージのアイテムを",
			"すべて集めるとクリア！",
		],
	},

];



var SceneHowTo = function(core) {
	base_scene.apply(this, arguments);
};
util.inherit(SceneHowTo, base_scene);

SceneHowTo.prototype.init = function(){
	base_scene.prototype.init.apply(this, arguments);
	this.index = 0;
};


SceneHowTo.prototype.beforeDraw = function(){
	base_scene.prototype.beforeDraw.apply(this, arguments);

	// カーソルを下移動
	if(this.core.isKeyPush(H_CONSTANT.BUTTON_RIGHT)) {
		this.index++;

		if(this.index >= HOWTOS.length) {
			this.index = HOWTOS.length - 1;
			// 終了
			this.core.changeScene("title");
		}
	}
	// カーソルを上移動
	if(this.core.isKeyPush(H_CONSTANT.BUTTON_LEFT)) {
		this.index--;

		if(this.index < 0) {
			this.index = 0;
		}
	}

};

// 画面更新
SceneHowTo.prototype.draw = function(){
	this.core.clearCanvas();
	var ctx = this.core.ctx;

	ctx.save();

	var title_bg = this.core.image_loader.getImage('title_bg');
	// 背景画像表示
	ctx.drawImage(title_bg,
					0,
					0,
					title_bg.width,
					title_bg.height,
					0,
					0,
					this.core.width,
					this.core.height);

	// 背景をちょっと暗めに表示
	ctx.fillStyle = 'rgb( 0, 0, 0 )' ;
	ctx.globalAlpha = 0.5; // 半透明
	ctx.fillRect(0, 0, this.core.width, this.core.height);

	ctx.restore();

	ctx.font = "36px 'Migu'";
	ctx.textAlign = 'left';

	// メッセージ
	this._drawText(HOWTOS[this.index].messages[0], 100, 500);
	if (HOWTOS[this.index].messages[1]) {
		this._drawText(HOWTOS[this.index].messages[1], 100, 540);
	}

	// 矢印
	if (this.index !== 0) {
		this._drawText("◀", 10, 250);
	}
	this._drawText("▶", this.core.width - 50, 250);

	// 画像
	var image = this.core.image_loader.getImage(HOWTOS[this.index].image);

	// 背景画像表示
	ctx.drawImage(image,
					0,
					0,
					image.width,
					image.height,
					80,
					20,
					image.width*0.8,
					image.height*0.8
	);

};

SceneHowTo.prototype._drawText = function(text, x, y){
	var ctx = this.core.ctx;
	ctx.fillStyle = 'rgb( 0, 0, 0 )';
	ctx.lineWidth = 4.0;
	ctx.strokeText(text, x, y);

	ctx.fillStyle = 'rgb( 255, 255, 255 )';
	ctx.fillText(text, x, y);
};

module.exports = SceneHowTo;
