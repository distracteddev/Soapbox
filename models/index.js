var Resourceful = require('resourceful');

var BlogPost = Resourceful.define('blogpost', function () {
    
	this.use('couchdb', {
		uri: 'couchdb://zeus.iriscouch.com/blogposts/'
	});

	this.string('title');
	this.string('subTitle');
	this.string('body');
	this.array('tags');
	this.timestamps();

});



exports.BlogPost = function() {
	return BlogPost; 
};