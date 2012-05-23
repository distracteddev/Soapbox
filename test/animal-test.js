var APIeasy = require('api-easy'),
    assert = require('assert');

var suite = APIeasy.describe('your/awesome/api');

suite.discuss('Testing SoapBox')
    .discuss('Get Requests:')
    .use('localhost', 9000)
    //.setHeader('Content-Type', 'application/json')
    .get('animals')
      .expect(200, { hello: 'animal world' })
    .get('animals/cat/')
      .expect(200, { cats: 'meow' })
    .get('animals/dog/')
      .expect(200, { dogs: 'bark' })
    .get('animals/dog/blue/')
      .expect(200, { "blue dogs": 'bark' })
    .get('animals/dog/green/')
      .expect(200, { "green dogs": 'bark' })
    .export(module);