'use strict';

var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;
var CONSTANT = require('../hakurei').constant;

var SceneTitle = function(core) {
	base_scene.apply(this, arguments);
};
util.inherit(SceneTitle, base_scene);

SceneTitle.prototype.beforeDraw = function(){
	base_scene.prototype.beforeDraw.apply(this, arguments);

	if(this.core.isKeyPush(CONSTANT.BUTTON_Z)) {
			//TODO: this.core.playSound('select');
			this.core.changeScene("title");
	}
};

// 画面更新
SceneTitle.prototype.draw = function(){
	this.core.clearCanvas();
	var ctx = this.core.ctx;

	ctx.save();


	// background
	ctx.fillStyle = util.hexToRGBString("000000");
	ctx.fillRect(
		0, 0,
		this.core.width, this.core.height
	);
	ctx.restore();

	// タイトル
	var text = '体験版 終了';
	ctx.textAlign = 'center';
	ctx.fillStyle = 'rgb( 255, 255, 255 )';
	ctx.font = "60px 'ＭＳ ゴシック'";
	ctx.fillText(text, this.core.width/2, 100);

	// メッセージ
	var texts = [
		'ここまでプレイくださり',
		'ありがとうございました。',
		'',
		'完成版は2017年夏コミで頒布予定です。',
		'恐らく以下が豪華になります。',
		'',
		'1. ステージ数が 5 -> 40に増えます。',
		'2. ゆかれいむ成分が増えます。',
		'3. その他もろもろ増えます。',
		'',
		'完成版もよろしくお願いします..！',
	];

	for (var i = 0; i < texts.length; i++) {
		ctx.font = "24px 'ＭＳ ゴシック'";
		ctx.textAlign = 'left';
		ctx.fillStyle = 'rgb( 255, 255, 255 )';
		ctx.fillText(texts[i], 100, 180 + i*30);
	}



	// show press z
	ctx.font = "38px 'ＭＳ ゴシック'";
	ctx.textAlign = 'center';

	if(this.frame_count % 80 > 40) {
		text = "Press Z to Return";
		ctx.fillStyle = 'rgb( 0, 0, 0 )';
		ctx.lineWidth = 4.0;
		ctx.strokeText(text, this.core.width/2, 550);

		ctx.fillStyle = 'rgb( 255, 255, 255 )';
		ctx.fillText(text, this.core.width/2, 550);
	}


	//ctx.fillText('→ Story Start', 280, 400);
	//ctx.fillText('　 Stage Select', 280, 450);
	ctx.restore();
};

module.exports = SceneTitle;
