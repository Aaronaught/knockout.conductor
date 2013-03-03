if (!String.prototype.endsWith) {
	String.prototype.endsWith = function(suffix) {
		return this.indexOf(suffix, this.length - suffix.length) !== -1;
	};
};

ko.conductor = {
	areas: {},
	nameKey: '@koConductorViewModelName',
	activate: function(areaName, viewModel, templateName) {
		if (!(areaName in ko.conductor.areas)) {
			throw 'Area "' + areaName + '" does not exist.';
		}
		var area = ko.conductor.areas[areaName];
		if (!templateName) {
			templateName = ko.conductor.findTemplate(viewModel);
		}
		ko.applyBindingsToNode(area.element, { template: { name: templateName, data: viewModel } });
		area.activeView = templateName;
		area.activeViewModel = areaName;
	},
	findTemplate: function(viewModel) {
		if (!viewModel) {
			return null;
		}
		if (!(ko.conductor.nameKey in viewModel)) {
			throw 'Cannot resolve template for view model: Name has not been assigned.';
		}
		var viewModelName = viewModel[ko.conductor.nameKey];
		var lc = viewModelName.toLowerCase();
		if (lc.endsWith('viewmodel')) {
			return viewModelName.substring(0, viewModelName.length - 5);
		}
		var templateName = viewModelName + 'View';
		if (!window[templateName]) {
			throw 'Cannot resolve template for view model: No template named "' + 
				templateName + '" exists in the current window.';
		}
		return templateName;
	},
	name: function(viewModel, name) {
		viewModel[ko.conductor.nameKey] = name;
	}
};

ko.bindingHandlers['activate'] = {
	init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
	},
	update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
	}
};

ko.bindingHandlers['area'] = {
	init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
		var value = ko.utils.unwrapObservable(valueAccessor());
		while (typeof value === 'function') {
			value = value(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
		}
		var areaName = (typeof value === 'string') ? 
			{ name: value } : ko.utils.unwrapObservable(value.name);
		if (!areaName) {
			throw 'Area must have a name.';
		}
		ko.conductor.areas[areaName] = { name: areaName, element: element };
		if (value.defaultViewModel || value.defaultView) {
			setTimeout(function() { ko.conductor.activate(areaName,
				ko.utils.unwrapObservable(value.defaultViewModel),
				ko.utils.unwrapObservable(value.defaultView)); }, 0);
		}
	}
};