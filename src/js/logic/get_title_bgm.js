'use strict';
// 静的クラス
var GetTitleBgm = function() {};

GetTitleBgm.exec = function(storage_story){
	// 通常ストーリーのみクリアしていれば、BGMを霊夢1人 ver に
	if(storage_story.getIsNormalStageCleared() && !storage_story.getIsExStageCleared()) {
		return "title_without_yukari";
	}
	else {
		return "title";
	}
};
module.exports = GetTitleBgm;
