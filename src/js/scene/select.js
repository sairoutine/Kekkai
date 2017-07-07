'use strict';

/* ステージセレクト画面 */


var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;
var H_CONSTANT = require('../hakurei').constant;
var CONSTANT = require('../constant');

var StageConfig = require('../stage_config');

// 画面に何個までステージを表示するか
var SHOW_STAGE_LIST_NUM = 20;


var SceneSelect = function(core) {
	base_scene.apply(this, arguments);
};
util.inherit(SceneSelect, base_scene);

SceneSelect.prototype.init = function(){
	base_scene.prototype.init.apply(this, arguments);


	// ステージ一覧
	this.stage_list = this.core.save.getStageResultList();

	// カーソル位置
	this.selected_stage = 0;

	/* デバッグ
	this.stage_list = [];
	for (var i = 0; i<40; i++) {
		this.stage_list.push({
			stage_no: i+1,
			time: 1,
			exchange_num: 1,
		});
	}
	*/
};


SceneSelect.prototype.beforeDraw = function(){
	base_scene.prototype.beforeDraw.apply(this, arguments);

	// 戻る
	if(this.core.isKeyPush(H_CONSTANT.BUTTON_X)) {
		this.core.changeScene("title");
	}

	// カーソルを下移動
	if(this.core.isKeyPush(H_CONSTANT.BUTTON_DOWN)) {
		this.selected_stage++;

		if(this.selected_stage >= this.stage_list.length) {
			this.selected_stage = this.stage_list.length - 1;
		}
	}
	// カーソルを上移動
	if(this.core.isKeyPush(H_CONSTANT.BUTTON_UP)) {
		this.selected_stage--;

		if(this.selected_stage < 0) {
			this.selected_stage = 0;
		}
	}


};

// 画面更新
SceneSelect.prototype.draw = function(){
	this.core.clearCanvas();
	var ctx = this.core.ctx;

	ctx.save();

	var title_bg = this.core.image_loader.getImage('title_bg');

	// 背景画像表示
	ctx.drawImage(title_bg,
					0,
					0,
					title_bg.width,
					title_bg.height,
					0,
					0,
					this.core.width,
					this.core.height);

	// 背景をちょっと暗めに表示
	ctx.fillStyle = 'rgb( 0, 0, 0 )' ;
	ctx.globalAlpha = 0.5; // 半透明
	ctx.fillRect(0, 0, this.core.width, this.core.height);

	// ステージ一覧背景 表示
	ctx.globalAlpha = 1.0; // 半透明戻す
	ctx.fillRect(this.core.width - 170, 0, 170, this.core.height);


	var stage_list;   // 表示するステージ一覧
	var index;        // カーソルの表示位置
	var is_show_up;   // 上カーソルを表示するかどうか
	var is_show_down; // 下カーソルを表示するかどうか
	if (this.selected_stage <= SHOW_STAGE_LIST_NUM/2) {
		stage_list = this.stage_list.slice(0, SHOW_STAGE_LIST_NUM);
		index = this.selected_stage;
		is_show_up   = false;
		is_show_down = true;
	}
	else if (SHOW_STAGE_LIST_NUM/2 < this.selected_stage && this.selected_stage <= StageConfig.MAP_NUM - SHOW_STAGE_LIST_NUM/2) {
		stage_list = this.stage_list.slice(this.selected_stage - SHOW_STAGE_LIST_NUM/2, SHOW_STAGE_LIST_NUM/2 + this.selected_stage);
		index = SHOW_STAGE_LIST_NUM/2;
		is_show_up   = true;
		is_show_down = true;
	}
	else if (StageConfig.MAP_NUM - SHOW_STAGE_LIST_NUM/2 < this.selected_stage) {
		stage_list = this.stage_list.slice(SHOW_STAGE_LIST_NUM, StageConfig.MAP_NUM);
		index = this.selected_stage - (StageConfig.MAP_NUM - SHOW_STAGE_LIST_NUM/2) + SHOW_STAGE_LIST_NUM/2;
		is_show_up   = true;
		is_show_down = false;
	}


	// ステージ一覧 文字列
	ctx.font = "18px 'Migu'";
	ctx.textAlign = 'left';
	ctx.textBaseAlign = 'middle';
	ctx.fillStyle = 'rgb( 255, 255, 255 )';
	var x = (this.core.height - 24 * SHOW_STAGE_LIST_NUM)/2;
	for(var i = 0, len = stage_list.length; i < len; i++) {
		var data = stage_list[i];
		var stage_no = data.stage_no.toString();
		stage_no = ( '00' + stage_no ).slice(-2); // 数字を2桁に揃える
		var menu = "Stage " + stage_no;

		if(i === index) {
			// カーソル表示
			this._drawText("▶", this.core.width - 150, x + 24*i);
		}
		// 文字表示
		this._drawText(menu, this.core.width - 120, x + 24 * i); // 1行表示

	}

	if (is_show_up) {
		ctx.fillText("▲", this.core.width - 100, 20);
	}
	if (is_show_down) {
		ctx.fillText("▼", this.core.width - 100, this.core.height- 10);
	}

	var stage_data = this.core.save.getStageResult(this.selected_stage + 1); // selected_stage は 0から始まるので +1

	if (stage_data) {
		// ステージ名表示
		ctx.font = "36px 'Migu'";
		ctx.textAlign = 'left';
		this._drawText("Stage N", 20, 50);

		// ステージサムネイル 表示
		// 横720px 縦480px
		var thumbnail = this.core.image_loader.getImage('thumbnail15');
		ctx.drawImage(thumbnail,
						25,
						50,
						30*24,
						20*24,
						10,
						90,
						30*24 *0.80,
						20*24 *0.80);

		// ステージスコア表示
		ctx.font = "40px 'Migu'";
		this._drawText("★★★", this.core.width - 300, this.core.height - 50);
	}

	// 操作方法説明
	this._showHowTo();

	ctx.restore();
};
SceneSelect.prototype._drawText = function(text, x, y){
	var ctx = this.core.ctx;
	ctx.fillStyle = 'rgb( 0, 0, 0 )';
	ctx.lineWidth = 4.0;
	ctx.strokeText(text, x, y);

	ctx.fillStyle = 'rgb( 255, 255, 255 )';
	ctx.fillText(text, x, y);
};

// 操作説明 表示
SceneSelect.prototype._showHowTo = function() {
	var ctx = this.core.ctx;
	ctx.save();

	var text = "Xキー：戻る";

	ctx.font = "14px 'Migu'";
	ctx.textAlign = 'left';
	ctx.textBaseAlign = 'middle';

	this._drawText(text, 10, this.core.height - 10);
	ctx.restore();
};





module.exports = SceneSelect;
