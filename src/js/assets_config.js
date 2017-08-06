'use strict';

var AssetsConfig = {};
AssetsConfig.images = {
	// タイトルロゴ
	title:         "./image/title.png",
	// タイトル背景
	title_bg:      "./image/title_bg.png",
	title_bg_without_yukari:      "./image/title_bg_without_yukari.png",

	// メニュー
	menu_story_start_off:    "./image/menu/menu_story_start_off.png",
	menu_story_start_on:     "./image/menu/menu_story_start_on.png",
	menu_ex_story_start_off: "./image/menu/menu_ex_story_start_off.png",
	menu_ex_story_start_on:  "./image/menu/menu_ex_story_start_on.png",
	menu_select_stage_off:   "./image/menu/menu_select_stage_off.png",
	menu_select_stage_on:    "./image/menu/menu_select_stage_on.png",
	menu_music_room_off:     "./image/menu/menu_music_room_off.png",
	menu_music_room_on:      "./image/menu/menu_music_room_on.png",
	menu_how_to_off:         "./image/menu/menu_how_to_off.png",
	menu_how_to_on:          "./image/menu/menu_how_to_on.png",
	menu_config_off:         "./image/menu/menu_config_off.png",
	menu_config_on:          "./image/menu/menu_config_on.png",


	// 回想シーン背景
	reminiscence1:   "./image/reminiscence1.png",
	reminiscence2:   "./image/reminiscence2.jpg",

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
	shrine_night:   "./image/shrine_night.png",

	after_ex1:   "./image/after_ex1.png",
	after_ex2:   "./image/after_ex2.png",
	after_ex3:   "./image/after_ex3.jpg",
	after_ex4:   "./image/after_ex4.png",

	epilogue1:   "./image/epilogue1.png",
	epilogue2:   "./image/epilogue2.png",
	epilogue3:   "./image/epilogue3.jpg",

	// スコアの★
	star_on:       "./image/star_on.png",
	star_off:      "./image/star_off.png",

	// カーソル
	cursor:      "./image/right_arrow.png",

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
	reimu_strength1:   "./image/reimu/strength1.png",
	reimu_strength2:   "./image/reimu/strength2.png",

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
	stage_result1: {
		path: "./sound/stage_result1",
		volume: 1.0,
	},
	drop: {
		path: "./sound/drop",
		volume: 0.5,
	},
	stage_result2: {
		path: "./sound/stage_result2",
		volume: 1.0,
	},
};
// bgm ファイルはogg と m4a の二種類を用意してください
AssetsConfig.bgms = {
	mute: {
		path: "./bgm/mute",
		title: "サンプル",
		message: "サンプルメッセージ",
		is_ex: true,
	},

	title: {
		path: "./bgm/title",
		loopStart: 0*60 + 10 + 0.312,
		loopEnd: 0*60 + 51 + 0.562,
		title: "永夜抄 ～ Eastern Night.",
		message: "東方永夜抄から「永夜抄 ～ Eastern Night.」のアレンジよ",
		is_ex: false,
	},
	reminiscence: {
		path: "./bgm/reminiscence",
		loopStart: 0*60 + 13 + 0.220,
		loopEnd: 1*60 + 22 + 0.373,
		title: "無何有の郷",
		message: "",
		is_ex: false,
	},
	prologue: {
		path: "./bgm/prologue",
		loopStart: 0*60 + 0 + 0.000,
		loopEnd: 0*60 + 52 + 0.881,
		title: "おてんば恋娘",
		message: "",
		is_ex: false,
	},

	stage_a: {
		path: "./bgm/stage_a",
		loopStart: 0*60 + 29 + 0.143,
		loopEnd: 1*60 + 51 + 0.429,
		title: "春色小径 ～ Colorful Path",
		message: "東方花映塚から「春色小径 ～ Colorful Path」のアレンジよ",
		is_ex: false,
	},
	stage_b: {
		path: "./bgm/stage_b",
		loopStart: 0*60 + 0 + 0.000,
		loopEnd: 1*60 + 22 + 0.500,
		title: "少女綺想曲",
		message: "",
		is_ex: false,
	},
	stage_c: {
		path: "./bgm/stage_c",
		loopStart: 0*60 + 14 + 0.746,
		loopEnd: 1*60 + 53 + 0.898,
		title: "夜が降りてくる",
		message: "",
		is_ex: false,
	},
	stage_d: {
		path: "./bgm/stage_d",
		loopStart: 0*60 + 29 + 0.189,
		loopEnd: 1*60 + 47 + 0.027,
		title: "二色蓮花蝶",
		message: "",
		is_ex: false,
	},
	stage_e: {
		path: "./bgm/stage_e",
		loopStart: 0*60 + 0 + 0.000,
		loopEnd: 2*60 + 37 + 0.297,
		title: "ネクロファンタジア",
		message: "",
		is_ex: false,
	},
	title_without_yukari: {
		path: "./bgm/title_without_yukari",
		loopStart: 0*60 + 0 + 0.000,
		loopEnd: 0*60 + 51 + 0.562,
		title: "永夜抄 ～ Eastern Night. (霊夢1人ver.)",
		message: "東方永夜抄から「永夜抄 ～ Eastern Night.」のアレンジよ",
		is_ex: false,
	},
	after_ex: {
		path: "./bgm/after_ex",
		loopStart: 0*60 + 0 + 0.000,
		loopEnd: 1*60 + 9 + 0.153,
		title: "Eternal Dream ～ 幽玄の槭樹",
		message: "",
		is_ex: false,
	},
	staffroll: {
		path: "./bgm/staffroll",
		loopStart: 0*60 + 8 + 0.727,
		loopEnd: 1*60 + 4 + 0.364,
		title: "月見草",
		message: "",
		is_ex: false,
	},





};


module.exports = AssetsConfig;
