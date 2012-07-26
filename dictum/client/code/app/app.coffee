### QUICK CHAT DEMO ####

# Delete this file once you've seen how the demo works

# Listen out for newMessage events coming from the server
ss.event.on 'newMessage', (message) ->

  # Example of using the Hogan Template in client/templates/chat/message.jade to generate HTML for each message
  html = ss.tmpl['chat-message'].render({message: message, time: -> timestamp() })

  # Append it to the #chatlog div and show effect
  $(html).hide().appendTo('#comments').slideDown()


ss.event.on 'newComment', (comment) ->
  console.log "Recieved", comment
  html = ss.tmpl['comments-new'].render({comment: comment})

  # Append it to the #chatlog div and show effect
  $(html).hide().appendTo('#comments').slideDown()


ss.event.on 'newReply', (reply) ->
  console.log "Recieved", reply
  exports.getAll()

# Show the chat form and bind to the submit action
exports.bindSubmit = () ->
  $('#commentForm').submit ->

    # Grab the message from the text box
    text = $('#myMessage').val()
    author = $("input[name=author]").val()
    authorEmail = $("input[name=author-email]").val()
    # Call the 'send' funtion (below) to ensure it's valid before sending to the server
    exports.send author, authorEmail, text, (success) ->
      if success
        $('#myMessage').val('') # clear text box
        $("input[name=author]").val('')
        $("input[name=author-email]").val('')        
      else
        alert('Oops! Unable to send message')

    return false


exports.getAll = () ->
  post_id = App.CommentsController.get('selectedComments');
  console.log("POST_ID: ", post_id)
  ss.rpc 'comments.allComments', post_id, (comments) -> 
    
    comments = JSON.parse comments
    console.log "Recieved", comments

    html = ss.tmpl['comments-new'].render({comments: comments})

    # Append it to the #chatlog div and show effect
    #$(html).hide().appendTo('#chatlog').slideDown()
    $("#comments").html($(html).hide().delay(100).slideDown())


# Demonstrates sharing code between modules by exporting function
exports.send = (author, authorEmail, text, cb) ->
  post_id = App.CommentsController.get('selectedComments');
  if valid(text) and valid(post_id) and valid(author) and valid(authorEmail)
    ss.rpc('comments.addComment', post_id, author, text, authorEmail, cb);
  else
    cb(false)


# Private functions

timestamp = ->
  d = new Date()
  d.getHours() + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds())

pad2 = (number) ->
  (if number < 10 then '0' else '') + number

valid = (text) ->
  text && text.length > 0