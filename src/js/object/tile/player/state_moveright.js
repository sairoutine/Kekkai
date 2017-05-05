'use strict';

// 左への移動状態

var CONSTANT = require('../../../constant');
var base_object = require('./state_move_base');
var util = require('../../../hakurei').util;

var StateMoveLeft = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(StateMoveLeft, base_object);

module.exports = StateMoveLeft;
