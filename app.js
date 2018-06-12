var http = require("http"), 
	async = require('async'),
	imgSpiderUtil = require('./lib/imgSpiderUtil'),
	saveImg = require("./lib/saveImg");

var url = "http://365.kv700.com/xtu/";
//抓取网页数据

function fetchHtmlData(url, callback) {
	http.get(url, function(res) {
		var bufferHelper = new BufferHelper();
		res.on("data", function(chunk) {
			bufferHelper.concat(chunk);
		});
		res.on("end", function() {
			var data = bufferHelper.toBuffer();
			callback(data);
		});
	});
}

/*
//同步执行版本
fetchHtmlData(url, function(data) {		//获取html页面中连接的地址
	var $ = cheerio.load(data);
	var htmlList = [];
	$("a[target]").each(function(index, item) {
		var href = $(item).attr("href");
		if (href && href != "/") {
			htmlList.push(url + href);
		}
	});
	htmlList = htmlList.splice(24);
	//console.log(htmlList.length);
	async.eachSeries(htmlList, function(item, callback) {
		console.log("fetchImgUrl: " + item);
		setTimeout(function() {
			fetchImgUrl(item, callback);
		}, 10);
	}, function(err) {
		if(err)
			console.log(err);
	});
	
});
*/


//获取html页面图片路径
function fetchImgUrl(url, callback) {
	http.get(url, function(res) {
		var bufferHelper1 = new BufferHelper();
		res.on("data", function(chunk) {
			bufferHelper1.concat(chunk);
		});
		res.on("end", function() {
			var data = bufferHelper1.toBuffer();
			var $1 = cheerio.load(data) , srcList=[];
			$1("table img").each(function(index, e) {
				var src = $1(e).attr("src");
				if (/^http:\/\//.test(src)) {
					// saveImg(src);
					srcList.push(src);
				}
			});
			if(srcList.length > 0){
				async.each(srcList, function(item, callback) {
					setTimeout(function() {
						saveImg(item, callback);
					}, 10);
				}, function(err) {
					console.log(err);
				});
				
			}else{
				console.log(url + "has no img.");
			}
			if (typeof callback == "function") {
				console.log(url + " fetchImgUrl finish.");
				callback(null);
			}
		});
	});
}

imgSpiderUtil.fetchUrlList(url, function(list){
	async.eachSeries(list, function(url,callback){
		imgSpiderUtil.fetchImgUrlList(url, function(imgList){
			console.log(url + "获取图片列表完成.")
			//callback();
			//return;
			var q = async.queue(function (task, queueCallback) {
    			saveImg(task, queueCallback);
			}, 10);
			q.drain = function() {
				console.log(url + " 图片下载完成.");
				callback();
			};
			q.push(imgList);
			
			// async.each(imgList, function(imgUrl, imgCallback){
				// saveImg(imgUrl, imgCallback);
			// },function(err){
				// if(err){
					// console.log(err.message);
				// }else {
					// console.log(url + " 图片下载完成.");
				// }
				// callback();
			// });
		});
	},function(err){
		if(err){
			console.log(err);
		} else {
			console.log("图片抓取完成.");
		}
	});
});

