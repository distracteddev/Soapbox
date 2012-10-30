// My SocketStream 0.3 app

var http = require('http'),
    ss = require('socketstream');

// SS Console Plugin
var consoleServer = require('ss-console')(ss);
consoleServer.listen(5000);   

// Define a single-page client
ss.client.define('main', {
  view: 'app.html',
  css:  ['libs/reset.css', 'app.styl'],
  code: ['libs/jquery.min.js', 'app'],
  tmpl: '*'
});

// Serve this client on the root URL
ss.http.route('/', function(req, res){
  res.serveClient('main');
});

// Code Formatters
ss.client.formatters.add(require('ss-coffee'));
ss.client.formatters.add(require('ss-stylus'));

// Use server-side compiled Hogan (Mustache) templates. Others engines available
ss.client.templateEngine.use(require('ss-hogan'));

// use redis for session storage and pub/sub
ss.session.store.use('redis');
ss.publish.transport.use('redis');

// Minimize and pack assets if you type: SS_ENV=production node app.js
if (ss.env !== 'development') ss.client.packAssets();

// Start web server
var server = http.Server(ss.http.middleware);
server.listen(3000);

// Start SocketStream
ss.start(server);
