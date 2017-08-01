'use strict';

// 星3つ
var messageS = [
	["reimu_smile", "やるじゃない"],
	["yukari_normal1", "あら、すてきね"],
	//["reimu_smile", ""],
];

// 星2つ
var messageA = [
	["reimu_normal2", "まぁ、こんなところね"],
	//["yukari_smile", "星2つ メッセージB"],
	//["reimu_smile", "星2つ メッセージC"],
];

// 星1つ
var messageB = [
	["reimu_yarare", "ちょっと調子が悪かっただけよ"],
	["yukari_normal2", "あら、残念"],
	["yukari_normal1", "雨垂れでも石を穿つものよ。次がんばりましょう"],

];

module.exports = {
	1: messageB,
	2: messageA,
	3: messageS,
};
