'use strict';

// 死亡中の状態

var CONSTANT = require('../../../constant');
var base_object = require('./state_base');
var util = require('../../../hakurei').util;

var StateNormal = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(StateNormal, base_object);

// 移動操作ができるか
StateNormal.prototype.isEnableToPlayMove = function () {
	return false;
};
// 交代操作ができるか
StateNormal.prototype.isEnableToPlayExchange = function () {
	return false;
};
// 落下するかどうか
StateNormal.prototype.isFallDown = function () {
	return false;
};

// 敵と接触するなどして死ねるかどうか
StateNormal.prototype.isEnableToDie = function () {
	return false;
};






module.exports = StateNormal;
