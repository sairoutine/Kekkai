'use strict';
var base_object = require('../../hakurei').object.sprite;
var util = require('../../hakurei').util;

var TileBase = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(TileBase, base_object);

TileBase.prototype.init = function(x, y, scale) {
	scale = scale || 1;

	base_object.prototype.init.apply(this, arguments);
	this.x(x);
	this.y(y);

	this._scale = scale;
};

TileBase.prototype.isBlock = function() {
	return false;
};
module.exports = TileBase;
