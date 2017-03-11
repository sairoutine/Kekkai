'use strict';

var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;
var SceneStageTalk = require("./stage/talk");
var SceneStagePlay = require("./stage/play");
var stage1_map = require("./map/stage1");

var SceneStage = function(core) {
	base_scene.apply(this, arguments);

	this.addSubScene("talk", new SceneStageTalk(core, this));
	this.addSubScene("play", new SceneStagePlay(core, this));
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

	// background
	ctx.fillStyle = util.hexToRGBString("EEEEEE");
	ctx.fillRect(0, 0, this.core.width, this.core.height);

	ctx.restore();

	ctx.save();
	var offset_x = 25;
	var offset_y = 50;
	var size = 24;

	ctx.fillStyle = util.hexToRGBString("DDDDDD");
	ctx.fillRect(
		offset_x, offset_y,
		size * 30, size * 20
	);
	ctx.restore();

	ctx.save();
	// map
	var stage = stage1_map;

	var player = this.core.image_loader.getImage("player");
	var block = this.core.image_loader.getImage("block");
	var hashigo = this.core.image_loader.getImage("hashigo");
	var item = this.core.image_loader.getImage("item");

	for (var i = 0; i < stage.length; i++) {
		var line = stage[i];
		for (var j = 0; j < line.length; j++) {
			var type = line[j];
			var pos_x = j*size + offset_x;
			var pos_y = i*size + offset_y;
			if (type === 0) {

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
			else if (type === 8) { // enemy
				ctx.drawImage(item,
					// sprite position
					32 * 0, 32 * 3,
					// sprite size to get
					32, 32,
					pos_x, pos_y,
					// sprite size to show
					size, size
				);
			}
			else if (type === 9) { // item1
				ctx.drawImage(item,
					// sprite position
					32 * 3, 32 * 2,
					// sprite size to get
					32, 32,
					pos_x, pos_y,
					// sprite size to show
					size, size
				);
			}
		}
	}

	base_scene.prototype.draw.apply(this, arguments);
};

module.exports = SceneStage;
