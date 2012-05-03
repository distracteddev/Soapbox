var Resourceful = require('resourceful');


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
    
	this.use('couchdb', {
		uri: 'couchdb://zeus.iriscouch.com/blogposts'
		//uri: 'couchdb://127.0.0.1:5984/blogposts'
	});

	this.string('title');
	this.string('subTitle');
  // the body property holds the HTML version of the body text
	this.string('body');
  // the body_raw property holds the Raw Markdown version of the body text.
  this.string('body_raw');
	this.array('tags');
	this.timestamps();
	debugger;
	this.filter("tagFilter", options, tagFilter);

});

exports.BlogPost = function() {
	return BlogPost; 
};


var BlogSettings = Resourceful.define('settings', function () {
	this.use('couchdb', {
		uri: 'couchdb://zeus.iriscouch.com/settings'
	});
	
	this.string('blog_itle');
	this.string('blog_sub_title');
	this.timestamps();

});

exports.BlogSettings = function () {
	return BlogSettings;
};
