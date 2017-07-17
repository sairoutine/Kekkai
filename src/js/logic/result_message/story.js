'use strict';

//ステージ1~15のリザルト画面のメッセージ
var messageA = [
	["reimu_smile", "1-15 メッセージA"],
	["reimu_smile", "1-15 メッセージB"],
	["reimu_smile", "1-15 メッセージC"],
];

//ステージ16~30のリザルト画面のメッセージ
var messageB = [
	["reimu_smile", "16-30 メッセージA"],
	["reimu_smile", "16-30 メッセージB"],
	["reimu_smile", "16-30 メッセージC"],
];

//ステージ31~40のリザルト画面のメッセージ
var messageC = [
	["reimu_smile", "31-40 メッセージA"],
	["reimu_smile", "31-40 メッセージB"],
	["reimu_smile", "31-40 メッセージC"],
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
