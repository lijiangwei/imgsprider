/**
 * 抓取网页上mp4下载链接地址
 * http://365.kv700.com/av/ 
 */
var cheerio = require("cheerio"), 
	Util = require("./Util"),
	iconv = require('iconv-lite'),	//解决中文乱码
	async = require('async'),
	fs = require("fs");
	
var path = "download/av/";

/*
 *  检查是否需要的url格式
 *  @param {String} url 
 */
function checkExpend(url){
	var reg = /^http:\/\/.*(mp4|torrent|avi|rmvb)\s?$/;
	if(reg.test(url)){
		return true;
	}
	return false;
};


//解析AV女优作品
function resolveAV(url, data, callback){
	var $ = cheerio.load(data),
		moveStr = "";
	var fileName = $("title").text().replace(/\//g,"");
	if(fileName){
		fileName = path+fileName+".txt";
	}
	$("a[href]").each(function(index, item) {
		var $ele = $(item);
		var href = $ele.attr("href");
		var text = $ele.text();
		if(checkExpend(href)){
			moveStr = moveStr + text + "\n" + href + "\n";
		}
	});
	Util.saveFile(moveStr, fileName, callback);
}

function featchAVList(){
	fs.readFile("download/av.txt",function(err, data){
		if(err){
			console.log("读取文件失败");
			return;
		}
		var moveList = data.toString().split("\n");
		async.eachSeries(moveList, function(url, callback){
			if(url){
				Util.fetchURLContents(url, function(data){
					resolveAV(url, data,function(){
						callback();
					});
				});
			}else{
				callback();
			}
		},function(err){
			if(err){
				console.log(err);
			}else{
				console.log("finish.");
			}
		});
	});
}

function startDownload(){
	console.log("start download...");
	featchAVList();
}

exports.startDownload = startDownload;	//解析av女友作品
