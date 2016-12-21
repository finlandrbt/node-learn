var PORT = 8000;

var http = require('http');
var url=require('url');
var fs=require('fs');
var path=require('path');

var server = http.createServer(function (request, response) {
    var realPath = url.parse(request.url).pathname;
    console.log(realPath);
    fs.readFile(realPath, "binary", function (err, file) {
        if (err) {
            response.writeHead(500, {'Content-Type': 'text/plain'});
            response.end(err);
        } else {
            var contentType = "text/plain";
            response.writeHead(200, {'Content-Type': contentType});
            response.write(file, "binary");
            response.end();
        }
    });
});
server.listen(PORT);
console.log("Server runing at port: " + PORT + ".");
