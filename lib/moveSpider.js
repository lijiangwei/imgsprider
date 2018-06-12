/**
 * 抓取网页上mp4下载链接地址
 * http://365.kv700.com/vod/ 
 */
var http = require("http"), 
	BufferHelper = require('bufferhelper'), 
	cheerio = require("cheerio"), 
	async = require('async'),
	iconv = require('iconv-lite'),	//解决中文乱码
	fs = require("fs"),
	saveImg = require("./saveImg"),
	moment = require("moment");		//格式化日期

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

function genarateFileName(){
	var path = "download/",
		fileName = path + "move"+moment().format("YYYYMMDD")+".txt";
	return fileName;
}

/*
 * 保存文件
 * @param contents 文件内容
 * @param fileName 文件名称
 */
function saveFile(contents, fileName, callback){	'use strict';
	fs.writeFile(fileName, contents, function(err){
		if(err){
			throw err;
		}
		console.log("文件%s保存成功!", fileName);
		if(typeof callback == "function"){
			callback();
		}
	});
}

/*
 * @func 抓取网页内容
 * @param fileName 要保存的文件名称
 */
function featchMoveList(options, fileName, callback){
	var url = options.url,
		func = options.funcName;
	http.get(url,function(res){
		var bufferHelper = new BufferHelper();
		res.on("data", function(chunk) {
			bufferHelper.concat(chunk);
		});
		res.on("end", function() {
			var data = iconv.decode(bufferHelper.toBuffer(),'GBK');
			switch(func){
				case "resolveAVList":
					resolveAVList(data);
					break;
				case "resolveAV":
					resolveAV(data, fileName, callback);
					break;
				default:
					break;
			}
		});
	});
}

//解析最新小电影 
function resolveXDY(data){
	var fileName = genarateFileName();
	var $ = cheerio.load(data),
		moveStr = "";
	$("h3").each(function(index,item){
		var text = $(item).text().match(/http:\/\/[\w\.\/]*torrent$/);
		if(text){
			var url = text[0];
			moveStr = moveStr + url + "\n";
		}
	});
	$("a[href]").each(function(index, item) {
		var href = $(item).attr("href");
		if(checkExpend(href)){
			moveStr = moveStr + href + "\n";
		}
	});
	saveFile(moveStr, fileName);
}

//解析在职素人链接
function resolveZZSR(data){		
	var fileName = "download/zzsr.txt",
		$ = cheerio.load(data),
		moveStr = "";
	$("a[href]").each(function(index, item) {
		var href = $(item).attr("href");
		if(checkExpend(href)){
			console.log(href);
			moveStr = moveStr + href + "\n";
		}
	});
	saveFile(moveStr, fileName);
}

//解析AV女优列表
function resolveAVList(data){		
	var fileName = "download/av.txt",
		$ = cheerio.load(data),
		moveList = [];
		moveStr = "";
	$("a[href]").each(function(index, item) {
		var href = $(item).attr("href");
		if(/^\w*\/$/.test(href)){
			url = "http://365.kv700.com/av/" + href;
			var tmp = {
				url: url,
				fileName: "download/av/"+href.substr(0, href.length-1)+".txt"
			};
			moveList.push(tmp);
			console.log(url);
			moveStr = moveStr + url + "\n";
		}
	});
	saveFile(moveStr, fileName);
	for(var item in moveList){
		var options = {
			url:item.url,
			funcName: "resolveAV"
		};
		featchMoveList(options, item.fileName);
	}
}

//解析AV女优作品
function resolveAV(data, fileName, callback){
	var $ = cheerio.load(data),
		moveStr = "";
	$("a[href]").each(function(index, item) {
		var href = $(item).attr("href");
		if(checkExpend(href)){
			console.log(href);
			moveStr = moveStr + href + "\n";
		}
	});
	saveFile(moveStr, fileName, callback);
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
				// console.log(url.substring(url.indexOf("av/")+3, url.length-2));
				// var fileName = "download/av/" + url.match(/.*\/(\w*)\/$/)[1] + ".txt";
				var fileName = "download/av/" + url.substring(url.indexOf("av/")+3, url.length-2) + ".txt";
				var options = {
					url: url,
					funcName: "resolveAV"
				};
				featchMoveList(options, fileName, callback);
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

exports.featchMoveList = featchMoveList;	//保存电影列表
exports.featchAVList = featchAVList;
