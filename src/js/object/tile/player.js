'use strict';
var CONSTANT = require('../../constant');
var base_object = require('../../hakurei').object.base;
var util = require('../../hakurei').util;

var Player = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(Player, base_object);

Player.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.x = x;
	this.y = y;
};

Player.prototype.beforeDraw = function(){
	base_object.prototype.beforeDraw.apply(this, arguments);

	// 落下していく
	this.y++;
};
Player.prototype.draw = function() {
	base_object.prototype.draw.apply(this, arguments);

	var ctx = this.core.ctx;
	var player = this.core.image_loader.getImage("player");
	ctx.drawImage(player,
		// sprite position
		32 * 1, 48 * 2,
		// sprite size to get
		32, 48,
		this.x, this.y,
		// sprite size to show
		32, 48
	);
};

module.exports = Player;
