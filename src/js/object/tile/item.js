'use strict';
var CONSTANT = require('../../constant');
var base_object = require('../../hakurei').object.sprite;
var util = require('../../hakurei').util;

var Item = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(Item, base_object);

Item.prototype.init = function(x, y) {
	base_object.prototype.init.apply(this, arguments);
	this.x = x;
	this.y = y;
	this.is_show = true;
	this.is_collision = true;
};

Item.prototype.got = function() {
	this.is_show = false;
	this.is_collision = false;
};

Item.prototype.isShow = function() {
	return this.is_show;
};

Item.prototype.isCollision = function() {
	return this.is_collision;
};










// sprite configuration

Item.prototype.spriteName = function(){
	return "item";
};
Item.prototype.spriteIndices = function(){
	return [{x: 3, y: 2}];
};
Item.prototype.spriteWidth = function(){
	return 32;
};
Item.prototype.spriteHeight = function(){
	return 32;
};
Item.prototype.scaleWidth = function(){
	return 1;
};
Item.prototype.scaleHeight = function(){
	return 1;
};

module.exports = Item;
