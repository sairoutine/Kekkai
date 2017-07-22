'use strict';

/* スタッフロール画面 */

var serifs = [
	["プログラマー","テストA"],
	["ドット絵","テストB"],
	["イラスト","テストC"],
	["脚本・シナリオ・セリフ","テストD"],
	["BGM","テストE"],
];
var RESULT_TRANSITION_COUNT = 320;


var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;
var Reimu = require('../object/reimu_for_staffroll');

var SceneStaffroll = function(core) {
	base_scene.apply(this, arguments);
};
util.inherit(SceneStaffroll, base_scene);

SceneStaffroll.prototype.init = function() {
	base_scene.prototype.init.apply(this, arguments);

	this.reimu = new Reimu(this);
	this.reimu.init(this.core.width - 100, this.core.height - 100);
	this.addObject(this.reimu);

	this.serif_index = 0;

	// スタッフロール終了中かどうか
	this.is_ending = false;

	this.core.playBGM("mute");
};

SceneStaffroll.prototype.beforeDraw = function() {
	base_scene.prototype.beforeDraw.apply(this, arguments);

	if (this.frame_count > RESULT_TRANSITION_COUNT) {
		this.frame_count = 0;

		if (this.is_ending) {
				this.core.changeScene("epilogue");
		}
		else {
			// メッセージを全て表示し終わったなら
			if(this.serif_index+1 === serifs.length){
				this.is_ending = true;
			}
			else {
				// 次のメッセージへ
				this.serif_index++;
			}
		}
	}
};
SceneStaffroll.prototype.draw = function(){
	var ctx = this.core.ctx;
	// 背景
	ctx.save();
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, this.core.width, this.core.height);
	ctx.restore();

	if (this.is_ending) {
		this.reimu.x(this.reimu.x() - this.core.width/RESULT_TRANSITION_COUNT);
	}
	else {
		// 文字の透過度
		var alpha = 0.0;
		if(this.frame_count < RESULT_TRANSITION_COUNT/4) {
			alpha = this.frame_count / (RESULT_TRANSITION_COUNT/4);
		}
		else if (RESULT_TRANSITION_COUNT/4 <= this.frame_count && this.frame_count < RESULT_TRANSITION_COUNT*2/4) {
			alpha = 1.0;
		}
		else if (RESULT_TRANSITION_COUNT*2/4 <= this.frame_count && this.frame_count < RESULT_TRANSITION_COUNT*3/4) {
			alpha = (RESULT_TRANSITION_COUNT*3/4 - this.frame_count) / (RESULT_TRANSITION_COUNT/4);
		}
		else if (RESULT_TRANSITION_COUNT*3/4 <= this.frame_count && this.frame_count < RESULT_TRANSITION_COUNT) {
			alpha = 0.0;
		}

		// 文字
		var message1 = serifs[this.serif_index][0];
		var message2 = serifs[this.serif_index][1];

		var x = this.core.width/2 - 250;

		ctx.save();
		ctx.globalAlpha = alpha;
		ctx.fillStyle = 'rgb( 255, 255, 255 )';
		ctx.textAlign = 'left';
		ctx.font = "30px 'Migu'";
		ctx.fillText(message1, this.core.width/2 - 150, this.core.height/2 - 30);
		ctx.fillText(message2, this.core.width/2 -  50, this.core.height/2 + 20);
		ctx.restore();
	}

	// 霊夢歩く
	base_scene.prototype.draw.apply(this, arguments);
};


module.exports = SceneStaffroll;
