// require('nodetime').profile({
//     accountKey: '364eb6a1359d9f0a3e866a329e2ba6fab7292cdb', 
//     appName: 'Soapbox'
// });

process.env.SS_DIRECTORY = '/dictum';

var flatiron = require('flatiron'),
    connect = require('connect'),
    path = require('path'),
    director = require('director'),
    http = require('http'),
    fs = require('fs'),
    //qs = require('querystring'),
    passport = require('passport'),
    User = require('./models').User(),
    LocalStrategy = require('passport-local').Strategy,
    render = require('./no_script'),    
    app = flatiron.app;

var routes = require('./routes');
var animalRoutes = require('./routes/animals.js');



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
      // console.log(password);
      // console.log(user.password);
      if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
      return done(null, user);
    });
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


eventMiddleware = function(req, res, next) {
  var initialDir;
  initialDir = req.url.split('/')[1];
  if (initialDir === '_serveDev') {
    req.url = transformURL(req.url);
  }
  if (staticDirs.indexOf(initialDir) >= 0 || !router.route(req.url, req, res)) {
    return next();
  }
};

transformURL = function(url) {
  var i, x, _i;
  i = 0;
  for (x = _i = 0; _i <= 1; x = ++_i) {
    i = url.indexOf('/', i + 1);
  }
  if (url[i] === '/') {
    url = url.replace('?', '&');
    url = url.substr(0, i) + '?' + url.substr(i + 1);
  }
  return url;
};


app.use(flatiron.plugins.http, {
  before: [
    function(req, res) {
    var initialDir;
    initialDir = req.url.split('/')[1];
    if (initialDir === '_serveDev') {
      req.url = transformURL(req.url);
      console.log("TRANSFORMED: ", req.url);
    }
    res.emit('next');
  },
  function(req, res) {
    if (req.headers['user-agent'].indexOf('Google') > -1 || req.query.no_script === 'true') {
      console.log(req.url, req.query, req.headers['user-agent']);
      res.writeHead(200, {'Content-Type' : 'text/html'});
      var parsed_url = req.url.split('?')[0];
      render('http://localhost:' + process.env.PORT + parsed_url, function(html) {
        res.end(html);
      });

    } else {
      res.emit('next');
    }
  },
  connect.static(__dirname + '/public'),
  connect.favicon('./public/favicon.ico'),
  connect.cookieParser('SocketStream'),
  connect.session({
    cookie: {
      path: '/',
      httpOnly: false
    }
  }),
  connect.methodOverride(),
  passport.initialize(),
  passport.session()
  ],

  after: []
});


process.SS_ROUTER = app.router;
ss = require('socketstream'),

ss.client.templateEngine.use(require('ss-hogan'));
ss.client.formatters.add(require('ss-coffee'));
ss.client.formatters.add(require('ss-stylus'));
// ss.client.packAssets();

ss.client.define('main', {
  view: 'index.html',
  css:  [],
  code: ['app']
  // tmpl: '*'
});


app.router.path('/', function () {
  this.get(function () {
    // var self = this;
    // fs.readFile('index.html', function(err, data) {
    //  if(err) {
    //    self.res.writeHead(404, {'Content-Type': 'text/html'});
    //    self.res.end("404");
    //    return;
    //  }
    //  self.res.writeHead(200, {'Content-Type': 'text/html'});
    //  self.res.end(data);
    // });
    var self = this;
    var union = require('union');
    union.RoutingStream.prototype.serveClient.call(self.res, 'main');   
  });

  this.get('/:name', function(name) {
    // var self = this;
    // fs.readFile('public/index.html', function(err, data) {
    //  if(err) {
    //    self.res.writeHead(404, {'Content-Type': 'text/html'});
    //    self.res.end(__dirname + " 404:\n" + JSON.stringify(err));
    //    return;
    //  }
    //  self.res.writeHead(200, {'Content-Type': 'text/html'});
    //  self.res.end(data);
    // });
    var self = this;
    var union = require('union');
    union.RoutingStream.prototype.serveClient.call(self.res, 'main');   
  });

  this.get('blog/:name', function(name) {
    // var self = this;
    // fs.readFile('public/index.html', function(err, data) {
    //  if(err) {
    //    self.res.writeHead(404, {'Content-Type': 'text/html'});
    //    self.res.end(__dirname + " 404:\n" + JSON.stringify(err));
    //    return;
    //  }
    //  self.res.writeHead(200, {'Content-Type': 'text/html'});
    //  self.res.end(data);
    // });
    var self = this;
    var union = require('union');
    union.RoutingStream.prototype.serveClient.call(self.res, 'main');
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

  //this.get('services/tags',routes.getTags);

  this.post('/login',
            function() {
              self = this;
              function next() {
                // console.log('next wrap');
                self.res.emit('next');
              }
              passport.authenticate('local', function(err, user) {
                // console.log(user);
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

app.router.path('/services/comments', function() {
  this.get(function() {
    var self = this;
    var union = require('union');
    union.RoutingStream.prototype.serveClient.call(self.res, 'main');
  });
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


console.log(process.env);
var port = process.env.PORT = process.env.PORT || process.env.app_port || 9000;
app.start(port);
app.log.info("Started at http://localhost:" + port + "/");

ss.start(app.server);

// console.log(app.router)

/// Remote REPL ///
// var net = require("net"),
//     repl = require("repl");

// connections = 0;

// net.createServer(function (socket) {
//   connections += 1;
//   repl.start("soapbox> ", socket, null, true).context.s = s;
// }).listen("/tmp/node-repl-sock");
/// End Remote REPL ///

