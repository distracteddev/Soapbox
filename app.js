var flatiron = require('flatiron'),
	connect = require('connect'),
	resourceful = require('resourceful'),
    path = require('path'),
    director = require('director'),
    fs = require('fs'),
    routes = require('./routes'),
    //qs = require('querystring'),
    app = flatiron.app;


app.use(flatiron.plugins.http, {
	before: [
		//connect.bodyParser(),
		connect.static(__dirname + '/public'),
		//connect.directory(__dirname + '/public'),
		connect.favicon('./public/favicon.ico'),
		//connect.cookieParser('lolcats'),
		//connect.session(),
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

app.router.path('/', function (req, res) {
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

	this.post('jsonTest', function (req, res) {
		console.log("I Started");
		console.log(this.req.body);
		var self = this;
		self.res.end(JSON.stringify(this.req.body));
	});
});


app.router.path('/\/blog/', function() {
	this.get(routes.getBP);
	this.post(routes.postBP);
});

app.router.path('/\/animals', function () {
	this.get(hello);
	this.get('/dog/', bark);
	this.get('/dog/:color', bark);
	this.get('/dog/:color/:text', bark);
	this.get('/cat/', meow);

});


//var port = process_env.C9_PORT;
var port = 9000;
app.start(port);
app.log.info("Started at http://localhost:" + port + "/");
