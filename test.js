var fs = require("fs"),
	http = require("http");

// var fileReadStream = fs.createReadStream("download/mp3/aaa001.mp3");
// var fileWriteStream = fs.createWriteStream("download/mp3/aaa001-back.mp3");


// fileReadStream.on("data", function(chunk){
	// fileWriteStream.write(chunk);
// });
// 
// fileReadStream.on("end", function(){
	// console.log("文件复制完成");
	// fileWriteStream.end();
// });

// fileReadStream.pipe(fileWriteStream);
// 
// fileWriteStream.on("close", function(){
	// console.log("文件复制完成");
// });

var options = {
	host: "localhost",
	port: 8888,
	path: "http://ly.asdfxxx.net/aaa001.mp3"
};
http.request(options, function(req, res){
	res.on("data", function(chunk){
		console.log(chunk);
	});
});
