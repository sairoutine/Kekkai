'use strict';

var AssetsConfig = {};
AssetsConfig.images = {
	// タイトルロゴ
	title:         "./image/title.png",
	// タイトル背景
	title_bg:      "./image/title_bg.png",

	// 回想シーン背景
	reminiscence:   "./image/reminiscence.png",

	// プロローグ背景
	shrine_noon:   "./image/shrine_noon.png",

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

	mari_bg:       "./image/mari_bg.png",
	// ノーマルステージクリア後背景
	shrine_night:   "./image/shrine_night.jpg",

	after_ex1:   "./image/after_ex1.jpg",
	after_ex2:   "./image/after_ex2.jpg",
	after_ex3:   "./image/after_ex3.jpg",
	after_ex4:   "./image/after_ex4.jpg",

	epilogue1:   "./image/epilogue1.jpg",
	epilogue2:   "./image/epilogue2.png",
	epilogue3:   "./image/epilogue3.jpg",

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

// sound ファイルはogg と m4a の二種類を用意してください
AssetsConfig.sounds = {
	forbidden:    {
		path: "./sound/forbidden",
		volume: 0.8,
	},
	select:    {
		path: "./sound/select",
		volume: 0.8,
	},
	boss_powerup:    {
		path: "./sound/boss_powerup",
		volume: 0.5,
	},
	dead:    {
		path: "./sound/dead",
		volume: 0.5,
	},
	got_item_ohuda: {
		path: "./sound/got_item_ohuda",
		volume: 0.8,
	},
	got_item_ribon: {
		path: "./sound/got_item_ribon",
		volume: 0.8,
	},

};
// bgm ファイルはogg と m4a の二種類を用意してください
AssetsConfig.bgms = {
	mute: {
		path: "./bgm/mute",
		title: "サンプル",
		message: "サンプルメッセージ",
	},

	title: {
		path: "./bgm/title",
		loopStart: 0*60 + 10 + 0.312,
		loopEnd: 0*60 + 51 + 0.562,
		title: "永夜抄 ～ Eastern Night.",
		message: "東方永夜抄から「永夜抄 ～ Eastern Night.」のアレンジよ",
	},

	stage_a: {
		path: "./bgm/stage_a",
		loopStart: 0*60 + 29 + 0.143,
		loopEnd: 1*60 + 51 + 0.429,
		title: "春色小径 ～ Colorful Path",
		message: "東方花映塚から「春色小径 ～ Colorful Path」のアレンジよ",
	},

};


module.exports = AssetsConfig;
