'use strict';

// scene to load image and sound

var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;

var SceneLoading = function(core) {
	base_scene.apply(this, arguments);
};
util.inherit(SceneLoading, base_scene);

SceneLoading.prototype.init = function() {
	base_scene.prototype.init.apply(this, arguments);
	this.core.image_loader.loadImage("title_bg", "./image/title_bg.png");
	this.core.image_loader.loadImage("block", "./image/block.png");
	this.core.image_loader.loadImage("water", "./image/water.png");
	this.core.image_loader.loadImage("player", "./image/player.png");
	this.core.image_loader.loadImage("enemy", "./image/enemy.png");
	this.core.image_loader.loadImage("alterego", "./image/alterego.png");
	this.core.image_loader.loadImage("exchange", "./image/exchange.png");
	this.core.image_loader.loadImage("hashigo", "./image/hashigo.png");
	this.core.image_loader.loadImage("item", "./image/item.png");
	this.core.image_loader.loadImage("reimu_angry", "./image/reimu_angry.png");
	this.core.image_loader.loadImage("reimu_laugh", "./image/reimu_laugh.png");
	this.core.image_loader.loadImage("reimu_laugh2", "./image/reimu_laugh2.png");
	this.core.image_loader.loadImage("reimu_normal", "./image/reimu_normal.png");
	this.core.image_loader.loadImage("reimu_yoyu", "./image/reimu_yoyu.png");
	this.core.image_loader.loadImage("yukari_angry", "./image/yukari_angry.png");
	this.core.image_loader.loadImage("yukari_angry", "./image/yukari_angry.png");
	this.core.image_loader.loadImage("yukari_laugh", "./image/yukari_laugh.png");
	this.core.image_loader.loadImage("yukari_normal", "./image/yukari_normal.png");

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
