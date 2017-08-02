'use strict';
var A = 11;
var B = 12;
var C = 13;
var D = 10;
var E = 8;
var F = 16;
var I = 9;
var L = 6;
var N = -1;
var P = 7;
var K = 5;
var Y = 14;
var X = 15;

var map = [
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,A,C,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,L,A,0,I,0,I,0,0,0,A,C,0,0,0,I,0,I,0,C,L,0,0,0,0,0],
	[0,0,0,0,0,L,A,K,K,K,K,K,K,K,A,C,K,K,K,K,K,K,K,C,L,0,0,0,0,0],
	[0,0,0,0,0,L,A,0,0,0,0,0,0,0,A,C,0,0,0,0,0,0,0,C,L,0,0,0,0,0],
	[0,0,0,0,0,L,A,0,0,0,0,0,0,0,A,C,0,0,0,0,0,0,0,C,L,0,0,0,0,0],
	[0,0,0,0,0,L,A,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,C,L,0,0,0,0,0],
	[0,0,0,0,0,L,A,0,I,0,0,E,0,I,0,0,I,0,E,0,0,I,0,C,L,0,0,0,0,0],
	[0,0,0,0,0,L,A,0,A,B,B,B,B,B,B,B,B,B,B,B,B,C,0,C,L,0,0,0,0,0],
	[0,0,0,0,0,L,A,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,C,L,0,0,0,0,0],
	[0,0,0,0,0,L,A,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,C,L,0,0,0,0,0],
	[0,0,0,0,0,L,A,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,C,L,0,0,0,0,0],
	[0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,F,0,0,0,L,0,0,0,0,0],
	[0,0,0,A,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,C,0,0,0],
	[0,0,0,A,0,L,0,0,0,0,0,0,0,P,0,0,0,0,0,0,0,0,0,0,L,0,C,0,0,0],
	[0,0,0,A,0,L,0,0,0,F,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,C,0,0,0],
	[0,0,0,A,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,C,0,0,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
];

module.exports = {
	map: map, // マップ
	exchange_num: 5, // 位置移動上限回数
	is_vertical: false, // 交代が垂直かどうか
	criteria_time:         900,   // スコア計算用基準タイム
	criteria_exchange_num: 2,   // スコア計算用基準 交換回数
};
