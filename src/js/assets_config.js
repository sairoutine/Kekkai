'use strict';

var AssetsConfig = {};
AssetsConfig.images = {
	title_bg:      "./image/title_bg.png",
	serif_window:  "./image/serif_window.png",
	stage_bg:      "./image/stage_bg.png",
	block:         "./image/block.png",
	water:         "./image/water.png",
	medama:        "./image/medama.jpg",
	player:        "./image/player.png",
	enemy:         "./image/enemy.png",
	alterego:      "./image/alterego.png",
	exchange:      "./image/exchange.png",
	hashigo:       "./image/hashigo.png",
	item:          "./image/item.png",
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
		path: "./bgm/stage_a.wav",
		loopStart: 0*60 + 29 + 0.03,
		loopEnd: 1*60 + 51 + 0.10,
	},
};


module.exports = AssetsConfig;
