var http = require('http');
var fs = require('fs');


http.createServer(function (request, response) {
	//var page = fs.readFileSync('page1.html');
	//response.writeHead(200, {"Content-Type": "text/html"});
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.end('Hello World\n');
}).listen(8080);