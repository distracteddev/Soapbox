var Resourceful = require('resourceful');

var BlogPost = Resourceful.define('blogpost', function () {
    
	this.use('couchdb', {
		uri: 'couchdb://zeus.iriscouch.com/blogposts'
		//uri: 'couchdb://127.0.0.1:5984/blogposts'
	});

	this.string('title');
	this.string('subTitle');
	this.string('body');
	this.array('tags');
	this.timestamps();

	var data = {};
	data.resource = 'blogpost';
	data.options = {};
	data.filter = {
		map: function (post) {
			post.tags.forEach(function (tag) {
				emit(tag, 1);
			});
		},
		reduce: function(keys, values) {
			return sum(values);
			
		}
	};
	this.filter("tagFilter", data);

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
}