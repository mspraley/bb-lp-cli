var _ = require('lodash');

module.exports = {
	url: 'preferences',
	schema: 'marked#/backbase/preferences',
	dependencies: {
		readme: './README.md',
		model: './model.xml'
	},
	defaultPreferences: [
		'Description', 'TemplateName', 'area', 'icon', 'locale', 'order',
		'src', 'thumbnailUrl', 'title', 'version', 'widgetChrome'
	],

	/**
	 * @private
	 */
	render: function(item){
		return '**' + item.name + '**' + (item.label ? ': ' + item.label : '');
	},

	/**
	 * @returns {Array} with not found in readme models
	 */
	difference: function(files){
		var actualModels = this.model(files);
		var readmeModels = this.parse(files);

		return _.filter(actualModels, function(model){
			return !~readmeModels.indexOf(model.name);
		});
	},

	/**
	 * get a clean model
	 */
	model: function(files){
		var defaultPreferences = this.defaultPreferences;

		return _.chain(_.property('catalog.widget.properties.property')(files.modelPost))
			.filter(function(property){
				return defaultPreferences.indexOf(property.name) === -1;
			})
			.value();
	},

	/**
	 * parse from view/readme file
	 */
	parse: function(files){
		var list = files.readmePost.findParagraphList(this.schema, true);

		return _.chain(list)
			.map(function(text){
				return text.replace(/\*\*([\w-]+)\*?\*?.*/, '$1');
			})
			.compact()
			.value();
	},

	// append new items to paragraph
	update: function(files){
		var paragraph = files.readmePost.find(this.schema);

		files.readmePost.replace(
			[paragraph],
			[paragraph].concat(files.readmePost.createList(_.map(
				this.difference(files),
				this.render
			)))
		);
	}
};