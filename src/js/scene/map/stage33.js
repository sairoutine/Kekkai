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
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,P,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,A,B,B,B,B,C,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,A,B,B,B,C,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,I,I,I,I,I,I,I,I,I,I,I,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,A,B,C,K,K,K,K,K,K,K,K,K,K,K,A,B,C,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,I,I,I,I,I,I,I,I,I,I,I,E,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,A,B,C,K,K,K,K,K,K,K,K,K,A,B,C,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,E,0,I,I,I,X,I,I,I,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,A,B,C,K,K,K,K,K,K,K,A,B,C,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,Y,0,0,E,0,E,0,E,0,Y,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,A,B,C,K,K,K,K,K,A,C,0,0,0,0,0,0,0,0,0,0],
	[D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D],
];
  //[B,B,B,B,B,B,B,B,B,B,B,B,B,B,0,0,B,B,B,B,B,B,B,B,B,B,B,B,B,B],

module.exports = {
	map: map, // マップ
	exchange_num: 1, // 位置移動上限回数
	is_vertical: true, // 交代が垂直かどうか
};
