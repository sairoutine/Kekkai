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
	[A,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,C],
	[A,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,C],
	[A,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,C],
	[A,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,C],
	[A,0,0,0,F,0,0,0,0,0,0,0,0,0,I,I,0,0,0,0,0,0,0,0,0,F,0,0,0,C],
	[A,0,0,0,0,0,0,0,0,0,0,0,A,K,K,K,K,C,0,0,0,0,0,0,0,0,0,0,0,C],
	[A,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,C],
	[A,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,C],
	[A,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,C],
	[A,0,0,0,I,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Y,0,0,0,C],
	[A,P,L,A,C,0,0,0,0,0,0,0,0,0,I,I,0,0,0,0,0,0,0,0,0,A,C,L,0,C],
	[A,0,L,A,C,0,0,0,0,0,0,0,L,A,B,B,C,L,0,0,0,0,0,0,0,A,C,L,0,C],
	[A,C,L,A,C,K,K,K,K,K,K,K,A,B,B,B,B,C,K,K,K,K,K,K,K,A,C,L,A,C],
	[A,0,L,A,C,0,0,0,I,0,0,0,0,0,0,0,0,0,0,0,0,Y,0,0,0,A,C,L,0,C],
	[A,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,C],
	[A,0,L,0,0,0,0,0,Y,0,0,0,0,0,0,0,0,0,0,0,0,I,0,0,0,0,0,L,0,C],
	[A,0,L,0,0,0,0,0,B,0,0,0,0,0,0,0,0,0,0,0,0,B,0,0,0,0,0,L,0,C],
	[A,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,C],
	[A,0,L,0,0,0,0,0,E,0,E,0,0,0,X,0,0,0,0,0,E,0,E,0,0,0,0,L,0,C],
	[A,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,C],
];

module.exports = {
	map: map, // マップ
	exchange_num: 3, // 位置移動上限回数
	is_vertical: false, // 交代が垂直かどうか
	criteria_time:         1200,   // スコア計算用基準タイム
	criteria_exchange_num: 2,     // スコア計算用基準 交換回数
};
