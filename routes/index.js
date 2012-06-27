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
});
console.log(marked("i am using __markdown__"));


// Parses a Markdown string into HTML
var MarkdownToHTML = function(s) {
  var html = marked(s);
  html = html.replace(/&#39;/g, "'");
  html = highlighter(html, false, true);
  html = html.replace('<code>\n','<pre><code>').replace('</code>','</code></pre>');
  return html;
}

exports.parseMarkdown = function() {
  var self = this;
  var markdown = MarkdownToHTML(self.req.body.md)
  if (self.res) self.res.end(markdown);
};

// Get all blog posts, or a single blog post when an ID is provided.
exports.getBP = function(id) {
	// Return all posts
	var self = this;
	if (arguments.length < 2) {
		BlogPost.all(function(err, posts) {
			if (err) {
				winston.error(JSON.stringify(err));
				throw new Error(err);
			}
			// Sort the returned array of posts by their creation
			// time
      		posts.sort(function(a, b) {
        		return b.ctime-a.ctime;
    	    });			
			if (self.res) self.res.end('{"blog_posts":' + JSON.stringify(posts) + "}");
			return posts;
		});
	}
	// Return a single post with a specific ID
	else {
		console.log('ID: ' + id);
		BlogPost.find({_id:id}, function(err, post) {
			if (err) throw err;
			if (Array.isArray(post) && post.length > 0) {
				if (self.res) self.res.end('{"blog_posts":' + JSON.stringify(post) + "}");
				winston.debug(post);
				return post;
			}
			else {
				winston.debug("The following blog_post id was not found: " + id);
				self.res.writeHead(204);
			}
		});
	}
};

// Function to serialize a blog post's title into a URL friendly id.
var titleToId = function(title) { 
	if (typeof title !== 'string') {
		throw new Error('titleToId requires a string as its first and only parameter');
	}
	return title.toLowerCase().split(" ").join("-");
}

exports.postBP = function (id) {
	var self = this;

  // Parse the raw markdown body of the Blog Post and save the HTML
  // result
  if (self.req.body.blog_post.body_raw.length > 0) {
    //self.req.body.blog_post.body = highlighter(marked(this.req.body.blog_post.body_raw), false, true);
    self.req.body.blog_post.body = highlighter(marked(this.req.body.blog_post.body_raw).replace(/&#39;/g, "'"), false, true);
    console.log(self.req.body.blog_post.body);
    self.req.body.blog_post.body = self.req.body.blog_post.body.replace('<code>\n','<pre><code>').replace('</code>','</code></pre>');
    console.log(self.req.body.blog_post.body);
  }
  	// if no id is passed as a URL param, then we create a new blog_post and persist it.
	if (typeof id !== "string") {
		// Set the _id of the blog_post
		self.req.body.blog_post._id = titleToId(self.req.body.blog_post.title)
		console.log(self.req.body.blog_post._id);
		BlogPost.create(self.req.body.blog_post, function (err, doc) {
			if (err) { 
				winston.error(JSON.stringify(err));
				throw new(Error)(err);
			}

			doc.save(function() {
				if (!err) {
					winston.log('Saved');
					if (self.res) self.res.end('Saved');				
				}
				else {				
					throw err;
				}
			});		
		});
	}
	else {
	// If an id is passed as a URL param, then we need to update that particular post
		BlogPost.get(id, function (err, post) {
			if (err) throw err;
			if (post) {
				// Set the _id of the blog_post incase it has changed
				self.req.body.blog_post._id = titleToId(self.req.body.blog_post.title)
				post.update(self.req.body.blog_post, function(err, post) {
					if (err) throw err;
					if (self.res) self.res.end('{"blog_post":' + JSON.stringify(post) + "}");
				});
			}
			else {
				self.res.writeHead(404);
			}
		});
	}
	
};

exports.deleteBP = function(id) {
  var self = this;

  if (typeof id === "string") {
    BlogPost.destroy(id, function (err, post) {
      if (err) throw err;
				if (self.res) self.res.end('Deleted');
    });
  }
};

exports.getTags = function () {
	var self = this;
	BlogPost.tagFilter(function(err, tags) {
		if (err) throw err;
		// console.log(tags);
		if (self.res) self.res.end('{"tags":' + JSON.stringify(tags) + "}");
	});
};

exports.getSettings = function () {
	var self = this;
	var settings = BlogSettings.all(function (err, settings) {
		if (err) {
			winston.error(JSON.stringify(err));
			throw err;
		}
		// Check if the function has been called
		// as a response handler.
		if (self !== undefined) {
		if (self.res) self.res.end('{"blog_settings": ' + JSON.stringify(settings) + " }");
		}
		// winston.debug(settings);
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
				if (self.res) self.res.end(JSON.stringify(settings));
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
				if (self.res) self.res.end("Settings Updated\n");
			});
		}
	});
	
};

