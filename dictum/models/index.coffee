Resourceful = require('resourceful-redis') 
url = require('url')
redis = require('redis')

# Helper function that parses a connection URL and returns a redis connection
connect = (redis_url) -> 
	parsed_url = url.parse redis_url or process.env.REDISTOGO_URL
	parsed_auth = (parsed_url.auth or '' ).split ':'
	redis = redis.createClient parsed_url.port, parsed_url.hostname

	if password = parsed_auth[1]
		redis.auth password, (err) ->
			throw err if err

	if database = parsed_auth[0]
		redis.select database
		redis.on 'connect', -> 
			redis.send_anyways = true
			redis.select database
			redis.send_anyways = false
			return

	return redis

# Get a redis connection
redisConnection = connect 'redis://localhost:6379'

# Define our comment model
Comment = exports.Comment = Resourceful.define 'comment', ->
	# Use a Redis Backend for this Model
	@.use 'redis',
		connection: redisConnection
		namespace: 'comments'
    
    # The id of the blog_post that this comment is in response to.
	@.string 'post_id', required: true, minLength: 1
	
	# Could be a nickname, a real name or a twitter handle
	@.string 'author', required: true, minLength: 1
	@.string 'comment', required: true, minLength: 1
	@.string 'authorEmail', minLength: 1
	@.array 'replies'

	@.timestamps()

	return

Reply = exports.Reply = Resourceful.define 'reply', ->
	# Use a Redis Backend for this Model
	@.use 'redis',
		connection: redisConnection
		namespace: 'replies'
    
    # The id of the blog_post that this comment is in response to.
	@.string 'comment_id', required: true, minLength: 1
	
	# Could be a nickname, a real name or a twitter handle
	@.string 'author', required: true, minLength: 1
	@.string 'reply', required: true, minLength: 1
	@.string 'authorEmail', minLength: 1
	
	@.timestamps()

	return

Comment.prototype.getReplies = (cb) ->
	# Self hold the comment object
	self = this
	# Find the replies tied to this comment
	Reply.find comment_id: @._id, (err, replies) ->
		if err then throw err
		# Append them to our Comment object stored in self		
		reply.ctime = (new Date(reply.ctime)).toLocaleDateString() for reply in replies
		self.replies = replies
		self.ctime = (new Date(self.ctime)).toLocaleDateString()
		cb()
		return
	return



