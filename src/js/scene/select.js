'use strict';

/* ステージセレクト画面 */


var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;
var H_CONSTANT = require('../hakurei').constant;
var CONSTANT = require('../constant');




var SceneSelect = function(core) {
	base_scene.apply(this, arguments);
};
util.inherit(SceneSelect, base_scene);

SceneSelect.prototype.init = function(){
	base_scene.prototype.init.apply(this, arguments);
};


SceneSelect.prototype.beforeDraw = function(){
	base_scene.prototype.beforeDraw.apply(this, arguments);

};

// 画面更新
SceneSelect.prototype.draw = function(){
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

	// show game title text
	/*
	var title = this.core.image_loader.getImage('title');
	ctx.drawImage(title,
					20,
					-20,
					title.width,
					title.height);
	*/
	// 文字背景 表示
	ctx.fillStyle = 'rgb( 0, 0, 0 )' ;
	ctx.globalAlpha = 0.5; // 半透明
	ctx.fillRect(0, 0, this.core.width, this.core.height);

	// 画面遷移やじるし表示
	ctx.globalAlpha = 1.0; // 半透明戻す
	ctx.fillRect(this.core.width - 170, 0, 160, this.core.height);

	ctx.font = "16px 'Migu'";
	ctx.textAlign = 'left';
	ctx.textBaseAlign = 'middle';
	ctx.fillStyle = 'rgb( 255, 255, 255 )';

	for(var i = 1, len = 25; i <= len; i++) {
		var menu = "Stage " + i.toString();

		if(i === 1) {
			// cursor 表示
			this._drawText("▶", this.core.width - 150, 30 + 20*i);
		}
		// 文字表示
		this._drawText(menu, this.core.width - 120, 30 + 20 * i); // 1行表示

	}




	ctx.fillText("▼", this.core.width - 100, this.core.height- 10);

	// ステージサムネイル 表示
	ctx.fillStyle = 'rgb(255, 255, 255)' ;

	// サムネイル：横720px 縦480px
	var thumbnail = this.core.image_loader.getImage('thumbnail15');
	ctx.font = "36px 'Migu'";
	ctx.textAlign = 'left';
	ctx.fillText("Stage N", 20, 50);
	ctx.drawImage(thumbnail,
					25,
					50,
					30*24,
					20*24,
					10,
					90,
					30*24 *0.80,
					20*24 *0.80);

	ctx.font = "40px 'Migu'";
	this._drawText("★★★", this.core.width - 300, this.core.height - 50);
	ctx.restore();
};
SceneSelect.prototype._drawText = function(text, x, y){
	var ctx = this.core.ctx;
	ctx.fillStyle = 'rgb( 0, 0, 0 )';
	ctx.lineWidth = 4.0;
	ctx.strokeText(text, x, y);

	ctx.fillStyle = 'rgb( 255, 255, 255 )';
	ctx.fillText(text, x, y);
};


module.exports = SceneSelect;
