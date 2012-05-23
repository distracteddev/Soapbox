exports.bark = function (color, text, unused) {
  if (!color) color = "";
  if (!text) text = "";

  if (arguments.length < 3) {
  	text = null;
  }
  else if (arguments.length < 2) {
  	color = null;
  	text = null;
  }

  console.log(arguments);
  var json = {};
  var key = (typeof color !== 'string') ? 'dogs' : color + " dogs";
  var secondValue = (!text) ? '' : " " + text.toString();
  json[key] = 'bark' + secondValue;
  var response = JSON.stringify(json);
  this.res.end(response);
};

exports.meow = function () {
  this.res.json({ 'cats': 'meow' });
};

exports.hello = function () {
  this.res.json({ 'hello': 'animal world' });
};