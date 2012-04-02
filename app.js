var flatiron = require('flatiron'),
	connect = require('connect'),
	resourceful = require('resourceful'),
    path = require('path'),
    director = require('director'),
    fs = require('fs'),
    app = flatiron.app;


app.use(flatiron.plugins.http, {
	before: [
		connect.static(__dirname + '/public'),
		//connect.directory(__dirname + '/public'),
		connect.favicon('./public/favicon.ico'),
		connect.bodyParser(),
		connect.cookieParser('lolcats'),
		connect.session(),
		connect.methodOverride()
	],

	after: []
});

var bark = function (color, text) {
  if (!color) color = "";
  if (!text) text = "";
  var json = {};
  var key = (color.length < 1) ? 'dogs' : color + " dogs";
  var secondValue = (text.length < 1) ? '' : " " + text.toString();
  json[key] = 'bark' + secondValue;
  var response = JSON.stringify(json);
  this.res.end(response);
};

var meow = function () {
  this.res.json({ 'cats': 'meow' });
};

var hello = function () {
  this.res.json({ 'hello': 'animal world' });
};

app.router.path('/', function () {
	this.get(function () {
		var self = this;
		fs.readFile('index.html', function(err, data) {
			if(err) {
				self.res.writeHead(404, {'Content-Type': 'text/html'});
				self.res.end("404");
				return;
			}
			self.res.writeHead(200, {'Content-Type': 'text/html'});
			self.res.end(data);
		});
	});
});

app.router.path('/\/animals', function () {
	this.get(hello);
	this.get('/dog/', bark);
	this.get('/dog/:color', bark);
	this.get('/dog/:color/:text', bark);
	this.get('/cat/', meow);

});


app.start(9000);
app.log.info("Started at http://localhost:9000/");
