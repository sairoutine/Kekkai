'use strict';

//ステージ1~15のリザルト画面のメッセージ
var messageA = [
	// デート気分
	//["reimu_confused", ""],
	["yukari_disappointed", "霊夢ったら、せっかくの肝試しなのに全然怖がってくれないわ"],
	["yukari_ecstasy1", "霊夢ー！おばけー！"],
];

//ステージ16~30のリザルト画面のメッセージ
var messageB = [
	["reimu_normal1", "そもそも、このオバケたち、どこから持ってきたのよ"],
	["reimu_normal1", "紫、アイツ何か隠しているんじゃないかしら"],
	["yukari_ecstasy1", "霊夢ったら、いつの間にか一人前になっちゃって"],
	["yukari_normal1", "博麗大結界は代々、博麗の巫女が管理してきたのよ"],
	["reimu_normal1", "アイツとこうしてるのも、月の異変以来ね"],
];

//ステージ31~40のリザルト画面のメッセージ
var messageC = [
	["reimu_strength2", "アイツ、ガラにもないこと言い出して...\n絶対連れ戻すんだから！"],
	["reimu_confused", "紫..."],
	//["reimu_smile", "31-40 メッセージC"],
];

var i;
var messages = [];

for (i = 0; i < 15; i++) {
	messages.push(messageA);
}
for (i = 15; i < 30; i++) {
	messages.push(messageB);
}
for (i = 30; i < 40; i++) {
	messages.push(messageC);
}

module.exports = messages;
