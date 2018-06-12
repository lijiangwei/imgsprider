/*
 * 解析 AV蓝光/原盘  URL，把链接保存在download/zz/文件夹下面
 * URL: http://365.kv700.com/lg/
 */

var Util = require("./Util"),
	cheerio = require("cheerio"), 
	async = require('async'),
	iconv = require('iconv-lite'),	//解决中文乱码
	fs = require("fs");
	
var url = "http://365.kv700.com/lg/",
	path = "download/lg/",
	RegExp_torrent = /http:\/\/[0-9a-z\.\/]*\.torrent/g,
	RegExp_img = /http:\/\/[0-9a-z\.\/]*\.jpg/g;

/**
 * 检查是否需要的url 
 * @param {String} url
 */
function checkURL(url){
	if(/\.htm$/.test(url)){
		return true;
	}
	return false;
}

/**
 * 获取要保存的文件名 
 * @param {String} url
 * @return {String} 文件名
 */
function resolveFileName(url){
	var fileName = url.match(/(-)(\d*-\d*-\d*)/);
	if(fileName) return path + fileName[2] +"/" +fileName[2] + ".txt";
}

/**
 * 下载图片 
 * @param {Object} list 图片地址列表
 */
function downloadImg(list, path, callback){
	var q = async.queue(function(task, callback2){
		Util.downloadImage(task, path, callback2);
	},5);
	q.drain = function() {		//所有任务执行完毕
		if(typeof callback ==="function"){
			callback();	
		}
	};
	q.push(list);
}

function startDownload(){
	console.log("start download...");
	var urlList = [];
	Util.fetchURLContents(url, function(data){
		var $ = cheerio.load(data);
		$("a[href]").each(function(index, item){
			var href = $(item).attr("href");
			if(checkURL(href)){
				var tmp = {
					url: url + href,
					fileName : resolveFileName(href)
				};
				urlList.push(tmp);
			}
		});
		var q = async.queue(function(task, callback){
			Util.fetchURLContents(task.url, function(data){
				var torrentList = data.match(RegExp_torrent);
				var imgList = data.match(RegExp_img);
				var tmp = [];
				if(!torrentList){
					callback();
					return;
				}
				for(var i=0, max=torrentList.length; i < max; i++){
					tmp.push(imgList[i]);
					tmp.push(torrentList[i]);
				}
				var fileName = resolveFileName(task.url),
						path = fileName.substring(0, fileName.lastIndexOf("/")+1);
				if(tmp){
					Util.saveFile(tmp.join("\n"),fileName,function(){
						if(imgList){	//下载图片
							downloadImg(imgList, path, function(){
								callback();		
							});
						}
					});
				}else{
					callback();
				}
			});
		},5);
		q.push(urlList);
	});
}

exports.startDownload = startDownload;
