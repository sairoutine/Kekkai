'use strict';

// 星3つ
var messageS = [
	["reimu", "smile", "やるじゃない！"],
	["yukari", "smile", "あら、すてきね！"],
	//["reimu", "smile", ""],
];

// 星2つ
var messageA = [
	["reimu", "laugh2", "まぁ、こんなところね"],
	["yukari", "normal3", "上出来ね"],
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
