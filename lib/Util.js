/**
 * Util 工具集 
 */

var http = require("http"),
	async = require('async'),
	iconv = require('iconv-lite'),	//解决中文乱码
	fs = require("fs");

var errorTimes = 0;
/**
 * 获取文件路径 
 */
function getPath(fileName){
	return fileName.substring(0, fileName.lastIndexOf("/")+1);
}
/*
 * 保存文件
 * @param fileContents 文件内容
 * @param fileName 文件名称
 * @param callback 回调函数
 */
function saveFile(fileContents, fileName, callback){
	// if(fs.existsSync(fileName)){
		// if(typeof callback === "function"){
			// callback();
		// }
		// return;
	// }
	var path = getPath(fileName);
	if(!fs.existsSync(path)){	//路径不存在
		fs.mkdirSync(path);
	}
	fs.writeFile(fileName, fileContents, function(err){
		if(err){
			console.log("写入文件%s错误!",fileName);
		}else{
			console.log("写入文件%s成功!", fileName);
		}
		if(typeof callback === "function"){
			callback();
		}
	});
}

/*
 * @func fetchURLContents
 * @description 抓取URL内容
 * @param url 网页地址
 * @callback 回调函数
 */
function fetchURLContents(url, callback){
	http.get(url, function(res){
		var buffer = [];
		res.on("data", function(chunk){
			buffer.push(chunk);
		});
		res.on("end", function(){
			var data = iconv.decode(Buffer.concat(buffer),'GBK');
			callback(data);
		});
	}).on("error",function(err){
		console.error("http请求出错: " + err.message);
	});
}

/**
 * 获取图片文件名 
 */
function getFileName(url){
	return url.substr(url.lastIndexOf("/")+1);
}

/**
 * 下载图片 
 * @param {Object} url
 */
function downloadImage(url, path, callback){
	var fileName = path+getFileName(url);
	if(fs.existsSync(fileName)){
		if(typeof callback === "function"){
			callback();
		}
		return;
	}
	http.get(url, function(res){
		var imgData = "";
		res.setEncoding("binary");
		res.on("data",function(chunk){
			imgData += chunk;
		});
		res.on("end",function(){
			fs.writeFile(fileName, imgData, "binary", function(err){
				if (err){
					console.log(err);	
				}else{
					console.log("图片%s下载成功!",url);	
				}
				if(typeof callback === "function"){
					callback();
				}
			});
		});
	}).on('error', function(e) {
		console.log("download image: %s, error: %s, error times: %d", url, e.message, (errorTimes++));
	});
}

/**
 * 下载mp3 
 * @param {Object} url
 */
function downloadMp3(url, path, callback){
	var fileName = path+getFileName(url);
	if(fs.existsSync(fileName)){
		if(typeof callback === "function"){
			callback();
		}
		return;
	}
	http.get(url, function(res){
		res.setEncoding("binary");
		var writestream = fs.createWriteStream(fileName,{
			encoding : 'binary'
		});
		
		res.on("data", function(chunk){
			console.log(chunk);
			writestream.write(chunk);
		});
		
		res.on("end", function(){
			console.log("文件%s下载完成!",url);
			writestream.end();
		});
		
        // writestream.on('close', function() {
        	// console.log("文件%s下载完成!",url);
            // callback();
        // });
        // res.pipe(writestream);
	}).on('error', function(e) {
		console.log("download mp3: %s, error: %s, error times: %d", url, e.message, (errorTimes++));
	});
}


exports.saveFile = saveFile;		//保存文件
exports.fetchURLContents = fetchURLContents;		//抓取网页内容
exports.downloadImage = downloadImage;				//保存图片
exports.downloadMp3 = downloadMp3;				//保存图片
