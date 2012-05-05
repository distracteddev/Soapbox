var flatiron = require('flatiron'),
	connect = require('connect'),
	resourceful = require('resourceful'),
    path = require('path'),
    director = require('director'),
    fs = require('fs'),
    //qs = require('querystring'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;
    app = flatiron.app;

var routes = require('./routes');

var users = [
    { id: 1, username: 'bob', password: 'secret', email: 'bob@example.com' }
  , { id: 2, username: 'joe', password: 'birthday', email: 'joe@example.com' }
];

function findById(id, fn) {
  var idx = id - 1;
  if (users[idx]) {
    fn(null, users[idx]);
  } else {
    fn(new Error('User ' + id + ' does not exist'));
  }
}

function findByUsername(username, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.username === username) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}

passport.use(new LocalStrategy(
  function(username, password, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // Find the user by username.  If there is no user with the given
      // username, or the password is not correct, set the user to `false` to
      // indicate failure and set a flash message.  Otherwise, return the
      // authenticated `user`.
      findByUsername(username, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unkown user ' + username }); }
        if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
        return done(null, user);
      })
    });
  }
));


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  findById(id, function (err, user) {
    done(err, user);
  });
});

app.use(flatiron.plugins.http, {
	before: [
		//connect.bodyParser(),
		connect.favicon('./public/favicon.ico'),
		connect.cookieParser('lolcats'),
		connect.session({secret: "9ajk21mas8"}),
		connect.static(__dirname + '/public'),
		connect.methodOverride(),
		passport.initialize(),
		passport.session()
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

	this.post('jsonTest', function () {
		console.log(this.req.body);
		var self = this;
    //self.res.end(JSON.stringify(this.req.isAuthenticated()) + '\n');
		self.res.end(JSON.stringify(self.req.body) + '\n');
	});

	this.get('/tags',routes.getTags);

	this.post('/login',
		function() {
			self = this;
			function next() {
				console.log('next wrap');
				self.res.emit('next');
			}
			passport.authenticate('local', function(err, user) {
				console.log(user);
				if (err) { self.res.end("SERVER ERROR\n") }
		        if (!user) { self.res.end("false") }
		        else {
		        	self.req.logIn(user, function(err) {
		        		if (err) {throw err}
		                self.res.writeHead(200, {'Content-Type': 'text/html',
		            		'Authentication': JSON.stringify(self.req._passport.session)});
		        		self.res.end("true");
		        	});
		        	
		        }
			})(this.req, this.res, next);
		}
	);
	
});

app.router.path('/\/markdown', function() {
	this.post(routes.parseMarkdown);
});


app.router.path('/\/blog_posts/', function() {
	this.get(routes.getBP);
	this.post(routes.postBP);
});

app.router.path('/\/blog_posts/:id', function() {
	this.get(routes.getBP);
	this.post(routes.postBP);
	this.put(routes.postBP);
});

app.router.path('/\/blog_settings', function() {
	this.get(routes.getSettings);
	this.post(routes.postSettings);
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
