'use strict';
var core = require('./hakurei').core;
var util = require('./hakurei').util;
var CONSTANT = require('./constant');

var SceneLoading = require('./scene/loading');
var SceneTitle = require('./scene/title');
var SceneStage = require('./scene/stage');
var PreReleaseEnd = require('./scene/prerelease_end');

var Game = function(canvas) {
	core.apply(this, arguments);
};
util.inherit(Game, core);

Game.prototype.init = function () {
	core.prototype.init.apply(this, arguments);

	this.addScene("loading", new SceneLoading(this));
	this.addScene("title", new SceneTitle(this)); // タイトル画面

	/*
	this.addScene("epigraph", new SceneEpiGraph(this)); // エピグラフ画面(詩の一節)
	this.addScene("reminiscence", new SceneReminiscence(this)); // 回想画面
	this.addScene("prologue", new ScenePrologue(this)); // プロローグ
	*/

	this.addScene("stage", new SceneStage(this));
	/*
	// Exプロローグ
	// もし、この幻想郷が全てを受け入れるというのであれば
	// この結末を受け入れない私もまた、受け入れる筈よ！
	this.addScene("ex_prologue", new SceneExPrologue(this));
	*/

	/*
	this.addScene("stage_end", new SceneStageEnd(this));
	this.addScene("staff_roll", new SceneStaffRoll(this));
	this.addScene("epilogue", new SceneEpilogue(this));
	*/

	this.addScene("prerelease_end", new PreReleaseEnd(this));

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
