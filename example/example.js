var express = require('express');
var app = express();
var fs = require('fs');


app.use('/static', express.static('assets'));
app.use('/static', express.static('../build'));

app.get('/', function (req, res) {
  var page = fs.readFileSync('index.html');
  res.send(page.toString());
});

app.get('/g1', function (req, res) {
  var page = fs.readFileSync('globaljs_1.html');
  res.send(page.toString());
});

app.get('/g2', function (req, res) {
  var page = fs.readFileSync('globaljs_2.html');
  console.log(page instanceof Buffer);
  res.send(page.toString());
});

app.get(['/c1'], function (req, res) {
  var page = fs.readFileSync('commonjs_1.html');
  res.send(page.toString());
});

app.get('/c2', function (req, res) {
  var page = fs.readFileSync('commonjs_2.html');
  console.log(page instanceof Buffer);
  res.send(page.toString());
});

var server = app.listen(8080, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});