/**
 * 图片抓取Util 
 */
var http = require("http"), 
	BufferHelper = require('bufferhelper'), 
	cheerio = require("cheerio"), 
	async = require('async');

/**
 * 获取页面url列表
 * @param {string} url
 * @param {Function} callback
 */
function fetchUrlList(url, callback) {
	http.get(url, function(res) {
		var bufferHelper = new BufferHelper();
		res.on("data", function(chunk) {
			bufferHelper.concat(chunk);
		});
		res.on("end", function() {
			var data = bufferHelper.toBuffer();
			var $ = cheerio.load(data);
			var htmlList = [];
			$("a[target]").each(function(index, item) {
				var href = $(item).attr("href");
				if (href && href != "/") {
					var num = href.match(/(\d*)\/(\d*)\.htm$/);
					if(num && ((parseInt(num[1]) == 5 && parseInt(num[2]) < 19 ))){
						htmlList.push(url + href);	
					}
				}
			});
			console.log("链接数：" + htmlList.length);
			//htmlList = htmlList.splice(24);
			callback(htmlList);
		});
	});
}

/**
 * 获取图片列表
 * @param {string} url
 * @param {Function} callback
 */
function fetchImgUrlList(url, callback){
	http.get(url, function(res) {
		var bufferHelper = new BufferHelper();
		res.on("data", function(chunk) {
			bufferHelper.concat(chunk);
		});
		res.on("end", function() {
			var data = bufferHelper.toBuffer();
			var $ = cheerio.load(data) , srcList=[];
			$("table img").each(function(index, e) {
				var src = $(e).attr("src");
				if (/^http:\/\//.test(src)) {
					srcList.push(src);
				}
			});
			callback(srcList);
		});
	});
}

exports.fetchImgUrlList = fetchImgUrlList;
exports.fetchUrlList = fetchUrlList;
