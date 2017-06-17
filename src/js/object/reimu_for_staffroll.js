'use strict';

/* スタッフロール用霊夢 */

var CONSTANT = require('../constant');
var H_CONSTANT = require('../hakurei').constant;
var base_object = require('../hakurei').object.sprite;
var util = require('../hakurei').util;

var Reimu = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(Reimu, base_object);

Reimu.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.x(x);
	this.y(y);
};


Reimu.prototype.spriteName = function(){
	return "stage_tile_32";
};
Reimu.prototype.spriteIndices = function(){
	return [{x: 3, y: 2}, {x: 4, y: 2}];
		//: [{x: 1, y: 2}, {x: 2, y:2}];
};
Reimu.prototype.spriteAnimationSpan = function(){
	return 10;
};

Reimu.prototype.spriteWidth = function(){
	return 32;
};
Reimu.prototype.spriteHeight = function(){
	return 32;
};

Reimu.prototype.scaleWidth = function(){
	return 3;
};
Reimu.prototype.scaleHeight = function(){
	return 3;
};



module.exports = Reimu;
