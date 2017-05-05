'use strict';

var MESSAGE_WINDOW_OUTLINE_MARGIN = 10;
var TALKER_MOVE_PX = 5;
var SCALE = 1;

var base_scene = require('../../hakurei').scene.base;
var CONSTANT = require('../../hakurei').constant;
var util = require('../../hakurei').util;

var SerifManager = require('../../hakurei').serif_manager;

var SceneStageTalk = function(core) {
	base_scene.apply(this, arguments);
	this.serif = new SerifManager();
};

util.inherit(SceneStageTalk, base_scene);

SceneStageTalk.prototype.init = function(serif_before){
	base_scene.prototype.init.apply(this, arguments);
	this.serif.init(serif_before);
};

SceneStageTalk.prototype.beforeDraw = function(){
	base_scene.prototype.beforeDraw.apply(this, arguments);

	this.parent.player().update();

	// セリフのないステージならば、そのままプレイに移行
	if(this.frame_count === 1 && this.serif.is_end()) {
		this.parent.changeSubScene("play");
		return;
	}

	if(this.core.isKeyPush(CONSTANT.BUTTON_Z)) {
		if(this.serif.is_end()) {
			this.parent.changeSubScene("play");
		}
		else {
			// セリフを送る
			this.serif.next();
		}
	}
};

SceneStageTalk.prototype.draw = function(){
	base_scene.prototype.draw.apply(this, arguments);
	var ctx = this.core.ctx;

	if(this.serif.right_image()) {
		this._showRightChara();
	}
	if(this.serif.left_image()) {
		this._showLeftChara();
	}

	this._showMessageWindow();

	this._showMessage();
};

SceneStageTalk.prototype._showRightChara = function(){
	var ctx = this.core.ctx;
	ctx.save();

	var x = 400;
	var y = 65;

	if(!this.serif.is_right_talking()) {
		ctx.globalAlpha = 0.75;
	}
	else {
		x -= TALKER_MOVE_PX;
		y -= TALKER_MOVE_PX;
	}

	var right_image = this.core.image_loader.getImage(this.serif.right_image());

	ctx.drawImage(right_image,
		x,
		y,
		right_image.width  * SCALE,
		right_image.height * SCALE
	);

	ctx.restore();
};

SceneStageTalk.prototype._showLeftChara = function(){
	var ctx = this.core.ctx;
	ctx.save();

	var x = -50;
	var y = 30;

	if(!this.serif.is_left_talking()) {
		ctx.globalAlpha = 0.75;
	}
	else {
		x += TALKER_MOVE_PX;
		y -= TALKER_MOVE_PX;
	}

	var left_image = this.core.image_loader.getImage(this.serif.left_image());

	ctx.drawImage(left_image,
		x,
		y,
		left_image.width  * SCALE,
		left_image.height * SCALE
	);

	ctx.restore();
};





/*
SceneStageTalk.prototype._showLeftChara = function () {
	var ctx = this.core.ctx;
	ctx.save();

	var x = -100;
	var y = 100;

	if(!this.serif.is_left_talking()) {
		ctx.globalAlpha = 0.5;
	}
	else {
		x -= -TALKER_MOVE_PX; // 左右反転
		y -= TALKER_MOVE_PX;
	}

	var left_image = this.core.image_loader.getImage(this.serif.left_image());
	ctx.transform(-1, 0, 0, 1, left_image.width * SCALE, 0); // 左右反転
	ctx.drawImage(left_image,
		-x, // 左右反転
		y,
		left_image.width * SCALE,
		left_image.height * SCALE
	);

	ctx.restore();
};
*/

SceneStageTalk.prototype._showMessageWindow = function(){
	var ctx = this.core.ctx;
	// show message window
	ctx.save();

	var message_height = 100;

	ctx.globalAlpha = 0.5;
	ctx.fillStyle = 'rgb( 0, 0, 0 )';
	ctx.fillRect(
		MESSAGE_WINDOW_OUTLINE_MARGIN,
		this.core.height - message_height - MESSAGE_WINDOW_OUTLINE_MARGIN,
		this.core.width - MESSAGE_WINDOW_OUTLINE_MARGIN * 2,
		message_height
	);

	ctx.restore();
};

// セリフ表示
SceneStageTalk.prototype._showMessage = function() {
	var ctx = this.core.ctx;
	ctx.save();

	ctx.font = "18px 'Migu'";
	ctx.textAlign = 'left';
	ctx.textBaseAlign = 'middle';

	var x, y;
	// セリフ表示
	var lines = this.serif.lines();
	if (lines.length) {
		// セリフテキストの y 座標初期位置
		var message_height = 80;
		y = this.core.height - message_height + MESSAGE_WINDOW_OUTLINE_MARGIN;

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




module.exports = SceneStageTalk;
