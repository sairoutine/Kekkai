'use strict';

/* ノーマルステージクリア後シーン */
/*
ノーマルステージが全て終了した後のシーン

霊夢がつらつらと一人で喋る。霊夢の独白。


案A
立ち絵とセリフが終わったら、回想シーンの一枚絵をもう一度表示して
セリフ欄を表示して、「やっぱり受け入れるしかないのかな…」という霊夢のセリフを入れる

or 

案B
立ち絵＆セリフのまま、霊夢の立ち絵を無くして、「（――幻想郷は全てを受け入れるのよ。それはそれは残酷な話ですわ――）」的なセリフを入れる

↑実装してみて決める

*/

var serif_script = require("../logic/serif/stage_end");


var util = require('../hakurei').util;
var CONSTANT = require('../constant');
var base_scene = require('./serif_base');

var ScenePrologue = function(game) {
	base_scene.apply(this, arguments);
};

util.inherit(ScenePrologue, base_scene);

// 立ち絵＆セリフ終了後
ScenePrologue.prototype.notifySerifEnd = function() {
	// TODO: Exステージ解放 */
	this.core.changeScene("title");
};

// セリフスクリプト
ScenePrologue.prototype.serifScript = function() {
	return serif_script;
};

// 背景画像名
ScenePrologue.prototype.background = function() {
	return "shrine_night";
};

module.exports = ScenePrologue;
