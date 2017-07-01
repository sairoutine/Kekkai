'use strict';
var base_class = require('./hakurei').storage.save;
var util = require('./hakurei').util;

var StorageSave = function(scene) {
	base_class.apply(this, arguments);
};
util.inherit(StorageSave, base_class);

StorageSave.prototype.setIsNormalStageCleared = function(flag){
	this._data.is_normal_stage_cleared = flag;
};
StorageSave.prototype.getIsNormalStageCleared = function(){
	return this._data.is_normal_stage_cleared;
};


module.exports = StorageSave;
