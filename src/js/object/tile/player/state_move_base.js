'use strict';

// 移動状態の基底クラス

var CONSTANT = require('../../../constant');
var base_object = require('./state_base');
var util = require('../../../hakurei').util;

var StateMoveBase = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(StateMoveBase, base_object);

module.exports = StateMoveBase;
