var App = Em.Application.create();

// Custom Ember Data Structure to Store an Array of tags
DS.attr.transforms.array = {
    from: function(serialized) {
        return serialized.join(', ');
    },

    to: function(deserialized) {
    	return deserialized.split(', ');
    }
};

// Initialize the Data Store provided by Ember-Data. 
App.store = DS.Store.create({
	revision: 4,
  // Use the default REST adapter. 
	adapter: DS.RESTAdapter.create({bulkCommit: false})
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

	didLoad: function() {
		console.log(this.get('tags'));
	}
});

App.Tag = DS.Model.extend({
	key: DS.attr('string'),
	value: DS.attr('number'),
	primaryKey: "key",

	didLoad: function() {
		console.log(this.get('key'));		
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
  selectedPost: null,
  selectedIndex: null,

  selectLatestPost: function() {
    this.set('selectedPost', this.get('firstObject'));
    this.set('selectedIndex', 0)
  },

  selectPost: function(idx) {
    if (this.selectedPost === null || this.selectedPost === undefined) {
      this.selectLatestPost();
    }
    else {
      this.set('selectedIndex', this.selectedIndex + idx);
      this.set('selectedPost', this.objectAt(this.selectedIndex));
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
     {
       tags: "Enter a Comma Seperated List of Tags",
       title: "Blog Title",
       sub_title: "Enter Witty Sub-Title Here"
    });
    // Set it as the selected post
    this.set("selectedPost", newPost);
  },

  noPreviousPost: function() {
    return (this.get("selectedIndex") <= 0);
  }.property("selectedIndex", "selectedPost", "content"),

  noNextPost: function() {
    return (this.get("selectedIndex") >= (this.get("length") - 1));
  }.property("selectedIndex", "selctedPost", "content"),

  authorized: function() {
    return Author.getObject().isLoggedIn();
  }.property()

});

App.TagController = Ember.ArrayProxy.create({
	content: []
});
/*
 *END OF CONTROLLERS
 */



/*
 *START OF EMBER-VIEWS
 */
App.layout = Ember.View.create({
  templateName: 'main-layout',
  classNames: ["container"],
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
  classNames: ["small", "radius", "black", "button"],
  target: "App.PostController"
});

/*
 *END OF EMBER-VIEWS
 */

// Fetch the data models from the server and pass them into our
// controllers
App.HeaderController.set('content', App.store.find(App.BlogSetting));
App.PostController.set('content', App.store.find(App.BlogPost));
App.TagController.set('content', App.store.find(App.Tag));
// CUSTOM FIELD VIEW FOR EMBER TO ALLOW FOR INLINE PAGE EDITING
// This field uses the property 'isEditing' as a signal to its
// associated template to display an input box when double clicked.
App.EditField = Ember.View.extend({
  tagName: 'span',
  templateName: 'edit-field',

  doubleClick: function() {
    if (!Author.getObject().isLoggedIn()) {
      this.set('isEditing', true);
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
  if (path === "bindingContext.body")
    options.hash.rawBinding = path + "_raw";
  console.log(options.hash);
  return Ember.Handlebars.helpers.view.call(this, App.EditField, options);
});

/*
 *START OF EMBER ROUTE MANAGER
 */
App.routeManager = Ember.RouteManager.create({
  enableLogging: true,
  rootView: App.layout,
  home: Em.State.create({
    //viewClass: App.postView
  }),
  login: Em.State.create({
    route: 'login',
    //view:  App.layout,
    index: Em.State.create({
      enter: function(statemanager, transition) {
        this._super(statemanager, transition);
        $("#reveal-Login").reveal();
      }
    })
  })
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
          authorized = true;
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
    App.layout.set('header', App.headerView);
    App.layout.set('content', App.selectedPostView);
    App.layout.append();
    // Bind the reveal:close event so that it replaces the route-managers
    // state with its previous one.
    $('body').bind('reveal:close', function () {
      console.log("reveal was closed");
      App.routeManager.set('location',''); 
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
    });
    $('body').bind("soapbox:blog_posts_loaded.soapbox",function() {
      Ember.run.next(function() {
        App.PostController.selectNextPost();
      });
    });
  });

});
