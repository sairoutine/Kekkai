'use strict';


var MAPS = require('../stage_config').MAPS;

/* スコア計算ロジック */

// 静的クラス
var Score = function() {};


// 称号がどれか計算
// S -> 3
// A -> 2
// B -> 1
Score.calcHonor = function(stage_no, time, exchange_num){
	var stage_data = this.getStageData(stage_no);

	var score          = this.calcScore(time, exchange_num);
	var criteria_score = this.calcScore(stage_data.criteria_time, stage_data.criteria_exchange_num);

	if (score > criteria_score) {
		return 3;
	}
	else if (criteria_score >= score && score > criteria_score/2) {
		return 2;
	}
	else if (criteria_score/2 >= score) {
		return 1;
	}
};

// スコア(数字)
// time -> 600 くらい
// exchange_num  -> 1 くらい
Score.calcScore = function(time, exchange_num){
	var t = 10000 - time;
	var e = 10 - exchange_num;

	if(t < 0) t = 0;
	if(e < 0) e = 0;

	return t*e;
};

Score.getStageData = function(stage_no){
	return MAPS[stage_no];
};
module.exports = Score;
