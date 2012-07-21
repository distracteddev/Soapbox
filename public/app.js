// For reference: https://github.com/wagenet/ember.js/blob/ac66dcb8a1cbe91d736074441f853e0da474ee6e/packages/ember-handlebars/lib/views/bound_property_view.js
var BoundHelperView = Ember.View.extend(Ember.Metamorph, {

  context: null,
  options: null,
  property: null,
  // paths of the property that are also observed
  propertyPaths: [],
  
  value: Ember.K,
  
  valueForRender: function() {
    var value = this.value(Ember.getPath(this.context, this.property), this.options);
    if (this.options.escaped) { value = Handlebars.Utils.escapeExpression(value); }
    return value;
  },

  render: function(buffer) {
    buffer.push(this.valueForRender());
  },

  valueDidChange: function() {
    if (this.morph.isRemoved()) { return; }
    this.morph.html(this.valueForRender());
  },

  didInsertElement: function() {
    this.valueDidChange();
  },

  init: function() {
    this._super();
    Ember.addObserver(this.context, this.property, this, 'valueDidChange');
    this.get('propertyPaths').forEach(function(propName) {
        Ember.addObserver(this.context, this.property + '.' + propName, this, 'valueDidChange');
    }, this);
  },
  
  destroy: function() {
    Ember.removeObserver(this.context, this.property, this, 'valueDidChange');
    this.get('propertyPaths').forEach(function(propName) {
        this.context.removeObserver(this.property + '.' + propName, this, 'valueDidChange');
    }, this);
    this._super();
  }

});

Ember.registerBoundHelper = function(name, func) {
  var propertyPaths = Array.prototype.slice.call(arguments, 2);
  Ember.Handlebars.registerHelper(name, function(property, options) {
    var data = options.data,
        view = data.view,
        ctx  = this;
    
    var bindView = view.createChildView(BoundHelperView, {
      property: property,
      propertyPaths: propertyPaths,
      context: ctx,
      options: options.hash,
      value: func
    });

    view.appendChild(bindView);
  });
};

// END OF BOUND HANDLEBARS HELPER DEFINITION

// START OF PATH REPLACEMENT
	var replacePath = function() {
		var path = window.location.pathname;

		if (path !== "/") {
			console.log("PATH:" + path);
			//newState = window.location.origin 
			//	+  "/#" + (window.location.pathname.slice(1
			// Turns /pathName into pathName
		    var newState = (window.location.pathname.slice(1));
		    //App.routeManager.set('baseURI', window.location.origin);
		    //window.history.pushState(null, null, window.location.origin);
			console.log(newState);
			App.routeManager.set('location', newState);
			//window.location.pathname = "";
			//window.location.hash = newState;

		}		
	};		
// END OF PATH REPLACEMENT

var App = Em.Application.create();

// Custom Ember Data Structure to Store an Array of tags
DS.attr.transforms.array = {
    from: function(serialized) {
      if (typeof serialized !== 'string') {
        return serialized.join(', ');
      } else {
        return serialized;
      }
    },

    to: function(deserialized) {
    	return deserialized.split(', ');
    }
};

// Initialize the Data Store provided by Ember-Data. 
App.store = DS.Store.create({
	revision: 4,
  	// Use the default REST adapter. 
	adapter: DS.RESTAdapter.create({
		bulkCommit: false,
		namespace: 'services'
	})	
});

/*
 *START OF EMBER-DATA MODELS
 */
App.BlogSetting = DS.Model.extend({
	blog_title: DS.attr('string'),
	resource: DS.attr('string'),
	_id: DS.attr('string'),
	_rev: DS.attr('string'),
	ctime: DS.attr('date'),
	mtime: DS.attr('date'),
	primaryKey: "_id",
	blog_sub_title: DS.attr('string'),

	didLoad: function() {
		//console.log("BlogSettings Loaded with id: " + this.get("_id"));	
		//console.log(this);
	}
});

App.BlogPost = DS.Model.extend({	
	title: DS.attr('string'),
	sub_title: DS.attr('string'),
	published: DS.attr('boolean'),
    // body holds the HTML String of the post content
	body: DS.attr('string'),
    // body_raw holds the Raw Markdown of the post content
	body_raw: DS.attr('string'),
	// Custom Data Type gets presented to the front end as a comma seperated string of values
	// e.g "First Tag, Second Tag, Another Tag"
	tags: DS.attr('array'),
	_id: DS.attr('string'),
	_rev: DS.attr('string'),
	ctime: DS.attr('date'),
	mtime: DS.attr('date'),
	primaryKey: "_id",

	tags_array: function() {
		return this.get('tags').split(', ');
	}.property('tags').cacheable(),

	didLoad: function() {
		console.log(this.get('ctime'));
	},

  	didUpdate: function() {
	    console.log(this.get("body") + " was updated");
	    // Refresh the view so that it updates with the latest content
	    // TODO: Refactor this so that Ember native observers work as intended
	    Ember.run.later(function() {
	      App.layout.set('content', '');
	      App.layout.set('content', App.selectedPostView);
	      console.log("later");
	    }, 800);
  	}
});



/*
 *END OF EMBER-DATA MODELS
 */



/*
 *START OF CONTROLLERS
 */
App.HeaderController = Ember.ArrayProxy.create({
	content: []
});

App.PostController = Ember.ArrayController.create({
	content: [],
  selectedPost: function() {
    var ctn = this.get('content');
    return ctn.objectAt(this.get('selectedIndex'));
  }.property('selectedIndex','content.@each'),

  selectedIndex: null,
  hasEdited: false,
  postPreview: null,

  save: function () {
    App.store.commit();
    console.log("Store was committed");
  },

  revert: function() {
    this.get("selectedPost").get("transaction").rollback();
    // Refresh the view so that it updates with the latest content
    // TODO: Refactor this so that Ember native observers work as intended
    App.layout.set('content', '');
    App.layout.set('content', App.selectedPostView);
    //this.objectAt(this.selectedIndex).get("transaction").rollback();
    console.log("Rollback " + this.selectedIndex);
  },

  confirmDelete: function() {
    $("#reveal-delete").show().reveal();
  },

  deleteSelectedPost: function() {
    this.get("selectedPost").deleteRecord();
    App.store.commit();
  },

  selectLatestPost: function() {
    this.set('selectedIndex', 0)
  },

  setSelectedPost: function(title) {    
    var clientId = App.store.find(App.BlogPost, title).clientId;     
    var targetIndex = this.get('content').get('content').indexOf(clientId);
    console.log("clientId: ", clientId, "targetIndex", targetIndex);
    if (targetIndex !== -1 ) {
      this.set('selectedIndex', targetIndex);
    } else {
      this.set('selectedIndex', 0);
    }
  },

  selectPost: function(idx) {
    if (this.get('selectedPost') === null || this.get('selectedPost') === undefined) {
      this.selectLatestPost();
    }
    else {
      this.set('selectedIndex', this.selectedIndex + idx);
    }
  },

  selectPreviousPost: function() {
    this.selectPost(-1);
  },

  selectNextPost: function() {
    this.selectPost(1);
  },

  selectNewPost: function() {
    // Create a new BlogPost record from our Ember-Data store
    var newPost = App.store.createRecord(App.BlogPost,
     { // Default values
       tags: "Enter, a, Comma, Seperated, List, of, Tags",
       title: "Blog Title",
       sub_title: "Enter Witty Sub-Title Here",
       body: "Double Click to Start Editing",
       published: false
    });
    // Set it as the selected post
    var lastIdx = this.get("content").get("length")
    this.set("selectedIndex", lastIdx-1 );
  },

  noPreviousPost: function() {
    return (this.get("selectedIndex") <= 0);
  }.property("selectedIndex", "selectedPost", "content"),

  noNextPost: function() {
    return (this.get("selectedIndex") >= (this.get("length") - 1));
  }.property("selectedIndex", "selectedPost", "content"),

  authorized: function() {
    return Author.getObject().isLoggedIn();
  }.property(),

  nextPostTitle: function() {
    var idx = this.get('selectedIndex');
    idx += 1;
    return this.objectAt(idx).get('title');
  }.property('selectedIndex', 'content.@each'),

  previousPostTitle: function() {
    var idx = this.get('selectedIndex');
    idx -= 1;
    return this.objectAt(idx).get('title');
  }.property('selectedIndex', 'content.@each'),

  nextPostURL: function() {
    var idx = this.get('selectedIndex');
    idx += 1;
    return this.objectAt(idx).get('id');
  }.property('selectedIndex', 'content.@each'),

  previousPostURL: function() {
    var idx = this.get('selectedIndex');
    idx -= 1;
    return this.objectAt(idx).get('id');
  }.property('selectedIndex', 'content.@each'),  

  getPostPreview: function() {
      if (this.get('selectedPost')) {
	    var rawMarkdown = this.get('selectedPost').get('body_raw');
	    var obj = {};
	    obj.md = rawMarkdown;
	    var that = this;
	    $.post('/markdown', obj, function(data) {
	        window.d = data;
	        console.log('getPostPreview fired');
	        //return $(data).children();
	        that.propertyWillChange('postPreview');
	        that.set('postPreview',data);
	        that.propertyDidChange('postPreview');
	        var editedPost = that.get('selectedPost');
	        editedPost.propertyWillChange('body');
	        editedPost.set('body', data);
	        editedPost.propertyDidChange('body');
	    }, 'text');
      }
      return this.get('postPreview');
  }.observes('selectedPost.body_raw')




});


/*
 *END OF CONTROLLERS
 */



/*
 *START OF EMBER-VIEWS
 */
App.layout = Ember.View.create({
  templateName: 'main-layout',
  classNames: ['container']
});

App.portfolioHeaderView = Ember.View.create({
  templateName: 'portfolio-header'
});

App.faceView = Ember.View.create({
  templateName: 'portfolio-content',
  classNames: ['portfolio-content']
});

App.headerView = Em.View.create({
	templateName: "header",
	contentBinding: 'App.HeaderController.content',
	tagsBinding: 'App.TagController.content'
});

App.postView = Em.View.create({
	templateName: "posts",
	contentBinding: "App.PostController.content"
});

App.selectedPostView = Em.View.create({
  templateName: "single-post",
  selectedPostBinding: "App.PostController.selectedPost"
});

App.PostButton = Em.Button.extend({
  classNames: ["small"],
  target: "App.PostController",
  tagName: "a"
});

App.bannerView = Ember.View.create({
  templateName: 'top-banner'
});

/*
 *END OF EMBER-VIEWS
 */

// Fetch the data models from the server and pass them into our
// controllers
App.HeaderController.set('content', App.store.find(App.BlogSetting));
// Load all Blog Posts
var allPosts = App.store.find(App.BlogPost);
// Filter out the unpublished posts and add the remaining objects
// to the PostController's content attribute
var publishedPosts = App.store.filter(App.BlogPost, function(post) {	
	return post.get('published');
});
App.PostController.set('content', publishedPosts);
// CUSTOM FIELD VIEW FOR EMBER TO ALLOW FOR INLINE PAGE EDITING
// This field uses the property 'isEditing' as a signal to its
// associated template to display an input box when double clicked.
App.EditField = Ember.View.extend({
  tagName: 'span',
  templateName: 'edit-field',

  doubleClick: function() {
    if (Author.getObject().isLoggedIn()) {
      this.set('isEditing', true);
      App.PostController.set('hasEdited', true);
      Ember.run.next(function() {
        $("textarea[class*=expand]").TextAreaExpander();
      });
    }
    return false;
  },

  touchEnd: function() {
    // Rudimentary double tap support, could be improved
    var touchTime = new Date();
    if (this._lastTouchTime && touchTime - this._lastTouchTime < 250) {
      this.doubleClick();
      this._lastTouchTime = null;
    } else {
      this._lastTouchTime = touchTime;
    }

    // Prevent zooming
    return false;

  },

  focusOut: function() {
    App.s
    this.set('isEditing', false);
    App.PostController.set('isEditing', true);

  },

  keyUp: function(evt) {
    if (evt.keyCode === 27) {
      this.set('isEditing', false);
    }
  }
});

// Set up a customer handlebars helper that will bind the variable to
// pass in to the our custom EditField view.
//
// Usage: 
// {{ editable <parameter> }}
//
// If you want the text to be replaced by a textarea element rather than
// standard <input></input> element, pass in any value to to textArea
// attribute
// {{ editable blog_post_content textArea="true"}}
Ember.Handlebars.registerHelper('editable', function(path, options) {
  options.hash.valueBinding = path;
  console.log(path);
  if (path === "body") {
    options.hash.rawBinding = path + "_raw";
    console.log(options.hash);
  }
  else if (path == "tags") {
    options.hash.tagsArrayBinding = path + "_array";
  }
  else { console.log(path); }
  return Ember.Handlebars.helpers.view.call(this, App.EditField, options);
});

// Set up a handlebar helper to output raw HTML without escaping it
Ember.Handlebars.registerHelper('raw', function(path) {
  var valueBinding = Ember.getPath(this, path);
  return new Handlebars.SafeString(valueBinding);
});

Ember.registerBoundHelper('preview', function(path) {
  return new Handlebars.SafeString(path);
});


// Returns a nicely formatted and localized date from a javascript Date() object
Ember.Handlebars.registerHelper('date', function(path, options) {
 console.log(path);
 date = options.contexts[0].get(path);
 if (typeof date === "undefined") {date = new Date()}
 dateArray = date.toDateString().split(' ');
 day = date.getDate() + '. ';
 // Gets the name of the month form the locaized date string
 // (A Nice trick to avoid using your own localized date maps)
 month = dateArray.splice(1)[0].split(' ')[0] + ' ';
 year = 1900 + date.getYear();
 return month + day + year;
});

/*
 *START OF EMBER ROUTE MANAGER
 */

var bindLinks = function() {
    // Bind all HashMark Links to 
  Ember.run.next(function() {
    console.log(" BINDING LINKS ")
    $('a').click(function() {
      var el = $(this);
      var target = el.attr('href').replace('#', '');
      if (target.indexOf('/') === 0) target = target.slice(1);
      console.log(target);
      if ((App.routeManager.hasOwnProperty(target) && target.length > 1) || target.indexOf('blog') !== -1) {
        console.log("Found a internal route");
        App.routeManager.set('location', target);
        return false;
      } else {
        console.log("DID NOT FIND a internal route");        
        return true;
      }
    });

    $('.portfolio-back').click(function() {
      App.layout.set('content', '');
      Ember.run.next(function() {
        //App.layout.set('content', App.faceView);
        //$("#content").hide();
        App.routeManager.portfolio.index.enter();
        //$("#content").fadeIn();
      });
      console.log("Going Back");
      return false;
    });

    $('#top-banner a').click(function() {
      $("#top-banner").slideUp();
      return false;
    });

    $('#nav-ctn').hoverIntent(function() {
      // Hover in
      $("#blog-nav").slideDown();
    },
    function() {
      $("#blog-nav").slideUp();
    });

  });
}

var updateNav = function(loc) {
  Ember.run.next(function() {
    $('.sub-nav a').show().removeClass('current');
    var selector = "a[href=#" + loc + "]"
    console.log(selector);
    $(selector).addClass('current');
  });
}

App.routeManager = Ember.RouteManager.create({

  enableLogging: true,
  rootView: App.layout,
  
  home: Em.State.create({
    enter: function(stateManager, transition) {
      this._super(stateManager, transition);
      App.routeManager.set('location', 'portfolio')
    }
  }),

  portfolio: Em.State.create({
    route: 'portfolio',

    index: Em.State.create({
      enter: function(stateManager, transition) {
        this._super(stateManager, transition);
        App.layout.set('banner', App.bannerView);
        App.layout.set('content', App.faceView);
        App.layout.set('header', App.portfolioHeaderView);
        console.log("Entering Portfolio");        
        updateNav('portfolio');
        $('body').removeClass('blog').addClass('portfolio');
        // App.layout.set('content', App.selectedPostView);
        bindLinks();
        bindPortfolioAnimation();
        Ember.run.next(function() {
          $("#switch").hide();
          $("#content").hide();
          setTimeout(function() {
            $("#content").fadeIn();
          }, 200);
        });
      },
    }),

    show: Em.State.create({
      route: ':id',
      enter: function(stateManager, transition) {
        this._super(stateManager, transition);
        var params = stateManager.get('params');
        var postId = params.id;
        console.log(postId);
        $('body').removeClass('blog').addClass('portfolio');
        App.layout.set('header', App.portfolioHeaderView);
        App.layout.set('content', App.faceView);
      }
    })    
  }),

  blog: Em.State.create({
    route: 'blog',
    enter: function(stateManager, transition) {
      this._super(stateManager, transition);
      console.log("Entering Blog");
      $('body').removeClass('portfolio').addClass('blog');
      App.layout.set('banner', '');
      App.layout.set('header', App.headerView);
      App.layout.set('content', App.selectedPostView);
      //bindLinks();  
      //$('body').removeClass('blog').addClass('portfolio');
      //App.layout.set('header', App.portfolioHeaderView);
      updateNav(this.route);
      //App.layout.set('content', App.selectedPostView);
      bindLinks();
      //setTimeout(function() {
        //$("#content").fadeIn();
      //}, 500);
        $('body').hide();
      Ember.run.next(function() {
        $("#switch").hide();
        //$("#content").hide();
        setTimeout(function() {
          bindLinks();
          $('body').fadeIn();
          $('#content').fadeIn();
          //$("#content").fadeIn();
        }, 200);
      });
    }
  }),

  blog_dark: Em.State.create({
    route: 'blog_dark',
    enter: function(stateManager, transition) {
      this._super(stateManager, transition);
      console.log("Entering Blog");
      //$('body').removeClass('portfolio').addClass('blog');
      //App.layout.set('header', App.headerView);
      //App.layout.set('content', App.selectedPostView);
      //bindLinks();  
      $('body').removeClass('blog').addClass('portfolio');
      App.layout.set('banner', '');
      App.layout.set('header', App.portfolioHeaderView);
      updateNav(this.route);
      App.layout.set('content', App.selectedPostView);
      bindLinks();
      Ember.run.next(function() {
        $("#switch").show();
        $("#content").hide();
        setTimeout(function() {
          $("#content").fadeIn();
        }, 200);
      });
    }
  }),



  login: Em.State.create({
    route: 'login',
    index: Em.State.create({
      enter: function(statemanager, transition) {
        this._super(statemanager, transition);
        $("#reveal-Login").reveal();
      }
    })
  }),

  show: Em.State.create({
  	route: 'blog/:id',
    enter: function(stateManager, transition) {
      this._super(stateManager, transition);
      var postID = stateManager.get('params').id           
      console.log("Showing Blog Post: " + postID);
      $('body').removeClass('portfolio').addClass('blog');
      App.layout.set('banner', '');
      App.layout.set('header', App.headerView);
      App.layout.set('content', App.selectedPostView);   
      bindLinks();
        $('body').hide();
      Ember.run.next(function() {
        $("#switch").hide();
        setTimeout(function() {
          App.PostController.setSelectedPost(postID);
          bindLinks();
          $('body').fadeIn();
          $('#content').fadeIn();
        }, 200);
      });
    }
  }),

});
    
/*
 *END OF EMBER ROUTE MANAGER
 */



/*
 *Custom User Object designed to create a protected "authorized" variable
 */
// This model is exposed and as such we cannot trust it's methods
// to remain untampered with. To prevent this, we used the objectHider
// function to define a new Author object with a hidden ExposedAuthor
// within it.
ExposedAuthor = function() {
  // Private variable, in accessible from the browser.
  var authorized = false;

  var loginPrivate = function() {
      $.post("login", $("#login-form").serialize(), function(data) {
        var auth = String(data)
        if (auth === 'true') {
          $("#login-sucess").fadeIn().delay(3000).fadeOut();
          App.PostController.propertyWillChange('authorized');
          authorized = true;
          App.PostController.propertyDidChange('authorized');
          App.PostController.propertyWillChange('content');
          App.PostController.set('content', allPosts);
          App.PostController.propertyDidChange('content');
          $("#reveal-Login").trigger("reveal:close");
        }
        else {
          authorized = false;
          $("#login-fail").fadeIn().delay(3000).fadeOut();
        }
      });
      return false;
  };

  return {
    logIn: loginPrivate,
    isLoggedIn: function() {
      return authorized;
    }
  }
}();

function objectHider(obj)
{
    this.getObject=function(){return obj;}
}
// Call Author.getObject() to get the instance of our hidden
// ExposedAuthor object.
var Author = new objectHider(ExposedAuthor);

// Place all initialization code that requires a loaded within this
// function.
$(function() {
  Ember.run(function() {

    // Start the Route Manager so that it listens for URL changes
    App.routeManager.start();
    // Initialize my layout and append it to the body
    App.layout.append();
    // Bind the reveal:close event so that it replaces the route-managers
    // state with its previous one.
    $('body').bind('reveal:close', function () {
      console.log("reveal was closed");
      App.routeManager.set('location','blog'); 
    });

    $(document).bind('keydown', function(evt) {
      if (evt.ctrlKey && evt.which === 76)
        App.routeManager.set('location', 'login');
    });

    $("#submit-login").click(function() {
      Author.getObject().logIn();
      return false;
    });
    
    Ember.run.next(function() {
      $(".alert-box").delegate("a.close", "click", function(event) {
        event.preventDefault();
        $(this).closest(".alert-box").fadeOut(function(event){
          $(this).remove();
        });
      });

      $("#login").click(function() {
        console.log(" I RAN ");
        App.routeManager.set('location', 'login');
        return false;
      });     
    });

    $('body').bind("soapbox:blog_posts_loaded.soapbox",function() {
      Ember.run.next(function() {
        App.PostController.selectNextPost();
      });
    });
    var hiddenText = $("#ce");
    hiddenText.bind('focusout', function() {
      var text = hiddenText.text();
      console.log(text);
      o = {};
      o.md = text;
      $.post('/markdown', o, function(data) {
        setTimeout(function() {
            window.d = data;
            console.log($(data).children());
            hiddenText.html($(data).children());
        }, 0);
      });
    });

  });

});

function getOffsetToTarget(el) {
  el = $(el);
  //var x = el.position().left + 30;
  var x = el.position().left + el.width()/2;
  //x = 0;
  var y = el.position().top;
  var pos = getTargetPosition();
  // x = 0;
  x = pos.x - x;
  y = pos.y - y;
  // console.log(x, y);
  return {x:x, y:y};
};

function getTargetPosition() {
  // Return the coordinates of the center of the container
  // offset by some vertical distance from the top.
  var x = $("#content").width()/2;
  //x -= 10;
  //x = 0;
  var y = -45;
  if ($('html').hasClass('touch')) {
    y = 0;
  }
  return {x:x, y:y};
};

function bindPortfolioAnimation() {
  Ember.run.next(function() {
    console.log("Bind Portfolio Animations");
    // Face Animation
    var rotations = 1;
    var locked = false;
    $("#face").click(function() {
      var degs;
      degs = (rotations++ % 2 === 0) ? 0 : 360;      
      move(this).rotate(degs).duration('.7s').ease('cubic-bezier(1,1,1,1)').end();
      // move("#face-ctn").scale(0.5).end();
      console.log(rotations, degs);
    });
    $('.rect-link').hoverIntent(function(el) {
      // Hover In
      var deg = 0;
      switch ($(this).attr('id')) {
        case 'featured-project':
          deg = -30;
          break;
        case 'about':
          deg = 20;
          break;
        case 'skills':
          deg = 100;
          break;
        case 'dl-resume':
          deg = -170;
          break;
      }
      
      if (!locked && Modernizr.mq('(min-width: 768px)')) move("#face").rotate(deg).duration('1s').end();
    }, function() {
      // Hover Out
      if (!locked && Modernizr.mq('(min-width: 768px)')) move("#face").rotate(0).end();
    });
    // Link Animations
    $('.rect-link').not("#dl-resume").click(function() {
      
      var targetID = $(this).attr('id') + "-detail";
      $("#" + targetID).show();
      var x = getOffsetToTarget(this).x
      var y = getOffsetToTarget(this).y
      console.log(x, y);
      var x2 = 2000;
      var y2 = 0;
      // Move the Nav Item to the center
      var left = '0%'
      var self = this;
      // $("#face").css('z-index', '-1');
      $("#face-ctn").css('background', 'none');

      if (Modernizr.mq('(min-width: 768px)') && !locked) {
        //move(this).set('left', '-26.5%').to(0,y).duration('1s').set('width', '150%').end(function() {
        //// Placeholder
        //});

        move(this).to(x-15,y).duration(1000).end(function() {
          //move(self).set('left', '-13.25%').to(0,y).duration('1s').set('width', '125%').end();
        });

        $("#nav-ring").children().not(this).add("#face").each(function(i) {          
          if (Math.random() > 0.5) {
            move(this).to(x2, y2).duration((Math.random()+1)*1200).end();
          } else {
            move(this).to(-x2, -y2).duration((Math.random()+1)*1200).end();
          }
        });

        left = '19.5%';
        if (!locked) move("#" + targetID).set('left', left).end();
        locked = true;
      } else if (!locked) {        
        move(this).set('width', '95%').end(function() {
          // move("#nav-ring").set('margin-bottom', '-25%').end();
          $(".rect-link").not(self).each(function(i) {
            var self = this;            
            if (Math.random() > 0.5) {
              move(this).to(x2, y2).duration((Math.random()+1)*1200).end(function() {
                
              });
            } else {
              move(this).to(-x2, -y2).duration((Math.random()+1)*1200).end(function() {

              });
            }
          });
          // $("#nav-ring").height(120);
          // var top_of_detail = $("#" + targetID).position().top;
          // var top_of_link = $(self).position().top;
          // var distance = top_of_detail - top_of_link - 50;
          // console.log("Top of Detail: ", top_of_detail, "Top Of Link: ", top_of_link);
          // move(self).to(0, distance).end();  
          var top_of_detail = $("#" + targetID).position().top;
          var top_of_link = $(self).position().top;
          var distance = top_of_detail - top_of_link - 50;
          console.log("Top of Detail: ", top_of_detail, "Top Of Link: ", top_of_link);
          if (!locked) move("#" + targetID).set('left', left).to(0, -distance).end();
          locked = true
        });
        // Unbind the animations
        // $('.rect-link').unbind('click');
      }

      ;
      // Push the Rest off the screen
      //move('#face-ctn').to(x2, y2).end(function() {
      //});
  
      // Prevent default click action
      // locked = false;
      return false;
    });
  });
}
