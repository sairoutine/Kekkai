'use strict';

var base_class = require('../hakurei').storage.base;
var util = require('../hakurei').util;

var StorageConfig = function(scene) {
	base_class.apply(this, arguments);
};
util.inherit(StorageConfig, base_class);

StorageConfig.KEY = function(){
	var key = "hakurei_engine:config";
	if (!this.isLocalMode() && window && window.location) {
		return(key + ":" + window.location.pathname);
	}
	else {
		return "config";
	}
};

module.exports = StorageConfig;
