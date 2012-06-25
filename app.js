var flatiron = require('flatiron'),
	connect = require('connect'),
	resourceful = require('resourceful'),
    path = require('path'),
    director = require('director'),
    fs = require('fs'),
    //qs = require('querystring'),
    passport = require('passport'),
    User = require('./models').User();
    LocalStrategy = require('passport-local').Strategy;
    app = flatiron.app;

var routes = require('./routes');
var animalRoutes = require('./routes/animals.js')

u = User.new(
	{
		"username": "zeus",
		"password": "zeus",
		"email": "lalkaka.zeus@gmail.com"
	}
);

u.save();

function findByUsername(username, done) {
  User.find({"username":username}, function(err, user) {
  	if (err) {
  		return done(err, null);
  	}
  	else if (user) {
  		return done(null, user[0]);
  	}
  	else {
  		return done(null, null);
  	}
  });
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
        debugger;
        console.log(password);
        console.log(user.password);
        if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
        return done(null, user);
      })
    });
  }
));


passport.serializeUser(function(user, done) {
  done(null, user.username);
});

passport.deserializeUser(function(username, done) {
  findByUsername(username, function (err, user) {
    done(err, user);
  });
});

app.use(flatiron.plugins.http, {
	before: [
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

	this.get('/:name', function(name) {
		var self = this;
		fs.readFile('public/index.html', function(err, data) {
			if(err) {
				self.res.writeHead(404, {'Content-Type': 'text/html'});
				self.res.end(__dirname + " 404:\n" + JSON.stringify(err));
				return;
			}
			self.res.writeHead(200, {'Content-Type': 'text/html'});
			self.res.end(data);
		});
	});

	this.get('blog/:name', function(name) {
		var self = this;
		fs.readFile('public/index.html', function(err, data) {
			if(err) {
				self.res.writeHead(404, {'Content-Type': 'text/html'});
				self.res.end(__dirname + " 404:\n" + JSON.stringify(err));
				return;
			}
			self.res.writeHead(200, {'Content-Type': 'text/html'});
			self.res.end(data);
		});
	});

	this.get('portfolio/:name', function(name) {
		var self = this;
		fs.readFile('public/index.html', function(err, data) {
			if(err) {
				self.res.writeHead(404, {'Content-Type': 'text/html'});
				self.res.end(__dirname + " 404:\n" + JSON.stringify(err));
				return;
			}
			self.res.writeHead(200, {'Content-Type': 'text/html'});
			self.res.end(data);
		});
	});		

	this.get('/services/jsonTest', function () {
		console.log(this.req.body);
		var self = this;  
		self.res.end(JSON.stringify(Object.keys(self.req)) + '\n');
	});

	this.get('services/tags',routes.getTags);

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


app.router.path('/services/blog_posts/', function() {
	this.get(routes.getBP);
	this.post(routes.postBP);
});

app.router.path('/services/blog_posts/:id', function() {
	this.get(routes.getBP);
	this.post(routes.postBP);
	this.put(routes.postBP);
  this.delete(routes.deleteBP);
});

app.router.path('/services/blog_settings', function() {
	this.get(routes.getSettings);
	this.post(routes.postSettings);
});

app.router.path('/\/animals', function () {
	this.get(animalRoutes.hello);
	this.get('/dog/', animalRoutes.bark);
	this.get('/dog/:color', animalRoutes.bark);
	this.get('/dog/:color/:text', animalRoutes.bark);
	this.get('/cat/', animalRoutes.meow);

});


var port = process.env.PORT || 9000;
app.start(port);
app.log.info("Started at http://localhost:" + port + "/");
