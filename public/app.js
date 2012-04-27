var App = Em.Application.create();


DS.attr.transforms.array = {
    from: function(serialized) {
        return serialized;
    },

    to: function(deserialized) {
    	return deserialized
    }
};

App.store = DS.Store.create({
	revision: 4,
	adapter: DS.RESTAdapter.create({bulkCommit: false})
});

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
		App.HeaderController.set('content', App.store.findAll(App.BlogSetting));
	}
});

App.BlogPost = DS.Model.extend({	
	title: DS.attr('string'),
	sub_title: DS.attr('string'),
	body: DS.attr('string'),
	tags: DS.attr('array'),
	_id: DS.attr('string'),
	_rev: DS.attr('string'),
	ctime: DS.attr('date'),
	mtime: DS.attr('date'),
	primaryKey: "_id",

	didLoad: function() {
		App.PostController.set('content', App.store.findAll(App.BlogPost));
		//console.log(this.get('tags'));
	}



});


App.Tag = DS.Model.extend({
	key: DS.attr('string'),
	value: DS.attr('number'),
	primaryKey: "key",

	didLoad: function() {
		App.TagController.set('content', App.store.findAll(App.Tag));
		console.log(this);		
	}
});

//fill the cache
// App.Settings = App.store.findAll(App.BlogSetting);
// App.BlogPosts = App.store.findAll(App.BlogPost);
// App.Tags = App.store.findAll(App.Tag);


App.HeaderController = Ember.ArrayProxy.create({
	content: []
});

App.PostController = Ember.ArrayProxy.create({
	content: []
});

App.TagController = Ember.ArrayProxy.create({
	content: []
});


App.HeaderView = Em.View.create({
	templateName: "header",
	contentBinding: 'App.HeaderController.content',
	tagsBinding: 'App.TagController.content'
});

App.PostView = Em.View.create({
	templateName: "posts",
	contentBinding: "App.PostController.content"
});


App.HeaderController.set('content', App.store.findAll(App.BlogSetting));
App.PostController.set('content', App.store.findAll(App.BlogPost));
App.TagController.set('content', App.store.findAll(App.Tag));

// Wrap our dom-affecting calls in a jQuery's ready callback
$(function() {
  App.HeaderView.append();
  App.PostView.append();
});

