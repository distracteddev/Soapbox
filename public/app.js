var App = Em.Application.create();

App.store = DS.Store.create({
	revision: 4,
	adapter: DS.RESTAdapter.create({bulkCommit: false})
});

App.BlogSetting = DS.Model.extend({
	title: DS.attr('string'),
	subTitle: DS.attr('string')
});

App.BlogPost = DS.Model.extend({
	title: DS.attr('string'),
	subTitle: DS.attr('string'),
	body: DS.attr('string'),
	tags: DS.hasMany('string', {embedded: true})
});

App.Settings = App.store.findAll(App.BlogSetting);

App.HeaderController = Ember.Object.create({
	content: App.Settings
})


App.HeaderView = Em.View.extend({
	templateName: 'header',

	titleBinding: 'App.HeaderController.content.title',
	subTitleBinding: 'App.HeaderController.content.subTitle'

});
