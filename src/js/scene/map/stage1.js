'use strict';
var N = -1;
var D = 10;
var A = 11;
var B = 12;
var C = 13;
	// 横:30, 縦20
	// N: 何もなし
	// 0: 背景
	// 1: 緑ブロック
	// 2: 青ブロック
	// 3: 赤ブロック
	// 4: 紫ブロック
	// 5: 茶ブロック
	// 6: はしご
	// 7: プレイヤー
	// 8: 敵
	// 9: アイテム
	// D: 死亡ゾーン
	// A: 石ブロック
	// B: 石ブロック
	// C: 石ブロック
var map = [
	[0,0,0,0,0,0,0,0,0,0,0,A,B,B,B,B,B,B,C,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,A,B,B,B,B,C,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,A,B,B,C,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,A,B,B,C,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,A,B,B,C,0,0,0,0,0,0,7,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,A,B,B,C,0,0,0,0,0,0,N,0,0,0,0,0,0],
	[0,A,B,B,B,B,B,C,6,A,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,C,0],
	[0,0,0,0,A,C,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,A,B,C,0,0],
	[0,0,0,0,A,C,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,A,B,C,0,0],
	[0,0,0,0,A,C,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,A,B,C,0,0],
	[0,0,0,0,A,C,0,A,B,C,0,0,0,0,0,0,0,0,0,0,A,B,C,0,0,A,B,C,0,0],
	[0,0,0,0,A,C,0,A,B,C,0,0,0,0,0,0,0,0,0,0,A,B,C,0,0,A,B,C,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0],
	[0,A,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,C,0],
	[0,0,A,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,C,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
];

module.exports = {
	map: map, // マップ
	exchange_num: 2, // 位置移動上限回数
	is_vertical: false, // 交代が垂直かどうか
};
