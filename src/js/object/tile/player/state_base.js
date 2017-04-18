'use strict';
var base_object = require('../../../hakurei').object.base;
var util = require('../../../hakurei').util;

var StateBase = function (scene, parent) {
	base_object.apply(this, arguments);
};
util.inherit(StateBase, base_object);

// 移動操作ができるか
StateBase.prototype.isEnableToPlayMove = function () {
	return true;
};
// 交代操作ができるか
StateBase.prototype.isEnableToPlayExchange = function () {
	return true;
};

// 落下するかどうか
StateBase.prototype.isFallDown = function () {
	return true;
};

module.exports = StateBase;
