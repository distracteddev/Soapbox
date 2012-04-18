var App = Em.Application.create();

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
		console.log("BlogSettings Loaded with id: " + this.get("_id"));	
		console.log(this);
		App.HeaderController.set('content', App.store.findAll(App.BlogSetting));
	}
});

App.BlogPost = DS.Model.extend({	
	title: DS.attr('string'),
	sub_title: DS.attr('string'),
	body: DS.attr('string'),
	tags: DS.hasMany('string', {embedded: true}),
	_id: DS.attr('string'),
	_rev: DS.attr('string'),
	ctime: DS.attr('date'),
	mtime: DS.attr('date'),
	primaryKey: "_id"
});


App.Tags = DS.Model.extend({

});

App.Settings = App.store.findAll(App.BlogSetting);

App.BlogPosts = App.store.findAll(App.BlogPost);

App.HeaderController = Ember.ArrayProxy.create({
	content: []
});

App.PostController = Ember.ArrayProxy.create({
	content: []
});


App.HeaderView = Em.View.create({
	templateName: "header",
	contentBinding: 'App.HeaderController.content'
});

App.PostView = Em.View.create({
	templateName: "posts",
	contentBinding: "App.PostController.content"
});

App.HeaderView.append();
App.PostView.append();

App.HeaderController.set('content', App.store.findAll(App.BlogSetting));
App.PostController.set('content', App.store.findAll(App.BlogPost));




