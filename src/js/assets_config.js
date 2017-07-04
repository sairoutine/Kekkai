'use strict';

var AssetsConfig = {};
AssetsConfig.images = {
	// タイトルロゴ
	title:         "./image/title.png",
	// タイトル背景
	title_bg:      "./image/title_bg.png",

	// プロローグ背景
	shrine_noon:   "./image/shrine_noon.jpg",

	// ステージ画面背景
	stage_bg01:      "./image/stage_bg01.png",
	stage_bg02:      "./image/stage_bg02.png",
	stage_bg03:      "./image/stage_bg03.png",
	stage_bg04:      "./image/stage_bg04.png",

	// ステージ画面ステージ背景
	bg:            "./image/bg.png",
	stage_tile_24: "./image/stage_tile_24.png",
	stage_tile_32: "./image/stage_tile_32.png",
	block:         "./image/block.png",
	hashigo:       "./image/hashigo.png",

	// ノーマルステージクリア後背景
	shrine_night:   "./image/shrine_night.jpg",

	yajirushi:      "./image/yajirushi.png",

	thumbnail15:      "./image/thumbnail/15.png",

	reimu_angry1:   "./image/reimu/angry1.png",
	reimu_angry2:   "./image/reimu/angry2.png",
	reimu_confused: "./image/reimu/confused.png",
	reimu_cry:      "./image/reimu/cry.png",
	reimu_laugh:    "./image/reimu/laugh1.png",
	reimu_laugh2:   "./image/reimu/laugh2.png",
	reimu_normal1:  "./image/reimu/normal1.png",
	reimu_normal2:  "./image/reimu/normal2.png",
	reimu_smile:    "./image/reimu/smile.png",
	reimu_yarare:   "./image/reimu/yarare.png",

	yukari_angry:        "./image/yukari/angry.png",
	yukari_confused:     "./image/yukari/confused.png",
	yukari_disappointed: "./image/yukari/disappointed.png",
	yukari_ecstasy1:     "./image/yukari/ecstasy1.png",
	yukari_ecstasy2:     "./image/yukari/ecstasy2.png",
	yukari_laugh:        "./image/yukari/laugh.png",
	yukari_normal1:      "./image/yukari/normal1.png",
	yukari_normal2:      "./image/yukari/normal2.png",
	yukari_normal3:      "./image/yukari/normal3.png",
	yukari_normal4:      "./image/yukari/normal4.png",
	yukari_smile:        "./image/yukari/smile.png",
	yukari_yarare:       "./image/yukari/yarare.png",
};

AssetsConfig.sounds = {
	forbidden:    {
		path: "./sound/forbidden.wav",
		volume: 0.8,
	},
	select:    {
		path: "./sound/select.wav",
		volume: 0.8,
	},
	boss_powerup:    {
		path: "./sound/boss_powerup.wav",
		volume: 0.5,
	},
	dead:    {
		path: "./sound/dead.wav",
		volume: 0.5,
	},
	powerup:    {
		path: "./sound/powerup.wav",
		volume: 0.8,
	},
};

AssetsConfig.bgms = {
	stage_a: {
		path: "./bgm/stage_a.ogg",
		loopStart: 0*60 + 29 + 0.143,
		loopEnd: 1*60 + 51 + 0.429,
		title: "春色小径 ～ Colorful Path",
		message: "東方花映塚から「春色小径 ～ Colorful Path」のアレンジよ",
	},
	title: {
		path: "./bgm/title.ogg",
		loopStart: 0*60 + 10 + 0.312,
		loopEnd: 0*60 + 51 + 0.562,
		title: "永夜抄 ～ Eastern Night.",
		message: "東方永夜抄から「永夜抄 ～ Eastern Night.」のアレンジよ",
	},
};


module.exports = AssetsConfig;
