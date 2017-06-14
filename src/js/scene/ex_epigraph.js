'use strict';

/* Ex エピグラフ画面 */

// 黒い画面に文字だけで、
// 「幻想郷は全てを受け入れるのよ。それはそれは残酷な話ですわ。」


var base_scene = require('../hakurei').scene.base;
var util = require('../hakurei').util;

var SceneExEpigraph = function(core) {
	base_scene.apply(this, arguments);
};
util.inherit(SceneExEpigraph, base_scene);

SceneExEpigraph.prototype.init = function() {
	base_scene.prototype.init.apply(this, arguments);
};

SceneExEpigraph.prototype.beforeDraw = function() {
	base_scene.prototype.beforeDraw.apply(this, arguments);
};
SceneExEpigraph.prototype.draw = function(){
};


module.exports = SceneExEpigraph;
