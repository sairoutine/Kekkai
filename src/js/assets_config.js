'use strict';

var AssetsConfig = {};
AssetsConfig.images = {
	// タイトルロゴ
	title:         "./image/title.png",
	// タイトル背景
	title_bg:      "./image/title_bg.png",
	// ステージ画面背景
	stage_bg:      "./image/stage_bg.png",
	// ステージ画面ステージ背景
	bg:            "./image/bg.png",
	stage_tile_24: "./image/stage_tile_24.png",
	stage_tile_32: "./image/stage_tile_32.png",
	block:         "./image/block.png",
	hashigo:       "./image/hashigo.png",
	reimu_angry:   "./image/reimu_angry.png",
	reimu_laugh:   "./image/reimu_laugh.png",
	reimu_laugh2:  "./image/reimu_laugh2.png",
	reimu_normal:  "./image/reimu_normal.png",
	reimu_yoyu:    "./image/reimu_yoyu.png",
	yukari_angry:  "./image/yukari_angry.png",
	yukari_laugh:  "./image/yukari_laugh.png",
	yukari_normal: "./image/yukari_normal.png",
};

AssetsConfig.sounds = {
	forbidden:    "./sound/forbidden.wav",
	select:       "./sound/select.wav",
	boss_powerup: "./sound/boss_powerup.wav",
	dead:         "./sound/dead.wav",
	powerup:      "./sound/powerup.wav",
};

AssetsConfig.bgms = {
	stage_a: {
		path: "./bgm/stage_a.ogg",
		loopStart: 0*60 + 29 + 0.143,
		loopEnd: 1*60 + 51 + 0.429,
	},
	title: {
		path: "./bgm/title.ogg",
		loopStart: 0*60 + 10 + 0.312,
		loopEnd: 0*60 + 51 + 0.562,
	},
};


module.exports = AssetsConfig;
