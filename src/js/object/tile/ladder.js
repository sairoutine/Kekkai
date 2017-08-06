'use strict';
var CONSTANT = require('../../constant');
var base_object = require('./tile_base');
var util = require('../../hakurei').util;

var Ladder = function (scene) {
	base_object.apply(this, arguments);

	// 種類
	this.type = CONSTANT.LADDER;
};
util.inherit(Ladder, base_object);

Ladder.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.x(x);
	this.y(y);
};

Ladder.prototype.isCollision = function() {
	return true;
};



/*
Ladder.prototype.draw = function() {
	base_object.prototype.draw.apply(this, arguments);

	var ctx = this.core.ctx;
	var hashigo = this.core.image_loader.getImage("hashigo");

	ctx.drawImage(hashigo,
		// sprite position
		0, 0,
		// sprite size to get
		32, 16,
		this.x(), this.y(),
		// sprite size to show
		CONSTANT.TILE_SIZE, CONSTANT.TILE_SIZE
	);

};
*/
// sprite configuration

Ladder.prototype.spriteName = function(){
	return "hashigo";
};
Ladder.prototype.spriteIndices = function(){
	return [{x: 0, y: 0}];
};
Ladder.prototype.spriteWidth = function(){
	return 32;
};
Ladder.prototype.spriteHeight = function(){
	return 16;
};
Ladder.prototype.scaleWidth = function(){
	return this._scale * 0.75;
};
Ladder.prototype.scaleHeight = function(){
	return this._scale * 1.5;
};

// collision configuration

Ladder.prototype.collisionWidth = function() {
	return 24;
};
Ladder.prototype.collisionHeight = function() {
	return 24;
};









module.exports = Ladder;
