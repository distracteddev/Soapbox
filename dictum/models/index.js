// Generated by CoffeeScript 1.3.3
var Comment, Reply, Resourceful, connect, redis, redisConnection, url;

Resourceful = require('resourceful-redis');

url = require('url');

redis = require('redis');

connect = function(redis_url) {
  var database, parsed_auth, parsed_url, password;
  parsed_url = url.parse(redis_url || process.env.REDISTOGO_URL);
  parsed_auth = (parsed_url.auth || '').split(':');
  redis = redis.createClient(parsed_url.port, parsed_url.hostname);
  if (password = parsed_auth[1]) {
    redis.auth(password, function(err) {
      if (err) {
        throw err;
      }
    });
  }
  if (database = parsed_auth[0]) {
    redis.select(database);
    redis.on('connect', function() {
      redis.send_anyways = true;
      redis.select(database);
      redis.send_anyways = false;
    });
  }
  return redis;
};

redisConnection = connect('redis://localhost:6379');

Comment = exports.Comment = Resourceful.define('comment', function() {
  this.use('redis', {
    connection: redisConnection,
    namespace: 'comments'
  });
  this.string('post_id', {
    required: true,
    minLength: 1
  });
  this.string('author', {
    required: true,
    minLength: 1
  });
  this.string('comment', {
    required: true,
    minLength: 1
  });
  this.string('authorEmail', {
    minLength: 1
  });
  this.array('replies');
  this.timestamps();
});

Reply = exports.Reply = Resourceful.define('reply', function() {
  this.use('redis', {
    connection: redisConnection,
    namespace: 'replies'
  });
  this.string('comment_id', {
    required: true,
    minLength: 1
  });
  this.string('author', {
    required: true,
    minLength: 1
  });
  this.string('reply', {
    required: true,
    minLength: 1
  });
  this.string('authorEmail', {
    minLength: 1
  });
  this.timestamps();
});

Comment.prototype.getReplies = function(cb) {
  var self;
  self = this;
  Reply.find({
    comment_id: this._id
  }, function(err, replies) {
    var reply, _i, _len;
    if (err) {
      throw err;
    }
    for (_i = 0, _len = replies.length; _i < _len; _i++) {
      reply = replies[_i];
      reply.ctime = (new Date(reply.ctime)).toLocaleDateString();
    }
    self.replies = replies;
    self.ctime = (new Date(self.ctime)).toLocaleDateString();
    cb();
  });
};
