/*
 * 解析 mp3，把链接保存在download/mp3/文件夹下面
 * URL: http://365.kv700.com/lymp3/
 */

var Util = require("./Util"),
	cheerio = require("cheerio"), 
	async = require('async'),
	iconv = require('iconv-lite'),	//解决中文乱码
	fs = require("fs");
	
var url = "http://365.kv700.com/lymp3/",
	path = "download/mp3/",
	RegExp_mp3 = /http:\/\/[0-9a-z\.\/]*\.mp3/ig;



function startDownload(){
	console.log("start download...");
	Util.fetchURLContents(url, function(data){
		var mp3List = data.match(RegExp_mp3);
		if(!mp3List) return;
		var q = async.queue(function(task, callback){
			Util.downloadMp3(task,path,callback);
		},5);
		mp3List = mp3List[0];
		//var max = mp3List.length, index=0;
		q.push(mp3List,function(){
			//index++;
			//console.log("还剩%d个文件", max-index);
		});
	});
}

exports.startDownload = startDownload;
