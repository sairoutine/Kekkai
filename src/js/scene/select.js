'use strict';

/* ステージセレクト画面 */


var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;
var StorageSave = require('../save');
var H_CONSTANT = require('../hakurei').constant;
var CONSTANT = require('../constant');




var SceneTitle = function(core) {
	base_scene.apply(this, arguments);
};
util.inherit(SceneTitle, base_scene);

SceneTitle.prototype.init = function(){
	base_scene.prototype.init.apply(this, arguments);

	// Exステージ解放されているかどうか */
	var save_data = StorageSave.load();
	if(!save_data) {
		save_data = new StorageSave();
	}
	this.is_normal_stage_cleared = save_data.getIsNormalStageCleared();

	this.core.stopBGM();
};


SceneTitle.prototype.beforeDraw = function(){
	base_scene.prototype.beforeDraw.apply(this, arguments);

	if(this.frame_count === 60) {
		this.core.playBGM("title");
	}

	if(this.core.isKeyPush(H_CONSTANT.BUTTON_Z)) {
		this.core.playSound('select');

		if(this.is_normal_stage_cleared) {
			// Exストーリー
			this.core.changeScene("ex_epigraph");
		}
		else {
			// 通常ストーリー
			this.core.changeScene("reminiscence");
		}

	}
};

// 画面更新
SceneTitle.prototype.draw = function(){
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
	var title = this.core.image_loader.getImage('title');
	ctx.drawImage(title,
					20,
					-20,
					title.width,
					title.height);

	// 文字背景 表示
	ctx.fillStyle = 'rgb( 0, 0, 0 )' ;
	ctx.globalAlpha = 0.7; // 半透明
	ctx.fillRect(0, 0, this.core.width, this.core.height);

	// 画面遷移やじるし表示
	ctx.globalAlpha = 1.0; // 半透明戻す
	ctx.font = "36px 'Migu'";
	ctx.textAlign = 'center';
	ctx.textBaseAlign = 'middle';
	ctx.fillStyle = 'rgb( 255, 255, 255 )';
	ctx.fillText("▶", this.core.width - 30, this.core.height/2 - 10);
	ctx.fillText("◀", 30,                   this.core.height/2 - 10);

	// ステージサムネイル 表示
	ctx.fillStyle = 'rgb(255, 255, 255)' ;

	// サムネイル：横720px 縦480px
	var thumbnail = this.core.image_loader.getImage('thumbnail15');
	var i;
	ctx.font = "24px 'Migu'";
	ctx.textAlign = 'left';
	for (i = 0; i<2; i++) {
		ctx.fillText("Stage N", 70 + 310*i, 80);
		ctx.drawImage(thumbnail,
						25,
						50,
						30*24,
						20*24,
						70+310*i,
						100,
						30*24 *0.40,
						20*24 *0.40);
	}
	for (i = 0; i<2; i++) {
		ctx.fillText("Stage N", 70 + 310*i, 320);
		ctx.drawImage(thumbnail,
						25,
						50,
						30*24,
						20*24,
						70+310*i,
						330,
						30*24 *0.40,
						20*24 *0.40);

	}

	// カーソル矢印
	var yajirushi = this.core.image_loader.getImage('yajirushi');
	ctx.drawImage(yajirushi,
					300,
					510,
					yajirushi.width*0.20,
					yajirushi.height*0.20);


	ctx.restore();
};

module.exports = SceneTitle;
