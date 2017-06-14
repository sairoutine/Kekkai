'use strict';

var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;
var StorageSave = require('../save');
var H_CONSTANT = require('../hakurei').constant;
var CONSTANT = require('../constant');

// transition time ready to show canvas
var SHOW_TRANSITION_COUNT = 100;

// blink interval time
var SHOW_START_MESSAGE_INTERVAL = 50;




var SceneTitle = function(core) {
	base_scene.apply(this, arguments);
};
util.inherit(SceneTitle, base_scene);

SceneTitle.prototype.init = function(){
	base_scene.prototype.init.apply(this, arguments);

	// Exステージ解放されているかどうか */
	var save_data = StorageSave.load();
	if(!save_data) {
		save_data = new StorageSave();
	}
	this.is_normal_stage_cleared = save_data.getIsNormalStageCleared();

	this.core.stopBGM();
};


SceneTitle.prototype.beforeDraw = function(){
	base_scene.prototype.beforeDraw.apply(this, arguments);

	if(this.frame_count === 60) {
		this.core.playBGM("title");
	}

	if(this.core.isKeyPush(H_CONSTANT.BUTTON_Z)) {
		this.core.playSound('select');
		this.core.changeScene("reminiscence");
	}
};

// 画面更新
SceneTitle.prototype.draw = function(){
	this.core.clearCanvas();
	var ctx = this.core.ctx;

	ctx.save();

	// 切り替え効果
	if( this.frame_count < SHOW_TRANSITION_COUNT ) {
		ctx.globalAlpha = this.frame_count / SHOW_TRANSITION_COUNT;
	}
	else {
		ctx.globalAlpha = 1.0;
	}


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

	// show game title text
	var title = this.core.image_loader.getImage('title');
	ctx.drawImage(title,
					20,
					-20,
					title.width,
					title.height);


	// show press z
	ctx.font = "38px 'Migu'";
	ctx.textAlign = 'center';

	if(this.frame_count % 80 > 40) {
		var text;
		if(this.is_normal_stage_cleared) {
			text = "Press Z to Start EX"; //Exステージ解放後
		}
		else {
			text = "Press Z to Start"; // Exステージ開放前
		}

		ctx.fillStyle = 'rgb( 0, 0, 0 )';
		ctx.lineWidth = 4.0;
		ctx.strokeText(text, this.core.width/2, 420);

		ctx.fillStyle = 'rgb( 255, 255, 255 )';
		ctx.fillText(text, this.core.width/2, 420);
	}


	//ctx.fillText('→ Story Start', 280, 400);
	//ctx.fillText('　 Stage Select', 280, 450);
	ctx.restore();
};

module.exports = SceneTitle;
