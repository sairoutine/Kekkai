'use strict';

var CONSTANT = require("./constant");

var AssetsConfig = {};

// 体験版用
AssetsConfig.images = {
	// タイトルロゴ
	title:         "./image/trial/title.png",
	// タイトル背景
	title_bg:      "./image/trial/title_bg.png",

	// メニュー
	menu_story_start_off:    "./image/trial/menu/menu_story_start_off.png",
	menu_story_start_on:     "./image/trial/menu/menu_story_start_on.png",
	menu_ex_story_start_off: "./image/trial/menu/menu_ex_story_start_off.png",
	menu_ex_story_start_on:  "./image/trial/menu/menu_ex_story_start_on.png",
	menu_select_stage_off:   "./image/trial/menu/menu_select_stage_off.png",
	menu_select_stage_on:    "./image/trial/menu/menu_select_stage_on.png",
	menu_music_room_off:     "./image/trial/menu/menu_music_room_off.png",
	menu_music_room_on:      "./image/trial/menu/menu_music_room_on.png",
	menu_how_to_off:         "./image/trial/menu/menu_how_to_off.png",
	menu_how_to_on:          "./image/trial/menu/menu_how_to_on.png",
	menu_config_off:         "./image/trial/menu/menu_config_off.png",
	menu_config_on:          "./image/trial/menu/menu_config_on.png",


	// 回想シーン背景
	reminiscence1:   "./image/trial/reminiscence1.png",
	reminiscence2:   "./image/trial/reminiscence2.jpg",

	// プロローグ背景
	shrine_noon:   "./image/trial/shrine_noon.png",

	// ステージ画面背景
	stage_bg01:      "./image/trial/stage_bg01.png",
	stage_bg02:      "./image/trial/stage_bg02.png",
	stage_bg03:      "./image/trial/stage_bg03.png",
	stage_bg04:      "./image/trial/stage_bg04.png",

	// ステージ画面ステージ背景
	bg:            "./image/trial/bg.png",
	stage_tile_24: "./image/trial/stage_tile_24.png",
	stage_tile_32: "./image/trial/stage_tile_32.png",
	block:         "./image/trial/block.png",
	hashigo:       "./image/trial/hashigo.png",
	//tile_brown:  "./image/trial/tile_brown.gif",
	//tile_purple: "./image/trial/tile_purple.gif",
	tile_gray:   "./image/trial/tile_gray.gif",
	tile_red:    "./image/trial/tile_red.gif",

	mari_bg:       "./image/trial/mari_bg.png",
	// スコアの★
	star_on:       "./image/trial/star_on.png",
	star_off:      "./image/trial/star_off.png",

	// カーソル
	cursor:      "./image/trial/right_arrow.png",

	reimu_angry1:   "./image/trial/reimu/angry1.png",
	reimu_angry2:   "./image/trial/reimu/angry2.png",
	reimu_confused: "./image/trial/reimu/confused.png",
	reimu_cry:      "./image/trial/reimu/cry.png",
	reimu_laugh:    "./image/trial/reimu/laugh1.png",
	reimu_laugh2:   "./image/trial/reimu/laugh2.png",
	reimu_normal1:  "./image/trial/reimu/normal1.png",
	reimu_normal2:  "./image/trial/reimu/normal2.png",
	reimu_smile:    "./image/trial/reimu/smile.png",
	reimu_yarare:   "./image/trial/reimu/yarare.png",
	reimu_strength1:   "./image/trial/reimu/strength1.png",
	reimu_strength2:   "./image/trial/reimu/strength2.png",

	yukari_angry:        "./image/trial/yukari/angry.png",
	yukari_confused:     "./image/trial/yukari/confused.png",
	yukari_disappointed: "./image/trial/yukari/disappointed.png",
	yukari_ecstasy1:     "./image/trial/yukari/ecstasy1.png",
	yukari_ecstasy2:     "./image/trial/yukari/ecstasy2.png",
	yukari_laugh:        "./image/trial/yukari/laugh.png",
	yukari_normal1:      "./image/trial/yukari/normal1.png",
	yukari_normal2:      "./image/trial/yukari/normal2.png",
	yukari_normal3:      "./image/trial/yukari/normal3.png",
	yukari_normal4:      "./image/trial/yukari/normal4.png",
	yukari_smile:        "./image/trial/yukari/smile.png",
	yukari_yarare:       "./image/trial/yukari/yarare.png",
};


// 画像(完成版)
if (!CONSTANT.TRIAL) {
	Object.assign(AssetsConfig.images, {
		title_bg_without_yukari:      "./image/production/title_bg_without_yukari.png",

		// ノーマルステージクリア後背景
		shrine_night:   "./image/production/shrine_night.png",

		after_ex1:   "./image/production/after_ex1.png",
		after_ex2:   "./image/production/after_ex2.png",
		after_ex3:   "./image/production/after_ex3.jpg",
		after_ex4:   "./image/production/after_ex4.png",

		epilogue1:   "./image/production/epilogue1.png",
		epilogue2:   "./image/production/epilogue2.png",
		epilogue3:   "./image/production/epilogue3.jpg",
	});
}

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

// BGM(体験版)
// bgm ファイルはogg と m4a の二種類を用意してください
AssetsConfig.bgms = {
	title: {
		path: "./bgm/trial/title",
		loopStart: 0*60 + 10 + 0.312,
		loopEnd: 0*60 + 51 + 0.562,
		title: "永夜抄 ～ Eastern Night.",
		message: "チップチューンだけど、チップチューンっぽくない感じのアレンジね。\n曲制作者もうまく出来たって言ってるわ。",
		is_normal: false,
		is_ex:     false,
	},
	reminiscence: {
		path: "./bgm/trial/reminiscence",
		loopStart: 0*60 + 13 + 0.220,
		loopEnd: 1*60 + 22 + 0.373,
		title: "無何有の郷",
		message: "ほのぼのとした思い出のイメージの曲ね。\nのんびりとしていて、それでいてちょっと哀愁も含んだアレンジよね。",
		is_normal: false,
		is_ex:     false,
	},
	prologue: {
		path: "./bgm/trial/prologue",
		loopStart: 0*60 + 0 + 0.000,
		loopEnd: 0*60 + 52 + 0.881,
		title: "おてんば恋娘",
		message: "おてんば恋娘のちょっとアホっぽくて、何か抜けてる感じのあるアレンジね。",
		is_normal: false,
		is_ex:     false,
	},

	stage_a: {
		path: "./bgm/trial/stage_a",
		loopStart: 0*60 + 29 + 0.143,
		loopEnd: 1*60 + 51 + 0.429,
		title: "春色小径",
		message: "ステージ曲その1よ。勢いがそこそこあって、\n異変解決するぞ！的な感じが垣間見える曲ね。",
		is_normal: false,
		is_ex:     false,
	},
	stage_b: {
		path: "./bgm/trial/stage_b",
		loopStart: 0*60 + 0 + 0.000,
		loopEnd: 1*60 + 22 + 0.500,
		title: "少女綺想曲",
		message: "ステージ曲その2よ。ゆったりとして、徐々に不穏な感じが少しづつ出てきているわ。",
		is_normal: false,
		is_ex:     false,
	},
};

// BGM(完成版)
if (!CONSTANT.TRIAL) {
	Object.assign(AssetsConfig.bgms, {
		stage_c: {
			path: "./bgm/production/stage_c",
			loopStart: 0*60 + 14 + 0.746,
			loopEnd: 1*60 + 53 + 0.898,
			title: "夜が降りてくる",
			message: "ステージ曲その3よ。かなりゆったりとして、不穏な感じがとても強い曲ね。",
			is_normal: false,
			is_ex:     false,
		},
		stage_d: {
			path: "./bgm/production/stage_d",
			loopStart: 0*60 + 29 + 0.189,
			loopEnd: 1*60 + 47 + 0.027,
			title: "二色蓮花蝶",
			message: "ラストバトルにふさわしい、かなり勢いのあるアレンジね。\nパズルゲームっぽくないけれど、緊迫した感じがあるわ。",
			is_normal: true,
			is_ex:     false,
		},
		stage_e: {
			path: "./bgm/production/stage_e",
			loopStart: 0*60 + 0 + 0.000,
			loopEnd: 2*60 + 37 + 0.297,
			title: "ネクロファンタジア",
			message: "こっちも、ネクロファンタジア同様、ラストバトルにふさわしい感じのアレンジね。\n紫を救いたい気持ちが曲に現れていると思うわ。",
			is_normal: true,
			is_ex:     false,
		},
		title_without_yukari: {
			path: "./bgm/production/title_without_yukari",
			loopStart: 0*60 + 0 + 0.000,
			loopEnd: 0*60 + 51 + 0.562,
			title: "永夜抄 ～ Eastern Night.",
			message: "退廃的な感じの曲ね。",
			is_normal: true,
			is_ex:     false,
		},
		after_ex: {
			path: "./bgm/production/after_ex",
			loopStart: 0*60 + 0 + 0.000,
			loopEnd: 1*60 + 9 + 0.153,
			title: "Eternal Dream",
			message: "別れの悲しい感じが出てるアレンジね。\nとにかく悲しくなるように、かなり音数を絞ったんですって。",
			is_normal: false,
			is_ex:     true,
		},
		staffroll: {
			path: "./bgm/production/staffroll",
			loopStart: 0*60 + 8 + 0.727,
			loopEnd: 1*60 + 4 + 0.364,
			title: "月見草",
			message: "めでたしめでたしじゃないエンディング曲ね。後味が悪い暗い感じにしようと思ったら\n思ったより暗くならなかったらしいわ。",
			is_normal: false,
			is_ex:     true,
		},
		epilogue: {
			path: "./bgm/production/epilogue",
			loopStart: 0*60 + 19 + 0.831,
			loopEnd: 1*60 + 8 + 0.664,
			title: "紅より儚い永遠",
			message: "すごくハッピーエンドな曲ね。落ち着いためでたしめでたしな感じだわ。\n曲制作者曰く「やっぱり、ゆかれいむはハッピーエンドが似合いますね」ですって。",
			is_normal: false,
			is_ex:     true,
		},
	});
}





module.exports = AssetsConfig;
