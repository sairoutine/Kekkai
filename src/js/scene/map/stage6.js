'use strict';
var A = 11;
var B = 12;
var C = 13;
var D = 10;
var E = 8;
var I = 9;
var L = 6;
var N = -1;
var P = 7;
var K = 5;
var Y = 14;

var map = [
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,E,0,0,E,0,0,E,0,0,Y,Y,0,0,0,0,0,0,0,0,0,0,0,0,I,I,0,0,0],
	[0,A,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,L,B,B,B,B,B,B,C,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0],
	[0,0,0,Y,Y,0,E,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,I,I,0,0,0,0,0],
	[0,0,A,B,B,B,B,B,B,B,B,L,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,C,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,I,I,I,I,0,0,0,L,0,0,0,0,0,0,0,0,Y,Y,0,E,0,0,0,0,0,0],
	[0,0,0,A,B,B,B,B,B,B,B,B,B,B,B,L,B,B,B,B,B,B,B,B,B,B,C,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,P,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,L,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,A,B,B,B,B,B,B,C,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
];

module.exports = {
	map: map, // マップ
	exchange_num: 4, // 位置移動上限回数
	is_vertical: false, // 交代が垂直かどうか
};
