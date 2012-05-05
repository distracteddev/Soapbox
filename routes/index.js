var Resourceful = require('resourceful'),
	winston = require('winston'),
  marked = require('marked'),
  highlighter = require('highlight').Highlight,
	BlogSettings = require('../models').BlogSettings(),
	BlogPost = require('../models').BlogPost();

// Complete set-up for modules
winston.cli();
marked.setOptions({
  gfm: true,
  pedantic: false,
  sanitize: false,
  // callback for code highlighter
  highlight: function(code, lang) {
    debugger;
    console.log("HIGHLIGHTER CALLBACK RAN");
    code = highlighter(code);
    return code;
  }
});
console.log(marked("i am using __markdown__"));

exports.parseMarkdown = function() {
  var self = this;
  self.res.end(marked(self.req.body.md));
};

// Get all blog posts, or a single blog post when an ID is provided.
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

exports.postBP = function (id) {
	console.log(this.req.body.blog_post);
	var self = this;

  // Parse the raw markdown body of the Blog Post and save the HTML
  // result
  if (self.req.body.blog_post.body_raw.length > 0) {
    self.req.body.blog_post.body = highlighter(marked(this.req.body.blog_post.body_raw), false, true);
    console.log(self.req.body.blog_post.body);
    self.req.body.blog_post.body = self.req.body.blog_post.body.replace('<code>','<pre><code>').replace('</code>','</code></pre>');
    console.log(self.req.body.blog_post.body);
  }
	if (typeof id !== "string") {
		BlogPost.create(self.req.body.blog_post, function (err, doc) {
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
			post.update(self.req.body.blog_post, function() {
				if (err) throw err;
				self.res.end('Post Updated\n');
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

