'use strict';

var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;
var H_CONSTANT = require('../hakurei').constant;
var CONSTANT = require('../constant');

// transition time ready to show canvas
var SHOW_TRANSITION_COUNT = 100;

// blink interval time
var SHOW_START_MESSAGE_INTERVAL = 50;

var MENU = [
	["menu_story_start", "reminiscence", function (core) {
		var progress_stage_no = core.storage_story.getNormalStageProgress();

		// 最初から
		if (!progress_stage_no) {
			// 回想シーン画面へ
			core.changeScene("reminiscence");
		}
		// 続きから
		else {
			// 続きのステージから
			core.changeScene("stage", progress_stage_no + 1, "talk");
		}
	}],
	["menu_ex_story_start", "ex_epigraph", function (core) {
		var progress_stage_no = core.storage_story.getExStageProgress();

		// 最初から
		if (!progress_stage_no) {
			// Ex エピグラフ画面へ
			core.changeScene("ex_epigraph");
		}
		// 続きから
		else {
			// 続きのステージから
			core.changeScene("stage", progress_stage_no + 1, "talk");
		}
	}],
	["menu_select_stage", "select", function (core) {
		// ステージセレクト画面へ
		core.changeScene("select");
	}],
	/*
	["menu_how_to", "howto", function (core) {
		// 遊び方画面へ
		core.changeScene("howto");
	}],
	["menu_config", "config", function (core) {
		core.changeScene("config");
	}],
	*/
	["menu_music_room", "music", function (core) {
		// Music Room 画面へ
		core.changeScene("music");
	}],
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
	var is_normal_stage_cleared = this.core.storage_story.getIsNormalStageCleared();

	// いずれかのステージがクリアされているかどうか
	var is_any_stage_cleared = this.core.storage_story.getLatestStageResult() ? true : false;

	// メニュー一覧
	this.menu_list = [];
	for(var i = 0, len = MENU.length; i < len; i++) {
		var menu = MENU[i];

		// 通常ストーリークリア後のみ、Ex Story を表示する
		if(!is_normal_stage_cleared && menu[1] === "ex_epigraph") {
			continue;
		}
		// stage 1クリア後のみ、ステージセレクトを表示する
		else if (!is_any_stage_cleared && menu[1] === "select") {
			continue;
		}

		this.menu_list.push(menu);
	}

	this.core.stopBGM();

	// フェードインする
	this.setFadeIn(SHOW_TRANSITION_COUNT);
};


SceneTitle.prototype.beforeDraw = function(){
	base_scene.prototype.beforeDraw.apply(this, arguments);

	if(this.frame_count === 60) {
		// 通常ストーリーのみクリアしていれば、BGMを霊夢1人 ver に
		if(this.core.storage_story.getIsNormalStageCleared() && !this.core.storage_story.getIsExStageCleared()) {
			this.core.playBGM("title_without_yukari");
		}
		else {
			this.core.playBGM("title");
		}


	}

	// カーソルを下移動
	if(this.core.isKeyPushOrLongDown(H_CONSTANT.BUTTON_DOWN)) {
		this.core.playSound('select');
		this.index++;

		if(this.index >= this.menu_list.length) {
			this.index = this.menu_list.length - 1;
		}
	}
	// カーソルを上移動
	if(this.core.isKeyPushOrLongDown(H_CONSTANT.BUTTON_UP)) {
		this.core.playSound('select');
		this.index--;

		if(this.index < 0) {
			this.index = 0;
		}
	}

	// 決定
	if(this.core.isKeyPush(H_CONSTANT.BUTTON_Z)) {
		this.core.playSound('select');

		// メニューに設定された関数を実行
		var exec_func = this.menu_list[this.index][2];
		exec_func(this.core);
	}
};

// 画面更新
SceneTitle.prototype.draw = function(){
	this.core.clearCanvas();
	var ctx = this.core.ctx;

	ctx.save();

	var title_bg;
	// 通常ストーリーのみクリアしていれば、背景を霊夢1人 ver に
	if(this.core.storage_story.getIsNormalStageCleared() && !this.core.storage_story.getIsExStageCleared()) {
		title_bg = this.core.image_loader.getImage('title_bg_without_yukari');
	}
	else {
		title_bg = this.core.image_loader.getImage('title_bg');
	}

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

	// タイトルロゴ
	var title = this.core.image_loader.getImage('title');
	ctx.drawImage(title,
					20,
					-20,
					title.width,
					title.height);



	var text_x    = this.core.width - 120;
	var y = 130;

	// メニュー一覧表示
	for(var i = 0, len = this.menu_list.length; i < len; i++) {
		var menu = this.menu_list[i];

		var suffix, pre_x;
		if(this.index === i) {
			suffix = "_on";
			pre_x = 10;
		}
		else {
			suffix = "_off";
			pre_x = 0;
		}
		var menu_image = this.core.image_loader.getImage(menu[0] + suffix);
		ctx.drawImage(menu_image,
						text_x - pre_x,
						y,
						menu_image.width,
						menu_image.height);
		y+= menu_image.height;
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
