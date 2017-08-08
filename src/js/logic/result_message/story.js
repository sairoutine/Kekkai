'use strict';

//ステージ1~15のリザルト画面のメッセージ
var messageA = [
	// デート気分
	["reimu", "confused", "紫がベタベタひっついてくるけど、暑くないのかしら"],
	["reimu", "normal2", "紫がこの前言ってた、せんぷうき？\nアレうちの神社に持ってきてよ"],
	["reimu", "normal1", "冬までまだ時間があるからか、紫がやたら元気なのよね"],
	["yukari", "disappointed", "霊夢ったら、せっかくの肝試しなのに全然怖がってくれないわ"],
	["yukari", "ecstasy2", "霊夢ー！おばけー！"],
	["yukari", "normal2", "ちっちゃい頃は、霊夢の方から\n「ゆかりー！おばけこわいー！」って抱きついてきたのに..."],
];

//ステージ16~30のリザルト画面のメッセージ
var messageB = [
	["reimu", "normal1", "そもそも、このオバケたち、どこから持ってきたのかしら"],
	["reimu", "normal1", "紫、アイツ何か隠しているんじゃないかしら"],
	["yukari", "ecstasy1", "霊夢ったら、いつの間にか一人前になっちゃって"],
	["yukari", "normal1", "博麗大結界は代々、博麗の巫女が管理してきたのよ"],
	["reimu", "normal1", "アイツとこうしてるのも、月の異変以来ね"],
];

//ステージ31~40のリザルト画面のメッセージ
var messageC = [
	["reimu", "strength1", "アイツ、ガラにもないこと言い出して...\n絶対連れ戻すんだから！"],
	["reimu", "confused", "紫..."],
	["reimu", "strength2", "まったく...アイツは本当に面倒くさいのよ"],
	["reimu", "confused", "思えば、アイツがいなくなるなんて、考えもしなかったわね"],
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
