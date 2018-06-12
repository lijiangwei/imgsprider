/*
 * 解析无码AV历史合集，把链接保存在download/dyall/文件夹下面
 * URL: http://dyall.2121921.net/
 */

var Util = require("./Util"),
	cheerio = require("cheerio"),
	async = require('async'),
	iconv = require('iconv-lite'),	//解决中文乱码
	fs = require("fs");
	
var url = "http://dyall.2121921.net/",
	path = "download/dyall/",
	RegExp_thunder = /thunder:\/\/[0-9a-z\.\/=\+]*/ig,
	RegExp_torrent = /http:\/\/[0-9a-z\.\/=]*\.torrent/ig,
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
	var fileName = url.match(/(\/)(\d*-\d*-\d*)/);
	if(fileName) return path + fileName[2] +"/" +fileName[2] + ".txt";
}

/**
 * 下载图片 
 * @param {Object} list 图片地址列表
 */
function downloadImg(taskNum, list, path, callback){
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
	var urlList = [], saveList = [];
	Util.fetchURLContents(url, function(data){
		var $ = cheerio.load(data);
		var nums = 1;
		$("a[href]").each(function(index, item){
			var href = $(item).attr("href");
			if(checkURL(href)){
				var tmp = {
					index: nums++,
					url: url + href,
					fileName : resolveFileName(href)
				};
				urlList.push(tmp);
			}
		});
		var q = async.queue(function(task, callback){
			Util.fetchURLContents(task.url, function(data){
				var thundertList = data.match(RegExp_thunder) || [];
				var torrentList = data.match(RegExp_torrent) || [];
				thundertList = thundertList.concat(torrentList);
				var imgList = data.match(RegExp_img);
				var fileName = resolveFileName(task.url),
						path = fileName.substring(0, fileName.lastIndexOf("/")+1);
				//console.log(thundertList.length);
				//return;
				if(thundertList.length > 0){
					Util.saveFile(thundertList.join("\n"),fileName,function(){
						if(imgList){	//下载图片
							downloadImg(task.index, imgList, path, callback);
						}
					});
				}else{
					callback();
				}
			});
		},5);
		for(var i=0, l=urlList.length; i < l; i++){
			if(urlList[i].url.indexOf("2015-5-23") > -1){
				console.log(i, urlList.length);
				urlList = urlList.slice(i);
				break;
				//return;
			}
		}
		
		var max = urlList.length, index=0;
		q.push(urlList,function(){
			index++;
			console.log("剩余任务数：%d", max-index);
		});
	});
}

exports.startDownload = startDownload;
