'use strict';
var core = require('./hakurei').core;
var util = require('./hakurei').util;
var CONSTANT = require('./constant');

// ローディング画面
var SceneLoading = require('./scene/loading');
// タイトル画面
var SceneTitle = require('./scene/title');
// ステージセレクト画面
var SceneSelect = require('./scene/select');
// 回想シーン画面
var SceneReminiscence = require('./scene/reminiscence');
// プロローグ画面
var ScenePrologue = require('./scene/prologue');
var SceneStage = require('./scene/stage');
// 通常ストーリー クリア後画面
var SceneAfterNormal = require('./scene/after_normal');
// Ex エピグラフ画面
var SceneExEpigraph = require('./scene/ex_epigraph');
// Ex プロローグ画面
var SceneExPrologue = require('./scene/ex_prologue');
// Exストーリー クリア後画面
var SceneAfterEx = require('./scene/after_ex');
// スタッフロール
var SceneStaffroll = require('./scene/staffroll');
// エピローグ
var SceneEpilogue = require('./scene/epilogue');

var Game = function(canvas) {
	core.apply(this, arguments);
};
util.inherit(Game, core);

Game.prototype.init = function () {
	core.prototype.init.apply(this, arguments);

	this.addScene("loading", new SceneLoading(this));
	this.addScene("title", new SceneTitle(this));
	this.addScene("select", new SceneSelect(this));
	this.addScene("reminiscence", new SceneReminiscence(this));
	this.addScene("prologue", new ScenePrologue(this));
	this.addScene("stage", new SceneStage(this));
	this.addScene("after_normal", new SceneAfterNormal(this));
	this.addScene("ex_epigraph", new SceneExEpigraph(this));
	this.addScene("ex_prologue", new SceneExPrologue(this));
	this.addScene("after_ex", new SceneAfterEx(this));
	this.addScene("staffroll", new SceneStaffroll(this));
	this.addScene("epilogue", new SceneEpilogue(this));

	this.changeScene("loading");

};
Game.prototype.playSound = function () {
	if (CONSTANT.DEBUG.SOUND_OFF) return;
	return this.audio_loader.playSound.apply(this.audio_loader, arguments);
};
Game.prototype.playBGM = function () {
	if (CONSTANT.DEBUG.SOUND_OFF) return;
	return this.audio_loader.playBGM.apply(this.audio_loader, arguments);
};
Game.prototype.stopBGM = function () {
	if (CONSTANT.DEBUG.SOUND_OFF) return;
	return this.audio_loader.stopBGM.apply(this.audio_loader, arguments);
};





module.exports = Game;
