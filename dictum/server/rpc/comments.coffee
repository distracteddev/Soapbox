# Server-side Code
Comment = require('../../models').Comment
Reply   = require('../../models').Reply
# Define actions which can be called from the client using ss.rpc('demo.ACTIONNAME', param1, param2...)
exports.actions = (req, res, ss) ->

  # Example of pre-loading sessions into req.session using internal middleware
  req.use('session')

  # Uncomment line below to use the middleware defined in server/middleware/example
  #req.use('example.authenticated')

  addComment: (post_id, author, comment, authorEmail) ->
    newComment = Comment.new
      post_id: post_id
      author: author
      comment: comment
      # Not Required
      authorEmail: authorEmail      
    
    newComment.save (err, saved) ->
      if err is null
        console.log "New Comment Saved Succesfully", saved
        # Push out to subscribers of this post
        saved.ctime = (new Date(saved.ctime)).toLocaleDateString()
        ss.publish.channel post_id, 'newComment', saved
        res(true)
      else
        console.log err        
        res(false)
      return
    return 

  addReply: (post_id, comment_id, author, reply, authorEmail) ->  
    # Build the Reply Object  
    newReply = Reply.new
      comment_id: comment_id        
      author: author
      reply: reply        
      authorEmail: authorEmail
    # Save the Reply Object
    newReply.save (err, saved_reply) ->        
      if err is null
        # console.log "Reply added to Comment Succesfully", saved_reply
        saved_reply.ctime = (new Date(saved_reply.ctime)).toLocaleDateString()
        ss.publish.channel post_id, 'newReply', saved_reply
        res(true)
      else
        console.log "Error Saving a Reply", err
        res(false)
      return      
    return

  allComments: (post_id) ->
    comments = Comment.find post_id: post_id, (err, cmnts) ->
      console.log "ALL COMMENTS: ", cmnts
      req.session.channel.subscribe post_id
      console.log req.session.channel.list()

      waiting = cmnts.length
      # 
      if waiting is 0 then return res('[]')
      done = ->
        waiting--
        # console.log "Done Called", waiting        
        if not waiting
          # console.log "NO MORE WAITING"
          res(JSON.stringify cmnts)              

      comment.getReplies done for comment in cmnts
      
      return
    return

      

