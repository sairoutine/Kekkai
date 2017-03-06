'use strict';
var core = require('./hakurei').core;
var util = require('./hakurei').util;

var SceneLoading = require('./scene/loading');
var SceneTitle = require('./scene/title');
var SceneStage = require('./scene/stage');

var Game = function(canvas) {
	core.apply(this, arguments);
};
util.inherit(Game, core);

Game.prototype.init = function () {
	core.prototype.init.apply(this, arguments);

	this.addScene("loading", new SceneLoading(this));
	this.addScene("title", new SceneTitle(this));
	this.addScene("stage", new SceneStage(this));
	this.changeScene("loading");

};

module.exports = Game;
