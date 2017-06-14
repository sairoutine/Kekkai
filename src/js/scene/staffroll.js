'use strict';

/* スタッフロール画面 */

var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;

var SceneStaffroll = function(core) {
	base_scene.apply(this, arguments);
};
util.inherit(SceneStaffroll, base_scene);

SceneStaffroll.prototype.init = function() {
	base_scene.prototype.init.apply(this, arguments);
};

SceneStaffroll.prototype.beforeDraw = function() {
	base_scene.prototype.beforeDraw.apply(this, arguments);
};
SceneStaffroll.prototype.draw = function(){
};


module.exports = SceneStaffroll;
