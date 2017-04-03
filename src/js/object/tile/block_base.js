'use strict';
var base_object = require('../../hakurei').object.base;
var util = require('../../hakurei').util;

var BlockBase = function (scene) {
	base_object.apply(this, arguments);
};
util.inherit(BlockBase, base_object);

module.exports = BlockBase;
