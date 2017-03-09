'use strict';

var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;
var SceneStageTalk = require("./stage/talk");

var SceneStage = function(core) {
	base_scene.apply(this, arguments);

	this.addSubScene("talk", new SceneStageTalk(core, this));
	//this.addSubScene("play", new SceneStagePlay(core, this));
};
util.inherit(SceneStage, base_scene);

SceneStage.prototype.init = function(){
	base_scene.prototype.init.apply(this, arguments);

};
SceneStage.prototype.beforeDraw = function(){
	base_scene.prototype.beforeDraw.apply(this, arguments);
	if(this.frame_count === 2) {
		this.changeSubScene("talk");
	}

};
SceneStage.prototype.draw = function() {
	var ctx = this.core.ctx;

	ctx.save();
	ctx.fillStyle = util.hexToRGBString("EEEEEE");
	ctx.fillRect(0, 0, this.core.width, this.core.height);

	// 横:30, 縦20
	// 0: 背景
	// 1: 緑ブロック
	// 2: 青ブロック
	// 3: 赤ブロック
	// 4: 紫ブロック
	// 5: 茶ブロック
	// 6: はしご
	// 7: プレイヤー
var stage = [
	[0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,7,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,9,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,2,2,2,2,2,2,2,6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
	[0,0,0,0,2,2,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0],
	[0,0,0,0,2,2,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0],
	[0,0,0,0,2,2,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0],
	[0,0,0,0,2,2,0,3,3,3,0,0,0,0,0,0,0,0,0,0,3,3,3,0,0,1,1,1,0,0],
	[0,0,0,0,2,2,0,3,3,3,0,0,0,0,0,0,0,0,0,0,3,3,3,0,0,1,1,1,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0],
	[0,0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

	var player = this.core.image_loader.getImage("player");
	var block = this.core.image_loader.getImage("block");
	var hashigo = this.core.image_loader.getImage("hashigo");

	var size = 24;
	for (var i = 0; i < stage.length; i++) {
		var line = stage[i];
		for (var j = 0; j < line.length; j++) {
			var type = line[j];
			var pos_x = j*size + 25;
			var pos_y = i*size + 50;
			if (type === 0) {
				ctx.fillStyle = util.hexToRGBString("DDDDDD");
				ctx.fillRect(
					pos_x, pos_y,
					size, size
				);

			}
			else if (type === 1) {//block
				ctx.drawImage(block,
					// sprite position
					16 * 4, 0,
					// sprite size to get
					16, 16,
					pos_x, pos_y,
					// sprite size to show
					size, size
				);
			}
			else if (type === 2) {//block
				ctx.drawImage(block,
					// sprite position
					16 * 5, 0,
					// sprite size to get
					16, 16,
					pos_x, pos_y,
					// sprite size to show
					size, size
				);
			}
			else if (type === 3) {//block
				ctx.drawImage(block,
					// sprite position
					16 * 6, 0,
					// sprite size to get
					16, 16,
					pos_x, pos_y,
					// sprite size to show
					size, size
				);
			}
			else if (type === 4) {//block
				ctx.drawImage(block,
					// sprite position
					16 * 7, 0,
					// sprite size to get
					16, 16,
					pos_x, pos_y,
					// sprite size to show
					size, size
				);
			}
			else if (type === 5) {//block
				ctx.drawImage(block,
					// sprite position
					16 * 3, 0,
					// sprite size to get
					16, 16,
					pos_x, pos_y,
					// sprite size to show
					size, size
				);
			}
			else if (type === 6) { //hashigo
				ctx.drawImage(hashigo,
					// sprite position
					0, 0,
					// sprite size to get
					32, 16,
					pos_x, pos_y,
					// sprite size to show
					size, size
				);
			}
			else if (type === 7) { // player
				ctx.drawImage(player,
					// sprite position
					32 * 1, 48 * 2,
					// sprite size to get
					32, 48,
					pos_x, pos_y,
					// sprite size to show
					32, 48
				);
			}

		}
	}

	base_scene.prototype.draw.apply(this, arguments);
};

module.exports = SceneStage;
