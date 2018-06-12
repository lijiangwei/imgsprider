var moveSpider = require("./lib/moveSpider");

var url2= "http://365.kv700.com/vod/0~200.htm";
var url3= "http://365.kv700.com/vod/400~600.htm";
var url4= "http://365.kv700.com/vod/600~800.htm";

//最新小电影
var newXDY = {
	"url": "http://365.kv700.com/vod/",
	"funcName": "resolveXDY" 
};

//在职素人
var zzsr = {
	"url": "http://365.kv700.com/av/zzsr/",
	"funcName": "resolveZZSR"
};

//av女优
var avList = {
	"url": "http://365.kv700.com/av/",
	"funcName": "resolveAVList"
};

moveSpider.featchAVList(avList);

