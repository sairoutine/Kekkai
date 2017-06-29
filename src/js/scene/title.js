'use strict';

var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;
var StorageSave = require('../save');
var H_CONSTANT = require('../hakurei').constant;
var CONSTANT = require('../constant');

// transition time ready to show canvas
var SHOW_TRANSITION_COUNT = 100;

// blink interval time
var SHOW_START_MESSAGE_INTERVAL = 50;

var MENU = [
	["Story Start", "reminiscence"],
	["Ex Story Start", "ex_epigraph"],
	["Select Stage", "select"],
	["Config", "config"],
	["Music Room", "music"],
];

var SceneTitle = function(core) {
	base_scene.apply(this, arguments);
};
util.inherit(SceneTitle, base_scene);

SceneTitle.prototype.init = function(){
	base_scene.prototype.init.apply(this, arguments);

	// 今どれにカーソルがあるか
	this.index = 0;

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

	// カーソルを下移動
	if(this.core.isKeyPush(H_CONSTANT.BUTTON_DOWN)) {
		this.index++;

		if(this.index >= MENU.length) {
			this.index = MENU.length - 1;
		}
	}
	// カーソルを上移動
	if(this.core.isKeyPush(H_CONSTANT.BUTTON_UP)) {
		this.index--;

		if(this.index < 0) {
			this.index = 0;
		}
	}

	// 決定
	if(this.core.isKeyPush(H_CONSTANT.BUTTON_Z)) {
		this.core.playSound('select');

		var scene_name = MENU[this.index][1];
		this.core.changeScene(scene_name);
	}
};

// 画面更新
SceneTitle.prototype.draw = function(){
	this.core.clearCanvas();
	var ctx = this.core.ctx;

	ctx.save();

	// 切り替え効果
	var alpha;
	if( this.frame_count < SHOW_TRANSITION_COUNT ) {
		alpha = this.frame_count / SHOW_TRANSITION_COUNT;
	}
	else {
		alpha = 1.0;
	}


	var title_bg = this.core.image_loader.getImage('title_bg');
	// 背景画像表示
	ctx.globalAlpha = alpha;
	ctx.drawImage(title_bg,
					0,
					0,
					title_bg.width,
					title_bg.height,
					0,
					0,
					this.core.width,
					this.core.height);

	// タイトルロゴ
	var title = this.core.image_loader.getImage('title');
	ctx.drawImage(title,
					20,
					-20,
					title.width,
					title.height);



	var cursor_x    = this.core.width - 200;
	var text_x      = cursor_x + 30;
	var y = this.core.height/2 - 50;

	// 文字背景 表示
	ctx.fillStyle = 'rgb( 0, 0, 0 )' ;
	ctx.globalAlpha = 0.7; // 半透明
	ctx.fillRect(cursor_x - 10, y - 100, this.core.width - cursor_x - 20, this.core.height - y + 70);

	// 文字表示
	ctx.globalAlpha = 1.0; // 半透明戻す
	ctx.font = "18px 'Migu'";
	ctx.textAlign = 'left';
	ctx.textBaseAlign = 'middle';
	ctx.fillStyle = 'rgb( 255, 255, 255 )';

	for(var i = 0, len = MENU.length; i < len; i++) {
		var menu = MENU[i];

		// 通常ストーリークリア後のみ、Ex Story を表示する
		if(!this.is_normal_stage_cleared && menu[1] === "ex_epigraph") {
			continue;
		}

		if(this.index === i) {
			// cursor 表示
			this._drawText("▶", cursor_x, y);
		}
		// 文字表示
		this._drawText(menu[0], text_x, y); // 1行表示

		y+= 40;
	}

	ctx.restore();


};

SceneTitle.prototype._drawText = function(text, x, y){
	var ctx = this.core.ctx;
	ctx.fillStyle = 'rgb( 0, 0, 0 )';
	ctx.lineWidth = 4.0;
	ctx.strokeText(text, x, y);

	ctx.fillStyle = 'rgb( 255, 255, 255 )';
	ctx.fillText(text, x, y);
};




module.exports = SceneTitle;
