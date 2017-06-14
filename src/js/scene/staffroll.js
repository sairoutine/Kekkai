'use strict';

/* スタッフロール画面 */

var util = require('../hakurei').util;
var CONSTANT = require('../constant');
var base_scene = require('./base');

var SceneStaffroll = function(game) {
	base_scene.apply(this, arguments);
};

util.inherit(SceneStaffroll, base_scene);

module.exports = SceneStaffroll;
