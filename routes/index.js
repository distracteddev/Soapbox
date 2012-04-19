var Resourceful = require('resourceful'),
	winston = require('winston'),
	BlogSettings = require('../models').BlogSettings(),
	BlogPost = require('../models').BlogPost();

winston.cli();

var throwError = function (err) {
	if (err) {
		winston.error(err);
		throw err;
	}
};

exports.getBP = function(id) {
	var self = this;
	if (arguments.length < 2) {
		BlogPost.all(function(err, posts) {
			if (err) throw err;
			self.res.end('{"blog_posts":' + JSON.stringify(posts) + "}");
			winston.debug(posts);
			return posts;
		});
	}
	else {
		console.log('ID: ' + id);
		BlogPost.find({_id:id}, function(err, post) {
			if (err) throw err;
			self.res.end('{"blog_posts":' + JSON.stringify(post) + "}");
			winston.debug(post);
			return post;
		});
	}
};

exports.postBP = function () {
	console.log(this.req.body);
	var self = this;
	if (!id) {
		BlogPost.create(this.req.body, function (err, doc) {
			if (err) { 
				winston.log(err);
				throw new(Error)(err);
			}

			console.log(doc);
			doc.save(function() {
				if (!err) {
					winston.log('Saved');
					self.res.end('Saved');				
				}
				else {				
					throw err;
				}
			});		
		});
	}
	else {
		BlogPost.get(id, function (err, post) {
			post.update(self.req.body, function() {
				if (err) throw err;
				this.res.end('Post Updated\n');
			});
		});
	}
	
};



exports.getTags = function () {
	var self = this;
	BlogPost.tagFilter(function(err, tags) {
		if (err) throw err;
		console.log(tags);
		self.res.end('{"tags":' + JSON.stringify(tags) + "}");
	});
};

exports.getSettings = function () {
	var self = this;
	var settings = BlogSettings.all(function (err, settings) {
		if (err) throw err;
		// Check if the function has been called
		// as a response handler.
		if (self !== undefined) {
		self.res.end('{"blog_settings": ' + JSON.stringify(settings) + " }");
		}
		winston.debug(settings);
		return settings;
	});
	return settings;
};


exports.postSettings = function () {
	var self = this;
	console.log(self.req.body);
	// If there are no settings, create them.
	BlogSettings.all(function (err, settings) {
		winston.debug(JSON.stringify(settings));
		if (settings === undefined) {
			BlogSettings.create(self.req.body, function (err, settings) {
				if (err) { 
					winston.error(err);
					throw new(Error)(err);
				}
				self.res.end(JSON.stringify(settings));
				winston.debug(settings);
			});
		}
		// If there are settings, update them.
		else {
			settings[0].update(self.req.body, function (err) {
				if (err) { 
					winston.error(err);
					throw err;				
				}
				self.res.end("Settings Updated\n");
			});
		}
	});
	
};

