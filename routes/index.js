var Resourceful = require('resourceful')
  , BlogPost = require('../models').BlogPost();


exports.getBP = function(req, res) {
	var BlogPosts = BlogPost.all(function(err, docs) {
		if (err) throw err;
		res.end(JSON.stringify(docs));
		
	});
	console.log(BlogPost);
};

exports.postBP = function (req, res) {
	console.log(req.body);
	console.log(BlogPost);
	BlogPost.create(req.body, function (err, document) {
		if (err) { 
			console.log(err);
			throw new(Error)(err);
		 }

		console.log(req.body);
		console.log(document);
		document.save(function() {
			if (!err) {
				res.end('Saved');				
			}
			else {				
				throw err;
			}
		});		
	});
};