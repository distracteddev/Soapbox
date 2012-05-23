var APIeasy = require('api-easy'),
    assert = require('assert');

var suite = APIeasy.describe('login');

suite.discuss('Testing SoapBox Login Functions')
    .discuss('Get Requests:')
    .use('localhost', 9000)
    .setHeader('Content-Type', 'application/json')
    .post('login')
      .expect('No Credentials Submitted', 200, function(ctx, args) {        
        assert.equal(args.body, 'false');
      })
    .post('login', {username:'bob', password:'secret'})
      .expect('Wrong Credentials Submitted', 200, function(ctx, args) {        
        assert.equal(args.body, 'false');
      })
    .post('login', {username:'zeus', password:'zeuszeus'})
      .expect('Correct Credentials Submitted', 200, function(ctx, args) {        
        assert.equal(args.body, 'true');
      })      
    .export(module);