var REDIS_URL = process.env.REDISTOGO_URL || 'redis://nodejitsu:04bb058fdb87894ab8d710a44e1d2d2f@drum.redistogo.com:9157/';

var Resourceful = require('resourceful-redis')
  , url = require('url');
// A function helper to connect to redis using Heroku's redis url
var connect = function(redis_url) {
  var password, database;
  var parsed_url  = url.parse(redis_url || process.env.REDISTOGO_URL || REDIS_URL || 'redis://localhost:6379');
  var parsed_auth = (parsed_url.auth || '').split(':');

  var redis = require('redis').createClient(parsed_url.port, parsed_url.hostname);

  if (password = parsed_auth[1]) {
    redis.auth(password, function(err) {
      if (err) throw err;
    });
  }
  // Select the right database
  if (database = parsed_auth[0]) {
    redis.select(database);
    redis.on('connect', function() {
      redis.send_anyways = true
      redis.select(database);
      redis.send_anyways = false;
    });
  }

  return(redis);
};

// Get a new redis connection
var redisConnection = exports.redisConnection =  connect(REDIS_URL);

var tagFilter = {
	map: function (post) {
		post.tags.forEach(function (tag) {
			emit(tag, 1);
		});
	},
	reduce: function(keys, values) {
		return sum(values);	
	}
};

var options = {
	"group": "true"
};


var BlogPost = Resourceful.define('blogpost', function () {

	this.use('redis', {
    connection: redisConnection,
    namespace: 'blogposts'
	});

	this.string('title');
	this.string('subTitle');
	this.bool('published');
    // the body property holds the HTML version of the body text
	this.string('body');
    // the body_raw property holds the Raw Markdown version of the body text.
    this.string('body_raw');
	this.array('tags');
	this.timestamps();
	debugger;
	//this.filter("tagFilter", options, tagFilter);

});

exports.BlogPost = function() {
	return BlogPost;
};


var BlogSettings = Resourceful.define('settings', function () {
	this.use('redis', {
    connection: redisConnection,
    namespace: 'settings'
	});
	
	this.string('blog_itle');
	this.string('blog_sub_title');
	this.timestamps();

});

exports.BlogSettings = function () {
	return BlogSettings;
};

var User = Resourceful.define('users', function() {
	this.use('memory');
	this.string('username');
	this.string('password');
	this.object('settings');
	this.string('email');
	this.timestamps();
});

exports.User = function() {
	return User;
}
