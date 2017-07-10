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
	[0,0,P,0,0,0,0,A,0,0,A,B,B,B,B,B,B,B,B,B,B,C,0,C,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,A,0,0,A,B,B,B,B,B,B,B,B,B,B,C,0,C,0,0,0,0,0,0],
	[0,0,A,B,B,L,C,A,0,0,A,B,B,B,B,B,B,B,B,B,B,C,0,C,0,0,0,0,0,0],
	[0,0,0,0,0,L,0,A,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,C,0,Y,0,I,0,0],
	[0,0,0,0,0,L,0,A,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,C,0,A,L,C,0,0],
	[0,0,0,0,0,L,0,A,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,C,0,0,L,0,0,0],
	[0,0,0,0,0,L,0,A,0,0,0,Y,Y,Y,0,0,I,I,I,0,0,0,0,C,0,0,L,0,0,0],
	[0,0,0,0,0,L,0,A,C,K,K,K,K,K,K,K,K,K,K,K,K,K,A,C,0,0,L,0,0,0],
	[0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0],
	[0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0],
	[0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0],
	[0,0,0,0,0,L,0,0,0,0,0,0,I,I,0,0,I,I,0,0,0,0,0,0,0,0,L,0,0,0],
	[0,0,A,B,B,B,B,B,C,K,K,K,K,K,0,0,K,K,K,K,K,A,B,B,B,B,B,C,0,0],
	[0,0,A,0,0,0,0,0,C,0,0,0,0,0,0,0,0,0,0,0,0,A,0,0,0,0,0,C,0,0],
	[0,0,A,0,0,I,0,0,C,0,0,0,0,0,0,0,0,0,0,0,0,A,0,0,0,0,0,C,0,0],
	[0,0,A,0,0,I,0,0,C,0,0,0,0,0,0,0,0,0,0,0,0,A,0,0,0,0,0,C,0,0],
	[0,0,A,0,0,0,0,0,C,0,0,0,0,0,0,0,0,0,0,0,0,A,0,0,I,0,0,C,0,0],
	[0,0,A,K,K,K,K,K,C,0,0,0,0,0,F,F,0,0,0,0,0,A,K,K,K,K,K,C,0,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
];

module.exports = {
	map: map, // マップ
	exchange_num: 5, // 位置移動上限回数
	is_vertical: true, // 交代が垂直かどうか
};
