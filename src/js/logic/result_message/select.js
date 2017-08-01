'use strict';

// 星3つ
var messageS = [
	["reimu", "smile", "やるじゃない"],
	["yukari", "normal1", "あら、すてきね"],
	//["reimu", "smile", ""],
];

// 星2つ
var messageA = [
	["reimu", "normal2", "まぁ、こんなところね"],
	//["yukari", "smile", "星2つ メッセージB"],
	//["reimu", "smile", "星2つ メッセージC"],
];

// 星1つ
var messageB = [
	["reimu", "yarare", "ちょっと調子が悪かっただけよ"],
	["yukari", "normal2", "あら、残念"],
	["yukari", "normal1", "雨垂れでも石を穿つものよ。次がんばりましょう"],

];

module.exports = {
	1: messageB,
	2: messageA,
	3: messageS,
};
