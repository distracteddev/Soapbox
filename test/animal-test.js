var APIeasy = require('api-easy'),
    assert = require('assert');

var suite = APIeasy.describe('your/awesome/api');

suite.discuss('Testing SoapBox')
    .discuss('Get Requests:')
    .use('localhost', 9000)
    //.setHeader('Content-Type', 'application/json')
    .get('/')
      .expect(200, { hello: 'world' })
    .get('/cat/')
      .expect(200, { cats: 'meow' })
    .get('/dog/')
      .expect(200, { dogs: 'bark' })
    .get('/dog/blue/')
      .expect(200, { "blue dogs": 'bark' })
    .get('/dog/green/')
      .expect(200, { "green dogs": 'bark' })
    .export(module);