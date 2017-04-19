'use strict';

// 落下中の状態

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

module.exports = StateNormal;
