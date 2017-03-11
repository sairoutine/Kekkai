'use strict';
var CONSTANT = require('../../constant');
var base_object = require('../../hakurei').object.base;
var util = require('../../hakurei').util;

var BlockGreen = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(BlockGreen, base_object);

BlockGreen.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.x = x;
	this.y = y;
};

BlockGreen.prototype.draw = function() {
	base_object.prototype.draw.apply(this, arguments);

	var ctx = this.core.ctx;
	var block = this.core.image_loader.getImage("block");
	ctx.drawImage(block,
		// sprite position
		16 * 4, 0,
		// sprite size to get
		16, 16,
		this.x, this.y,
		// sprite size to show
		CONSTANT.TILE_SIZE, CONSTANT.TILE_SIZE
	);
};

module.exports = BlockGreen;
