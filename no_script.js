var util = require('util'),
    exec = require('child_process').exec,
    child;



module.exports = function(url, cb) {
	child = exec('phantomjs undead.js ' + url,
	  function (error, stdout, stderr) {
	    if (error !== null) {
	      console.log('exec error: ' + error);
	    } else {
	    	cb(stdout);
	    }
	});
};

