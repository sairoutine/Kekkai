'use strict';

/* コンフィグ画面 */
var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;
var H_CONSTANT = require('../hakurei').constant;
var CONSTANT = require('../constant');
var StorageConfig = require('../storage/config');

// キーコンフィグメニュー一覧
var MENU = [
	{name: '決定 (Zキー)',             type: "key", key: H_CONSTANT.BUTTON_Z },
	{name: 'スキマ移動 (Xキー)',       type: "key", key: H_CONSTANT.BUTTON_X },
	{name: 'ポーズ(SPACE キー)',       type: "key", key: H_CONSTANT.BUTTON_SPACE },
	/*
	{name: 'ストーリー進捗をリセット', type: "func", func: function (scene_select) {
		// 確認済みなら
		if (scene_select.isConfirm()) {
			// 本当に消す
			scene_select.resetStory();
		}
		else {
			// 確認する
			scene_select.setConfirm();
		}
	} },
	{name: '戻る',                     type: "func", func: function (scene_select) {
		scene_select.quitConfig();
	} },
	*/
];

var SceneSelect = function(core) {
	base_scene.apply(this, arguments);
};
util.inherit(SceneSelect, base_scene);

SceneSelect.prototype.init = function(selected_stage_no){
	base_scene.prototype.init.apply(this, arguments);

	// 今どれにカーソルがあるか
	this.index = 0;

	this.core.changeBGM("title");
};
SceneSelect.prototype.beforeDraw = function(){
	base_scene.prototype.beforeDraw.apply(this, arguments);

	// カーソルを上移動
	if(this.core.isKeyPushOrLongDown(H_CONSTANT.BUTTON_DOWN)) {
		this.index++;

		if(this.index >= MENU.length) {
			this.index = MENU.length - 1;
		}
		else {
			this.unsetConfirm();
		}
	}

	// カーソルを下移動
	if(this.core.isKeyPushOrLongDown(H_CONSTANT.BUTTON_UP)) {
		this.index--;

		if(this.index < 0) {
			this.index = 0;
		}
		else {
			this.unsetConfirm();
		}
	}

	// 現在選択しているメニュー
	var current_menu = MENU[this.index];

	if(current_menu.type === "func") {
		// 決定
		if(this.core.isKeyPush(H_CONSTANT.BUTTON_Z)) {
			// 現在選択しているメニューに設定された関数を実行
			current_menu.func(this);
		}
	}
	else if (current_menu.type === "key") {
		// 押下したボタンを取得
		var button_id = this.core.input_manager.getAnyButtonId();
		if (button_id !== undefined) {
			// キーコンフィグ遷移後すぐの入力は、キーコンフィグ遷移ボタンがまだ入力されている可能性があるので無視
			if(this.frame_count >= 60) {
				this.core.input_manager.setButtonIdMapping(button_id, current_menu.key);
			}
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
	ctx.globalAlpha = 1.0; // 半透明戻す

	// セリフテキストの x, y 座標初期位置
	var cursor_x    = 206;
	var text_x      = 236;
	var button_id_x = 386;
	var y = 220;

	ctx.restore();

	// コンフィグメニュー一覧
	ctx.save();

	// 文字背景 表示
	ctx.fillStyle = 'rgb( 57, 93, 220 )' ;
	//ctx.globalAlpha = 0.3; // 半透明
	ctx.fillRect(cursor_x - 10, y - 30, button_id_x - cursor_x + 50, MENU.length * 33);

	// 文字表示
	ctx.globalAlpha = 1.0; // 半透明戻す
	ctx.font = "18px 'Migu'";
	ctx.textAlign = 'left';
	ctx.textBaseAlign = 'middle';
	ctx.fillStyle = 'rgb( 255, 255, 255 )';

	var map = this.core.input_manager.getKeyToButtonIdMap();
	for(var i = 0, len = MENU.length; i < len; i++) {
		if(this.index === i) {
			// cursor 表示
			ctx.fillText("▶", cursor_x, y);
		}
		// 文字表示
		ctx.fillText(MENU[i].name, text_x, y); // 1行表示

		// button_id 表示
		if(MENU[i].key) {
			ctx.fillText(Number(map[ MENU[i].key ]) + 1, button_id_x, y); // 配列の index なので -1 されているので、+1する
		}

		y+= 30;
	}

	// DEBUG
	//this.core.input_manager.dumpGamePadKey();
	ctx.restore();
};
SceneSelect.prototype.quitConfig = function(){
	var map = this.core.input_manager.getButtonIdToKeyMap();
	var storage_config = new StorageConfig(map);
	storage_config.save();

	this.core.changeScene("title");
};

/*
SceneSelect.prototype._drawText = function(text, x, y){
	var ctx = this.core.ctx;
	ctx.fillStyle = 'rgb( 0, 0, 0 )';
	ctx.lineWidth = 4.0;
	ctx.strokeText(text, x, y);

	ctx.fillStyle = 'rgb( 255, 255, 255 )';
	ctx.fillText(text, x, y);
};
*/

/*
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
*/
module.exports = SceneSelect;
