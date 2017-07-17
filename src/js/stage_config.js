'use strict';

// ステージマップ一覧
var MAPS = [
	null,
	require("./scene/map/stage01"),
	require("./scene/map/stage02"),
	require("./scene/map/stage03"),
	require("./scene/map/stage04"),
	require("./scene/map/stage05"),
	require("./scene/map/stage06"),
	require("./scene/map/stage07"),
	require("./scene/map/stage08"),
	require("./scene/map/stage09"),
	require("./scene/map/stage10"),
	require("./scene/map/stage11"),
	require("./scene/map/stage12"),
	require("./scene/map/stage13"),
	require("./scene/map/stage14"),
	require("./scene/map/stage15"),
	require("./scene/map/stage16"),
	require("./scene/map/stage17"),
	require("./scene/map/stage18"),
	require("./scene/map/stage19"),
	require("./scene/map/stage20"),
	require("./scene/map/stage21"),
	require("./scene/map/stage22"),
	require("./scene/map/stage23"),
	require("./scene/map/stage24"),
	require("./scene/map/stage25"),
	require("./scene/map/stage26"),
	require("./scene/map/stage27"),
	require("./scene/map/stage28"),
	require("./scene/map/stage29"),
	require("./scene/map/stage30"),
	require("./scene/map/stage31"),
	require("./scene/map/stage32"),
	require("./scene/map/stage33"),
	require("./scene/map/stage34"),
	require("./scene/map/stage35"),
	require("./scene/map/stage36"),
	require("./scene/map/stage37"),
	require("./scene/map/stage38"),
	require("./scene/map/stage39"),
	require("./scene/map/stage40"),
];

// セリフ(ステージ開始前) 一覧
var SERIF_BEFORES = [
	null,
	require("./logic/serif/stage01/before"),
	require("./logic/serif/stage02/before"),
	require("./logic/serif/stage03/before"),
	require("./logic/serif/stage04/before"),
	require("./logic/serif/stage05/before"),
	require("./logic/serif/stage06/before"),
	require("./logic/serif/stage07/before"),
	require("./logic/serif/stage08/before"),
	require("./logic/serif/stage09/before"),
	require("./logic/serif/stage10/before"),
	require("./logic/serif/stage11/before"),
	require("./logic/serif/stage12/before"),
	require("./logic/serif/stage13/before"),
	require("./logic/serif/stage14/before"),
	require("./logic/serif/stage15/before"),
	require("./logic/serif/stage16/before"),
	require("./logic/serif/stage17/before"),
	require("./logic/serif/stage18/before"),
	require("./logic/serif/stage19/before"),
	require("./logic/serif/stage20/before"),
	require("./logic/serif/stage21/before"),
	require("./logic/serif/stage22/before"),
	require("./logic/serif/stage23/before"),
	require("./logic/serif/stage24/before"),
	require("./logic/serif/stage25/before"),
	require("./logic/serif/stage26/before"),
	require("./logic/serif/stage27/before"),
	require("./logic/serif/stage28/before"),
	require("./logic/serif/stage29/before"),
	require("./logic/serif/stage30/before"),
	require("./logic/serif/stage31/before"),
	require("./logic/serif/stage32/before"),
	require("./logic/serif/stage33/before"),
	require("./logic/serif/stage34/before"),
	require("./logic/serif/stage35/before"),
	require("./logic/serif/stage36/before"),
	require("./logic/serif/stage37/before"),
	require("./logic/serif/stage38/before"),
	require("./logic/serif/stage39/before"),
	require("./logic/serif/stage40/before"),
];

// セリフ(ステージクリア後) 一覧
var SERIF_AFTERS = [
	null,
	require("./logic/serif/stage01/after"),
	require("./logic/serif/stage02/after"),
	require("./logic/serif/stage03/after"),
	require("./logic/serif/stage04/after"),
	require("./logic/serif/stage05/after"),
	require("./logic/serif/stage06/after"),
	require("./logic/serif/stage07/after"),
	require("./logic/serif/stage08/after"),
	require("./logic/serif/stage09/after"),
	require("./logic/serif/stage10/after"),
	require("./logic/serif/stage11/after"),
	require("./logic/serif/stage12/after"),
	require("./logic/serif/stage13/after"),
	require("./logic/serif/stage14/after"),
	require("./logic/serif/stage15/after"),
	require("./logic/serif/stage16/after"),
	require("./logic/serif/stage17/after"),
	require("./logic/serif/stage18/after"),
	require("./logic/serif/stage19/after"),
	require("./logic/serif/stage20/after"),
	require("./logic/serif/stage21/after"),
	require("./logic/serif/stage22/after"),
	require("./logic/serif/stage23/after"),
	require("./logic/serif/stage24/after"),
	require("./logic/serif/stage25/after"),
	require("./logic/serif/stage26/after"),
	require("./logic/serif/stage27/after"),
	require("./logic/serif/stage28/after"),
	require("./logic/serif/stage29/after"),
	require("./logic/serif/stage30/after"),
	require("./logic/serif/stage31/after"),
	require("./logic/serif/stage32/after"),
	require("./logic/serif/stage33/after"),
	require("./logic/serif/stage34/after"),
	require("./logic/serif/stage35/after"),
	require("./logic/serif/stage36/after"),
	require("./logic/serif/stage37/after"),
	require("./logic/serif/stage38/after"),
	require("./logic/serif/stage39/after"),
	require("./logic/serif/stage40/after"),
];

// ステージに表示する目玉の数
var EYES_NUM = [
	null,
	0,
	1,
	3,
	4,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
	6,
];

module.exports = {
	MAPS: MAPS,
	MAP_NUM: MAPS.length - 1, // マップ数
	SERIF_BEFORES: SERIF_BEFORES,
	SERIF_AFTERS: SERIF_AFTERS,
	EYES_NUM: EYES_NUM,
};