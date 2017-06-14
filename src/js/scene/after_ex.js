'use strict';

/* Exストーリー クリア後画面 */

// カットを2~3点とセリフ


var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;

var SceneAfterEx = function(core) {
	base_scene.apply(this, arguments);
};
util.inherit(SceneAfterEx, base_scene);

SceneAfterEx.prototype.init = function() {
	base_scene.prototype.init.apply(this, arguments);
};

SceneAfterEx.prototype.beforeDraw = function() {
	base_scene.prototype.beforeDraw.apply(this, arguments);
};
SceneAfterEx.prototype.draw = function(){
};


module.exports = SceneAfterEx;
