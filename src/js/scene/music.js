'use strict';

/* music room */

var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;
var H_CONSTANT = require('../hakurei').constant;
var CONSTANT = require('../constant');
var AssetsConfig = require('../assets_config');

/* BGM 一覧を配列化 */
var BGMS = [];
for (var key in AssetsConfig.bgms) {
	var data = util.shallowCopyHash(AssetsConfig.bgms[key]);

	data.name = key;
	BGMS.push(data);
}

var SceneMusic = function(core) {
	base_scene.apply(this, arguments);
};
util.inherit(SceneMusic, base_scene);

SceneMusic.prototype.init = function(){
	base_scene.prototype.init.apply(this, arguments);

	// 今どれにカーソルがあるか
	this.index = 0;

	this.core.stopBGM();
};


SceneMusic.prototype.beforeDraw = function(){
	base_scene.prototype.beforeDraw.apply(this, arguments);

	// 戻る
	if(this.core.isKeyPush(H_CONSTANT.BUTTON_X)) {
		this.core.changeScene("title");
	}

	// カーソルを下移動
	if(this.core.isKeyPushOrLongDown(H_CONSTANT.BUTTON_DOWN)) {
		this.index++;

		if(this.index >= BGMS.length) {
			this.index = BGMS.length - 1;
		}
	}
	// カーソルを上移動
	if(this.core.isKeyPushOrLongDown(H_CONSTANT.BUTTON_UP)) {
		this.index--;

		if(this.index < 0) {
			this.index = 0;
		}
	}

	// 決定
	if(this.core.isKeyPush(H_CONSTANT.BUTTON_Z)) {
		if (BGMS[this.index].is_normal && !this.isNormalStoryCleared()) { // Normal未クリア
			// Normal 未クリアなら聴けない
		}
		else if (BGMS[this.index].is_ex && !this.isExStoryCleared()) { // Ex未クリア
			// Ex未クリアなら聴けない
		}
		else {
			var bgm_name = BGMS[this.index].name;
			this.core.playBGM(bgm_name);
		}
	}
};

// 画面更新
SceneMusic.prototype.draw = function(){
	this.core.clearCanvas();
	var ctx = this.core.ctx;

	ctx.save();

	// 背景表示
	this._showBackGround();

	// キャラ表示
	this._showRightChara();

	// メッセージウィンドウを表示
	this._showMessageWindow();

	var cursor_x    = 50;
	var text_x      = cursor_x + 30;
	var y = 80;

	// 文字表示
	ctx.font = "18px 'Migu'";
	ctx.textAlign = 'left';
	ctx.textBaseAlign = 'middle';
	ctx.fillStyle = 'rgb( 255, 255, 255 )';

	for(var i = 0, len = BGMS.length; i < len; i++) {
		var bgm = BGMS[i];
		var music_no = ( '00' + (i + 1) ).slice(-2); // 数字を2桁に揃える

		if(this.index === i) {
			// cursor 表示
			this._drawText("▶", cursor_x, y);

			// メッセージ表示
			if (bgm.is_normal && !this.isNormalStoryCleared()) { // Normal未クリア
				this._showMessage("ゲームをすすめたら聴けるわよ");
			}
			else if (bgm.is_ex && !this.isExStoryCleared()) { // Ex未クリア
				this._showMessage("ゲームをすすめたら聴けるわよ");
			}
			else {
				this._showMessage(bgm.message);
			}
		}

		// 文字表示
		if (bgm.is_normal && !this.isNormalStoryCleared()) { // Normal未クリア
			this._drawText(music_no + ": " + "???????", text_x, y); // 1行表示
		}
		else if (bgm.is_ex && !this.isExStoryCleared()) { // Ex未クリア
			this._drawText(music_no + ": " + "???????", text_x, y); // 1行表示
		}
		else {
			this._drawText(music_no + ": " + bgm.title, text_x, y); // 1行表示
		}

		y+= 30;
	}

	ctx.restore();

	// 操作方法説明
	this._showHowTo();
};

SceneMusic.prototype._drawText = function(text, x, y){
	var ctx = this.core.ctx;
	ctx.fillStyle = 'rgb( 0, 0, 0 )';
	ctx.lineWidth = 4.0;
	ctx.strokeText(text, x, y);

	ctx.fillStyle = 'rgb( 255, 255, 255 )';
	ctx.fillText(text, x, y);
};

// 操作説明 表示
SceneMusic.prototype._showHowTo = function() {
	var ctx = this.core.ctx;
	ctx.save();

	var text = "Xキー：戻る";

	ctx.font = "14px 'Migu'";
	ctx.textAlign = 'left';
	ctx.textBaseAlign = 'middle';

	this._drawText(text, 10, this.core.height - 10);
	ctx.restore();
};

SceneMusic.prototype._showRightChara = function(){
	var ctx = this.core.ctx;
	ctx.save();

	var x = 400;
	var y = 65;

	var right_image = this.core.image_loader.getImage("reimu_normal1");
	ctx.drawImage(right_image,
		x,
		y,
		right_image.width,
		right_image.height
	);

	ctx.restore();
};

var MESSAGE_WINDOW_OUTLINE_MARGIN = 10;
SceneMusic.prototype._showMessageWindow = function(){
	var ctx = this.core.ctx;
	// show message window
	ctx.save();

	var message_height = 100;

	ctx.globalAlpha = 0.5;
	ctx.fillStyle = 'rgb( 0, 0, 0 )';
	ctx.fillRect(
		MESSAGE_WINDOW_OUTLINE_MARGIN,
		this.core.height - 125,
		this.core.width - MESSAGE_WINDOW_OUTLINE_MARGIN * 2,
		message_height
	);

	ctx.restore();
};

// セリフ表示
SceneMusic.prototype._showMessage = function(message) {
	var ctx = this.core.ctx;
	ctx.save();

	ctx.font = "18px 'Migu'";
	ctx.textAlign = 'left';
	ctx.textBaseAlign = 'middle';

	var x, y;
	// セリフ表示
	var lines = [message];
	if (lines.length) {
		// セリフテキストの y 座標初期位置
		var message_height = 80;
		y = this.core.height - 125 + 40;

		for(var i = 0, len = lines.length; i < len; i++) {
			ctx.fillStyle = 'rgb( 0, 0, 0 )';
			ctx.lineWidth = 4.0;
			ctx.strokeText(lines[i], MESSAGE_WINDOW_OUTLINE_MARGIN * 2 + 20, y); // 1行表示

			ctx.fillStyle = 'white';
			ctx.fillText(lines[i], MESSAGE_WINDOW_OUTLINE_MARGIN * 2 + 20, y); // 1行表示

			y+= 30;
		}
	}

	ctx.restore();
};




SceneMusic.prototype._showBackGround = function(){
	var ctx = this.core.ctx;
	var title_bg = this.core.image_loader.getImage('shrine_noon');
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
	ctx.globalAlpha = 0.4; // 半透明
	ctx.fillRect(0, 0, this.core.width, this.core.height);

	ctx.globalAlpha = 1.0; // 半透明戻す
};


SceneMusic.prototype.isExStoryCleared = function(){
	return this.core.storage_story.getIsExStageCleared();
};
SceneMusic.prototype.isNormalStoryCleared = function(){
	return this.core.storage_story.getIsNormalStageCleared();
};



module.exports = SceneMusic;
