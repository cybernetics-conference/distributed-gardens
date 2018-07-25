var http = require('http');
var express = require('express');
var app = express();
var fs = require('fs');

(function() {

  var webpack = require('webpack');
  var webpackConfig = require('./webpack.config');
  var compiler = webpack(webpackConfig);

  var webpackDevMiddleware = require('webpack-dev-middleware');
  var webpackHotMiddleware = require('webpack-hot-middleware');

  app.use(webpackDevMiddleware(compiler, {
    noInfo: true,
    publicPath: webpackConfig.output.publicPath,
  }));

  app.use(webpackHotMiddleware(compiler, {
    log: console.log, path: '/__webpack_hmr', heartbeat: 10 * 1000
  }));

  app.use(express.static('assets'));

})();

////////////////////////////////
///////// ROUTES HERE //////////
////////////////////////////////

app.get('/garden', function(req, res){
    res.sendFile(__dirname + '/garden/index.html');
});


app.get('/rhizome', function(req, res){
    res.sendFile(__dirname + '/rhizome/index.html');
});


///////// express server a
var server = http.createServer(app);

server.listen(process.env.PORT || 8081, function() {
	console.log("Listening on %j", server.address());
});


