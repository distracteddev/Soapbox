var Resourceful = require('resourceful');

var Document = Resourceful.define('doucument', function () {
    
	this.use('couchdb', {database: 'nodepad'});

	this.string('title');
	this.string('data');
	this.array('tags');
	this.timestamps();

});



exports.Document = function() {
	return Document; 
};