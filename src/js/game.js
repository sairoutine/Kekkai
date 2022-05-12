'use strict';
var core = require('./hakurei').core;
var util = require('./hakurei').util;
var CONSTANT = require('./constant');

var StorageStory = require('./storage/story');

var FPS_SPAN = 30;

// ローディング画面
var SceneLoading      = require('./scene/00_loading');
// タイトル画面
var SceneTitle        = require('./scene/01_title');
// 回想シーン画面
var SceneReminiscence = require('./scene/02_reminiscence');
// 題字画面
var SceneLogo         = require('./scene/03_logo');
// プロローグ画面
var ScenePrologue     = require('./scene/04_prologue');
// ステージ画面
var SceneStage        = require('./scene/05_stage');
// 通常ストーリー クリア後画面
var SceneAfterNormal  = require('./scene/06_after_normal');
// Ex エピグラフ画面
var SceneExEpigraph   = require('./scene/07_ex_epigraph');
// Ex プロローグ画面
var SceneExPrologue   = require('./scene/08_ex_prologue');
// Exストーリー クリア後画面
var SceneAfterEx      = require('./scene/09_after_ex');
// スタッフロール
var SceneStaffroll    = require('./scene/10_staffroll');
// エピローグ
var SceneEpilogue     = require('./scene/11_epilogue');
// Music Room
var SceneMusic        = require('./scene/music');
// 遊び方
var SceneHowTo        = require('./scene/howto');
// ステージセレクト画面
var SceneSelect       = require('./scene/select');

var Game = function(canvas) {
	core.apply(this, arguments);
};
util.inherit(Game, core);

Game.prototype.init = function () {
	core.prototype.init.apply(this, arguments);

	// 前回にFPSを計算した際の時刻(ミリ秒)
	this.before_time = 0;

	// 計測したFPS
	this.fps = 0;

	// セーブデータ
	this.storage_story = StorageStory.load(); // ストーリー進捗

	this.addScene("loading", new SceneLoading(this));
	this.addScene("title", new SceneTitle(this));
	this.addScene("select", new SceneSelect(this));
	this.addScene("reminiscence", new SceneReminiscence(this));
	this.addScene("logo", new SceneLogo(this));
	this.addScene("prologue", new ScenePrologue(this));
	this.addScene("stage", new SceneStage(this));
	this.addScene("after_normal", new SceneAfterNormal(this));
	this.addScene("ex_epigraph", new SceneExEpigraph(this));
	this.addScene("ex_prologue", new SceneExPrologue(this));
	this.addScene("after_ex", new SceneAfterEx(this));
	this.addScene("staffroll", new SceneStaffroll(this));
	this.addScene("epilogue", new SceneEpilogue(this));
	this.addScene("music", new SceneMusic(this));
	this.addScene("howto", new SceneHowTo(this));

	this.changeScene("loading");

};

Game.prototype.isKeyLongDown = function (key) {
	var time = this.getKeyDownTime(key);
	return time > 30 && time % 5 === 0 ? true : false;
};
Game.prototype.isKeyPushOrLongDown = function (key) {
	return this.isKeyPush(key) || this.isKeyLongDown(key);
};

Game.prototype.playSound = function () {
	if (CONSTANT.DEBUG.SOUND_OFF) return;
	return this.audio_loader.playSound.apply(this.audio_loader, arguments);
};
Game.prototype.playBGM = function () {
	if (CONSTANT.DEBUG.SOUND_OFF) return;
	return this.audio_loader.playBGM.apply(this.audio_loader, arguments);
};
Game.prototype.changeBGM = function () {
	if (CONSTANT.DEBUG.SOUND_OFF) return;
	return this.audio_loader.changeBGM.apply(this.audio_loader, arguments);
};
Game.prototype.stopBGM = function () {
	if (CONSTANT.DEBUG.SOUND_OFF) return;
	return this.audio_loader.stopBGM.apply(this.audio_loader, arguments);
};
Game.prototype.clearStageForDebug = function () {
	// 現在のシーンがステージシーンならば
	if (this.currentScene() instanceof SceneStage) {
		this.currentScene().clearStageForDebug();
	}
};
Game.prototype.run = function(){
	core.prototype.run.apply(this, arguments);
	if(CONSTANT.DEBUG.ON) {
		this._renderFPS();
	}
};
Game.prototype._renderFPS = function(){
	// FPSをレンダリング
	var ctx = this.ctx;
	ctx.save();
	ctx.fillStyle = 'rgb( 6, 40, 255 )';
	ctx.textAlign = 'left';
	ctx.font = "16px 'Migu'";
	ctx.fillText("FPS: " + this.fps, 10, 20);
	ctx.restore();

	// FPS_SPAN 毎にFPSを計測する
	if((this.frame_count % FPS_SPAN) !== 0) return;

	// 現在時刻(ミリ秒)を取得
	var newTime = Date.now();

	if(this.before_time) {
		this.fps = parseInt(1000 * FPS_SPAN / (newTime - this.before_time));
	}

	this.before_time = newTime;
};
Game.prototype.setupDebug = function (dom) {
	if (!CONSTANT.DEBUG.ON) return;

	this.debug_manager.setOn(dom);

	// テキスト追加
	this.debug_manager.addMenuText("Zキーで決定。Xキーで位置入れ替え。矢印キーで移動。\nステージ上のアイテムを全て獲得するとクリア");

	// ゲームスタート ボタン
	this.debug_manager.addMenuButton("Run", function (game) {
		game.startRun();
	});

	// ゲームストップ ボタン
	this.debug_manager.addMenuButton("Stop", function (game) {
		game.stopRun();
	});

	// フルスクリーン ボタン
	this.debug_manager.addMenuButton("最大化", function (game) {
		game.fullscreen();
	});

	// Ex ストーリー クリア ボタン
	this.debug_manager.addMenuButton("現在のステージをクリア", function (game) {
		game.clearStageForDebug();
	});

	// ゲームデータ消去ボタン
	this.debug_manager.addMenuButton("セーブクリア", function (game) {
		game.storage_story.del();
	});

	// 通常ストーリー クリア ボタン
	this.debug_manager.addMenuButton("通常ストーリークリア", function (game) {
		game.storage_story.clearNormalStageForDebug();
	});

	// Ex ストーリー クリア ボタン
	this.debug_manager.addMenuButton("Ex ストーリークリア", function (game) {
		game.storage_story.clearExStageForDebug();
	});
};





module.exports = Game;
