'use strict';

// scene to load image and sound

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
	for (var key in AssetsConfig) {
		this.core.image_loader.loadImage(key, AssetsConfig[key]);
	}
};

SceneLoading.prototype.beforeDraw = function() {
	base_scene.prototype.beforeDraw.apply(this, arguments);

	if (this.core.image_loader.isAllLoaded()) {
		this.core.changeScene("title");
	}
};
SceneLoading.prototype.draw = function(){
	base_scene.prototype.draw.apply(this, arguments);

	// TODO: update loading message
	var ctx = this.core.ctx;
	ctx.save();
	ctx.fillStyle = 'rgb( 0, 0, 0 )';
	ctx.textAlign = 'right';
	ctx.font = "30px 'ＭＳ ゴシック'";
	ctx.fillText('Now Loading...', 400, 225);
	ctx.restore();
};

module.exports = SceneLoading;
