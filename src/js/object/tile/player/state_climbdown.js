'use strict';

// はしごを降りている状態

var CONSTANT = require('../../../constant');
var base_object = require('./state_base');
var util = require('../../../hakurei').util;

var StateNormal = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(StateNormal, base_object);

// 落下するかどうか
StateNormal.prototype.isFallDown = function () {
	return false;
};



module.exports = StateNormal;
