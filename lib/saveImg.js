/*
 *  保存图片
 * @param url 图片路径
 * @param callback
 */
var http = require("http"),
	fs = require("fs");

var downloadPath = "download/images/";

function saveImg(url, callback){	'use strict';

	var fileName = url.substr(url.lastIndexOf("/") + 1);
	var downloadName = downloadPath + fileName;
	if (fs.existsSync(downloadName)) {
		downloadName = downloadPath + ((new Date()).getTime() + fileName);
	}
	console.log("download image: " + url);
	var beginDate = new Date().getTime();
	http.get(url, function(res){
		var imgData = "";
		res.setEncoding("binary");
		res.on("data",function(chunk){
			imgData += chunk;
		});
		res.on("end",function(){
			fs.writeFile(downloadName, imgData, "binary", function(err){
				if (err){
					console.log(err);
					callback(err);	
				} else {
					var endDate = new Date().getTime();
					console.log(url + " download finish. " + (endDate-beginDate) + "ms");
					callback();
				}
			});
		});
	}).on('error', function(e) {
		console.log("download image: " + e.message + " " + url);
		//callback(e.message);
	});
}

module.exports = saveImg;
