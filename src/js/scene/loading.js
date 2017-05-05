'use strict';

// ローディングシーン

var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;
var AssetsConfig = require('../assets_config');

var SceneLoading = function(core) {
	base_scene.apply(this, arguments);
};
util.inherit(SceneLoading, base_scene);

SceneLoading.prototype.init = function() {
	base_scene.prototype.init.apply(this, arguments);

	// ゲームで使用する画像一覧
	for (var key in AssetsConfig.images) {
		this.core.image_loader.loadImage(key, AssetsConfig.images[key]);
	}

	// ゲームで使用するSE一覧
	for (var key2 in AssetsConfig.sounds) {
		var conf2 = AssetsConfig.sounds[key2];
		this.core.audio_loader.loadSound(key2, conf2.path, conf2.volume);
	}

	// ゲームで使用するBGM一覧
	for (var key3 in AssetsConfig.bgms) {
		var conf3 = AssetsConfig.bgms[key3];
		this.core.audio_loader.loadBGM(key3, conf3.path, 1.0, conf3.loopStart, conf3.loopEnd);
	}
};

SceneLoading.prototype.beforeDraw = function() {
	base_scene.prototype.beforeDraw.apply(this, arguments);

	if (this.core.image_loader.isAllLoaded() && this.core.audio_loader.isAllLoaded() && this.core.font_loader.isAllLoaded()) {
		this.core.changeScene("title");
	}
};
SceneLoading.prototype.draw = function(){
	base_scene.prototype.draw.apply(this, arguments);
	var ctx = this.core.ctx;

	// 背景
	ctx.save();
	ctx.fillStyle = 'white';
	ctx.fillRect(0, 0, this.core.width, this.core.height);
	ctx.restore();

	// メッセージ
	var per_frame = this.frame_count % 60;
	var DOT_SPAN = 15;

	var dot = "";
	if (DOT_SPAN > per_frame && per_frame >= 0) {
		dot = "";
	}
	else if (DOT_SPAN*2 > per_frame && per_frame >= DOT_SPAN*1) {
		dot = ".";
	}
	else if (DOT_SPAN*3 > per_frame && per_frame >= DOT_SPAN*2) {
		dot = "..";
	}
	else {
		dot = "...";
	}

	ctx.save();
	ctx.fillStyle = 'rgb( 0, 0, 0 )';
	ctx.textAlign = 'left';
	ctx.font = "30px 'Migu'";
	ctx.fillText('Now Loading' + dot, this.core.width - 250, this.core.height - 50);
	ctx.restore();


	// プログレスバー
	ctx.save();
	ctx.fillStyle = 'rgb(119, 66, 244)';
	ctx.fillRect(0, this.core.height - 20, this.core.width * this.progress(), 50);
	ctx.restore();
};


SceneLoading.prototype.progress = function(){
	return(this.core.audio_loader.progress() + this.core.image_loader.progress() + this.core.font_loader.progress()) / 3;
};

module.exports = SceneLoading;
